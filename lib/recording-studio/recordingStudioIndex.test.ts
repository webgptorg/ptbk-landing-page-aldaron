import { describe, expect, it } from 'vitest';
import {
    describeRecordingIndexCheckFailure, describeRecordingIndexWarning, readRecordingIndexReport,
    RECORDING_INDEX_REPAIR_COMMAND,
} from './recordingStudioIndex';
import {
    createBytesBlob, createIndexedMatroskaBlob, createUnindexedMatroskaBlob, encodeEbml, encodeEbmlSize,
    encodeFloat64, encodeIsobmffBox, encodeUint32, MATROSKA_FIXTURE_IDS,
} from './recordingStudioTestUtilities';

const IDS = MATROSKA_FIXTURE_IDS;
const MATROSKA_HEADER = encodeEbml(IDS.ebmlHeader, encodeEbml(IDS.docType, [0x77, 0x65, 0x62, 0x6d]));
const SEEK_HEAD_WITH_CUES = encodeEbml(IDS.seekHead, encodeEbml(IDS.seekEntry, encodeEbml(IDS.seekTarget, IDS.cues)));

function matroskaInfo(durationSeconds: number | null): number[] {
    return encodeEbml(IDS.info, durationSeconds === null ? [] : encodeEbml(IDS.duration, encodeFloat64(durationSeconds)));
}

function movieHeader(durationUnits: number): number[] {
    // Version 0: version, flags, 32-bit creation and modification times, timescale, duration.
    return encodeIsobmffBox('mvhd', [0x00, 0x00, 0x00, 0x00, ...encodeUint32(0), ...encodeUint32(0), ...encodeUint32(1000), ...encodeUint32(durationUnits)]);
}

function longFormMovieHeader(durationUnits: number): number[] {
    // Version 1: version, flags, 64-bit creation and modification times, timescale, 64-bit duration.
    return encodeIsobmffBox('mvhd', [0x01, 0x00, 0x00, 0x00, ...encodeUint32(0), ...encodeUint32(0), ...encodeUint32(0), ...encodeUint32(0),
        ...encodeUint32(1000), ...encodeUint32(0), ...encodeUint32(durationUnits)]);
}

const FILE_TYPE = encodeIsobmffBox('ftyp', [0x69, 0x73, 0x6f, 0x36]);
/** A fragmented file closes with `mfra`, whose own byte length is written into its final `mfro` box. */
const FRAGMENT_INDEX = encodeIsobmffBox('mfra', encodeIsobmffBox('mfro', [0x00, 0x00, 0x00, 0x00, ...encodeUint32(24)]));

describe('seek index of one recorded container', () => {
    it('recognizes the live container a recorder writes, where the Segment size is never filled in', async () => {
        expect(await readRecordingIndexReport(createUnindexedMatroskaBlob())).toEqual({
            status: 'unindexed', format: 'matroska', isDurationStored: false, hasSeekIndex: false,
            detail: 'Matroska Segment má neznámou velikost, takže kontejner byl zapsán jako živý proud bez indexu.',
        });
        // Chrome writes that same unknown size as the shortest possible variable-length integer.
        const shortUnknownSize = createBytesBlob(MATROSKA_HEADER, [...IDS.segment, 0xff, ...encodeEbml(IDS.tracks, []), ...encodeEbml(IDS.cluster, [0x00])]);
        expect(await readRecordingIndexReport(shortUnknownSize)).toMatchObject({ status: 'unindexed', format: 'matroska' });
    });

    it('recognizes a remuxed container by its referenced Cues and its stored duration', async () => {
        expect(await readRecordingIndexReport(createIndexedMatroskaBlob(12.5))).toMatchObject({
            status: 'indexed', format: 'matroska', isDurationStored: true, hasSeekIndex: true,
        });
    });

    it('accepts a Cues element stored before the clusters, without a SeekHead pointing at it', async () => {
        const remuxed = createBytesBlob(MATROSKA_HEADER, encodeEbml(IDS.segment, [
            ...matroskaInfo(3), ...encodeEbml(IDS.tracks, []), ...encodeEbml(IDS.cues, []), ...encodeEbml(IDS.cluster, [0x00]),
        ]));
        expect(await readRecordingIndexReport(remuxed)).toMatchObject({ status: 'indexed', hasSeekIndex: true });
    });

    it('calls a container without a duration unindexed even when its index is written', async () => {
        const withoutDuration = createBytesBlob(MATROSKA_HEADER, encodeEbml(IDS.segment, [
            ...SEEK_HEAD_WITH_CUES, ...matroskaInfo(0), ...encodeEbml(IDS.tracks, []), ...encodeEbml(IDS.cluster, [0x00]),
        ]));
        expect(await readRecordingIndexReport(withoutDuration)).toMatchObject({
            status: 'unindexed', hasSeekIndex: true, isDurationStored: false, detail: 'Matroska neobsahuje uloženou délku.',
        });
    });

    it('calls a container without Cues unindexed even when its duration is written', async () => {
        const withoutCues = createBytesBlob(MATROSKA_HEADER, encodeEbml(IDS.segment, [
            ...matroskaInfo(9), ...encodeEbml(IDS.tracks, []), ...encodeEbml(IDS.cluster, [0x00]),
        ]));
        expect(await readRecordingIndexReport(withoutCues)).toMatchObject({
            status: 'unindexed', hasSeekIndex: false, isDurationStored: true, detail: 'Matroska neobsahuje element Cues.',
        });
    });

    it('answers unknown rather than raising an alarm when the header outgrows the read window', async () => {
        // A Tracks element claiming more bytes than the fixture holds leaves no cluster to conclude from.
        const truncated = createBytesBlob(MATROSKA_HEADER, [...IDS.segment, ...encodeEbmlSize(1_000_100), ...IDS.tracks, ...encodeEbmlSize(1_000_000)]);
        expect(await readRecordingIndexReport(truncated)).toMatchObject({
            status: 'unknown', format: 'matroska', detail: 'Hlavička kontejneru není v přečtené části úplná.',
        });
    });

    it('answers unknown for an empty part and for bytes which are neither Matroska nor MP4', async () => {
        expect(await readRecordingIndexReport(createBytesBlob([]))).toMatchObject({ status: 'unknown', format: 'unknown' });
        expect(await readRecordingIndexReport(createBytesBlob([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00])))
            .toMatchObject({ status: 'unknown', format: 'unknown' });
    });

    it('recognizes a fragmented MP4 which stores neither a duration nor a fragment index', async () => {
        const fragmented = createBytesBlob(FILE_TYPE,
            encodeIsobmffBox('moov', [...movieHeader(0), ...encodeIsobmffBox('mvex', [])]),
            encodeIsobmffBox('moof', []), encodeIsobmffBox('mdat', [0x00, 0x01]));
        expect(await readRecordingIndexReport(fragmented)).toMatchObject({
            status: 'unindexed', format: 'isobmff', isDurationStored: false,
        });
    });

    it('recognizes a fragmented MP4 whose index is only reachable from its closing mfro box', async () => {
        const padding = new Uint8Array(300 * 1024);
        const indexed = createBytesBlob(FILE_TYPE,
            encodeIsobmffBox('moov', [...movieHeader(4_000), ...encodeIsobmffBox('mvex', [])]),
            encodeIsobmffBox('moof', []), [...encodeUint32(padding.length + 8), 0x6d, 0x64, 0x61, 0x74], padding, FRAGMENT_INDEX);
        expect(await readRecordingIndexReport(indexed)).toMatchObject({
            status: 'indexed', format: 'isobmff', isDurationStored: true, hasSeekIndex: true,
        });
    });

    it('treats the sample tables of a plain MP4 as its index', async () => {
        const plain = createBytesBlob(FILE_TYPE, encodeIsobmffBox('moov', movieHeader(2_000)), encodeIsobmffBox('mdat', [0x00]));
        expect(await readRecordingIndexReport(plain)).toMatchObject({ status: 'indexed', format: 'isobmff', hasSeekIndex: true });
    });

    it('reads the duration of a long-form movie header behind its 64-bit times', async () => {
        const stored = createBytesBlob(FILE_TYPE, encodeIsobmffBox('moov', longFormMovieHeader(2_000)), encodeIsobmffBox('mdat', [0x00]));
        expect(await readRecordingIndexReport(stored)).toMatchObject({ status: 'indexed', isDurationStored: true });
        const empty = createBytesBlob(FILE_TYPE, encodeIsobmffBox('moov', longFormMovieHeader(0)), encodeIsobmffBox('mdat', [0x00]));
        expect(await readRecordingIndexReport(empty)).toMatchObject({ status: 'unindexed', isDurationStored: false });
    });

    it('answers unindexed rather than throwing on a movie header which is too short to hold its duration', async () => {
        const truncatedHeader = createBytesBlob(FILE_TYPE,
            encodeIsobmffBox('moov', encodeIsobmffBox('mvhd', [0x00, 0x00, 0x00, 0x00, ...encodeUint32(0)])), encodeIsobmffBox('mdat', [0x00]));
        expect(await readRecordingIndexReport(truncatedHeader)).toMatchObject({ status: 'unindexed', isDurationStored: false });
    });

    it('answers unknown when a plain MP4 keeps its moov past the read window', async () => {
        const padding = new Uint8Array(300 * 1024);
        const trailing = createBytesBlob(FILE_TYPE, [...encodeUint32(padding.length + 8), 0x6d, 0x64, 0x61, 0x74], padding,
            encodeIsobmffBox('moov', movieHeader(2_000)));
        expect(await readRecordingIndexReport(trailing)).toMatchObject({ status: 'unknown', format: 'isobmff' });
    });

    it('names the manual repair in every message an administrator receives', () => {
        const warning = describeRecordingIndexWarning('Obrazovka', {
            status: 'unindexed', format: 'matroska', isDurationStored: false, hasSeekIndex: false, detail: 'Chybí Cues.',
        });
        expect(warning).toContain('Zdroj „Obrazovka“');
        expect(warning).toContain('Chybí Cues.');
        expect(warning).toContain(RECORDING_INDEX_REPAIR_COMMAND);
        const failure = describeRecordingIndexCheckFailure('Kamera', new Error('Část média není úplná.'));
        expect(failure).toContain('Kamera');
        expect(failure).toContain('Část média není úplná.');
        expect(failure).toContain(RECORDING_INDEX_REPAIR_COMMAND);
    });
});

import { BlobReader, TextWriter, ZipReader } from '@zip.js/zip.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bufferRecordingPreparedDownload, exportRecordingArchive, exportRecordingManifest, exportRecordingOriginal, recordingOriginalFilename, recordingPreparedFilename } from './recordingStudioExport';
import { createIndexedMatroskaBlob, createTestStudioRecording, createUnindexedMatroskaBlob } from './recordingStudioTestUtilities';
import { RECORDING_INDEX_REPAIR_COMMAND } from './recordingStudioIndex';
import { getRecordingMediaRevision } from './recordingStudioDerived';
import { createRecordingWorkshopMetadata } from './recordingStudioWorkshop';
import type { RecordingArchiveManifest, RecordingDerivedTrack, RecordingEditRecipe, RecordingTrim } from './recordingStudioTypes';

const DOWNLOADS = vi.hoisted(() => ({ download: vi.fn(), read: vi.fn() }));
const REINDEX = vi.hoisted(() => {
    class RecordingIndexRebuildUnavailable extends Error {}
    return { RebuildUnavailableError: RecordingIndexRebuildUnavailable, rebuild: vi.fn() };
});
vi.mock('@/lib/downloadBlobFile', () => ({ downloadBlobFile: DOWNLOADS.download }));
vi.mock('./recordingStudioStorage', () => ({ readRecordingTrack: DOWNLOADS.read, readRecordingPart: DOWNLOADS.read,
    streamRecordingTrack: () => new Blob(['original bytes']).stream(), streamRecordingPart: () => new Blob(['original bytes']).stream() }));
vi.mock('./recordingStudioReindex', () => ({ RecordingIndexRebuildUnavailable: REINDEX.RebuildUnavailableError,
    withRebuiltRecordingIndex: REINDEX.rebuild }));

describe('recording archive exports', () => {
    it('never loads a large or cancelled prepared file into a download buffer', async () => {
        const file = new Blob(['prepared media']);
        const read = vi.spyOn(file, 'arrayBuffer');
        Object.defineProperty(file, 'size', { value: 300 * 1024 * 1024 });
        await expect(bufferRecordingPreparedDownload(file, new AbortController().signal)).rejects.toThrow('256 MiB');
        const controller = new AbortController();
        controller.abort();
        await expect(bufferRecordingPreparedDownload(new Blob(['media']), controller.signal)).rejects.toThrow();
        expect(read).not.toHaveBeenCalled();
    });

    it('retains distinct individual source filenames after storage clones their objects', () => {
        const recording = createTestStudioRecording();
        for (const track of recording.tracks) {
            expect(recordingOriginalFilename(structuredClone(recording), track)).toBe(recordingOriginalFilename(recording, track));
            expect(recordingPreparedFilename(structuredClone(recording), track)).toBe(recordingPreparedFilename(recording, track));
        }
        expect(new Set(recording.tracks.map((track) => recordingOriginalFilename(structuredClone(recording), track))).size).toBe(recording.tracks.length);
        expect(() => recordingPreparedFilename(recording, { ...recording.tracks[0], id: 'absent' })).toThrow();
    });
    beforeEach(() => {
        DOWNLOADS.download.mockReset(); DOWNLOADS.read.mockReset().mockResolvedValue(new Blob(['original bytes']));
        REINDEX.rebuild.mockReset();
    });

    it('rebuilds the missing index of an individually downloaded original', async () => {
        const rebuilt = createIndexedMatroskaBlob(10, 64);
        DOWNLOADS.read.mockResolvedValue(createUnindexedMatroskaBlob());
        REINDEX.rebuild.mockImplementation((options: { consume: (file: Blob) => Promise<unknown> }) =>
            options.consume(new File([rebuilt], 'rebuilt.webm', { type: 'video/webm' })));
        const base = createTestStudioRecording();
        const mediaBounds = { firstTimestampSeconds: 0, availableStartTimestampSeconds: 0, endTimestampSeconds: 10, components: [] };
        const track = { ...base.tracks[0], byteLength: 14, chunkCount: 1, parts: [
            { id: 'part-one', takeId: 'take-one', sessionStartSeconds: 0, durationSeconds: 10, byteLength: 14, chunkCount: 1,
                mimeType: 'video/webm', indexStatus: 'unindexed' as const, mediaBounds },
        ] };
        const recording = { ...base, tracks: [track, base.tracks[1]] };
        await exportRecordingOriginal(recording, track, null, new AbortController().signal);
        expect(REINDEX.rebuild).toHaveBeenCalledWith(expect.objectContaining({ format: 'matroska', expectedMedia: mediaBounds }));
        const [download] = DOWNLOADS.download.mock.calls[0];
        expect(download.fileName).toBe(recordingOriginalFilename(recording, track));
        expect(download.blob.size).toBe(rebuilt.size);
    });

    it('hands over the recorder\'s own bytes and records the reason when no index can be built', async () => {
        DOWNLOADS.read.mockResolvedValue(createUnindexedMatroskaBlob());
        REINDEX.rebuild.mockRejectedValue(new REINDEX.RebuildUnavailableError('Prohlížeč neumí zkopírovat všechny zaznamenané stopy.'));
        const base = createTestStudioRecording();
        const progress: string[] = [];
        const track = { ...base.tracks[0], byteLength: 14, chunkCount: 1 };
        await exportRecordingOriginal({ ...base, tracks: [track, base.tracks[1]] }, track, null,
            new AbortController().signal, undefined, (message) => progress.push(message));
        expect(progress).toContain('Prohlížeč neumí zkopírovat všechny zaznamenané stopy.');
        expect(DOWNLOADS.download.mock.calls[0][0].blob.size).toBe(createUnindexedMatroskaBlob().size);
    });

    it('says of every archived original whether its index was rebuilt', async () => {
        DOWNLOADS.read.mockResolvedValue(createUnindexedMatroskaBlob());
        REINDEX.rebuild
            .mockImplementationOnce((options: { consume: (file: Blob) => Promise<unknown> }) =>
                options.consume(new File([createIndexedMatroskaBlob()], 'rebuilt.webm', { type: 'video/webm' })))
            .mockRejectedValueOnce(new REINDEX.RebuildUnavailableError('Doplněný index se nepodařilo ověřit.'));
        const base = createTestStudioRecording();
        const recording = { ...base, tracks: base.tracks.map((track) => ({ ...track, byteLength: 14, chunkCount: 1 })) };
        await exportRecordingArchive({ recording, destination: null, isTrimIncluded: false,
            signal: new AbortController().signal, onProgress: vi.fn() });
        const reader = new ZipReader(new BlobReader(DOWNLOADS.download.mock.calls[0][0].blob));
        const entries = await reader.getEntries();
        const manifestEntry = entries.find((entry) => entry.filename === 'recording.json');
        if (!manifestEntry || manifestEntry.directory) throw new Error('Expected manifest');
        const manifest = JSON.parse(await manifestEntry.getData(new TextWriter())) as RecordingArchiveManifest;
        expect(manifest.tracks.map((track) => track.originalParts?.[0])).toMatchObject([
            { status: 'indexed', isIndexRebuilt: true },
            { status: 'unindexed', isIndexRebuilt: false, reason: 'Doplněný index se nepodařilo ověřit.' },
        ]);
        const readme = entries.find((entry) => entry.filename === 'README.txt');
        if (!readme || readme.directory) throw new Error('Expected README');
        expect(await readme.getData(new TextWriter())).toContain(RECORDING_INDEX_REPAIR_COMMAND);
        await reader.close();
    });
    it('downloads source-specific original metadata with an individual source', async () => {
        const base = createTestStudioRecording();
        const subtitleTrack: RecordingDerivedTrack = { id: 'subtitle-one', kind: 'subtitles',
            provenance: { sourceId: base.tracks[0].id, sourceLabel: base.tracks[0].label, mediaRevision: 'a'.repeat(64),
                createdAt: '2026-09-29T08:00:00.000Z', language: 'cs', processor: 'openai-whisper-1', settings: {} },
            cues: [{ id: 'cue-one', startSeconds: 1, endSeconds: 2, text: 'Ahoj', isEnabled: true, origin: 'manual' }] };
        const recording = { ...base, tracks: base.tracks.map((track) => ({ ...track, byteLength: 14, chunkCount: 1 })), derivedTracks: [subtitleTrack] };
        await exportRecordingOriginal(recording, recording.tracks[0], null, new AbortController().signal);
        expect(DOWNLOADS.download.mock.calls.map(([download]) => download.fileName)).toEqual([
            recordingOriginalFilename(recording, recording.tracks[0]),
            expect.stringMatching(/subtitle-one\.srt$/), expect.stringMatching(/subtitle-one\.vtt$/), expect.stringMatching(/subtitle-one\.json$/),
        ]);
    });
    it('does not claim prepared sidecars when a selection crosses separate media parts', async () => {
        const base = createTestStudioRecording();
        const source = { ...base.tracks[0], byteLength: 28, chunkCount: 2, parts: [
            { id: 'part-one', takeId: 'take-one', sessionStartSeconds: 0, durationSeconds: 5, byteLength: 14, chunkCount: 1, mimeType: 'video/webm', isAudioIncluded: true },
            { id: 'part-two', takeId: 'take-two', sessionStartSeconds: 5, durationSeconds: 5, byteLength: 14, chunkCount: 1, mimeType: 'video/webm', isAudioIncluded: true },
        ] };
        const subtitleTrack: RecordingDerivedTrack = { id: 'subtitle-one', kind: 'subtitles',
            provenance: { sourceId: source.id, sourceLabel: source.label, mediaRevision: 'a'.repeat(64),
                createdAt: '2026-09-29T08:00:00.000Z', language: 'cs', processor: 'openai-whisper-1', settings: {} },
            cues: [{ id: 'cue-one', startSeconds: 4, endSeconds: 6, text: 'Přes pauzu', isEnabled: true, origin: 'generated' }] };
        const recording = { ...base, tracks: [source], trim: { startSeconds: 4, endSeconds: 6 }, derivedTracks: [subtitleTrack] };
        await exportRecordingArchive({ recording, destination: null, isTrimIncluded: true,
            signal: new AbortController().signal, onProgress: vi.fn() });
        const reader = new ZipReader(new BlobReader(DOWNLOADS.download.mock.calls[0][0].blob));
        const entries = await reader.getEntries();
        expect(entries.some((entry) => entry.filename.startsWith('metadata/original/'))).toBe(true);
        expect(entries.some((entry) => entry.filename.startsWith('metadata/prepared/'))).toBe(false);
        const manifestEntry = entries.find((entry) => entry.filename === 'recording.json');
        if (!manifestEntry || manifestEntry.directory) throw new Error('Expected manifest');
        const manifest = JSON.parse(await manifestEntry.getData(new TextWriter())) as RecordingArchiveManifest;
        expect(manifest.derivedTracks[0].preparedFiles).toEqual([]);
        expect(manifest.tracks[0].trimmedFile).toBeNull();
        await reader.close();
    });
    it('exports one common workshop clock for both sources, including paused-part fallback', async () => {
        const base = createTestStudioRecording();
        const tracks = base.tracks.map((track) => ({ ...track, byteLength: 28, chunkCount: 2, startOffsetSeconds: 0,
            durationSeconds: 10, parts: [0, 5].map((sessionStartSeconds, index) => ({ id: `${track.id}-${index}`,
                takeId: `take-${index}`, sessionStartSeconds, durationSeconds: 5, byteLength: 14, chunkCount: 1,
                mimeType: 'video/webm', isAudioIncluded: track.isAudioIncluded })) }));
        const source = { ...base, tracks, trim: { startSeconds: 4, endSeconds: 6 } };
        const metadata = createRecordingWorkshopMetadata(source, await getRecordingMediaRevision(source));
        const recording = { ...source, workshopMetadata: { ...metadata,
            events: [{ id: 'event', seconds: 5, title: 'Append', detail: '', type: 'take' }],
            autoView: { ...metadata.autoView, isDefaultReviewed: true } } };
        await exportRecordingArchive({ recording, destination: null, isTrimIncluded: true,
            signal: new AbortController().signal, onProgress: vi.fn() });
        const reader = new ZipReader(new BlobReader(DOWNLOADS.download.mock.calls[0][0].blob));
        const entries = await reader.getEntries();
        const original = entries.find((entry) => entry.filename.endsWith('-workshop.json') && entry.filename.includes('metadata/original/'));
        const prepared = entries.find((entry) => entry.filename.endsWith('-workshop.json') && entry.filename.includes('metadata/prepared/'));
        const manifestEntry = entries.find((entry) => entry.filename === 'recording.json');
        if (!original || original.directory || !prepared || prepared.directory || !manifestEntry || manifestEntry.directory) throw new Error('Missing workshop files');
        const preparedData = JSON.parse(await prepared.getData(new TextWriter())) as {
            readonly events: readonly { readonly seconds: number; readonly originalSeconds: number }[];
            readonly activityIntervals: readonly RecordingTrim[];
            readonly editRecipe: RecordingEditRecipe;
        };
        const manifest = JSON.parse(await manifestEntry.getData(new TextWriter())) as RecordingArchiveManifest;
        expect(preparedData.events).toMatchObject([{ seconds: 1, originalSeconds: 5 }]);
        expect(preparedData.activityIntervals).toMatchObject([{ startSeconds: 0, endSeconds: 2 }]);
        expect(preparedData.editRecipe.sources).toHaveLength(2);
        expect(manifest.workshopMetadata?.originalFile).toBe(original.filename);
        expect(manifest.workshopMetadata?.preparedFile).toBe(prepared.filename);
        expect(manifest.tracks.every((track) => track.trimmedFile === null)).toBe(true);
        await reader.close();
    });
    it('preserves all original tracks and shared trim decisions in a real ZIP64 archive', async () => {
        const recording = createTestStudioRecording();
        await exportRecordingArchive({
            recording: { ...recording, tracks: recording.tracks.map((track) => ({ ...track, byteLength: 14, chunkCount: 1 })), trim: { startSeconds: 1, endSeconds: 4 } },
            destination: null, isTrimIncluded: false, signal: new AbortController().signal, onProgress: vi.fn(),
        });
        const reader = new ZipReader(new BlobReader(DOWNLOADS.download.mock.calls[0][0].blob));
        const entries = await reader.getEntries();
        expect(entries.map((entry) => entry.filename)).toEqual(['originals/01-camera-part-001.webm', 'originals/02-screen-part-001.webm', 'recording.json', 'README.txt']);
        for (const entry of entries.slice(0, 2)) {
            if (entry.directory) throw new Error('Expected file');
            expect(await entry.getData(new TextWriter())).toBe('original bytes');
        }
        const manifestEntry = entries[2];
        if (manifestEntry.directory) throw new Error('Expected manifest');
        const manifest = JSON.parse(await manifestEntry.getData(new TextWriter())) as RecordingArchiveManifest;
        expect(manifest.trim).toEqual({ startSeconds: 1, endSeconds: 4 });
        expect(manifest.isTrimIncluded).toBe(false);
        expect(manifest.tracks[1].startOffsetSeconds).toBe(0.002);
        await reader.close();
    });
    it('aborts a disk destination when the export is cancelled instead of closing a partial archive', async () => {
        const abort = vi.fn();
        const close = vi.fn();
        const writable = new WritableStream({ abort, close });
        const controller = new AbortController();
        controller.abort();
        await expect(exportRecordingArchive({
            recording: createTestStudioRecording(), destination: { createWritable: async () => writable } as unknown as FileSystemFileHandle,
            isTrimIncluded: false, signal: controller.signal, onProgress: vi.fn(),
        })).rejects.toThrow();
        expect(abort).toHaveBeenCalledOnce();
        expect(close).not.toHaveBeenCalled();
        expect(DOWNLOADS.download).not.toHaveBeenCalled();
    });
    it('does not begin an unbounded in-memory archive in browsers without a disk picker', async () => {
        const recording = createTestStudioRecording();
        await expect(exportRecordingArchive({
            recording: { ...recording, tracks: [{ ...recording.tracks[0], byteLength: 300 * 1024 * 1024 }] },
            destination: null, isTrimIncluded: false, signal: new AbortController().signal, onProgress: vi.fn(),
        })).rejects.toThrow('velký ZIP');
        expect(DOWNLOADS.read).not.toHaveBeenCalled();
    });

    it('exports shared timing and missing tails for large individual originals without reading media', async () => {
        const base = createTestStudioRecording();
        const recording = { ...base, status: 'interrupted' as const, captureEndSeconds: null, tracks: base.tracks.map((track) => ({ ...track, byteLength: 12 * 1024 ** 3 })) };
        await exportRecordingManifest(recording);
        const manifest = JSON.parse(await DOWNLOADS.download.mock.calls[0][0].blob.text()) as RecordingArchiveManifest;
        expect(manifest.schemaVersion).toBe(5);
        expect(manifest.tracks[1].originalFile).toBe(recordingOriginalFilename(recording, recording.tracks[1]));
        expect(manifest.tracks[1].byteLength).toBe(12 * 1024 ** 3);
        expect(manifest.tracks[1].startOffsetSeconds).toBe(0.002);
        expect(manifest.missingRanges.some((range) => range.trackId === recording.tracks[1].id && range.endSeconds === null)).toBe(true);
        expect(DOWNLOADS.read).not.toHaveBeenCalled();
    });
});

import { RECORDING_STUDIO_AUTHORITY, type RecordingStudioAuthority, type RecordingStudioAuthorityKeeper } from './recordingStudioAuthority';
import type { StudioRecording } from './recordingStudioTypes';

/**
 * Makes one keeper the studio, which is what holding the browser lock and claiming the storage does for a tab
 *
 * @param keeper the document's own keeper by default; a second one stands in for another tab
 */
export async function claimTestRecordingStudioAuthority(keeper: RecordingStudioAuthorityKeeper = RECORDING_STUDIO_AUTHORITY, instanceId = 'test-studio'): Promise<RecordingStudioAuthority> {
    const authority = await keeper.claim(instanceId, (await keeper.read()).generation);
    if (!authority) throw new Error('The test could not become the studio.');
    return authority;
}

export function createTestStudioRecording(): StudioRecording {
    return {
        id: 'test-recording', title: 'Test recording', createdAt: '2026-09-20T12:00:00.000Z', status: 'complete',
        durationSeconds: 10, trim: null, errorMessage: null,
        tracks: ['camera', 'screen'].map((kind, index) => ({
            id: `track-${index}`, kind: kind as 'camera' | 'screen', label: `${kind} ${index}`, mimeType: 'video/webm',
            byteLength: 0, chunkCount: 0, startOffsetSeconds: index * 0.002, durationSeconds: 10 - index * 0.002,
            width: 1280, height: 720, frameRate: 30, isAudioIncluded: index === 1,
        })),
    };
}

/** Element identities as they are written into a Matroska container, with their marker bits. */
export const MATROSKA_FIXTURE_IDS = {
    ebmlHeader: [0x1a, 0x45, 0xdf, 0xa3],
    docType: [0x42, 0x82],
    segment: [0x18, 0x53, 0x80, 0x67],
    seekHead: [0x11, 0x4d, 0x9b, 0x74],
    seekEntry: [0x4d, 0xbb],
    seekTarget: [0x53, 0xab],
    info: [0x15, 0x49, 0xa9, 0x66],
    duration: [0x44, 0x89],
    tracks: [0x16, 0x54, 0xae, 0x6b],
    cluster: [0x1f, 0x43, 0xb6, 0x75],
    cues: [0x1c, 0x53, 0xbb, 0x6b],
};

/** One eight-byte encoding keeps every fixture readable without a second length rule. */
export function encodeEbmlSize(size: number): number[] {
    const bytes = [0x01];
    for (let shift = 6; shift >= 0; shift -= 1) bytes.push(Math.floor(size / 256 ** shift) % 256);
    return bytes;
}

export function encodeEbml(id: readonly number[], content: readonly number[]): number[] {
    return [...id, ...encodeEbmlSize(content.length), ...content];
}

/** The shape a recorder writes: the end of the container is not known while it is being streamed. */
export function encodeEbmlWithUnknownSize(id: readonly number[], content: readonly number[]): number[] {
    return [...id, 0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, ...content];
}

export function encodeFloat64(value: number): number[] {
    const view = new DataView(new ArrayBuffer(8));
    view.setFloat64(0, value);
    const bytes: number[] = [];
    for (let index = 0; index < 8; index += 1) bytes.push(view.getUint8(index));
    return bytes;
}

export function encodeUint32(value: number): number[] {
    return [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];
}

export function encodeIsobmffBox(type: string, content: readonly number[]): number[] {
    const typeBytes = [type.charCodeAt(0), type.charCodeAt(1), type.charCodeAt(2), type.charCodeAt(3)];
    return [...encodeUint32(content.length + 8), ...typeBytes, ...content];
}

export function createBytesBlob(...parts: readonly (readonly number[] | Uint8Array<ArrayBuffer>)[]): Blob {
    return new Blob(parts.map((part) => part instanceof Uint8Array ? part : new Uint8Array(part)));
}

const MATROSKA_FIXTURE_HEADER = encodeEbml(MATROSKA_FIXTURE_IDS.ebmlHeader,
    encodeEbml(MATROSKA_FIXTURE_IDS.docType, [0x77, 0x65, 0x62, 0x6d]));

/** The container a `MediaRecorder` writes: a live Segment with neither Cues nor a stored duration. */
export function createUnindexedMatroskaBlob(mediaByteCount = 3): Blob {
    return createBytesBlob(MATROSKA_FIXTURE_HEADER, encodeEbmlWithUnknownSize(MATROSKA_FIXTURE_IDS.segment, [
        ...encodeEbml(MATROSKA_FIXTURE_IDS.info, []), ...encodeEbml(MATROSKA_FIXTURE_IDS.tracks, []),
        ...encodeEbml(MATROSKA_FIXTURE_IDS.cluster, new Array(mediaByteCount).fill(0x42)),
    ]));
}

/** The container a finished packet-copy remux writes: a referenced Cues element and a stored duration. */
export function createIndexedMatroskaBlob(durationSeconds = 10, mediaByteCount = 3): Blob {
    return createBytesBlob(MATROSKA_FIXTURE_HEADER, encodeEbml(MATROSKA_FIXTURE_IDS.segment, [
        ...encodeEbml(MATROSKA_FIXTURE_IDS.seekHead, encodeEbml(MATROSKA_FIXTURE_IDS.seekEntry,
            encodeEbml(MATROSKA_FIXTURE_IDS.seekTarget, MATROSKA_FIXTURE_IDS.cues))),
        ...encodeEbml(MATROSKA_FIXTURE_IDS.info, encodeEbml(MATROSKA_FIXTURE_IDS.duration, encodeFloat64(durationSeconds))),
        ...encodeEbml(MATROSKA_FIXTURE_IDS.tracks, []),
        ...encodeEbml(MATROSKA_FIXTURE_IDS.cluster, new Array(mediaByteCount).fill(0x42)),
        ...encodeEbml(MATROSKA_FIXTURE_IDS.cues, []),
    ]));
}

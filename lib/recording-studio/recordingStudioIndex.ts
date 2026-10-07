/**
 * What a usable seek index is, and how one recorded container is asked whether it has one
 *
 * Note: `MediaRecorder` writes a live container: the Matroska Segment is left with an unknown size, no Cues are
 *       written and no duration is stored, because the browser is streaming a file whose end it does not know yet.
 *       Such a file plays from the beginning in every player, but an editor cannot seek in it, which is exactly the
 *       state an administrator has been repairing by hand with `ffmpeg -map 0 -c copy`. That repair rewrites the
 *       container around unchanged media, so this module decides once whether a repair is needed at all.
 */

/** The manual repair which always remains available, named in every message about a missing index. */
export const RECORDING_INDEX_REPAIR_COMMAND = 'ffmpeg -i zaznam.webm -map 0 -c copy zaznam-fixed.webm';

/** Structural elements live at the head of the container; media bytes are never read to answer this. */
const INDEX_HEADER_BYTES = 256 * 1024;
/** A fragmented MP4 closes with `mfra`/`mfro`, which is the only part of its index stored at the end. */
const INDEX_TAIL_BYTES = 64 * 1024;
/** A live container fills the read window with clusters or fragments; the header is decided long before that. */
const MAX_PARSED_ELEMENTS = 4_096;

const EBML_HEADER_ID = 0x1a45dfa3;
const SEGMENT_ID = 0x18538067;
const SEEK_HEAD_ID = 0x114d9b74;
const SEEK_ENTRY_ID = 0x4dbb;
const SEEK_TARGET_ID = 0x53ab;
const INFO_ID = 0x1549a966;
const DURATION_ID = 0x4489;
const CLUSTER_ID = 0x1f43b675;
const CUES_ID = 0x1c53bb6b;
const CUES_ID_BYTES = [0x1c, 0x53, 0xbb, 0x6b];

export type RecordingContainerFormat = 'matroska' | 'isobmff' | 'unknown';

/**
 * Whether one recorded container can be seeked in
 *
 * - `indexed`: the container stores both its duration and a seek index.
 * - `unindexed`: it is a live container — playable, but without a usable index.
 * - `unknown`: the container is not one this studio records, or its head is not readable. Never an alarm.
 */
export type RecordingIndexStatus = 'indexed' | 'unindexed' | 'unknown';

export type RecordingIndexReport = {
    readonly status: RecordingIndexStatus;
    readonly format: RecordingContainerFormat;
    readonly isDurationStored: boolean;
    readonly hasSeekIndex: boolean;
    /** Names the element which was missing, so a recorded reason and an alert say the same thing. */
    readonly detail: string;
};

type EbmlElement = { readonly id: number; readonly size: number; readonly isUnknownSize: boolean; readonly contentOffset: number };
type IsobmffBox = { readonly type: string; readonly size: number; readonly contentOffset: number };

function createReport(status: RecordingIndexStatus, format: RecordingContainerFormat, detail: string,
    measured: { readonly isDurationStored: boolean; readonly hasSeekIndex: boolean } = { isDurationStored: false, hasSeekIndex: false }): RecordingIndexReport {
    return { status, format, detail, ...measured };
}

function readEbmlId(bytes: Uint8Array, offset: number): { readonly id: number; readonly length: number } | null {
    const first = bytes[offset];
    if (first === undefined || first === 0) return null;
    let length = 1;
    while (length <= 4 && (first & (0x80 >> (length - 1))) === 0) length += 1;
    if (length > 4 || offset + length > bytes.length) return null;
    let id = 0;
    for (let index = 0; index < length; index += 1) id = id * 0x100 + bytes[offset + index];
    return { id, length };
}

function readEbmlSize(bytes: Uint8Array, offset: number): { readonly size: number; readonly isUnknownSize: boolean; readonly length: number } | null {
    const first = bytes[offset];
    if (first === undefined || first === 0) return null;
    let length = 1;
    while (length <= 8 && (first & (0x80 >> (length - 1))) === 0) length += 1;
    if (length > 8 || offset + length > bytes.length) return null;
    let size = first & (0xff >> length);
    let isUnknownSize = size === (0xff >> length);
    for (let index = 1; index < length; index += 1) {
        isUnknownSize = isUnknownSize && bytes[offset + index] === 0xff;
        size = size * 0x100 + bytes[offset + index];
    }
    return { size, isUnknownSize, length };
}

function readEbmlElement(bytes: Uint8Array, offset: number): EbmlElement | null {
    const id = readEbmlId(bytes, offset);
    if (!id) return null;
    const size = readEbmlSize(bytes, offset + id.length);
    // An unknown size fills every value bit, so its number is meaningless rather than out of range.
    if (!size || (!size.isUnknownSize && !Number.isSafeInteger(size.size))) return null;
    return { id: id.id, size: size.size, isUnknownSize: size.isUnknownSize, contentOffset: offset + id.length + size.length };
}

/** Reads the direct children of one element, bounded by both its own size and the read window. */
function readEbmlChildren(bytes: Uint8Array, parent: EbmlElement): EbmlElement[] {
    const end = parent.isUnknownSize ? bytes.length : Math.min(bytes.length, parent.contentOffset + parent.size);
    const children: EbmlElement[] = [];
    let offset = parent.contentOffset;
    while (offset < end && children.length < MAX_PARSED_ELEMENTS) {
        const child = readEbmlElement(bytes, offset);
        if (!child) break;
        children.push(child);
        if (child.isUnknownSize) break;
        offset = child.contentOffset + child.size;
    }
    return children;
}

/** A written index is normally referenced from the SeekHead rather than stored before the clusters. */
function hasMatroskaCuesReference(bytes: Uint8Array, seekHead: EbmlElement): boolean {
    return readEbmlChildren(bytes, seekHead).some((seek) => seek.id === SEEK_ENTRY_ID &&
        readEbmlChildren(bytes, seek).some((entry) => entry.id === SEEK_TARGET_ID && entry.size === CUES_ID_BYTES.length &&
            CUES_ID_BYTES.every((value, index) => bytes[entry.contentOffset + index] === value)));
}

function hasMatroskaStoredDuration(bytes: Uint8Array, info: EbmlElement): boolean {
    const duration = readEbmlChildren(bytes, info).find((child) => child.id === DURATION_ID);
    if (!duration || duration.contentOffset + duration.size > bytes.length) return false;
    const view = new DataView(bytes.buffer, bytes.byteOffset + duration.contentOffset, duration.size);
    const seconds = duration.size === 4 ? view.getFloat32(0) : duration.size === 8 ? view.getFloat64(0) : 0;
    return Number.isFinite(seconds) && seconds > 0;
}

function readMatroskaIndexReport(bytes: Uint8Array): RecordingIndexReport {
    const header = readEbmlElement(bytes, 0);
    if (!header || header.id !== EBML_HEADER_ID || header.isUnknownSize) return createReport('unknown', 'matroska', 'Hlavičku EBML nelze přečíst.');
    const segment = readEbmlElement(bytes, header.contentOffset + header.size);
    if (!segment || segment.id !== SEGMENT_ID) return createReport('unknown', 'matroska', 'Element Segment nelze přečíst.');
    if (segment.isUnknownSize) {
        return createReport('unindexed', 'matroska', 'Matroska Segment má neznámou velikost, takže kontejner byl zapsán jako živý proud bez indexu.');
    }
    let hasSeekIndex = false;
    let isDurationStored = false;
    let isConclusive = false;
    for (const child of readEbmlChildren(bytes, segment)) {
        // Every header element precedes the first cluster, so reaching one means nothing further can be found.
        if (child.id === CLUSTER_ID) { isConclusive = true; break; }
        if (child.id === CUES_ID) hasSeekIndex = true;
        if (child.id === SEEK_HEAD_ID) hasSeekIndex = hasSeekIndex || hasMatroskaCuesReference(bytes, child);
        if (child.id === INFO_ID) isDurationStored = isDurationStored || hasMatroskaStoredDuration(bytes, child);
        if (child.isUnknownSize) break;
    }
    const measured = { hasSeekIndex, isDurationStored };
    if (hasSeekIndex && isDurationStored) return createReport('indexed', 'matroska', 'Kontejner obsahuje Cues i uloženou délku.', measured);
    if (!isConclusive) return createReport('unknown', 'matroska', 'Hlavička kontejneru není v přečtené části úplná.', measured);
    return createReport('unindexed', 'matroska', hasSeekIndex ? 'Matroska neobsahuje uloženou délku.' : 'Matroska neobsahuje element Cues.', measured);
}

function readIsobmffBox(bytes: Uint8Array, offset: number): IsobmffBox | null {
    if (offset + 8 > bytes.length) return null;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const declaredSize = view.getUint32(offset);
    const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);
    if (declaredSize === 1) {
        if (offset + 16 > bytes.length) return null;
        const size = Number(view.getBigUint64(offset + 8));
        return Number.isSafeInteger(size) && size > 16 ? { type, size: size - 16, contentOffset: offset + 16 } : null;
    }
    if (declaredSize < 8) return null;
    return { type, size: declaredSize - 8, contentOffset: offset + 8 };
}

function readIsobmffBoxes(bytes: Uint8Array, start: number, end: number): IsobmffBox[] {
    const boxes: IsobmffBox[] = [];
    let offset = start;
    while (offset < end && boxes.length < MAX_PARSED_ELEMENTS) {
        const box = readIsobmffBox(bytes, offset);
        if (!box) break;
        boxes.push(box);
        offset = box.contentOffset + box.size;
    }
    return boxes;
}

/** An `mfro` box closes a fragmented file with the byte length of the `mfra` index it belongs to. */
function hasIsobmffFragmentIndexTail(tail: Uint8Array, fileByteLength: number): boolean {
    if (tail.length < 16) return false;
    const view = new DataView(tail.buffer, tail.byteOffset, tail.byteLength);
    const mfroOffset = tail.length - 16;
    const isMfro = String.fromCharCode(tail[mfroOffset + 4], tail[mfroOffset + 5], tail[mfroOffset + 6], tail[mfroOffset + 7]) === 'mfro';
    if (!isMfro || view.getUint32(mfroOffset) !== 16) return false;
    const indexByteLength = view.getUint32(mfroOffset + 12);
    return indexByteLength >= 16 && indexByteLength <= fileByteLength;
}

function readIsobmffMovieIndex(bytes: Uint8Array, movie: IsobmffBox): { readonly isDurationStored: boolean; readonly isFragmented: boolean } {
    const children = readIsobmffBoxes(bytes, movie.contentOffset, Math.min(bytes.length, movie.contentOffset + movie.size));
    const isFragmented = children.some((child) => child.type === 'mvex');
    const header = children.find((child) => child.type === 'mvhd' && child.contentOffset + child.size <= bytes.length);
    if (!header) return { isDurationStored: false, isFragmented };
    const view = new DataView(bytes.buffer, bytes.byteOffset + header.contentOffset, header.size);
    // Version 0 stores 32-bit times, version 1 the 64-bit ones, which moves the duration behind a longer header.
    const isLongForm = view.getUint8(0) === 1;
    if (header.size < (isLongForm ? 32 : 20)) return { isDurationStored: false, isFragmented };
    const duration = isLongForm ? Number(view.getBigUint64(24)) : view.getUint32(16);
    return { isDurationStored: Number.isFinite(duration) && duration > 0, isFragmented };
}

function readIsobmffIndexReport(bytes: Uint8Array, tail: Uint8Array, fileByteLength: number): RecordingIndexReport {
    let hasFragmentIndex = hasIsobmffFragmentIndexTail(tail, fileByteLength);
    for (const box of readIsobmffBoxes(bytes, 0, bytes.length)) {
        if (box.type === 'sidx' || box.type === 'mfra') hasFragmentIndex = true;
        if (box.type !== 'moov' || box.contentOffset + box.size > bytes.length) continue;
        const { isDurationStored, isFragmented } = readIsobmffMovieIndex(bytes, box);
        // Sample tables are the index of a plain MP4; a fragmented one needs `mfra` or `sidx` instead.
        const hasSeekIndex = isFragmented ? hasFragmentIndex : true;
        const measured = { isDurationStored, hasSeekIndex };
        if (isDurationStored && hasSeekIndex) return createReport('indexed', 'isobmff', 'Kontejner obsahuje index i uloženou délku.', measured);
        return createReport('unindexed', 'isobmff', isDurationStored
            ? 'Fragmentovaný MP4 neobsahuje index mfra ani sidx.'
            : 'MP4 neobsahuje uloženou délku ve mvhd.', measured);
    }
    return createReport('unknown', 'isobmff', 'Box moov není v přečtené části kontejneru.');
}

function detectRecordingContainerFormat(bytes: Uint8Array): RecordingContainerFormat {
    if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return 'matroska';
    const box = bytes.length >= 8 ? readIsobmffBox(bytes, 0) : null;
    return box && ['ftyp', 'styp', 'moov', 'moof'].includes(box.type) ? 'isobmff' : 'unknown';
}

/** Structural reads can come from a Blob or a bounded IndexedDB range adapter without assembling a whole Blob. */
export type RecordingIndexSource = {
    readonly size: number;
    readonly slice: (start: number, end: number) => { readonly arrayBuffer: () => Promise<ArrayBuffer> };
};

async function readBlobBytes(blob: RecordingIndexSource, start: number, end: number): Promise<Uint8Array> {
    return new Uint8Array(await blob.slice(start, end).arrayBuffer());
}

/** Reads only the structural head and tail of a recorded part; media bytes are never decoded or scanned. */
export async function readRecordingIndexReport(blob: RecordingIndexSource): Promise<RecordingIndexReport> {
    if (blob.size === 0) return createReport('unknown', 'unknown', 'Část média je prázdná.');
    const header = await readBlobBytes(blob, 0, Math.min(blob.size, INDEX_HEADER_BYTES));
    const format = detectRecordingContainerFormat(header);
    if (format === 'matroska') return readMatroskaIndexReport(header);
    if (format === 'unknown') return createReport('unknown', 'unknown', 'Kontejner není Matroska ani MP4.');
    const tail = await readBlobBytes(blob, Math.max(0, blob.size - INDEX_TAIL_BYTES), blob.size);
    return readIsobmffIndexReport(header, tail, blob.size);
}

/** A missing index loses no media, so it is announced as a take which was kept rather than one which failed. */
export function describeRecordingIndexWarning(sourceLabel: string, report: RecordingIndexReport): string {
    return `Zdroj „${sourceLabel}“ byl zaznamenán bez indexu pro vyhledávání a tento prohlížeč jej neumí dopočítat. ${report.detail} Uložené médium je celé a přehratelné, ale střihač v něm nebude moci přeskakovat; index doplňte příkazem ${RECORDING_INDEX_REPAIR_COMMAND}.`;
}

export function describeRecordingIndexCheckFailure(sourceLabel: string, error: unknown): string {
    const reason = error instanceof Error ? error.message : 'Kontejner nelze přečíst.';
    return `Index uzavřené části zdroje „${sourceLabel}“ se nepodařilo zkontrolovat: ${reason} Uložené médium zůstává dostupné; index si ověřte příkazem ${RECORDING_INDEX_REPAIR_COMMAND}.`;
}

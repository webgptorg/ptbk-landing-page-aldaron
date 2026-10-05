/** Shared by the media service worker and editor upload/inspection. No caches contain whole media files. */
export function readStudioRequest(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function openStudioReadDatabase() {
    const database = await readStudioRequest(indexedDB.open('promptbook-recording-studio'));
    database.onversionchange = () => database.close();
    return database;
}

/** start is inclusive, end exclusive. The byte index makes a seek near hour five a bounded lookup. */
export async function readStudioRecordingRange(database, location, start, end, signal) {
    if (start < 0 || end <= start || end > location.part.byteLength) throw new Error('Invalid local media range.');
    signal?.throwIfAborted();
    const index = database.transaction('chunks').objectStore('chunks').index('byteRange');
    const cursor = await readStudioRequest(
        index.openCursor(
            IDBKeyRange.bound(
                [location.recordingId, location.part.id, 0],
                [location.recordingId, location.part.id, start],
            ),
            'prev',
        ),
    );
    if (!cursor) throw new Error('Místní zdroj chybí. Znovu připojte původní médium.');
    const blobs = [];
    let chunk = cursor.value;
    let position = start;
    while (position < end) {
        signal?.throwIfAborted();
        if (!chunk || chunk.byteStart > position || chunk.byteStart + chunk.data.size <= position)
            throw new Error('Potvrzené části místního média nejsou úplné.');
        const chunkEnd = Math.min(end, chunk.byteStart + chunk.data.size);
        blobs.push(chunk.data.slice(position - chunk.byteStart, chunkEnd - chunk.byteStart));
        position = chunkEnd;
        if (position < end)
            chunk = await readStudioRequest(
                database
                    .transaction('chunks')
                    .objectStore('chunks')
                    .get([location.recordingId, location.part.id, chunk.sequence + 1]),
            );
    }
    return new Blob(blobs, { type: location.part.mimeType });
}

export function parseStudioByteRange(value, byteLength) {
    if (!value) return { start: 0, end: byteLength, isPartial: false };
    const match = /^bytes=(\d*)-(\d*)$/.exec(value);
    if (!match || (!match[1] && !match[2])) return null;
    const start = match[1] ? Number(match[1]) : Math.max(0, byteLength - Number(match[2]));
    const end = match[1] && match[2] ? Math.min(byteLength, Number(match[2]) + 1) : byteLength;
    return Number.isSafeInteger(start) && Number.isSafeInteger(end) && start >= 0 && start < end && start < byteLength
        ? { start, end, isPartial: true }
        : null;
}

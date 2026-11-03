import type { MessageRecordingChunk, MessageRecordingPart } from './messageRecordingTypes';

const DATABASE = 'ptbk-message-recordings-v1';
const request = <T>(value: IDBRequest<T>) => new Promise<T>((resolve, reject) => {
    value.onsuccess = () => resolve(value.result); value.onerror = () => reject(value.error);
});
async function open(): Promise<IDBDatabase> {
    const pending = indexedDB.open(DATABASE, 1);
    pending.onupgradeneeded = () => {
        pending.result.createObjectStore('parts', { keyPath: 'id' });
        pending.result.createObjectStore('chunks', { keyPath: ['partId', 'sequence'] });
    };
    return request(pending);
}
async function transaction<T>(stores: string[], mode: IDBTransactionMode, run: (tx: IDBTransaction) => Promise<T>): Promise<T> {
    const db = await open();
    try {
        const tx = db.transaction(stores, mode, mode === 'readwrite' ? { durability: 'strict' } : undefined);
        const done = new Promise<void>((resolve, reject) => {
            tx.oncomplete = () => resolve(); tx.onabort = () => reject(tx.error ?? new Error('Ukládání audia bylo přerušeno.'));
            tx.onerror = () => reject(tx.error);
        });
        // Observe completion rejection even if an individual request rejects first.
        void done.catch(() => undefined);
        const result = await run(tx); await done; return result;
    } finally { db.close(); }
}
export const listRecordingParts = () => transaction(['parts'], 'readonly', async tx =>
    (await request(tx.objectStore('parts').getAll()) as MessageRecordingPart[]).sort((a, b) => a.startedAt.localeCompare(b.startedAt)));
export const saveRecordingPart = (part: MessageRecordingPart) => transaction(['parts'], 'readwrite', async tx => { await request(tx.objectStore('parts').put(part)); });
export const loadRecordingPart = (id: string) => transaction(['parts'], 'readonly', async tx => request<MessageRecordingPart | undefined>(tx.objectStore('parts').get(id)));
export const patchRecordingPart = (id: string, update: Partial<MessageRecordingPart>) => transaction(['parts'], 'readwrite', async tx => {
    const store = tx.objectStore('parts'), part = await request<MessageRecordingPart | undefined>(store.get(id));
    if (!part) throw new Error('Nahrávka nebyla nalezena.');
    await request(store.put({ ...part, ...update, id: part.id }));
});
/** Audio and its committed counters change in the same durable transaction. */
export const saveRecordingChunk = (chunk: MessageRecordingChunk) => transaction(['parts', 'chunks'], 'readwrite', async tx => {
    const store = tx.objectStore('parts'), part = await request<MessageRecordingPart | undefined>(store.get(chunk.partId));
    if (!part || part.chunkCount !== chunk.sequence) throw new Error('Pořadí ukládaného audia nesouhlasí.');
    await request(tx.objectStore('chunks').add(chunk));
    await request(store.put({ ...part, chunkCount: part.chunkCount + 1, byteLength: part.byteLength + chunk.bytes.size, lastSavedAt: new Date().toISOString() }));
});
export const loadRecordingChunks = (partId: string) => transaction(['chunks'], 'readonly', async tx =>
    request<MessageRecordingChunk[]>(tx.objectStore('chunks').getAll(IDBKeyRange.bound([partId, 0], [partId, Number.MAX_SAFE_INTEGER]))));
export const markRecordingChunkSynced = (partId: string, sequence: number) => transaction(['chunks'], 'readwrite', async tx => {
    const store = tx.objectStore('chunks'), chunk = await request<MessageRecordingChunk | undefined>(store.get([partId, sequence]));
    if (chunk) await request(store.put({ ...chunk, synced: true }));
});
export async function localRecordingFile(part: MessageRecordingPart): Promise<File | null> {
    const chunks = await loadRecordingChunks(part.id);
    if (!chunks.length) return null;
    if (chunks.length !== part.chunkCount || chunks.some((chunk, index) => chunk.sequence !== index)) throw new Error('Místní nahrávce chybí část dat; použijte serverovou zálohu.');
    const { recordingFilename } = await import('./messageRecordingTypes');
    return new File(chunks.map(chunk => chunk.bytes), recordingFilename(part), { type: part.mimeType });
}

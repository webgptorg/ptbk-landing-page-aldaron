const RECORDING_DATABASE_NAME = 'promptbook-recording-studio';
/** Version 3 adds the store which says which tab may write. See `recordingStudioAuthority.ts`. */
const RECORDING_DATABASE_VERSION = 3;
export const RECORDING_STORE = 'recordings';
export const CHUNK_STORE = 'chunks';
export const DIRECTORY_STORE = 'directories';
export const AUTHORITY_STORE = 'authority';

let databasePromise: Promise<IDBDatabase> | null = null;

/**
 * Opens the database of the studio at the schema this code writes, upgrading it when it is older
 *
 * Note: An upgrade closes the connection of every other tab, so only a tab which is becoming the studio may call this.
 *       A tab which merely looks uses `readRecordingDatabaseAsIs`.
 */
export function openRecordingDatabase(): Promise<IDBDatabase> {
    if (databasePromise) return databasePromise;
    databasePromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(RECORDING_DATABASE_NAME, RECORDING_DATABASE_VERSION);
        request.onupgradeneeded = () => {
            const database = request.result;
            if (!database.objectStoreNames.contains(RECORDING_STORE)) database.createObjectStore(RECORDING_STORE, { keyPath: 'id' });
            if (!database.objectStoreNames.contains(CHUNK_STORE)) {
                const chunks = database.createObjectStore(CHUNK_STORE, { keyPath: ['recordingId', 'trackId', 'sequence'] });
                chunks.createIndex('recordingId', 'recordingId');
            }
            if (!database.objectStoreNames.contains(DIRECTORY_STORE)) database.createObjectStore(DIRECTORY_STORE);
            if (!database.objectStoreNames.contains(AUTHORITY_STORE)) database.createObjectStore(AUTHORITY_STORE);
        };
        request.onsuccess = () => {
            request.result.onversionchange = () => { request.result.close(); databasePromise = null; };
            resolve(request.result);
        };
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error('Starší instance studia blokuje změnu místního úložiště. Převzetí se nepodařilo bezpečně dokončit; počkejte na uvolnění úložiště a zkuste převzetí znovu.'));
    });
    void databasePromise.catch(() => { databasePromise = null; });
    return databasePromise;
}

/**
 * Reads the database as it is, without ever upgrading it
 *
 * Note: A tab which does not own the studio must not be the one which changes the schema, because an upgrade closes
 *       the connection the owning tab may be writing a recording through. That matters right after a deployment,
 *       while a tab loaded before it is still recording.
 *
 * @param read what to read; a store this code expects may not exist yet
 */
export async function readRecordingDatabaseAsIs<Result>(read: (database: IDBDatabase) => Promise<Result>): Promise<Result> {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(RECORDING_DATABASE_NAME);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
    // The tab which is becoming the studio may upgrade the schema while this short read is open.
    database.onversionchange = () => database.close();
    try { return await read(database); }
    finally { database.close(); }
}

export function waitForTransaction(transaction: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        // A failed request aborts its transaction, and only the abort knows the error which caused it.
        transaction.onabort = () => reject(transaction.error ?? new Error('Uložení do prohlížeče se nezdařilo.'));
    });
}

export function readRequest<Result>(request: IDBRequest<Result>): Promise<Result> {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

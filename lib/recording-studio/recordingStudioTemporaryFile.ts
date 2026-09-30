const EXPORT_TEMPORARY_DIRECTORY = 'promptbook-recording-studio-exports';

/** One seekable disk-backed working file, as both trimming and index rebuilding need it. */
export type RecordingTemporaryFile = {
    readonly writable: FileSystemWritableFileStream;
    readonly readFile: () => Promise<File>;
};

export function isRecordingTemporaryFileSupported(): boolean {
    return Boolean(navigator.storage?.getDirectory);
}

export async function clearRecordingExportTemporaryFiles(): Promise<void> {
    if (!isRecordingTemporaryFileSupported()) return;
    const root = await navigator.storage.getDirectory();
    await root.removeEntry(EXPORT_TEMPORARY_DIRECTORY, { recursive: true }).catch((error: unknown) => {
        if (!(error instanceof DOMException) || error.name !== 'NotFoundError') throw error;
    });
}

/**
 * Runs one output-writing step against a temporary file and removes that file afterwards
 *
 * Note: A Matroska or MP4 index can only be written into a seekable target, so neither trimming nor index
 *       rebuilding can stream straight into a download. Holding a whole transcoded or remuxed camera track in
 *       memory is not an option either, which is why both of them borrow the same disk-backed working file.
 */
export async function withRecordingTemporaryFile<Result>(runWithFile: (target: RecordingTemporaryFile) => Promise<Result>): Promise<Result> {
    const root = await navigator.storage.getDirectory();
    const directory = await root.getDirectoryHandle(EXPORT_TEMPORARY_DIRECTORY, { create: true });
    const filename = crypto.randomUUID();
    const handle = await directory.getFileHandle(filename, { create: true });
    const writable = await handle.createWritable();
    try {
        return await runWithFile({ writable, readFile: () => handle.getFile() });
    } finally {
        await writable.abort().catch(() => undefined);
        // A leaked working file is collected when the studio is opened again; it must never mask a real failure.
        await directory.removeEntry(filename).catch(() => undefined);
    }
}

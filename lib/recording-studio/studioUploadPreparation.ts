import { withRebuiltRecordingIndex } from './recordingStudioReindex';
import type { RecordingContainerFormat } from './recordingStudioIndex';
import type { StudioAsset } from './studioProjectTypes';
import { readStudioAssetUpload } from './studioProjectStorage';
import type { StudioAssetUploadState } from './studioAssetUploadTypes';
import { createStudioRangeInput, type StudioRangeSource } from './studioMediaSource';

const UPLOAD_PREPARATION_DIRECTORY = 'promptbook-studio-upload-preparations';
const PREPARED_MEDIA_FILENAME = 'media';
const PREPARATION_MANIFEST_FILENAME = 'identity.json';

function getPreparationIdentity(asset: StudioAsset): string {
    // A pinned immutable recorded-part descriptor identifies the INPUT. The upload manifest hashes the actual output.
    return JSON.stringify({ id: asset.id, original: asset.original, bounds: asset.bounds });
}

export async function removeStudioUploadPreparation(assetId: string): Promise<void> {
    if (!navigator.storage?.getDirectory) return;
    const root = await navigator.storage.getDirectory();
    try {
        const directory = await root.getDirectoryHandle(UPLOAD_PREPARATION_DIRECTORY);
        await directory.removeEntry(assetId, { recursive: true });
    } catch (error) {
        if (!(error instanceof DOMException) || error.name !== 'NotFoundError') throw error;
    }
}

/** Only explicit index preparation writes media into OPFS; external-file import never calls this path. */
export async function prepareStudioUpload(
    asset: StudioAsset,
    source: StudioRangeSource,
    format: RecordingContainerFormat,
    signal: AbortSignal,
    onProgress: (progress: number) => void,
): Promise<File> {
    if (!navigator.storage?.getDirectory)
        throw new Error('Doplnění indexu potřebuje dočasné úložiště OPFS. Zdroj a projekt zůstaly místní.');
    const root = await navigator.storage.getDirectory();
    const directory = await root.getDirectoryHandle(UPLOAD_PREPARATION_DIRECTORY, { create: true });
    const preparation = await directory.getDirectoryHandle(asset.id, { create: true });
    const identity = getPreparationIdentity(asset);
    try {
        const manifestFile = await (await preparation.getFileHandle(PREPARATION_MANIFEST_FILENAME)).getFile();
        if (manifestFile.size > 64 * 1024) throw new Error('Dočasný předpis indexu je příliš velký.');
        const manifest = JSON.parse(await manifestFile.text());
        const file = await (await preparation.getFileHandle(PREPARED_MEDIA_FILENAME)).getFile();
        if (
            typeof manifest === 'object' &&
            manifest !== null &&
            'identity' in manifest &&
            'byteLength' in manifest &&
            manifest.identity === identity &&
            manifest.byteLength === file.size &&
            file.size > 0
        )
            return file;
    } catch (error) {
        if (!(error instanceof SyntaxError) && (!(error instanceof DOMException) || error.name !== 'NotFoundError'))
            throw error;
    }
    const existing = await readStudioAssetUpload<StudioAssetUploadState>(asset.id);
    if (existing?.isIndexRebuilt)
        throw new Error(
            'Dočasná příprava rozpracovaného uploadu chybí nebo se změnila. Zrušte jeho upload a připravte stejný originál znovu; již nahrané části se nemíchají s novými bajty.',
        );
    const handle = await preparation.getFileHandle(PREPARED_MEDIA_FILENAME, { create: true });
    const writable = await handle.createWritable();
    try {
        const file = await withRebuiltRecordingIndex({
            input: createStudioRangeInput(source, signal),
            format,
            expectedMedia: asset.bounds,
            signal,
            onProgress,
            temporaryFile: { writable, readFile: () => handle.getFile() },
            consume: async (result) => result,
        });
        signal.throwIfAborted();
        const manifest = await (
            await preparation.getFileHandle(PREPARATION_MANIFEST_FILENAME, { create: true })
        ).createWritable();
        try {
            await manifest.write(JSON.stringify({ identity, byteLength: file.size }));
            await manifest.close();
        } catch (error) {
            await manifest.abort().catch(() => undefined);
            throw error;
        }
        // Retained on pause/reload. Removed only after verified conversion or explicit upload cancellation.
        return file;
    } finally {
        await writable.abort().catch(() => undefined);
    }
}

type ImportedTrack = { readonly id: string; readonly kind: string; readonly label?: string;
    readonly trimmedFile?: string | null; readonly preparation?: { readonly status?: string } };
type ImportedManifest = { readonly schemaVersion: number; readonly timeUnit: string; readonly id: string;
    readonly editRecipe: unknown; readonly tracks: readonly ImportedTrack[];
    readonly workshopMetadata?: unknown; readonly createdAt?: string;
    readonly durationSeconds?: number; readonly takes?: unknown };

function parseManifest(content: string): ImportedManifest {
    const value: unknown = JSON.parse(content);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Manifest must be an object.');
    const manifest = value as ImportedManifest;
    if (manifest.schemaVersion !== 5 || manifest.timeUnit !== 'seconds' || typeof manifest.id !== 'string' ||
        !Array.isArray(manifest.tracks)) throw new Error('Select schema 5 studio manifests in seconds.');
    return manifest;
}

/**
 * Standalone prepared exports each carry the same session manifest but prepare one
 * different source. Combine only identical edit recipes from the same recording.
 */
export async function mergeHostedRecordingManifests(files: readonly File[]): Promise<{
    readonly file: File;
    readonly tracks: readonly ImportedTrack[];
}> {
    if (files.length === 0 || files.length > 20) throw new Error('Select one to twenty studio manifests.');
    const manifests = await Promise.all(files.map(async (file) => parseManifest(await file.text())));
    const first = manifests[0]!;
    const recipe = JSON.stringify(first.editRecipe);
    const workshopMetadata = JSON.stringify(first.workshopMetadata ?? null);
    for (const manifest of manifests.slice(1)) {
        if (manifest.id !== first.id || JSON.stringify(manifest.editRecipe) !== recipe ||
            JSON.stringify(manifest.workshopMetadata ?? null) !== workshopMetadata ||
            manifest.createdAt !== first.createdAt || manifest.durationSeconds !== first.durationSeconds ||
            JSON.stringify(manifest.takes ?? null) !== JSON.stringify(first.takes ?? null)) {
            throw new Error('The manifests must describe the same recording, selection and workshop metadata.');
        }
    }
    const tracks = new Map<string, ImportedTrack>();
    for (const manifest of manifests) for (const track of manifest.tracks) {
        if (!track || typeof track.id !== 'string' || !track.id || !['camera', 'screen', 'microphone'].includes(track.kind)) {
            throw new Error('A manifest contains an invalid source track.');
        }
        const existing = tracks.get(track.id);
        const isPrepared = track.preparation?.status === 'prepared' && !!track.trimmedFile;
        if (existing?.preparation?.status === 'prepared' && isPrepared &&
            existing.trimmedFile !== track.trimmedFile) {
            throw new Error('The manifests disagree about a prepared source file.');
        }
        if (!existing || isPrepared) tracks.set(track.id, track);
    }
    const merged = { ...first, tracks: Array.from(tracks.values()) };
    const file = new File([JSON.stringify(merged)], 'studio-prepared-manifest.json', { type: 'application/json' });
    return { file, tracks: merged.tracks };
}

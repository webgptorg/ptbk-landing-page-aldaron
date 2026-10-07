'use client';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import { saveStudioProject } from './studioProjectStorage';
import type { StudioAsset, StudioProject } from './studioProjectTypes';

export async function synchronizeStudioProjectReferences(
    project: StudioProject,
    assets: readonly StudioAsset[],
    isRetainOnly: boolean,
): Promise<void> {
    const references = assets
        .filter((asset) => project.clips.some((clip) => clip.assetId === asset.id) && asset.location.kind === 's3')
        .map((asset) => (asset.location.kind === 's3' ? asset.location.storageAssetId : ''));
    if (isRetainOnly && references.length === 0) return;
    await requestAdminJson(`/api/admin/studio/projects/${project.id}/references`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetIds: Array.from(new Set(references)), isRetainOnly }),
    });
}

export async function persistStudioProject(
    project: StudioProject,
    assets: readonly StudioAsset[],
): Promise<StudioProject> {
    const isRemoteReferenced = assets.some(
        (asset) => asset.location.kind === 's3' && project.clips.some((clip) => clip.assetId === asset.id),
    );
    if (isRemoteReferenced) await synchronizeStudioProjectReferences(project, assets, true);
    const saved = await saveStudioProject(project);
    // Conservative retention: never release remote references as a side effect of an ordinary local autosave.
    // Explicit project deletion reconciles them after local deletion; failed reconciliation only retains extra bytes.
    return saved;
}

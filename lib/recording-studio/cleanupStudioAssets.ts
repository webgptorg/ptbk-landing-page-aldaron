import 'server-only';
import { getWorkshopDatabaseOrNull } from '@/lib/workshops/workshopDatabase';
import { loadAllSupabaseRows } from '@/lib/supabase/loadAllSupabaseRows';
import {
    abortAbandonedHostedRecordingUploads,
    abortHostedRecordingUpload,
    deleteHostedRecordingObjects,
    getHostedRecordingObject,
} from '@/lib/workshops/hostedRecording/hostedRecordingStorage';
import { STUDIO_MEDIA_ASSET_TABLE, type StudioMediaAssetRow } from './studioAssetServer';
import { verifyStudioStoredAsset } from './studioAssetS3';

const ABANDONED_UPLOAD_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;
const UNREFERENCED_OBJECT_RETENTION_MILLISECONDS = 30 * 24 * 60 * 60 * 1000;
const MAXIMUM_CLEANUP_ASSETS = 25;

/** Distinct namespace and reference registry prevent workshop-revision cleanup from owning editor objects. */
export async function cleanupStudioAssets(): Promise<number> {
    const database = getWorkshopDatabaseOrNull();
    if (!database) throw new Error('Studio asset metadata database is unavailable.');
    const uploadCutoff = new Date(Date.now() - ABANDONED_UPLOAD_MILLISECONDS).toISOString();
    const objectCutoff = new Date(Date.now() - UNREFERENCED_OBJECT_RETENTION_MILLISECONDS).toISOString();
    const candidates = await database
        .from(STUDIO_MEDIA_ASSET_TABLE)
        .select('*')
        .or(
            `and(status.in.(allocating,uploading,completing,cancelled),updated_at.lt.${uploadCutoff}),and(status.eq.verified,updated_at.lt.${objectCutoff}),status.eq.deleting`,
        )
        .order('created_at', { ascending: true })
        .limit(MAXIMUM_CLEANUP_ASSETS);
    if (candidates.error) throw new Error(candidates.error.message);
    let cleaned = 0;
    for (const candidate of (candidates.data ?? []) as StudioMediaAssetRow[]) {
        // Only unreferenced assets can be claimed. Referenced pending uploads are retained for explicit resume/cancel.
        const claimed = await database.rpc('claim_studio_media_cleanup', {
            target_asset_id: candidate.id,
            old_upload_cutoff: uploadCutoff,
            old_object_cutoff: objectCutoff,
        });
        if (claimed.error) throw new Error(claimed.error.message);
        if (claimed.data !== true) continue;
        if (candidate.upload_id && candidate.status !== 'verified')
            await abortHostedRecordingUpload(candidate.object_key, candidate.upload_id).catch(() => undefined);
        let isObjectPresent = true;
        try {
            const response = await getHostedRecordingObject(candidate.object_key, 'bytes=0-0');
            await response.Body?.transformToByteArray();
        } catch (error) {
            if (error instanceof Error && ['NoSuchKey', 'NotFound'].includes(error.name)) isObjectPresent = false;
            else throw error;
        }
        // Even a lost completion response is checked before deletion. Never remove an unverified unknown object.
        if (isObjectPresent) {
            await verifyStudioStoredAsset(candidate);
            await deleteHostedRecordingObjects([candidate.object_key]);
        }
        const removed = await database
            .from(STUDIO_MEDIA_ASSET_TABLE)
            .delete()
            .eq('id', candidate.id)
            .eq('status', 'deleting');
        if (removed.error) throw new Error(removed.error.message);
        cleaned += 1;
    }
    const registered = await loadAllSupabaseRows<{ readonly upload_id: string | null }>(
        (from, to) => database.from(STUDIO_MEDIA_ASSET_TABLE).select('upload_id').order('id').range(from, to),
        'Studio protected multipart identities',
    );
    if (!registered.rows) throw new Error(registered.errorMessage ?? 'Cannot establish protected Studio uploads.');
    const protectedUploads = new Set(registered.rows.flatMap((asset) => (asset.upload_id ? [asset.upload_id] : [])));
    await abortAbandonedHostedRecordingUploads(new Date(uploadCutoff), 'studio-assets/', protectedUploads);
    return cleaned;
}

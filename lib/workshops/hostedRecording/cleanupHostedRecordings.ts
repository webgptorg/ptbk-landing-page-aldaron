import 'server-only';

import { getWorkshopDatabaseOrNull } from '@/lib/workshops/workshopDatabase';
import { getHostedRecordingAssets, HOSTED_RECORDING_REVISION_TABLE,
    type HostedRecordingRevisionRow } from './hostedRecordingRequest';
import { abortAbandonedHostedRecordingUploads, abortHostedRecordingUpload,
    deleteHostedRecordingObjects } from './hostedRecordingStorage';
import { cleanupStudioAssets } from '@/lib/recording-studio/cleanupStudioAssets';

const ABANDONED_UPLOAD_AGE_MILLISECONDS = 24 * 60 * 60 * 1000;
const SUPERSEDED_RETENTION_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;
const MAXIMUM_CLEANUP_REVISIONS = 25;

/** Scheduler cleanup excludes the current pointer and every published revision. */
export async function cleanupHostedRecordings(): Promise<number> {
    const supabase = getWorkshopDatabaseOrNull();
    if (!supabase) throw new Error('Workshop database unavailable.');
    const oldUploadCutoff = new Date(Date.now() - ABANDONED_UPLOAD_AGE_MILLISECONDS).toISOString();
    const oldRevisionCutoff = new Date(Date.now() - SUPERSEDED_RETENTION_MILLISECONDS).toISOString();
    const query = await supabase.from(HOSTED_RECORDING_REVISION_TABLE).select('*')
        .or(`and(status.in.(draft,failed,processing,cancelled),updated_at.lt.${oldUploadCutoff}),and(status.eq.ready,updated_at.lt.${oldRevisionCutoff}),and(status.eq.superseded,superseded_at.lt.${oldRevisionCutoff})`)
        .order('created_at', { ascending: true }).limit(MAXIMUM_CLEANUP_REVISIONS);
    if (query.error) throw new Error(query.error.message);
    let cleaned = 0;
    for (const revision of (query.data ?? []) as HostedRecordingRevisionRow[]) {
        const claim = await supabase.rpc('claim_workshop_hosted_recording_cleanup', {
            target_revision_id: revision.id, old_upload_cutoff: oldUploadCutoff,
            old_revision_cutoff: oldRevisionCutoff,
        });
        if (claim.error) throw new Error(claim.error.message);
        if (claim.data !== true) continue;
        const assets = await getHostedRecordingAssets(supabase, revision.id);
        for (const asset of assets.filter((candidate) => candidate.status !== 'complete')) {
            await abortHostedRecordingUpload(asset.object_key, asset.upload_id).catch(() => undefined);
        }
        await deleteHostedRecordingObjects(assets.map((asset) => asset.object_key));
        const removal = await supabase.from(HOSTED_RECORDING_REVISION_TABLE).delete().eq('id', revision.id)
            .eq('status', 'cancelled');
        if (removal.error) throw new Error(removal.error.message);
        cleaned += 1;
    }
    await abortAbandonedHostedRecordingUploads(new Date(oldUploadCutoff));
    return cleaned + await cleanupStudioAssets();
}

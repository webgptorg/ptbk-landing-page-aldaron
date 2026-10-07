import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
import { getRecordingWorkspacePath } from '@/lib/recording-studio/recordingStudioSessionTime';
import { LEGACY_RECORDING_STUDIO_PATH } from '@/lib/recording-studio/recordingStudioTypes';
import { permanentRedirect } from 'next/navigation';

export default async function RecordingPreparationPage({ params }: { readonly params: Promise<{ recordingId: string }> }) {
    const { recordingId } = await params;
    await requireAdminSignedIn(`${LEGACY_RECORDING_STUDIO_PATH}/${encodeURIComponent(recordingId)}`);
    permanentRedirect(getRecordingWorkspacePath(recordingId));
}

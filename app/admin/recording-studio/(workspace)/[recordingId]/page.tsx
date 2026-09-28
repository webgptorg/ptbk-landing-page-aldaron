import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
import { getRecordingWorkspacePath } from '@/lib/recording-studio/recordingStudioSessionTime';

export default async function RecordingPreparationPage({ params }: { readonly params: Promise<{ recordingId: string }> }) {
    const { recordingId } = await params;
    await requireAdminSignedIn(getRecordingWorkspacePath(recordingId));
    return null;
}

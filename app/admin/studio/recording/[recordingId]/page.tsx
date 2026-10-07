import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
import { STUDIO_RECORDING_PATH } from '@/lib/recording-studio/studioProjectTypes';
export default async function StudioRecordingPage({ params }: { readonly params: Promise<{ recordingId: string }> }) {
    await requireAdminSignedIn(`${STUDIO_RECORDING_PATH}/${encodeURIComponent((await params).recordingId)}`);
    return null;
}

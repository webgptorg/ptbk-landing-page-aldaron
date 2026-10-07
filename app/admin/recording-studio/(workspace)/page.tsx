import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
import { LEGACY_RECORDING_STUDIO_PATH, RECORDING_STUDIO_PATH } from '@/lib/recording-studio/recordingStudioTypes';
import { permanentRedirect } from 'next/navigation';

export default async function RecordingSetupPage() {
    await requireAdminSignedIn(LEGACY_RECORDING_STUDIO_PATH);
    permanentRedirect(RECORDING_STUDIO_PATH);
}

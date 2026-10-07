import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
import { STUDIO_RECORDING_PATH } from '@/lib/recording-studio/studioProjectTypes';
export default async function StudioRecordingPage() {
    await requireAdminSignedIn(STUDIO_RECORDING_PATH);
    return null;
}

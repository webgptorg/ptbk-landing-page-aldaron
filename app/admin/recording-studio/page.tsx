import { RecordingStudio } from '@/components/recording-studio/RecordingStudio';
import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
import { RECORDING_STUDIO_PATH } from '@/lib/recording-studio/recordingStudioTypes';

export default async function AdminRecordingStudioPage() {
    await requireAdminSignedIn(RECORDING_STUDIO_PATH);
    return <RecordingStudio />;
}

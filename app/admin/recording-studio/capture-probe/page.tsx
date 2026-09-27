import { RecordingCaptureProbe } from '@/components/recording-studio/RecordingCaptureProbe';
import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';

const CAPTURE_PROBE_PATH = '/admin/recording-studio/capture-probe';

export default async function RecordingStudioCaptureProbePage() {
    await requireAdminSignedIn(CAPTURE_PROBE_PATH);
    return <RecordingCaptureProbe />;
}

import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
import { STUDIO_PATH, STUDIO_RECORDING_PATH } from '@/lib/recording-studio/studioProjectTypes';
import { redirect } from 'next/navigation';
export default async function StudioPage() {
    await requireAdminSignedIn(STUDIO_PATH);
    redirect(STUDIO_RECORDING_PATH);
}

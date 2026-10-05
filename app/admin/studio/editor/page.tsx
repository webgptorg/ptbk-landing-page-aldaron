import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
import { STUDIO_EDITOR_PATH } from '@/lib/recording-studio/studioProjectTypes';
export default async function StudioEditorPage() {
    await requireAdminSignedIn(STUDIO_EDITOR_PATH);
    return null;
}

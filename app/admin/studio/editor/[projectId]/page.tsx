import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
import { getStudioProjectPath } from '@/lib/recording-studio/studioProjectTypes';
export default async function StudioProjectPage({ params }: { readonly params: Promise<{ projectId: string }> }) {
    await requireAdminSignedIn(getStudioProjectPath((await params).projectId));
    return null;
}

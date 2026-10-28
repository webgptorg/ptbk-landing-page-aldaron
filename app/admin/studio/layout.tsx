import { RecordingStudio } from '@/components/recording-studio/RecordingStudio';
import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';

/** One mounted owner/capture runtime across recording, editing and individual project URLs. */
export default async function StudioLayout({ children }: { readonly children: React.ReactNode }) {
    await requireAdminSignedIn('/admin/studio');
    return (
        <>
            <RecordingStudio />
            {children}
        </>
    );
}

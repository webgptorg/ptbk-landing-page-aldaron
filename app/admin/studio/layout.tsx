import { RecordingStudio } from '@/components/recording-studio/RecordingStudio';
import { isAdminSignedIn } from '@/lib/admin/isAdminSignedIn';

/** One mounted owner/capture runtime across recording, editing and individual project URLs. */
export default async function StudioLayout({ children }: { readonly children: React.ReactNode }) {
    if (!(await isAdminSignedIn())) return <>{children}</>;
    return (
        <>
            <RecordingStudio />
            {children}
        </>
    );
}

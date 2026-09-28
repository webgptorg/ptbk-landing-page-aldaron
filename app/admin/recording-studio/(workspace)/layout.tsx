import { RecordingStudio } from '@/components/recording-studio/RecordingStudio';
import { isAdminSignedIn } from '@/lib/admin/isAdminSignedIn';

/** Both leaf pages authorize their exact address; this shell retains the local capture/lock across modes. */
export default async function RecordingWorkspaceLayout({ children }: { readonly children: React.ReactNode }) {
    // Do not mount local media/storage before authorization. The leaf owns the exact login return URL.
    if (!(await isAdminSignedIn())) return <>{children}</>;
    return <><RecordingStudio />{children}</>;
}

import { buildAdminLoginPath } from '@/lib/admin/adminLoginRedirect';
import { getCurrentAdminIdentity } from './getCurrentAdminIdentity';
import { canAccessAdminPath, type AdminIdentity } from './adminPermissions';
import { redirect } from 'next/navigation';

/**
 * Let one page of the administration render only for a signed in administrator, and send anybody else to the login
 *
 * Note: The page names itself, so that the sign in returns to the very page which was asked for
 */
export async function requireAdminSignedIn(currentAdminPath: string): Promise<AdminIdentity> {
    const identity = await getCurrentAdminIdentity();
    if (identity === null) {
        redirect(buildAdminLoginPath(currentAdminPath));
    }
    if (!canAccessAdminPath(identity, currentAdminPath)) redirect('/admin?access=denied');
    return identity;
}

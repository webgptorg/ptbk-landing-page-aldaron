import type { Metadata } from 'next';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { AdminSaveProtection } from '@/components/admin/AdminSaveProtection';
import { ADMIN_NAVIGATION_ITEMS } from '@/components/admin/adminNavigationConfig';
import { getCurrentAdminIdentity } from '@/lib/admin/getCurrentAdminIdentity';
import { canAccessAdminPath } from '@/lib/admin/adminPermissions';

export const metadata: Metadata = {
    title: 'Promptbook administration',
    robots: { index: false, follow: false },
    referrer: 'no-referrer',
};

export default async function AdminLayout({ children }: { readonly children: React.ReactNode }) {
    const identity = await getCurrentAdminIdentity();
    const allowedPaths = identity ? ADMIN_NAVIGATION_ITEMS.filter((item) => canAccessAdminPath(identity, item.path)).map((item) => item.path) : [];
    return (
        <>
            <AdminNavigation allowedPaths={allowedPaths} username={identity?.username} />
            <AdminSaveProtection />
            {children}
        </>
    );
}

import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
import { Suspense } from 'react';
import { LicenseAdministration } from '@/components/admin/licensing/LicenseAdministration';
export default async function Page() {
    await requireAdminSignedIn('/admin/promptbook-licensing');
    return <Suspense fallback={<p>Načítám licence…</p>}><LicenseAdministration/></Suspense>;
}

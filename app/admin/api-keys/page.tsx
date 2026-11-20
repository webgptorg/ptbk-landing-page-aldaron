import { Suspense } from 'react';
import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
import { API_KEYS_ADMIN_PATH } from '@/lib/ecosystem-api/contract';
import { ApiKeyAdministration } from '@/components/admin/ApiKeyAdministration';

export default async function Page() {
    await requireAdminSignedIn(API_KEYS_ADMIN_PATH);
    return <Suspense fallback={<p>Načítám API klíče…</p>}><ApiKeyAdministration /></Suspense>;
}

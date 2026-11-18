import { Suspense } from 'react';
import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
import { SubscriptionAdministration } from '@/components/admin/licensing/SubscriptionAdministration';
export default async function Page() {
    await requireAdminSignedIn('/admin/promptbook-subscriptions');
    return <Suspense fallback={<p>Načítám předplatná…</p>}><SubscriptionAdministration/></Suspense>;
}

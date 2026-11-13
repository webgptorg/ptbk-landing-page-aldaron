import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export default async function TwentyCrmOperatorPage() {
    const identity = await requireAdminSignedIn('/admin/twenty-crm');
    if (!identity.isSuperAdmin || process.env.VERCEL_ENV !== 'production' || process.env.TWENTY_CRM_OPERATOR_ENABLED !== 'true') notFound();
    return <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-4 text-2xl font-bold">CRM · Bezpečné provozní úpravy</h1>
        <p className="mb-6">Nejdřív kontrola a ověřená soukromá záloha. Načtení stránky nic nemění, žádná akce nemaže kontakty ani neposílá zprávy.</p>
        <form method="post" action="/api/admin/twenty-crm"><button className="rounded-lg border px-4 py-3" name="action" value="inspect">1. Zkontrolovat CRM bez změn</button></form>
        <form method="post" action="/api/admin/twenty-crm"><button className="rounded-lg border px-4 py-3" name="action" value="backup">2. Uložit a ověřit zálohu</button></form>
    </main>;
}

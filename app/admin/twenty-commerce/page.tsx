import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function TwentyCommerceOperatorPage() {
    const identity = await requireAdminSignedIn('/admin/twenty-commerce');
    if (!identity.isSuperAdmin || process.env.VERCEL_ENV !== 'production' || process.env.TWENTY_COMMERCE_OPERATOR_ENABLED !== 'true') notFound();
    return <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-4 text-2xl font-bold">CRM · Nákupy a platby</h1>
        <p className="mb-6">Výslovné operátorské akce. Načtení stránky nic nemění. Import neúčtuje ani neposílá e-maily.</p>
        <div className="space-y-4">
            <form method="post" action="/api/admin/twenty-commerce"><button className="rounded-lg border px-4 py-3" name="action" value="dry-run">1. Zkontrolovat zdroj bez zápisu</button></form>
            <form method="post" action="/api/admin/twenty-commerce"><button className="rounded-lg border px-4 py-3" name="action" value="setup">2. Vytvořit chybějící objekty a pole</button></form>
            <form method="post" action="/api/admin/twenty-commerce"><button className="rounded-lg border px-4 py-3" name="action" value="verify">3. Importovat a ověřit opakování</button></form>
        </div>
    </main>;
}

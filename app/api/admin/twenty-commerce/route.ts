import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { runTwentyCommerceSync } from '@/lib/crm/runTwentyCommerceSync';
import { getTwentyContactSyncSettings } from '@/lib/crm/runTwentyContactSync';
import { ensureTwentyCommerceSchema } from '@/lib/crm/twentyCommerceSchema';
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;
const endpoint = '/api/admin/twenty-commerce';
const headers = {
    'Cache-Control': 'private, no-store',
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'",
    'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex, nofollow',
};

function enabled() {
    return process.env.VERCEL_ENV === 'production' && process.env.TWENTY_COMMERCE_OPERATOR_ENABLED === 'true';
}

function page(result?: unknown, status = 200) {
    const escaped = JSON.stringify(result ?? { status: 'ready' }, null, 2)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const forms = [
        ['dry-run', '1. Zkontrolovat zdroj bez zápisu'],
        ['setup', '2. Vytvořit chybějící objekty a pole'],
        ['verify', '3. Importovat a ověřit opakování'],
    ].map(([action, label]) => `<form method="post" action="${endpoint}"><button name="action" value="${action}">${label}</button></form>`).join('');
    return new NextResponse(`<!doctype html><html lang="cs"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CRM · Nákupy a platby</title><style>body{font:16px system-ui;max-width:900px;margin:40px auto;padding:20px;color:#15263b}button{font:inherit;padding:12px;margin:8px 0;cursor:pointer}pre{white-space:pre-wrap;background:#f2f4f7;padding:20px;border-radius:8px}a{color:#234eb2}</style><h1>CRM · Nákupy a platby</h1><p>Výslovné operátorské akce. Načtení stránky nic nemění. Import neúčtuje ani neposílá e-maily.</p><pre role="status">${escaped}</pre>${forms}<p>Po úspěšném ověření odeberte dočasné oprávnění Datový model a nastavte TWENTY_COMMERCE_OPERATOR_ENABLED=false. Automatickou synchronizaci povolte zvlášť pomocí TWENTY_COMMERCE_SYNC_ENABLED=true.</p><a href="/admin">Administrace</a></html>`, { status, headers });
}

export async function GET(request: NextRequest) {
    const denied = await getUnauthorizedResponseOrNull(request);
    if (denied) return denied;
    return enabled() ? page() : new NextResponse(null, { status: 404 });
}

export async function POST(request: NextRequest) {
    const denied = await getUnauthorizedResponseOrNull(request);
    if (denied) return denied;
    if (!enabled()) return new NextResponse(null, { status: 404 });
    if (!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')) {
        return page({ error: 'operator_form_required' }, 415);
    }
    const action = (await request.formData()).get('action');
    if (!['dry-run', 'setup', 'verify'].includes(String(action))) return page({ error: 'operator_invalid_action' }, 400);
    try {
        if (action === 'setup') {
            const settings = getTwentyContactSyncSettings();
            if (!settings) return page({ error: 'commerce_production_settings_required' }, 503);
            return page({ action, ...await ensureTwentyCommerceSchema(settings, true) });
        }
        const result = await runTwentyCommerceSync(action === 'dry-run' ? { dryRun: true } : { verify: true });
        return page({ action, result }, 'busy' in result && result.busy ? 409 : 200);
    } catch (error) {
        const value = error as { code?: string; message?: string; status?: number };
        const candidate = value.code ?? value.message ?? '';
        const code = /^(commerce_[a-z_]+|twenty_[a-z_0-9]+)$/.test(candidate) ? candidate : 'commerce_operator_failed';
        const status = Number.isInteger(value.status) ? value.status : undefined;
        console.error('TWENTY_COMMERCE_OPERATOR_FAILED', { code, status });
        return page({ action, error: code, status }, 502);
    }
}

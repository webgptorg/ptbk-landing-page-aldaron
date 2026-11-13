import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { backupTwentyCrm, enrichTwentyCrm, ensureTwentyCrmOperationalFields, inspectTwentyCrm, inspectTwentyCrmSyncHealth, loadTwentyCrmBackup, verifyTwentyCrmBackupPreservation } from '@/lib/crm/twentyCrmOperations';
import { getTwentyContactSyncSettings, runTwentyContactSync } from '@/lib/crm/runTwentyContactSync';
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;
const endpoint = '/api/admin/twenty-crm';
const headers = { 'Cache-Control': 'private, no-store', 'Content-Type': 'text/html; charset=utf-8',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'",
    'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow' };
const enabled = () => process.env.VERCEL_ENV === 'production' && process.env.TWENTY_CRM_OPERATOR_ENABLED === 'true';
const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function page(result: unknown = { status: 'ready' }, status = 200, backupKey = '', archive?: string) {
    const forms = [['inspect', '1. Zkontrolovat CRM bez změn'], ['backup', '2. Uložit a ověřit zálohu'], ['schema', '3. Doplnit chybějící provozní pole'], ['enrich', '4. Doplnit prázdná pole a zařadit zdroje (nejvýše 50 záznamů)'], ['health', '5. Ověřit stav pravidelného přenosu'], ['sync', '6. Zpracovat běžnou frontu webových událostí'], ['verify', '7. Porovnat původní data se zálohou bez změn'], ['export', 'Zobrazit ověřenou zálohu pro export']]
        .map(([action, label]) => `<form method="post" action="${endpoint}"><input type="hidden" name="backupKey" value="${escape(backupKey)}"><button name="action" value="${action}">${label}</button></form>`).join('');
    return new NextResponse(`<!doctype html><html lang="cs"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CRM · Bezpečné provozní úpravy</title><style>body{font:16px system-ui;max-width:1100px;margin:40px auto;padding:20px;color:#172b51}button{font:inherit;padding:12px;margin:8px 0;cursor:pointer}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#eef3fa;padding:20px}textarea{width:100%;height:160px}</style><h1>CRM · Bezpečné provozní úpravy</h1><p>Načtení stránky nic nemění. Změna schématu pouze přidává pole, vyžaduje ověřenou zálohu a nemaže ani nepřepisuje kontakty. Žádná akce neposílá e-maily.</p><pre role="status">${escape(JSON.stringify(result, null, 2))}</pre>${archive ? `<label for="backup-archive">Soukromá ověřená záloha (gzip / base64)</label><textarea id="backup-archive" readonly>${archive}</textarea>` : ''}${forms}<p>Po dokončení nastavte TWENTY_CRM_OPERATOR_ENABLED=false.</p><a href="/admin">Administrace</a></html>`, { status, headers });
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
    if (!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')) return page({ error: 'crm_operator_form_required' }, 415);
    const form = await request.formData();
    const action = String(form.get('action'));
    const backupKey = String(form.get('backupKey') ?? '');
    if (!['inspect', 'backup', 'schema', 'enrich', 'health', 'sync', 'verify', 'export'].includes(action)) return page({ error: 'crm_invalid_action' }, 400);
    try {
        const settings = getTwentyContactSyncSettings();
        if (!settings) return page({ error: 'crm_settings_required' }, 503);
        if (action === 'inspect') return page({ action, result: await inspectTwentyCrm(settings) }, 200, backupKey);
        if (action === 'health') return page({ action, result: await inspectTwentyCrmSyncHealth(settings) }, 200, backupKey);
        if (action === 'verify') {
            const result = await verifyTwentyCrmBackupPreservation(settings, backupKey);
            return page({ action, result }, result.verified ? 200 : 409, backupKey);
        }
        if (action === 'sync') {
            const result = await runTwentyContactSync(settings);
            return page({ action, result }, result.failed ? 502 : result.busy ? 409 : 200, backupKey);
        }
        if (action === 'backup') {
            const backup = await backupTwentyCrm(settings);
            return page({ action, result: backup }, 200, backup.key);
        }
        if (action === 'export') {
            const backup = await loadTwentyCrmBackup(backupKey);
            return page({ action, verified: true, backupKey }, 200, backupKey, backup.bytes.toString('base64'));
        }
        if (action === 'enrich') return page({ action, result: await enrichTwentyCrm(settings, backupKey) }, 200, backupKey);
        return page({ action, result: await ensureTwentyCrmOperationalFields(settings, backupKey) }, 200, backupKey);
    } catch (error) {
        const value = error as { message?: string; code?: string; status?: number };
        const candidate = value.code ?? value.message ?? '';
        const code = /^(crm_[a-z_]+|twenty_[a-z_0-9]+)$/.test(candidate) ? candidate : 'crm_operator_failed';
        const status = Number.isInteger(value.status) ? value.status : undefined;
        console.error('TWENTY_CRM_OPERATOR_FAILED', { code, status });
        return page({ action, error: code, status }, 502, backupKey);
    }
}

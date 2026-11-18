import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { getAdminIdentityForSession } from '@/lib/admin/adminIdentity';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { memberResponse } from '@/lib/promptbook-billing/memberAccess';
import { licenseDatabase } from '@/lib/promptbook-licensing/accounts';
import { licenseAdminMutationSchema, type AdminLicense } from '@/lib/promptbook-licensing/adminContract';
import { adminEmailPattern, loadLicenseDetail, readAdminPageQuery } from '@/lib/promptbook-licensing/adminData';
import { readBoundedJson } from '@/lib/api/readBoundedJson';

/** Private billing sections stay superadmin-only through the existing session and cross-site guards. */
export async function POST(request: NextRequest) {
    const rejected = await getUnauthorizedResponseOrNull(request);
    if (rejected) return rejected;
    const parsed = licenseAdminMutationSchema.safeParse(await readBoundedJson(request, 16_384).catch(() => null));
    if (!parsed.success) return memberResponse({ error: 'Neplatné zadání. Zkontrolujte kapacity, důvod a platnost.' }, 400);
    try {
        const db = licenseDatabase();
        const p = parsed.data;
        if (p.action === 'referral') {
            const response = await db.rpc('correct_promptbook_referral', { p_account: p.accountId, p_code: p.code || null, p_reason: p.reason });
            if (response.error) throw new Error('Referral unavailable');
            return memberResponse({ saved: true });
        }
        const identity = await getAdminIdentityForSession(request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value);
        if (!identity?.isSuperAdmin) return memberResponse({ error: 'Forbidden' }, 403);
        const fields = p.action === 'grant' || p.action === 'update' ? p : null;
        const validFrom = fields?.validFrom ?? new Date().toISOString();
        if (fields?.validUntil && Date.parse(fields.validUntil) <= Date.parse(validFrom)) return memberResponse({ error: 'Konec platnosti musí následovat po začátku.' }, 400);
        const result = await db.rpc('admin_mutate_promptbook_grant', {
            p_action: p.action, p_email: p.action === 'grant' ? p.email : null,
            p_grant: 'grantId' in p ? p.grantId : p.action === 'grant' ? p.requestId ?? null : null, p_revision: 'revision' in p ? p.revision : null,
            p_kind: fields?.kind ?? null, p_label: fields?.label ?? null, p_capabilities: fields?.capabilities ?? null,
            p_seats: fields?.communitySeats ?? null, p_from: fields ? validFrom : null, p_until: fields?.validUntil ?? null,
            p_reason: p.reason, p_actor: identity.username, p_is_test: p.isTest,
        });
        if (result.error) {
            if (result.error.code === '40001') return memberResponse({ error: 'Záznam mezitím změnil jiný administrátor. Načtěte aktuální verzi.' }, 409);
            if (result.error.code === 'P0002') return memberResponse({ error: 'Licence nebyla nalezena.' }, 404);
            if (result.error.code === '22023') return memberResponse({ error: 'Tento záznam nelze upravit.' }, 400);
            throw new Error('Grant unavailable');
        }
        return memberResponse({ saved: true, grantId: result.data });
    } catch { return memberResponse({ error: 'Změnu nelze uložit.' }, 503); }
}

export async function GET(request: NextRequest) {
    const rejected = await getUnauthorizedResponseOrNull(request);
    if (rejected) return rejected;
    try {
        const params = request.nextUrl.searchParams;
        const { offset, isTest, query, limit } = readAdminPageQuery(params);
        if (params.has('grant')) {
            const detail = await loadLicenseDetail(z.string().uuid().parse(params.get('grant')), z.enum(['manual','subscription']).parse(params.get('source') ?? 'manual'), isTest);
            return detail ? memberResponse(detail) : memberResponse({ error: 'Licence nebyla nalezena.' }, 404);
        }
        const state = z.enum(['all','active','scheduled','expired','revoked','deleted','unverified']).parse(params.get('state') ?? 'all');
        let lookup = licenseDatabase().from('promptbook_admin_licenses').select('*', { count: 'exact' }).eq('is_test', isTest);
        if (state !== 'all') lookup = lookup.eq('state', state);
        if (query) lookup = lookup.ilike('email', adminEmailPattern(query));
        const result = await lookup.order('created_at', { ascending: false }).order('id').range(offset, offset+limit-1);
        if (result.error) throw new Error('License list unavailable');
        return memberResponse({ items: result.data as AdminLicense[], total: result.count ?? 0, offset, limit });
    } catch (error) {
        return error instanceof z.ZodError ? memberResponse({ error: 'Neplatný filtr.' }, 400) : memberResponse({ error: 'Evidence není dostupná.' }, 503);
    }
}

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { memberResponse } from '@/lib/promptbook-billing/memberAccess';
import { licenseDatabase } from '@/lib/promptbook-licensing/accounts';
import { licenseCapabilitiesSchema } from '@/lib/promptbook-licensing/contract';
const schema = z.discriminatedUnion('action', [
    z
        .object({
            action: z.literal('grant'),
            email: z.string().trim().toLowerCase().email().max(254),
            kind: z.enum(['partner', 'custom']),
            communitySeats: z.number().int().min(0).max(1000),
            capabilities: licenseCapabilitiesSchema,
            validUntil: z.string().datetime().nullable(),
            reason: z.string().trim().min(5).max(1000),
        })
        .strict(),
    z
        .object({
            action: z.literal('referral'),
            accountId: z.string().uuid(),
            code: z
                .string()
                .trim()
                .max(80)
                .regex(/^[A-Za-z0-9_-]*$/),
            reason: z.string().trim().min(5).max(1000),
        })
        .strict(),
]);
/** Unknown admin sections are superadmin-only through the existing guard. */
export async function POST(request: NextRequest) {
    const rejected = await getUnauthorizedResponseOrNull(request);
    if (rejected) return rejected;
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return memberResponse({ error: 'Neplatné zadání.' }, 400);
    try {
        const db = licenseDatabase();
        const p = parsed.data;
        if (p.action === 'grant') {
            const added = await db
                .from('promptbook_license_accounts')
                .upsert({ email: p.email, is_test: false }, { onConflict: 'email,is_test', ignoreDuplicates: true });
            if (added.error) throw new Error();
            const account = await db
                .from('promptbook_license_accounts')
                .select('id')
                .eq('email', p.email)
                .eq('is_test', false)
                .single();
            if (account.error) throw new Error();
            const grant = await db
                .from('promptbook_license_grants')
                .insert({
                    account_id: account.data.id,
                    kind: p.kind,
                    capabilities: p.capabilities,
                    community_seats: p.communitySeats,
                    valid_until: p.validUntil,
                    reason: p.reason,
                });
            if (grant.error) throw new Error();
        } else {
            const result = await db.rpc('correct_promptbook_referral', {
                p_account: p.accountId,
                p_code: p.code || null,
                p_reason: p.reason,
            });
            if (result.error) throw new Error();
        }
        return memberResponse({ saved: true });
    } catch {
        return memberResponse({ error: 'Změnu nelze uložit.' }, 503);
    }
}
export async function GET(request: NextRequest) {
    const rejected = await getUnauthorizedResponseOrNull(request);
    if (rejected) return rejected;
    try {
        const db = licenseDatabase();
        const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase();
        if (!email || !z.string().email().safeParse(email).success) return memberResponse({ accounts: [] });
        const accounts = await db
            .from('promptbook_license_accounts')
            .select('*')
            .eq('email', email)
            .eq('is_test', false);
        if (accounts.error) throw new Error();
        const ids = accounts.data.map((a) => a.id);
        if (!ids.length) return memberResponse({ accounts: [] });
        const [grants, history] = await Promise.all([
            db.from('promptbook_license_grants').select('*').in('account_id', ids),
            db
                .from('promptbook_referral_history')
                .select('*')
                .in('account_id', ids)
                .order('created_at', { ascending: false })
                .limit(100),
        ]);
        if (grants.error || history.error) throw new Error();
        return memberResponse({ accounts: accounts.data, grants: grants.data, history: history.data });
    } catch {
        return memberResponse({ error: 'Evidence není dostupná.' }, 503);
    }
}

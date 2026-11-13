import { NextRequest } from 'next/server';
import { z } from 'zod';
import { memberResponse, rejectCrossSiteMemberRequest } from '@/lib/promptbook-billing/memberAccess';
import {
    accountGrants,
    communitySeatLimit,
    licenseDatabase,
    verifiedLicenseAccount,
} from '@/lib/promptbook-licensing/accounts';
import { capabilitiesForPlan } from '@/lib/promptbook-licensing/contract';
import { createContactNoticeFields, readContactSubmissionEvidence } from '@/lib/contacts/contactSubmissionPolicy';

const actionSchema = z.discriminatedUnion('action', [
    z
        .object({
            action: z.literal('activate'),
            ready: z.literal(true),
            acceptedTrialTerms: z.literal(true),
            country: z.enum(['CZ', 'SK']),
        })
        .strict(),
    z
        .object({
            action: z.literal('seat'),
            email: z.string().trim().toLowerCase().email().max(254),
            remove: z.boolean().default(false),
        })
        .strict(),
    z
        .object({
            action: z.literal('referral'),
            code: z
                .string()
                .trim()
                .max(80)
                .regex(/^[a-zA-Z0-9_-]*$/),
            provenance: z.enum(['link', 'customer']),
        })
        .strict(),
]);
export async function GET(request: NextRequest) {
    try {
        const account = await verifiedLicenseAccount(request);
        if (!account) return memberResponse({ verified: false });
        const grants = await accountGrants(account);
        const seats = await licenseDatabase()
            .from('promptbook_community_seats')
            .select('email,assigned_at')
            .eq('account_id', account.id)
            .order('assigned_at');
        if (seats.error) throw new Error('Seats unavailable');
        return memberResponse({
            verified: true,
            email: account.email,
            grants,
            seats: seats.data,
            communitySeatLimit: await communitySeatLimit(account),
            referral: account.referral_code,
        });
    } catch {
        return memberResponse({ error: 'Licence se teď nepodařilo načíst. Běh enginu tím není omezen.' }, 503);
    }
}
export async function POST(request: NextRequest) {
    const rejected = rejectCrossSiteMemberRequest(request);
    if (rejected) return rejected;
    const parsed = actionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return memberResponse({ error: 'Zkontrolujte zadané údaje.' }, 400);
    try {
        const account = await verifiedLicenseAccount(request);
        if (!account) return memberResponse({ error: 'Nejdříve ověřte e-mail.' }, 401);
        const database = licenseDatabase();
        const input = parsed.data;
        if (input.action === 'activate') {
            const evidence = readContactSubmissionEvidence(
                createContactNoticeFields('cs'),
                'promptbook-business-trial',
            );
            const result = await database.rpc('activate_promptbook_trial', {
                p_account: account.id,
                p_campaign: 'business-launch-2026',
                p_capabilities: capabilitiesForPlan('business'),
                p_evidence: evidence,
                p_acceptance: {
                    termsVersion: '2026-11-13-online-v3',
                    country: input.country,
                    engineReady: true,
                    acceptedAt: new Date().toISOString(),
                },
            });
            if (result.error) throw new Error('Trial unavailable');
        } else if (input.action === 'seat') {
            if (input.remove) {
                const result = await database
                    .from('promptbook_community_seats')
                    .delete()
                    .eq('account_id', account.id)
                    .eq('email', input.email);
                if (result.error) throw new Error('Seat removal unavailable');
            } else {
                const result = await database.rpc('assign_promptbook_community_seat', {
                    p_account: account.id,
                    p_email: input.email,
                    p_limit: await communitySeatLimit(account),
                });
                if (result.error) throw new Error('Seat assignment unavailable');
                if (!result.data)
                    return memberResponse(
                        { error: 'Všechna komunitní místa jsou obsazená. Nejprve uvolněte některé místo.' },
                        409,
                    );
            }
        } else {
            const code = input.code || null;
            // An editable attribution assertion is evidence, never automatic commission approval.
            const result = await database.rpc('set_promptbook_customer_referral', {
                p_account: account.id,
                p_code: code,
                p_provenance: input.provenance,
            });
            if (result.error) throw new Error('Referral unavailable');
        }
        return memberResponse({ saved: true });
    } catch {
        return memberResponse({ error: 'Změnu se teď nepodařilo uložit. Zkuste to znovu.' }, 503);
    }
}

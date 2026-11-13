import 'server-only';
import type { NextRequest } from 'next/server';
import { readMemberEmailCookie } from '@/lib/promptbook-billing/memberAccess';
import {
    getBillingDatabase,
    PROMPTBOOK_ORDERS_TABLE,
    type PromptbookOrder,
} from '@/lib/promptbook-billing/billingOrders';
import { getStripeConfigurationOrNull } from '@/lib/payments/stripeConfiguration';
import {
    capabilitiesForPlan,
    isGrantCurrent,
    licenseCapabilitiesSchema,
    type LicenseGrant,
    type LicenseSnapshot,
} from './contract';

export type LicenseAccount = { id: string; email: string; is_test: boolean; referral_code: string | null };
export function licenseDatabase() {
    const database = getBillingDatabase();
    if (!database) throw new Error('License storage unavailable');
    return database;
}
export async function ensureLicenseAccount(email: string): Promise<void> {
    const result = await licenseDatabase()
        .from('promptbook_license_accounts')
        .upsert(
            { email, is_test: getStripeConfigurationOrNull()?.isTestMode ?? false },
            { onConflict: 'email,is_test', ignoreDuplicates: true },
        );
    if (result.error) throw new Error('Account creation unavailable');
}
export async function verifiedLicenseAccount(request: NextRequest): Promise<LicenseAccount | null> {
    const email = readMemberEmailCookie(request);
    if (!email) return null;
    const isTest = getStripeConfigurationOrNull()?.isTestMode ?? false;
    const result = await licenseDatabase()
        .from('promptbook_license_accounts')
        .select('id,email,is_test,referral_code')
        .eq('email', email)
        .eq('is_test', isTest)
        .maybeSingle<LicenseAccount>();
    if (result.error) throw new Error('Account unavailable');
    return result.data;
}
export async function accountGrants(account: LicenseAccount) {
    const database = licenseDatabase();
    const [custom, paid] = await Promise.all([
        database.from('promptbook_license_grants').select('*').eq('account_id', account.id).order('created_at'),
        database
            .from(PROMPTBOOK_ORDERS_TABLE)
            .select('*')
            .eq('email', account.email)
            .eq('is_test', account.is_test)
            .not('paid_through', 'is', null)
            .limit(1000),
    ]);
    if (custom.error || paid.error) throw new Error('Grants unavailable');
    const grants: (LicenseGrant & { communitySeats: number; kind: string; campaign?: string })[] = [
        ...(custom.data ?? []).map((row) => ({
            id: row.id,
            validFrom: row.valid_from,
            validUntil: row.valid_until,
            capabilities: licenseCapabilitiesSchema.parse(row.capabilities),
            communitySeats: row.community_seats,
            kind: row.kind,
            campaign: row.campaign,
        })),
        ...((paid.data ?? []) as PromptbookOrder[])
            .filter((row) => row.confirmed_at && row.stripe_subscription_id && row.paid_through)
            .map((row) => ({
                id: row.id,
                validFrom: row.confirmed_at!,
                validUntil: row.paid_through,
                capabilities: capabilitiesForPlan(row.plan),
                communitySeats: row.plan === 'business' ? 10 : 1,
                kind: 'subscription',
            })),
    ];
    return grants;
}
/** Community grants stay on the website and never enter the App API. */
export async function licenseSnapshot(account: LicenseAccount): Promise<LicenseSnapshot> {
    const grants = await accountGrants(account);
    return {
        version: 1,
        subject: account.id,
        generatedAt: new Date().toISOString(),
        refreshAfterSeconds: 900,
        enforcement: 'advisory',
        manageUrl: 'https://www.ptbk.io/cs/pricing/predplatne',
        grants: grants
            .filter((grant) => isGrantCurrent(grant, Date.now()))
            .map(({ id, validFrom, validUntil, capabilities }) => ({ id, validFrom, validUntil, capabilities })),
    };
}
export async function communitySeatLimit(account: LicenseAccount): Promise<number> {
    return (await accountGrants(account))
        .filter((grant) => isGrantCurrent(grant, Date.now()))
        .reduce((sum, grant) => sum + grant.communitySeats, 0);
}
export async function hasLicenseCommunityAccess(email: string): Promise<boolean> {
    const database = licenseDatabase();
    const seats = await database
        .from('promptbook_community_seats')
        .select('account_id')
        .eq('email', email.trim().toLowerCase())
        .limit(1000);
    if (seats.error) throw new Error('Community grants unavailable');
    if (!seats.data?.length) return false;
    const accounts = await database
        .from('promptbook_license_accounts')
        .select('*')
        .in(
            'id',
            seats.data.map((row) => row.account_id),
        )
        .eq('is_test', false);
    if (accounts.error) throw new Error('Community accounts unavailable');
    for (const account of accounts.data as LicenseAccount[]) {
        const limit = await communitySeatLimit(account);
        // Keep the earliest assigned seats when the account has fewer places after a downgrade.
        const assigned = await database
            .from('promptbook_community_seats')
            .select('email')
            .eq('account_id', account.id)
            .order('assigned_at')
            .order('email')
            .limit(Math.max(1, limit));
        if (assigned.error) throw new Error('Community seats unavailable');
        if (limit > 0 && assigned.data?.some((row) => row.email === email.trim().toLowerCase())) return true;
    }
    return false;
}

import 'server-only';
import type { NextRequest } from 'next/server';
import { readMemberEmailCookie } from '@/lib/promptbook-billing/memberAccess';
import {
    getBillingDatabase,
    PROMPTBOOK_ORDERS_TABLE,
    type PromptbookOrder,
} from '@/lib/promptbook-billing/billingOrders';
import { getStripeConfigurationOrNull } from '@/lib/payments/stripeConfiguration';
import { licenseCapabilitiesSchema, licenseSnapshotSchema, type LicenseSnapshot } from './contract';
import {
    grantDates,
    isAccountGrantCurrent,
    isSoftwareGrant,
    numericGrant,
    subscriptionGrant,
    type AccountGrant,
    type PaidLicenseInvoice,
} from './grants';

export type LicenseAccount = { id: string; email: string; is_test: boolean; referral_code: string | null };
type CustomGrantRow = {
    id: string;
    valid_from: string;
    valid_until: string | null;
    capabilities: unknown;
    community_seats: number;
    kind: 'trial' | 'partner' | 'custom';
    campaign: string | null;
};
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
/** Page explicitly: PostgREST's default row cap must not silently drop a customer's grants/history. */
async function licenseRows<T>(page: (offset: number) => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
    const rows: T[] = [];
    for (let offset = 0; offset <= 10_000; offset += 500) {
        const result = await page(offset);
        if (result.error || !result.data) throw new Error('License evidence unavailable');
        rows.push(...result.data);
        if (rows.length > 10_000) throw new Error('License evidence exceeds read bound');
        if (result.data.length < 500) return rows;
    }
    throw new Error('License evidence exceeds read bound');
}
export function accountOrders(email: string, isTest: boolean): Promise<PromptbookOrder[]> {
    return licenseRows<PromptbookOrder>((offset) => licenseDatabase()
        .from(PROMPTBOOK_ORDERS_TABLE).select('*').eq('email', email).eq('is_test', isTest)
        .order('id').range(offset, offset + 499));
}
export async function accountGrants(account: LicenseAccount): Promise<AccountGrant[]> {
    const database = licenseDatabase();
    const [custom, paid] = await Promise.all([
        licenseRows<CustomGrantRow>((offset) => database.from('promptbook_license_grants').select('*')
            .eq('account_id', account.id).order('id').range(offset, offset + 499)),
        accountOrders(account.email, account.is_test),
    ]);
    const paidIds = paid.filter((order) => order.confirmed_at && order.stripe_subscription_id && order.paid_through)
        .map((order) => order.id);
    const invoices: PaidLicenseInvoice[] = [];
    for (let index = 0; index < paidIds.length; index += 100) {
        invoices.push(...await licenseRows<PaidLicenseInvoice>((offset) => database.from('promptbook_invoices')
            .select('order_id,paid_at,paid_through,amount_paid,refunded_amount')
            .in('order_id', paidIds.slice(index, index + 100)).order('stripe_invoice_id').range(offset, offset + 499)));
    }
    const grants: AccountGrant[] = [
        ...custom.map((row) => {
            if (!['trial', 'partner', 'custom'].includes(row.kind)) throw new Error('Unknown grant kind');
            return {
                id: row.id,
                ...grantDates(row.valid_from, row.valid_until),
                capabilities: licenseCapabilitiesSchema.parse(row.capabilities),
                communitySeats: row.community_seats,
                kind: row.kind,
                campaign: row.campaign,
                label: row.kind === 'trial' ? 'Business – zkušební období' : 'Licence na míru',
            };
        }),
        ...paid.flatMap((order) => {
            const grant = subscriptionGrant(order, invoices.filter((invoice) => invoice.order_id === order.id));
            return grant ? [grant] : [];
        }),
    ];
    return grants;
}
/** Community grants stay on the website and never enter the App API. */
export async function licenseSnapshot(account: LicenseAccount): Promise<LicenseSnapshot> {
    const grants = await accountGrants(account);
    return accountSnapshot(account, grants, new Date());
}
export function accountSnapshot(account: LicenseAccount, grants: AccountGrant[], now: Date): LicenseSnapshot {
    return licenseSnapshotSchema.parse({
        version: 1,
        subject: account.id,
        generatedAt: now.toISOString(),
        refreshAfterSeconds: 900,
        enforcement: 'advisory',
        manageUrl: 'https://www.ptbk.io/cs/pricing/predplatne',
        grants: grants
            .filter((grant) => isSoftwareGrant(grant) && isAccountGrantCurrent(grant, now.getTime()))
            .map(numericGrant),
    });
}
export async function communitySeatLimit(account: LicenseAccount): Promise<number> {
    return (await accountGrants(account))
        .filter((grant) => isAccountGrantCurrent(grant, Date.now()))
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

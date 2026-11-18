import 'server-only';
import { accountGrants, accountOrders, accountSnapshot, licenseDatabase, type LicenseAccount } from './accounts';
import { isAccountGrantCurrent, isSoftwareGrant, type AccountGrant } from './grants';
import { licenseLookupRequestSchema, licenseLookupResponseSchema, type LicenseLookupResponse } from './lookupContract';

export class LicenseAccountBackfillRequired extends Error {
    constructor() { super('License account reconciliation required'); }
}

/** No upsert, activation, Stripe call or CRM write is permitted in this resolver. Production only. */
export async function lookupLicenseByEmail(input: string): Promise<LicenseLookupResponse> {
    const { email } = licenseLookupRequestSchema.parse({ email: input });
    const result = await licenseDatabase().from('promptbook_license_accounts').select('id,email,is_test,referral_code')
        .eq('email', email).eq('is_test', false).maybeSingle<LicenseAccount>();
    if (result.error) throw new Error('License account unavailable');
    const account = result.data;
    if (!account) {
        const orders = await accountOrders(email, false);
        if (orders.some((order) => order.confirmed_at || order.first_paid_at || order.paid_through)) {
            throw new LicenseAccountBackfillRequired();
        }
    }
    const grants = account ? await accountGrants(account) : [];
    return licenseOverview(account, grants, new Date());
}

export function licenseOverview(account: LicenseAccount | null, grants: AccountGrant[], now: Date): LicenseLookupResponse {
    const software = grants.filter(isSoftwareGrant);
    const current = software.filter((grant) => isAccountGrantCurrent(grant, now.getTime()));
    const paid = current.filter((grant) => grant.kind !== 'trial');
    const future = software.some((grant) => !grant.revoked && Date.parse(grant.validFrom) > now.getTime());
    const status = paid.length ? 'active' : current.length ? 'trial' : future ? 'scheduled' : software.length ? 'expired' : 'none';
    const label = status === 'active' ? (current.length === 1 ? paid[0]!.label : `${current.length} aktivní licence`) :
        status === 'trial' ? (current.length === 1 ? current[0]!.label : `${current.length} aktivní zkušební licence`) :
        status === 'scheduled' ? 'Licence začne platit později' :
        status === 'expired' ? 'Platnost licence skončila' : 'Bez aktivní licence';
    return licenseLookupResponseSchema.parse({
        schemaVersion: 1,
        status,
        display: { label },
        manageUrl: 'https://www.ptbk.io/cs/pricing/predplatne',
        generatedAt: now.toISOString(),
        refreshAfterSeconds: 900,
        enforcement: 'advisory',
        snapshot: account ? accountSnapshot(account, grants, now) : null,
    });
}

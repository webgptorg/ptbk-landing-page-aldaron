import { getStripeConfigurationOrNull } from '@/lib/payments/stripeConfiguration';

export { PROMPTBOOK_ONLINE_TERMS_PATH, PROMPTBOOK_ONLINE_TERMS_VERSION } from '@/lib/legal/promptbookOnlineTermsVersion';

export const PROMPTBOOK_MEMBER_PATH = '/cs/pricing/predplatne';

export function getBillingSetting(name: string): string {
    return process.env[name]?.trim() ?? '';
}

export function getPromptbookBillingAvailability() {
    const stripe = getStripeConfigurationOrNull();
    const supportedVersion = getBillingSetting('PROMPTBOOK_BILLING_ENGINE_VERSION');
    const engineLicenceUrl = getBillingSetting('PROMPTBOOK_BILLING_ENGINE_LICENCE_URL');
    const supportEmail = getBillingSetting('PROMPTBOOK_BILLING_SUPPORT_EMAIL');
    const portalLoginUrl = getBillingSetting('PROMPTBOOK_BILLING_PORTAL_LOGIN_URL');
    const isLocalSandbox = process.env.NODE_ENV !== 'production' && stripe?.isTestMode === true;
    const enabled =
        getBillingSetting('PROMPTBOOK_BILLING_ENABLED') === 'true' &&
        !!stripe?.webhookSigningSecret &&
        /^(?:sk|rk)_(?:live|test)_/.test(stripe.secretKey) &&
        (!stripe.isTestMode || isLocalSandbox) &&
        (isLocalSandbox || (getBillingSetting('PROMPTBOOK_BILLING_EMAIL_VERIFICATION_ENABLED') === 'true' &&
            !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) &&
        getBillingSetting('PROMPTBOOK_BILLING_ACCESS_SECRET').length >= 32 &&
        !!getBillingSetting('PROMPTBOOK_BILLING_PORTAL_CONFIGURATION_ID') &&
        !!getBillingSetting('PROMPTBOOK_BILLING_CZ_INVOICE_TEMPLATE_ID') &&
        !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
        !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
        /^[\w.-]{1,80}$/.test(supportedVersion) &&
        /^https:\/\/github\.com\/webgptorg\/promptbook\/blob\/[a-f0-9]{40}\/.+$/i.test(engineLicenceUrl) &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail);
    const slovakiaEnabled =
        enabled &&
        getBillingSetting('PROMPTBOOK_BILLING_SK_ENABLED') === 'true' &&
        !!getBillingSetting('PROMPTBOOK_BILLING_SK_INVOICE_TEMPLATE_ID') &&
        !!getBillingSetting('PROMPTBOOK_BILLING_SUPPLIER_TAX_ID');
    return {
        enabled,
        slovakiaEnabled,
        supportedVersion,
        engineLicenceUrl,
        supportEmail,
        isTest: stripe?.isTestMode === true,
        portalLoginUrl: /^https:\/\/billing\.stripe\.com\/p\/login\/[\w-]+$/.test(portalLoginUrl) ? portalLoginUrl : '',
    };
}

export function getBillingOrigin(request: Request): string {
    const url = new URL(request.url);
    if (process.env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(url.hostname)) {
        return url.origin;
    }

    const host = request.headers.get('host');
    return host === 'ptbk.io' ? 'https://ptbk.io' : 'https://www.ptbk.io';
}

import 'server-only';
import { AVATAR_PUBLIC_PRICE_CZK } from './presentation';
import { getPublicRequestHostname, normalizeHostname } from '@/lib/domains/publicDomainRouting';
import { getStripeConfigurationOrNull } from '@/lib/payments/stripeConfiguration';

export const AVATAR_PRICE_CZK = AVATAR_PUBLIC_PRICE_CZK;
export const AVATAR_TERMS_VERSION = '2026-11-17-v1';
export const AVATAR_TERMS_PATH = '/avatar/legal/terms/2026-11-17-v1';
export const AVATAR_PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' };
const PERSONAL_HOSTS = ['pavolhejny.cz', 'www.pavolhejny.cz', 'pavolhejny.com', 'www.pavolhejny.com'];

export class AvatarError extends Error {
    constructor(message: string, readonly status = 503) { super(message); this.name = 'AvatarError'; }
}
export function isAvatarEnabled(): boolean { return process.env.PAVOL_AVATAR_ENABLED === 'true'; }
function limit(name: string, fallback: number): number {
    const n = Number(process.env[name]);
    return Number.isSafeInteger(n) && n > 0 && n <= 100000 ? n : fallback;
}
export function getAvatarAvailability() {
    const stripe = getStripeConfigurationOrNull();
    const database = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const authEnabled = isAvatarEnabled() && database && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const magic = !!process.env.PAVOL_AVATAR_EMAIL_API_KEY?.trim() && !!process.env.PAVOL_AVATAR_EMAIL_FROM?.trim();
    const isTest = stripe?.isTestMode ?? false;
    return {
        enabled: isAvatarEnabled(), priceCzk: AVATAR_PRICE_CZK, authEnabled, authMethod: magic ? 'magic-link' as const : 'otp' as const,
        billingEnabled: authEnabled && process.env.PAVOL_AVATAR_BILLING_ENABLED === 'true' &&
            !!stripe?.webhookSigningSecret && /^(?:sk|rk)_(?:live|test)_/.test(stripe.secretKey) &&
            (!isTest || process.env.NODE_ENV !== 'production'),
        isTest, slovakiaEnabled: process.env.PAVOL_AVATAR_SK_ENABLED === 'true',
        limits: { free: limit('PAVOL_AVATAR_FREE_MONTHLY_LIMIT', 5), light: limit('PAVOL_AVATAR_LIGHT_MONTHLY_LIMIT', 50), full: limit('PAVOL_AVATAR_FULL_MONTHLY_LIMIT', 500) },
    };
}
export function getAvatarOrigin(request: Request): string {
    const url = new URL(request.url);
    const host = getPublicRequestHostname(request.headers, url.hostname);
    const preview = process.env.VERCEL_URL && normalizeHostname(process.env.VERCEL_URL);
    const local = process.env.NODE_ENV !== 'production' && (host === 'localhost' || host === '127.0.0.1');
    if (!PERSONAL_HOSTS.includes(host) && host !== preview && !local) throw new AvatarError('Not found.', 404);
    return local ? url.origin : `https://${host}`;
}
/** Browser mutations require a matching Origin; authenticated machine transports validate their own bearer credential. */
export function assertAvatarRequest(request: Request, mutation: boolean | { mutation: boolean } = true): void {
    const expected = getAvatarOrigin(request);
    if (!isAvatarEnabled()) throw new AvatarError('Avatar subscription is not enabled.', 404);
    if (typeof mutation === 'boolean' ? mutation : mutation.mutation) {
        const origin = request.headers.get('origin');
        if (!origin || (origin !== expected && origin !== new URL(request.url).origin)) throw new AvatarError('Požadavek z jiné stránky byl odmítnut.', 403);
    }
}
export async function readAvatarJson(request: Request, maxBytes = 16000): Promise<unknown> {
    const reader = request.body?.getReader();
    if (!reader) return null;
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.length;
            if (size > maxBytes) { await reader.cancel(); throw new AvatarError('Požadavek je příliš velký.', 413); }
            chunks.push(value);
        }
        return JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch (error) {
        if (error instanceof AvatarError) throw error;
        throw new AvatarError('Neplatný požadavek.', 400);
    }
}

import PUBLIC_DOMAIN_HOSTS from '@/lib/domains/publicDomainHosts.json';

export const EMAIL_LOGIN_PATH = '/api/auth/email';
export type EmailLoginFlow = 'billing' | 'avatar' | 'community';

/** Keep the visitor's exact approved host, including www, instead of choosing a global Site URL. */
export function getEmailLoginOrigin(request: Request): string {
    const url = new URL(request.url);
    const host = (request.headers.get('x-forwarded-host')?.split(',')[0] ??
        request.headers.get('host') ?? url.host).trim().toLowerCase();
    const publicHosts = Object.values(PUBLIC_DOMAIN_HOSTS).flatMap((name) => [name, 'www.' + name]);
    const previewHosts = [process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL].filter(Boolean);
    const local = process.env.NODE_ENV !== 'production' && /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
    if (!local && !publicHosts.includes(host) && host !== 'new.ptbk.io' && !previewHosts.includes(host)) {
        throw new Error('Unknown email sign-in origin');
    }
    return (local ? url.protocol : 'https:') + '//' + host;
}

/** A return location can never leave the host that issued the email, or loop through an API. */
export function safeEmailReturnPath(value: unknown, origin: string, fallback = '/'): string {
    if (typeof value !== 'string' || value.length > 4096 || /[\u0000-\u0020\\]/.test(value)) return fallback;
    try {
        const url = new URL(value, origin);
        if (url.origin !== origin || url.username || url.password || /^\/api(?:\/|$)/.test(url.pathname)) return fallback;
        for (const name of ['token_hash', 'login_token', 'login_email', 'access_token', 'refresh_token']) {
            url.searchParams.delete(name);
        }
        if (/(?:^|[&#])(token_hash|login_token|access_token|refresh_token)=/.test(url.hash)) url.hash = '';
        return url.pathname + url.search + url.hash;
    } catch { return fallback; }
}

export function createEmailLoginRedirect(
    request: Request,
    flow: EmailLoginFlow,
    fallback: string,
    returnTo?: string,
): URL {
    const origin = getEmailLoginOrigin(request);
    const next = safeEmailReturnPath(returnTo ?? request.headers.get('referer'), origin, fallback);
    const url = new URL(EMAIL_LOGIN_PATH, origin);
    url.searchParams.set('flow', flow);
    url.searchParams.set('next', next);
    return url;
}

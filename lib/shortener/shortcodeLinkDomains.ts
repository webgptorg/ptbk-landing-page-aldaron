import PUBLIC_DOMAIN_HOSTS from '@/lib/domains/publicDomainHosts.json';
import { getPublicRequestHostname, normalizeHostname } from '@/lib/domains/publicDomainRouting';

export const SHORTCODE_LINK_HOST_HEADER = 'x-promptbook-shortlink-host';

/** Middleware overwrites this header on every page request before Next can replace forwarded host on a rewrite. */
export function getShortcodeLinkRequestHostname(headers: Pick<Headers, 'get'>): string {
    return normalizeShortcodeLinkHostname(headers.get(SHORTCODE_LINK_HOST_HEADER) ?? getPublicRequestHostname(headers));
}

/** Canonical public sites, shared by validation and both administration forms. www is an alias, not another scope. */
export const SHORTCODE_LINK_DOMAINS: readonly string[] = Object.values(PUBLIC_DOMAIN_HOSTS);

export function normalizeShortcodeLinkHostname(hostname: string): string {
    const normalized = normalizeHostname(hostname);
    return normalized === 'new.ptbk.io' ? PUBLIC_DOMAIN_HOSTS.primary : normalized;
}

/** null/absent means all hosts, including new deployment aliases. A selected subset fails closed on other hosts. */
export function isShortcodeLinkAvailableOnHostname(domains: readonly string[] | null | undefined, hostname: string): boolean {
    return domains == null || domains.includes(normalizeShortcodeLinkHostname(hostname));
}

/** A restricted link must be copied, opened and encoded in a QR code on an enabled domain. */
export function getPreferredShortcodeLinkHostname(domains: readonly string[] | null | undefined): string {
    return domains?.includes(PUBLIC_DOMAIN_HOSTS.primary) || !domains?.length ? PUBLIC_DOMAIN_HOSTS.primary : domains[0]!;
}

export function getPublicShortcodeLinkAddressOrNull(value: string): { readonly shortcode: string; readonly hostname: string } | null {
    try {
        const url = new URL(value);
        const hostname = normalizeShortcodeLinkHostname(url.hostname);
        if (url.protocol !== 'https:' || url.port || url.username || url.password || !SHORTCODE_LINK_DOMAINS.includes(hostname)) return null;
        const match = url.pathname.match(/^\/([A-Za-z0-9-]+)$/);
        return match ? { shortcode: match[1]!, hostname } : null;
    } catch { return null; }
}

import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

/**
 * A public domain which renders one route that still lives beneath the Promptbook application.
 *
 * `sourcePath` is an implementation detail of the Next.js application. `publicPaths` are the only paths that the
 * custom hostname exposes from that route. Keeping both values together prevents redirects, rewrites and canonical
 * URLs from drifting apart.
 */
export type CustomDomainRoute = {
    readonly hostname: string;
    readonly sourcePath: string;
    readonly language: SupportedHomepageLanguage;
    readonly publicPaths: readonly string[];
};

/**
 * Hostnames which keep the full Promptbook site. Source paths only redirect away when they are requested here, so
 * local development and Vercel preview deployments can still render the routes directly without custom DNS records.
 */
export const LEGACY_SITE_HOSTNAMES = ['ptbk.io', 'www.ptbk.io'] as const;

/**
 * Every independently addressed page and the route which renders it.
 *
 * Note: Add a public path here whenever a new App Router route belonging to one of these sites is published. The
 * middleware deliberately allow-lists those paths instead of exposing the entire Promptbook application on a personal
 * or podcast domain.
 */
export const CUSTOM_DOMAIN_ROUTES = {
    AI_TA_KRAJTA: {
        hostname: 'ai-ta-krajta.cz',
        sourcePath: '/ai-ta-krajta',
        language: 'cs',
        publicPaths: [
            '/',
            '/media-kit',
            '/branding',
            '/logo.svg',
            '/logo.png',
            '/manifest.webmanifest',
            '/opengraph-image',
        ],
    },
    PAVOL_CZECH: {
        hostname: 'pavolhejny.cz',
        sourcePath: '/cs/pavol',
        language: 'cs',
        publicPaths: ['/', '/opengraph-image'],
    },
    PAVOL_ENGLISH: {
        hostname: 'pavolhejny.com',
        sourcePath: '/en/pavol',
        language: 'en',
        publicPaths: ['/', '/opengraph-image'],
    },
} as const satisfies Record<string, CustomDomainRoute>;

const CUSTOM_DOMAIN_ROUTE_LIST: readonly CustomDomainRoute[] = Object.values(CUSTOM_DOMAIN_ROUTES);

/**
 * Normalizes a host header before it is compared with a configured hostname.
 */
export function normalizeHostname(hostname: string | null): string {
    if (hostname === null) {
        return '';
    }

    const hostnameCandidate = hostname.split(',')[0]?.trim().toLowerCase() ?? '';

    try {
        return new URL(`https://${hostnameCandidate}`).hostname.replace(/\.$/, '');
    } catch {
        return hostnameCandidate.replace(/:\d+$/, '').replace(/\.$/, '');
    }
}

/**
 * Finds the configured custom site for a hostname, including a port-bearing request host.
 */
export function findCustomDomainRouteByHostname(hostname: string | null): CustomDomainRoute | null {
    const normalizedHostname = normalizeHostname(hostname);

    return CUSTOM_DOMAIN_ROUTE_LIST.find((route) => route.hostname === normalizedHostname) ?? null;
}

/**
 * Tells whether a hostname is where the full Promptbook site remains available.
 */
export function isLegacySiteHostname(hostname: string | null): boolean {
    return LEGACY_SITE_HOSTNAMES.includes(normalizeHostname(hostname) as (typeof LEGACY_SITE_HOSTNAMES)[number]);
}

/**
 * Removes only non-semantic trailing slashes from an application pathname.
 */
function normalizePathname(pathname: string): string {
    const pathnameWithLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;

    return pathnameWithLeadingSlash.length === 1 ? pathnameWithLeadingSlash : pathnameWithLeadingSlash.replace(/\/+$/, '');
}

/**
 * Tells whether a pathname belongs to an internal source route without treating similarly named routes as children.
 */
function isPathnameWithinSourcePath(pathname: string, sourcePath: string): boolean {
    return pathname === sourcePath || pathname.startsWith(`${sourcePath}/`);
}

/**
 * Finds the custom domain responsible for an internal application pathname.
 */
export function findCustomDomainRouteBySourcePath(pathname: string): CustomDomainRoute | null {
    const normalizedPathname = normalizePathname(pathname);

    return (
        CUSTOM_DOMAIN_ROUTE_LIST.find((route) => isPathnameWithinSourcePath(normalizedPathname, route.sourcePath)) ??
        null
    );
}

/**
 * Turns an internal source path into its path beneath the custom hostname.
 *
 * @returns `/` for a domain root, a public nested path for a matching source route, or `null` for ordinary Promptbook
 *          routes
 */
export function getCustomDomainPublicPathForSourcePath(sourcePath: string): string | null {
    const sourceUrl = createSourceUrl(sourcePath);

    if (sourceUrl === null) {
        return null;
    }

    const route = findCustomDomainRouteBySourcePath(sourceUrl.pathname);

    if (route === null) {
        return null;
    }

    const publicPath = sourceUrl.pathname.slice(route.sourcePath.length);

    return normalizePathname(publicPath || '/');
}

/**
 * Builds the canonical custom-domain URL for an internal route, preserving its query string and hash when supplied.
 */
export function createCustomDomainUrlForSourcePath(sourcePath: string): string | null {
    const sourceUrl = createSourceUrl(sourcePath);

    if (sourceUrl === null) {
        return null;
    }

    const route = findCustomDomainRouteBySourcePath(sourceUrl.pathname);
    const publicPath = getCustomDomainPublicPathForSourcePath(sourceUrl.pathname);

    if (route === null || publicPath === null) {
        return null;
    }

    const publicUrl = new URL(publicPath, `https://${route.hostname}`);
    publicUrl.search = sourceUrl.search;
    publicUrl.hash = sourceUrl.hash;

    return publicUrl.toString();
}

/**
 * Resolves a public custom-domain path to the existing application route, but only when that path has been explicitly
 * published for the domain.
 */
export function getCustomDomainSourcePathForPublicPath(route: CustomDomainRoute, publicPath: string): string | null {
    const normalizedPublicPath = normalizePathname(publicPath);

    if (!route.publicPaths.includes(normalizedPublicPath)) {
        return null;
    }

    return normalizedPublicPath === '/' ? route.sourcePath : `${route.sourcePath}${normalizedPublicPath}`;
}

/**
 * Tells client-side shared components whether a hostname identifies one specific internal route.
 */
export function isCustomDomainHostnameForSourcePath(hostname: string | null, sourcePath: string): boolean {
    return findCustomDomainRouteByHostname(hostname)?.sourcePath === normalizePathname(sourcePath);
}

/**
 * Parses a site-relative source URL without accidentally treating an already absolute public URL as a source route.
 */
function createSourceUrl(sourcePath: string): URL | null {
    if (!sourcePath.startsWith('/')) {
        return null;
    }

    try {
        return new URL(sourcePath, 'https://source-route.invalid');
    } catch {
        return null;
    }
}

/**
 * Canonical origin of the main Promptbook site.
 */
export const PRIMARY_SITE_URL = 'https://ptbk.io';

/**
 * Hostnames which serve the main Promptbook site and must send legacy branded paths to their own domains.
 */
export const PRIMARY_SITE_HOSTNAMES: readonly string[] = ['ptbk.io', 'www.ptbk.io'];

/**
 * Internal route which renders the AI ta Krajta site.
 */
export const AI_TA_KRAJTA_INTERNAL_PATH = '/ai-ta-krajta';

/**
 * Internal route which renders Pavol Hejný's Czech personal site.
 */
export const PAVOL_CZECH_INTERNAL_PATH = '/cs/pavol';

/**
 * Internal route which renders Pavol Hejný's English personal site.
 */
export const PAVOL_ENGLISH_INTERNAL_PATH = '/en/pavol';

/**
 * One independently branded site which is rendered by a route nested inside the Promptbook application.
 */
export type PublicDomainRoute = {
    /** Hostname visitors use for the independent site. */
    readonly hostname: string;

    /** Canonical HTTPS origin of the independent site. */
    readonly origin: string;

    /** Existing application route which renders the independent site's root page. */
    readonly internalPath: string;

    /**
     * Route suffixes exposed at the independent site's root.
     *
     * Static assets and APIs deliberately stay outside this list: they already exist at the application root and
     * should keep resolving from the custom hostname without being rewritten into the page route.
     */
    readonly publicPathSuffixes: readonly string[];
};

const AI_TA_KRAJTA_PUBLIC_PATH_SUFFIXES: readonly string[] = [
    '',
    '/media-kit',
    '/branding',
    '/opengraph-image',
    '/manifest.webmanifest',
    '/logo.svg',
    '/logo.png',
];

const PAVOL_PUBLIC_PATH_SUFFIXES: readonly string[] = ['', '/opengraph-image'];

/**
 * Every independently branded site. This is the sole mapping used for incoming custom-domain rewrites, outgoing
 * legacy redirects, and canonical public URLs.
 */
export const PUBLIC_DOMAIN_ROUTES: readonly PublicDomainRoute[] = [
    {
        hostname: 'ai-ta-krajta.cz',
        origin: 'https://ai-ta-krajta.cz',
        internalPath: AI_TA_KRAJTA_INTERNAL_PATH,
        publicPathSuffixes: AI_TA_KRAJTA_PUBLIC_PATH_SUFFIXES,
    },
    {
        hostname: 'pavolhejny.cz',
        origin: 'https://pavolhejny.cz',
        internalPath: PAVOL_CZECH_INTERNAL_PATH,
        publicPathSuffixes: PAVOL_PUBLIC_PATH_SUFFIXES,
    },
    {
        hostname: 'pavolhejny.com',
        origin: 'https://pavolhejny.com',
        internalPath: PAVOL_ENGLISH_INTERNAL_PATH,
        publicPathSuffixes: PAVOL_PUBLIC_PATH_SUFFIXES,
    },
];

/**
 * Removes a port, a trailing DNS dot, and letter-case differences from a host before comparing it.
 */
export function normalizeHostname(hostname: string): string {
    const hostnameWithoutPort = hostname.trim().replace(/:\d+$/, '');

    return hostnameWithoutPort.replace(/\.$/, '').toLowerCase();
}

/**
 * Tells whether a hostname is one of the public Promptbook hosts.
 */
export function isPrimarySiteHostname(hostname: string): boolean {
    const normalizedHostname = normalizeHostname(hostname);

    return PRIMARY_SITE_HOSTNAMES.some((primarySiteHostname) => primarySiteHostname === normalizedHostname);
}

/**
 * Finds the independently branded site served by a hostname.
 */
export function getPublicDomainRouteByHostname(hostname: string): PublicDomainRoute | undefined {
    const normalizedHostname = normalizeHostname(hostname);

    return PUBLIC_DOMAIN_ROUTES.find((publicDomainRoute) => publicDomainRoute.hostname === normalizedHostname);
}

/**
 * Tells whether a pathname is one route or a child route below it, without mistaking a shared string prefix for one.
 */
function isPathnameWithinPath(pathname: string, path: string): boolean {
    return pathname === path || pathname.startsWith(`${path}/`);
}

/**
 * Finds the independently branded site whose existing internal route owns a pathname.
 */
export function getPublicDomainRouteByInternalPathname(pathname: string): PublicDomainRoute | undefined {
    return PUBLIC_DOMAIN_ROUTES.find((publicDomainRoute) =>
        isPathnameWithinPath(pathname, publicDomainRoute.internalPath),
    );
}

/**
 * Turns an existing internal route into the matching path at its independent domain.
 */
export function getPublicPathname(publicDomainRoute: PublicDomainRoute, internalPathname: string): string {
    if (internalPathname === publicDomainRoute.internalPath) {
        return '/';
    }

    return internalPathname.slice(publicDomainRoute.internalPath.length);
}

/**
 * Finds the existing application route which should render one public custom-domain path.
 */
export function getInternalPathname(publicDomainRoute: PublicDomainRoute, publicPathname: string): string | undefined {
    const normalizedPublicPathname =
        publicPathname.length > 1 ? publicPathname.replace(/\/+$/, '') : publicPathname;
    const publicPathSuffix = publicDomainRoute.publicPathSuffixes.find(
        (candidatePublicPathSuffix) => normalizedPublicPathname === `/${candidatePublicPathSuffix.replace(/^\//, '')}`,
    );

    if (publicPathSuffix === undefined) {
        return undefined;
    }

    return `${publicDomainRoute.internalPath}${publicPathSuffix}`;
}

/**
 * Turns an internal application path into its canonical public URL whenever that page owns an independent domain.
 * Paths that remain part of Promptbook keep the main site's canonical origin.
 */
export function createPublicUrl(path: string): string {
    const inputUrl = new URL(path, PRIMARY_SITE_URL);

    if (!isPrimarySiteHostname(inputUrl.hostname)) {
        return inputUrl.toString();
    }

    const publicDomainRoute = getPublicDomainRouteByInternalPathname(inputUrl.pathname);

    if (!publicDomainRoute) {
        return inputUrl.toString();
    }

    return new URL(
        `${getPublicPathname(publicDomainRoute, inputUrl.pathname)}${inputUrl.search}${inputUrl.hash}`,
        publicDomainRoute.origin,
    ).toString();
}

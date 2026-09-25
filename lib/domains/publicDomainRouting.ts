import { SHARED_PUBLIC_ASSET_PATHS } from './sharedPublicAssetPaths';
import PUBLIC_DOMAIN_HOSTS from './publicDomainHosts.json';

/**
 * Canonical origin of the main Promptbook site.
 */
export const PRIMARY_SITE_URL = `https://${PUBLIC_DOMAIN_HOSTS.primary}`;

/**
 * Hostnames which serve the main Promptbook site and must send legacy branded paths to their own domains.
 *
 * Note: `normalizeHostname` already folds a leading `www.` into its bare apex, so the `www.` host is covered here
 *       without being listed. Every independently branded domain relies on that same folding instead of repeating a
 *       `www.` entry of its own.
 */
export const PRIMARY_SITE_HOSTNAMES: readonly string[] = [PUBLIC_DOMAIN_HOSTS.primary];

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
    readonly publicPathSuffixes: readonly {
        readonly path: string;
        readonly isIndexed?: boolean;
    }[];

    /** Copy and navigation for this site's standalone 404 document. */
    readonly notFound: {
        readonly language: 'cs' | 'en';
        readonly appearance: 'podcast' | 'personal';
        readonly siteName: string;
        readonly logoPath: string;
        readonly title: string;
        readonly description: string;
        readonly homeLabel: string;
        readonly navigationLabel: string;
        readonly navigation: readonly { readonly label: string; readonly internalPath: string }[];
    };
};

const AI_TA_KRAJTA_PUBLIC_PATH_SUFFIXES: PublicDomainRoute['publicPathSuffixes'] = [
    { path: '', isIndexed: true },
    { path: '/media-kit', isIndexed: true },
    { path: '/branding', isIndexed: true },
    { path: '/opengraph-image' },
    { path: '/manifest.webmanifest' },
    { path: '/logo.svg' },
    { path: '/logo.png' },
];

const PAVOL_PUBLIC_PATH_SUFFIXES: PublicDomainRoute['publicPathSuffixes'] = [
    { path: '', isIndexed: true },
    { path: '/opengraph-image' },
];

/**
 * Every independently branded site. This is the sole mapping used for incoming custom-domain rewrites, outgoing
 * legacy redirects, and canonical public URLs.
 */
export const PUBLIC_DOMAIN_ROUTES: readonly PublicDomainRoute[] = [
    {
        hostname: PUBLIC_DOMAIN_HOSTS.podcast,
        origin: `https://${PUBLIC_DOMAIN_HOSTS.podcast}`,
        internalPath: AI_TA_KRAJTA_INTERNAL_PATH,
        publicPathSuffixes: AI_TA_KRAJTA_PUBLIC_PATH_SUFFIXES,
        notFound: {
            language: 'cs',
            appearance: 'podcast',
            siteName: 'AI ta Krajta',
            logoPath: '/logo.svg',
            title: 'Stránka nenalezena',
            description: 'Tahle stránka na webu AI ta Krajta není. Vraťte se k podcastu a vyberte si další díl.',
            homeLabel: 'Zpět k podcastu',
            navigationLabel: 'Stránky podcastu',
            navigation: [
                { label: 'Podcast', internalPath: AI_TA_KRAJTA_INTERNAL_PATH },
                { label: 'Media kit', internalPath: `${AI_TA_KRAJTA_INTERNAL_PATH}/media-kit` },
                { label: 'Brand kit', internalPath: `${AI_TA_KRAJTA_INTERNAL_PATH}/branding` },
            ],
        },
    },
    {
        hostname: PUBLIC_DOMAIN_HOSTS.pavolCzech,
        origin: `https://${PUBLIC_DOMAIN_HOSTS.pavolCzech}`,
        internalPath: PAVOL_CZECH_INTERNAL_PATH,
        publicPathSuffixes: PAVOL_PUBLIC_PATH_SUFFIXES,
        notFound: {
            language: 'cs',
            appearance: 'personal',
            siteName: 'Pavol Hejný',
            logoPath: '/logo/pavol-hejny-ph.svg',
            title: 'Stránka nenalezena',
            description: 'Tahle stránka na osobním webu Pavola Hejného není. Vraťte se na úvodní stránku.',
            homeLabel: 'Zpět na úvod',
            navigationLabel: 'Osobní web',
            navigation: [
                { label: 'Úvod', internalPath: PAVOL_CZECH_INTERNAL_PATH },
                { label: 'Služby', internalPath: `${PAVOL_CZECH_INTERNAL_PATH}#services` },
                { label: 'Projekty', internalPath: `${PAVOL_CZECH_INTERNAL_PATH}#projects` },
                { label: 'English', internalPath: PAVOL_ENGLISH_INTERNAL_PATH },
            ],
        },
    },
    {
        hostname: PUBLIC_DOMAIN_HOSTS.pavolEnglish,
        origin: `https://${PUBLIC_DOMAIN_HOSTS.pavolEnglish}`,
        internalPath: PAVOL_ENGLISH_INTERNAL_PATH,
        publicPathSuffixes: PAVOL_PUBLIC_PATH_SUFFIXES,
        notFound: {
            language: 'en',
            appearance: 'personal',
            siteName: 'Pavol Hejný',
            logoPath: '/logo/pavol-hejny-ph.svg',
            title: 'Page not found',
            description: "This page is not on Pavol Hejný's personal site. Return to the homepage.",
            homeLabel: 'Back to home',
            navigationLabel: 'Personal site',
            navigation: [
                { label: 'Home', internalPath: PAVOL_ENGLISH_INTERNAL_PATH },
                { label: 'Services', internalPath: `${PAVOL_ENGLISH_INTERNAL_PATH}#services` },
                { label: 'Projects', internalPath: `${PAVOL_ENGLISH_INTERNAL_PATH}#projects` },
                { label: 'Čeština', internalPath: PAVOL_CZECH_INTERNAL_PATH },
            ],
        },
    },
];

/**
 * Removes a port, a trailing DNS dot, a leading `www.`, and letter-case differences from a host before comparing it.
 *
 * A `www.` host is universally an alias of its bare apex, so folding it away here lets one apex hostname stand for both
 * forms everywhere — the primary Promptbook hosts and every independently branded domain alike. Without it, a visitor
 * who types `www.ai-ta-krajta.cz` would match no branded route and be dropped onto the Promptbook homepage.
 */
export function normalizeHostname(hostname: string): string {
    const hostnameWithoutPort = hostname.trim().replace(/:\d+$/, '');

    return hostnameWithoutPort
        .replace(/\.$/, '')
        .toLowerCase()
        .replace(/^www\./, '');
}

/** Read the visitor-facing host before a reverse proxy substitutes its internal address. */
export function getPublicRequestHostname(requestHeaders: Pick<Headers, 'get'>, fallbackHostname = ''): string {
    const forwardedHostname = requestHeaders.get('x-forwarded-host')?.split(',')[0];

    return normalizeHostname(forwardedHostname ?? requestHeaders.get('host') ?? fallbackHostname);
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
        (candidatePublicPathSuffix) => normalizedPublicPathname === `/${candidatePublicPathSuffix.path.replace(/^\//, '')}`,
    );

    if (publicPathSuffix === undefined) {
        return undefined;
    }

    return `${publicDomainRoute.internalPath}${publicPathSuffix.path}`;
}

const SHARED_PUBLIC_ASSET_PATH_SET = new Set(SHARED_PUBLIC_ASSET_PATHS);

/**
 * Build output and known public-file locations are shared by all three sites.
 * APIs, including the contact form endpoint and authenticated admin APIs, bypass the middleware matcher.
 */
export function isSharedDeploymentAssetPath(pathname: string): boolean {
    if (pathname.startsWith('/_next/')) {
        return true;
    }

    return SHARED_PUBLIC_ASSET_PATH_SET.has(pathname);
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

/**
 * Keeps navigation within the current site on its current host, including local and preview hosts.
 * A link which crosses into another public site uses that site's canonical absolute URL.
 */
export function createPublicNavigationUrl(path: string, requestHostname: string): string {
    const publicUrl = new URL(createPublicUrl(path));
    const currentDomainRoute = getPublicDomainRouteByHostname(requestHostname);
    const destinationDomainRoute = getPublicDomainRouteByHostname(publicUrl.hostname);
    const isSameSite = currentDomainRoute
        ? destinationDomainRoute?.hostname === currentDomainRoute.hostname
        : isPrimarySiteHostname(publicUrl.hostname);

    return isSameSite ? `${publicUrl.pathname}${publicUrl.search}${publicUrl.hash}` : publicUrl.toString();
}

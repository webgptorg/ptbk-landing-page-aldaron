import { NextRequest, NextResponse } from 'next/server';
import {
    createCustomDomainUrlForSourcePath,
    findCustomDomainRouteByHostname,
    findCustomDomainRouteBySourcePath,
    getCustomDomainSourcePathForPublicPath,
    isLegacySiteHostname,
    normalizeHostname,
} from './lib/domains/customDomainRouting';
import { getPreferredHomepageLanguage } from './lib/homepage-language';

const PERMANENT_REDIRECT_STATUS_CODE = 308;

/**
 * Reads the original browser hostname through the proxy headers Vercel and Cloudflare preserve.
 */
function getRequestHostname(request: NextRequest): string {
    return normalizeHostname(
        request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.hostname,
    );
}

/**
 * Sends an old internal address to its canonical custom-domain equivalent while retaining campaign and page state.
 */
function createCustomDomainRedirect(request: NextRequest): NextResponse | null {
    const destination = createCustomDomainUrlForSourcePath(`${request.nextUrl.pathname}${request.nextUrl.search}`);

    return destination === null
        ? null
        : NextResponse.redirect(destination, PERMANENT_REDIRECT_STATUS_CODE);
}

export function middleware(request: NextRequest) {
    const requestHostname = getRequestHostname(request);
    const customDomainRoute = findCustomDomainRouteByHostname(requestHostname);
    const sourceRoute = findCustomDomainRouteBySourcePath(request.nextUrl.pathname);

    // A source route is never canonical on ptbk.io or on any of the custom hostnames. The same rule also repairs an
    // accidentally copied internal path on a custom domain, including a Czech/English Pavol link on the other domain.
    if (sourceRoute !== null && (isLegacySiteHostname(requestHostname) || customDomainRoute !== null)) {
        const customDomainRedirect = createCustomDomainRedirect(request);

        if (customDomainRedirect !== null) {
            return customDomainRedirect;
        }
    }

    if (customDomainRoute !== null) {
        const sourcePath = getCustomDomainSourcePathForPublicPath(customDomainRoute, request.nextUrl.pathname);

        if (sourcePath !== null) {
            const rewriteUrl = request.nextUrl.clone();
            rewriteUrl.pathname = sourcePath;

            return NextResponse.rewrite(rewriteUrl);
        }
    }

    const language = getPreferredHomepageLanguage(request.headers.get('accept-language'));

    if (request.nextUrl.pathname === '/') {
        const redirectUrl = request.nextUrl.clone();

        redirectUrl.pathname = `/${language}`;

        return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
}

export const config = {
    // Every custom-domain public route is resolved from CUSTOM_DOMAIN_ROUTES. Keeping this matcher broad means adding
    // a route there does not require duplicating its path here; Next.js assets and APIs remain outside middleware.
    matcher: ['/((?!api|_next|favicon.ico).*)'],
};

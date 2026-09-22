import { NextRequest, NextResponse } from 'next/server';
import {
    getInternalPathname,
    getPublicDomainRouteByHostname,
    getPublicDomainRouteByInternalPathname,
    getPublicPathname,
    isPrimarySiteHostname,
    normalizeHostname,
} from './lib/domains/publicDomainRouting';
import { getPreferredHomepageLanguage } from './lib/homepage-language';

/**
 * Reads the public hostname before an internal reverse-proxy address can replace it.
 */
function getRequestHostname(request: NextRequest): string {
    const forwardedHostname = request.headers.get('x-forwarded-host')?.split(',')[0];
    const hostname = forwardedHostname ?? request.headers.get('host') ?? request.nextUrl.hostname;

    return normalizeHostname(hostname);
}

/**
 * Builds a redirect to an independently branded site's public URL while retaining the browser's query parameters.
 */
function createPublicDomainRedirectResponse(request: NextRequest) {
    const publicDomainRoute = getPublicDomainRouteByInternalPathname(request.nextUrl.pathname);

    if (!publicDomainRoute) {
        return undefined;
    }

    const redirectUrl = new URL(getPublicPathname(publicDomainRoute, request.nextUrl.pathname), publicDomainRoute.origin);
    redirectUrl.search = request.nextUrl.search;

    return NextResponse.redirect(redirectUrl, 308);
}

export function middleware(request: NextRequest) {
    const requestHostname = getRequestHostname(request);
    const publicDomainRoute = getPublicDomainRouteByHostname(requestHostname);

    // Legacy branded paths always have one public home. This also makes a link to the other Pavol language move to
    // that language's domain instead of treating it as a path below the current one.
    if (isPrimarySiteHostname(requestHostname) || publicDomainRoute) {
        const publicDomainRedirectResponse = createPublicDomainRedirectResponse(request);

        if (publicDomainRedirectResponse) {
            return publicDomainRedirectResponse;
        }
    }

    // A custom domain keeps its concise public path in the address bar while Next renders the existing nested route.
    if (publicDomainRoute) {
        const internalPathname = getInternalPathname(publicDomainRoute, request.nextUrl.pathname);

        if (internalPathname) {
            const rewriteUrl = request.nextUrl.clone();
            rewriteUrl.pathname = internalPathname;

            return NextResponse.rewrite(rewriteUrl);
        }
    }

    if (request.nextUrl.pathname !== '/') {
        return NextResponse.next();
    }

    const language = getPreferredHomepageLanguage(request.headers.get('accept-language'));
    const redirectUrl = request.nextUrl.clone();

    redirectUrl.pathname = `/${language}`;

    return NextResponse.redirect(redirectUrl);
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

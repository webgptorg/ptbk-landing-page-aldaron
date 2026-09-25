import { NextRequest, NextResponse } from 'next/server';
import {
    getInternalPathname,
    getPublicRequestHostname,
    getPublicDomainRouteByHostname,
    getPublicDomainRouteByInternalPathname,
    getPublicPathname,
    isPrimarySiteHostname,
    isSharedDeploymentAssetPath,
    type PublicDomainRoute,
} from './lib/domains/publicDomainRouting';
import { createPublicDomainNotFoundHtml } from './lib/domains/publicDomainNotFound';
import { createPublicDomainRobotsText, createPublicDomainSitemapXml } from './lib/domains/publicDomainMetadata';
import { getPreferredHomepageLanguage } from './lib/homepage-language';

/**
 * Builds a redirect to an independently branded site's public URL while retaining the browser's query parameters.
 */
function createPublicDomainRedirectResponse(request: NextRequest, publicDomainRoute: PublicDomainRoute) {
    const redirectUrl = new URL(getPublicPathname(publicDomainRoute, request.nextUrl.pathname), publicDomainRoute.origin);
    redirectUrl.search = request.nextUrl.search;

    return NextResponse.redirect(redirectUrl, 308);
}

export function middleware(request: NextRequest) {
    const requestHostname = getPublicRequestHostname(request.headers, request.nextUrl.hostname);
    const publicDomainRoute = getPublicDomainRouteByHostname(requestHostname);

    // A custom domain keeps its concise public path in the address bar while Next renders the existing nested route.
    if (publicDomainRoute) {
        if (request.nextUrl.pathname === '/robots.txt') {
            return new NextResponse(createPublicDomainRobotsText(publicDomainRoute), {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });
        }

        if (request.nextUrl.pathname === '/sitemap.xml') {
            return new NextResponse(createPublicDomainSitemapXml(publicDomainRoute), {
                headers: { 'Content-Type': 'application/xml; charset=utf-8' },
            });
        }

        const internalPathname = getInternalPathname(publicDomainRoute, request.nextUrl.pathname);

        if (internalPathname) {
            const rewriteUrl = request.nextUrl.clone();
            rewriteUrl.pathname = internalPathname;

            return NextResponse.rewrite(rewriteUrl);
        }

        const legacyDomainRoute = getPublicDomainRouteByInternalPathname(request.nextUrl.pathname);

        // Old nested links to this same site normalize to its public path. An old path owned by a different site
        // must never become a cross-site redirect when requested on this domain.
        if (legacyDomainRoute?.hostname === publicDomainRoute.hostname) {
            return createPublicDomainRedirectResponse(request, publicDomainRoute);
        }

        if (isSharedDeploymentAssetPath(request.nextUrl.pathname)) {
            return NextResponse.next();
        }

        return new NextResponse(createPublicDomainNotFoundHtml(publicDomainRoute), {
            status: 404,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-store',
                'X-Robots-Tag': 'noindex, nofollow',
            },
        });
    }

    if (isPrimarySiteHostname(requestHostname)) {
        const legacyDomainRoute = getPublicDomainRouteByInternalPathname(request.nextUrl.pathname);

        if (legacyDomainRoute) {
            return createPublicDomainRedirectResponse(request, legacyDomainRoute);
        }
    }

    if (request.nextUrl.pathname === '/pavol') {
        const language = getPreferredHomepageLanguage(request.headers.get('accept-language'));
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = `/${language}/pavol`;

        return NextResponse.redirect(redirectUrl);
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

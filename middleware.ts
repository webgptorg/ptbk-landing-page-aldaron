import { NextRequest, NextResponse } from 'next/server';
import { getLegacyLegalRedirect } from '@/lib/legal/legalRedirects';
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
import { isNewSitePublicPath } from './businesses/new/siteConfig';
import { getPublicShortcodeLinkOnHostname } from './lib/shortener/shortcodeLinkMiddleware';
import { SHORTCODE_LINK_HOST_HEADER } from './lib/shortener/shortcodeLinkDomains';

/**
 * Builds a redirect to an independently branded site's public URL while retaining the browser's query parameters.
 */
function createPublicDomainRedirectResponse(request: NextRequest, publicDomainRoute: PublicDomainRoute) {
    const redirectUrl = new URL(getPublicPathname(publicDomainRoute, request.nextUrl.pathname), publicDomainRoute.origin);
    redirectUrl.search = request.nextUrl.search;

    return NextResponse.redirect(redirectUrl, 308);
}

export async function middleware(request: NextRequest) {
    const requestHostname = getPublicRequestHostname(request.headers, request.nextUrl.hostname);
    const requestHeaders = new Headers(request.headers);
    // Never accept a client-supplied scope header. Preserve the original host across Next's internal rewrites.
    requestHeaders.set(SHORTCODE_LINK_HOST_HEADER, requestHostname);
    requestHeaders.set('x-promptbook-private-message', '0');
    const publicDomainRoute = getPublicDomainRouteByHostname(requestHostname);

    // A custom domain keeps its concise public path in the address bar while Next renders the existing nested route.
    if (publicDomainRoute) {
        if (request.nextUrl.pathname === '/robots.txt') {
            return new NextResponse(createPublicDomainRobotsText(publicDomainRoute), {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });
        }

        if (request.nextUrl.pathname === '/sitemap.xml' && publicDomainRoute.notFound.appearance !== 'personal') {
            return new NextResponse(createPublicDomainSitemapXml(publicDomainRoute), {
                headers: { 'Content-Type': 'application/xml; charset=utf-8' },
            });
        }

        const internalPathname = getInternalPathname(publicDomainRoute, request.nextUrl.pathname);

        if (internalPathname) {
            const rewriteUrl = request.nextUrl.clone();
            rewriteUrl.pathname = internalPathname;

            return NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
        }

        const legacyDomainRoute = getPublicDomainRouteByInternalPathname(request.nextUrl.pathname);

        // Old nested links to this same site normalize to its public path. An old path owned by a different site
        // must never become a cross-site redirect when requested on this domain.
        if (legacyDomainRoute?.hostname === publicDomainRoute.hostname) {
            return createPublicDomainRedirectResponse(request, publicDomainRoute);
        }

        if (isSharedDeploymentAssetPath(request.nextUrl.pathname)) {
            return NextResponse.next({ request: { headers: requestHeaders } });
        }

        const shortcodePath = request.nextUrl.pathname.match(/^\/([A-Za-z0-9-]+)(\/opengraph-image)?\/?$/);
        const shortLink = shortcodePath ? await getPublicShortcodeLinkOnHostname(shortcodePath[1]!, requestHostname) : null;
        if (shortcodePath && shortLink) {
            requestHeaders.set('x-promptbook-private-message', shortLink.isMessage ? '1' : '0');
            const rewriteUrl = request.nextUrl.clone();
            rewriteUrl.pathname = `/short-links/${shortcodePath[1]}${shortcodePath[2] ?? ''}`;
            const response = NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
            if (shortLink.isMessage) {
                response.headers.set('Cache-Control', 'private, no-store, max-age=0');
                response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
                response.headers.set('Referrer-Policy', 'no-referrer');
            }
            return response;
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

    if (/^\/new(?:\/|$)/.test(request.nextUrl.pathname)) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = request.nextUrl.pathname.slice('/new'.length) || '/';
        return NextResponse.redirect(redirectUrl, 308);
    }

    const legalDestination = getLegacyLegalRedirect(request.nextUrl.pathname, getPreferredHomepageLanguage(request.headers.get('accept-language')));
    if (legalDestination) {
        const url = request.nextUrl.clone();
        url.pathname = legalDestination;
        const explicitLanguage = /^\/(cs|en)\//.test(request.nextUrl.pathname);
        const response = NextResponse.redirect(url, explicitLanguage ? 308 : 307);
        if (!explicitLanguage) { response.headers.set('Vary', 'Accept-Language'); response.headers.set('Cache-Control', 'private, no-store'); }
        return response;
    }

    if (isNewSitePublicPath(request.nextUrl.pathname)) {
        // Explicit locale URLs are stable. Entry pages without a locale follow the browser language;
        // keep the response private because shared caching must not send another visitor to our choice.
        if (!/^\/(?:cs|en)(?:\/|$)/.test(request.nextUrl.pathname) && !request.nextUrl.pathname.endsWith('/opengraph-image')) {
            const redirectUrl = request.nextUrl.clone();
            const language = getPreferredHomepageLanguage(request.headers.get('accept-language'));
            redirectUrl.pathname = `/${language}${request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname}`;
            const response = NextResponse.redirect(redirectUrl, 307);
            response.headers.set('Vary', 'Accept-Language');
            response.headers.set('Cache-Control', 'private, no-store');
            return response;
        }
        requestHeaders.set('x-promptbook-page-language', /^\/en(?:\/|$)/.test(request.nextUrl.pathname) ? 'en' : 'cs');
        return NextResponse.next({ request: { headers: requestHeaders } });
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
    matcher: ['/((?!api(?:/|$)|_next/static|_next/image|favicon.ico).*)'],
};

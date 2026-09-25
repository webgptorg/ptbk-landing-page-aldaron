import type { PublicDomainRoute } from './publicDomainRouting';

/** A domain advertises only the public pages it owns. */
export function createPublicDomainSitemapXml(publicDomainRoute: PublicDomainRoute): string {
    const urls = publicDomainRoute.publicPathSuffixes
        .filter((publicPathSuffix) => publicPathSuffix.isIndexed === true)
        .map((publicPathSuffix) => {
            const pathname = publicPathSuffix.path || '/';

            return `<url><loc>${new URL(pathname, publicDomainRoute.origin).toString()}</loc></url>`;
        })
        .join('');

    return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

/** Keep crawlers on the requested public domain and point them to its own sitemap. */
export function createPublicDomainRobotsText(publicDomainRoute: PublicDomainRoute): string {
    return `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: ${publicDomainRoute.origin}/sitemap.xml\n`;
}

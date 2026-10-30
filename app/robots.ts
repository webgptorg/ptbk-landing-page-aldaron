import { SITE_URL, createAbsoluteUrl } from '@/lib/metadata/site-config';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

/**
 * Parts of the site which hold no public content and must never be crawled
 *
 * Note: Pages which merely must not appear in search results are missing here on purpose - they say so with a `noindex`
 *       directive, which crawlers can only read when they are allowed to fetch the page.
 */
const DISALLOWED_PATHS: readonly string[] = ['/admin/', '/api/', '/cs/pavol/messages/', '/messages/'];

/**
 * Tells crawlers what they may fetch and where to find the sitemap
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [...DISALLOWED_PATHS],
            },
        ],
        sitemap: createAbsoluteUrl('/sitemap.xml'),
        host: SITE_URL,
    };
}

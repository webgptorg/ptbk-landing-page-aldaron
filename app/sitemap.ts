import { INDEXED_PAGE_METADATA_DEFINITIONS } from '@/lib/metadata/page-registry';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import { createAbsoluteUrl } from '@/lib/metadata/site-config';
import { PRIMARY_SITE_URL } from '@/lib/domains/publicDomainRouting';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

/**
 * Relative importance used for a page which does not state its own
 */
const DEFAULT_SITEMAP_PRIORITY = 0.5;

/**
 * Update rate reported for a page which does not state its own
 */
const DEFAULT_SITEMAP_CHANGE_FREQUENCY = 'monthly' as const;

/**
 * Turns the `hreflang` alternates of a page into the absolute urls the sitemap protocol expects
 */
function createSitemapLanguageAlternates(definition: PageMetadataDefinition): Record<string, string> | undefined {
    if (!definition.languageAlternates) {
        return undefined;
    }

    return Object.fromEntries(
        Object.entries(definition.languageAlternates).map(([language, path]) => [language, createAbsoluteUrl(path)]),
    );
}

/**
 * Turns one page definition into one sitemap entry.
 *
 * `lastModified` is deliberately absent until a page has a source-backed
 * timestamp. Advertising the build time for every URL creates false update
 * signals for crawlers whenever the application is deployed.
 */
function createSitemapEntry(definition: PageMetadataDefinition): MetadataRoute.Sitemap[number] {
    return {
        url: createAbsoluteUrl(definition.path),
        changeFrequency: definition.sitemapChangeFrequency ?? DEFAULT_SITEMAP_CHANGE_FREQUENCY,
        priority: definition.sitemapPriority ?? DEFAULT_SITEMAP_PRIORITY,
        alternates: {
            languages: createSitemapLanguageAlternates(definition),
        },
    };
}

/**
 * Lists every indexable page of the site, built from the very same definitions the pages describe themselves with
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
    return INDEXED_PAGE_METADATA_DEFINITIONS.filter(
        (definition) => new URL(createAbsoluteUrl(definition.path)).origin === PRIMARY_SITE_URL,
    ).map(createSitemapEntry);
}

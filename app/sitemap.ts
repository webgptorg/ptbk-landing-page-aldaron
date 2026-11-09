import { getLegacyLegalRedirect } from '@/lib/legal/legalRedirects';
import { getLegacyArticleSitemapEntries, getManagedPublicCanonicalArticles } from '@/lib/articles/publishedArticles';
import { getArticleIndexUrl, getArticleUrl } from '@/lib/articles/urls';
import { INDEXED_PAGE_METADATA_DEFINITIONS } from '@/lib/metadata/page-registry';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import { createAbsoluteUrl } from '@/lib/metadata/site-config';
import { PRIMARY_SITE_URL } from '@/lib/domains/publicDomainRouting';
import type { MetadataRoute } from 'next';
import { NEW_SITE_SECTIONS } from '@/businesses/new/siteConfig';
import { localizedPath } from '@/businesses/new/localization';
import { SCENARIOS } from '@/businesses/new/economics';
import { COMPARISONS } from '@/businesses/new/comparisons';
import { LEGAL_PAGE_DEFINITION_LIST } from '@/lib/legal/legalPageMetadata';

export const revalidate = 3600;

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
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Navigable marketing routes can also be non-indexed discussion drafts.
    const excludedLegalUrls = new Set(LEGAL_PAGE_DEFINITION_LIST
        .filter((definition) => definition.isIndexed === false)
        .map((definition) => createAbsoluteUrl(definition.path)));
    const marketingPaths = ['', ...NEW_SITE_SECTIONS,
        ...Object.keys(SCENARIOS).map(id => `agendy/${id}`),
        ...COMPARISONS.map(item => `srovnani/${item.slug}`),
    ];
    const marketingPages = marketingPaths.flatMap(path => (['cs', 'en'] as const).map(language => ({
        url: createAbsoluteUrl(localizedPath(path, language)),
        changeFrequency: DEFAULT_SITEMAP_CHANGE_FREQUENCY,
        priority: path ? 0.6 : 1,
        alternates: { languages: {
            cs: createAbsoluteUrl(localizedPath(path, 'cs')),
            en: createAbsoluteUrl(localizedPath(path, 'en')),
        } },
    }))).filter((page) => !excludedLegalUrls.has(page.url) && !getLegacyLegalRedirect(new URL(page.url).pathname));
    const marketingUrls = new Set(marketingPages.map(page => page.url));
    const pages = INDEXED_PAGE_METADATA_DEFINITIONS.filter(
        (definition) => new URL(createAbsoluteUrl(definition.path)).origin === PRIMARY_SITE_URL &&
            !marketingUrls.has(createAbsoluteUrl(definition.path)),
    ).map(createSitemapEntry);
    return [
        ...marketingPages,
        ...pages,
        ...(['cs', 'en'] as const).map((language) => ({ url: getArticleIndexUrl(language, 'promptbook'), changeFrequency: 'weekly' as const, priority: 0.6 })),
        ...(await getManagedPublicCanonicalArticles(['promptbook-blog', 'vyvojari', 'promptbook'])).map((article) => ({
            url: article.canonicalUrl,
            lastModified: article.updatedAt ?? article.publishedAt,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        })),
        ...(await getLegacyArticleSitemapEntries('promptbook')).map((article) => ({
            url: getArticleUrl(article, 'promptbook'),
            lastModified: article.updatedAt ?? article.publishedAt,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
            ...(article.translations.length ? { alternates: { languages: Object.fromEntries([[article.language, article.canonicalUrl], ...article.translations.map((variant) => [variant.language, variant.url])]) } } : {}),
        })),
    ];
}

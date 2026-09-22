import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { MetadataRoute } from 'next';

/**
 * How often the content of a page is expected to change, as understood by the sitemap protocol
 */
export type SitemapChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

/**
 * Kind of content the page represents, as understood by the Open Graph protocol
 */
export type OpenGraphType = 'website' | 'profile' | 'article';

/**
 * A page-specific brand which replaces the site's default identity in crawler and sharing metadata
 */
export type PageMetadataBrand = {
    /**
     * Name shown in the document-level and Open Graph brand fields
     */
    readonly name: string;

    /**
     * Handle shown on X cards, when the page has an identity separate from the site
     */
    readonly socialHandle?: string;
};

/**
 * Single source of truth describing one page of the site
 *
 * Note: The very same definition is used to build the page `Metadata`, the social preview image and the sitemap entry,
 *       so a page never has to repeat its title, description or url.
 */
export type PageMetadataDefinition = {
    /**
     * Existing application path of the page, for example `/pro-mesta`. A route with its own domain is converted to
     * that domain's public URL by the shared domain routing map.
     */
    readonly path: string;

    /**
     * Language the page content is written in
     */
    readonly language: SupportedHomepageLanguage;

    /**
     * Identity used instead of the site's brand in document and sharing metadata
     */
    readonly brand?: PageMetadataBrand;

    /**
     * Text of the `<title>` element and the primary search result headline
     */
    readonly title: string;

    /**
     * Meta description shown in search results, ideally up to 160 characters
     */
    readonly description: string;

    /**
     * Headline used in sharing previews, defaults to `title`
     *
     * Note: Use it to drop the brand suffix which reads badly on a social card.
     */
    readonly socialTitle?: string;

    /**
     * Description used in sharing previews, defaults to `description`
     */
    readonly socialDescription?: string;

    /**
     * Alternative text of the sharing preview image, defaults to `socialTitle`
     */
    readonly socialPreviewImageAlt?: string;

    /**
     * Explicit sharing preview image path which wins over the generated one
     */
    readonly socialPreviewImagePath?: string;

    /**
     * Whether the route renders its own `opengraph-image` instead of falling back to the site-wide one
     */
    readonly isSocialPreviewImageGenerated?: boolean;

    /**
     * Kind of content for the Open Graph protocol, defaults to `website`
     */
    readonly openGraphType?: OpenGraphType;

    /**
     * Topical keywords of the page
     */
    readonly keywords?: readonly string[];

    /**
     * Paths of the same page in other languages, published as `hreflang` alternates
     */
    readonly languageAlternates?: Readonly<Partial<Record<SupportedHomepageLanguage, string>>>;

    /**
     * Whether search engines may index the page and list it in the sitemap, defaults to `true`
     */
    readonly isIndexed?: boolean;

    /**
     * Relative importance of the page within the site, between `0` and `1`
     */
    readonly sitemapPriority?: number;

    /**
     * Expected update rate of the page reported in the sitemap
     */
    readonly sitemapChangeFrequency?: SitemapChangeFrequency;
};

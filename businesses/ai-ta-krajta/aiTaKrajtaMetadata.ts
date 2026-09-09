import type { AiTaKrajtaEpisode } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import { createAiTaKrajtaEpisodePath } from '@/businesses/ai-ta-krajta/aiTaKrajtaViewState';
import {
    AI_TA_KRAJTA_APP_ICONS,
    AI_TA_KRAJTA_BRAND_NAME,
    AI_TA_KRAJTA_BRANDING_PATH,
    AI_TA_KRAJTA_COLORS,
    AI_TA_KRAJTA_COVER_IMAGE_PATH,
    AI_TA_KRAJTA_MANIFEST_PATH,
    AI_TA_KRAJTA_MEDIA_KIT_PATH,
    AI_TA_KRAJTA_PATH,
    AI_TA_KRAJTA_RSS_FEED_MEDIA_TYPE,
    AI_TA_KRAJTA_RSS_FEED_PLATFORM,
    AI_TA_KRAJTA_SOCIAL_URLS,
    AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE,
    AI_TA_KRAJTA_THEME_COLOR,
    AI_TA_KRAJTA_X_HANDLE,
} from '@/businesses/ai-ta-krajta/config';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import { createAbsoluteUrl } from '@/lib/metadata/site-config';
import type { SocialPreviewImageOptions } from '@/lib/metadata/social-preview-image';
import {
    createPodcastSeriesStructuredData,
    createOrganizationStructuredData,
    createWebPageStructuredData,
    createWebSiteStructuredData,
    type StructuredDataNode,
} from '@/lib/metadata/structured-data';
import type { Metadata, MetadataRoute, Viewport } from 'next';

/**
 * How many newest episodes the structured data lists, which is enough for a search engine to understand the show
 * without repeating the whole archive in every response
 */
const STRUCTURED_DATA_EPISODE_COUNT = 10;

const AI_TA_KRAJTA_STRUCTURED_DATA_URL = createAbsoluteUrl(AI_TA_KRAJTA_PATH);
const AI_TA_KRAJTA_ORGANIZATION_STRUCTURED_DATA_ID = `${AI_TA_KRAJTA_STRUCTURED_DATA_URL}#organization`;
const AI_TA_KRAJTA_WEBSITE_STRUCTURED_DATA_ID = `${AI_TA_KRAJTA_STRUCTURED_DATA_URL}#website`;

/**
 * The definition every piece of metadata of this page stems from, including the canonical url, the sharing tags and
 * the entry in the sitemap
 */
export const AI_TA_KRAJTA_PAGE_DEFINITION: PageMetadataDefinition = {
    path: AI_TA_KRAJTA_PATH,
    language: 'cs',
    brand: {
        name: AI_TA_KRAJTA_BRAND_NAME,
        socialHandle: AI_TA_KRAJTA_X_HANDLE,
    },
    title: `${AI_TA_KRAJTA_BRAND_NAME} | Český podcast o umělé inteligenci`,
    socialTitle: AI_TA_KRAJTA_BRAND_NAME,
    description:
        'Každý týden probíráme, co se v AI událo. Nové modely, nástroje a průšvihy. Díly si pustíte tady, nebo je najdete na YouTube.',
    socialDescription: AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE.cs,
    socialPreviewImageAlt: `${AI_TA_KRAJTA_BRAND_NAME}, český podcast o umělé inteligenci`,
    keywords: [
        AI_TA_KRAJTA_BRAND_NAME,
        'AI ta Krajta',
        'AI podcast',
        'český podcast o AI',
        'umělá inteligence',
        'AI novinky',
        'podcast o technologiích',
        'Pavol Hejný',
    ],
    isSocialPreviewImageGenerated: true,
    sitemapPriority: 0.7,
    sitemapChangeFrequency: 'weekly',
};

/**
 * Search and sharing metadata of the media kit, which keeps the podcast identity instead of inheriting the product
 * identity of the rest of the site
 */
export const AI_TA_KRAJTA_MEDIA_KIT_PAGE_DEFINITION: PageMetadataDefinition = {
    path: AI_TA_KRAJTA_MEDIA_KIT_PATH,
    language: 'cs',
    brand: {
        name: AI_TA_KRAJTA_BRAND_NAME,
        socialHandle: AI_TA_KRAJTA_X_HANDLE,
    },
    title: AI_TA_KRAJTA_BRAND_NAME + ' | Media kit a spolupráce',
    socialTitle: 'Media kit | ' + AI_TA_KRAJTA_BRAND_NAME,
    description: 'Media kit AI ta Krajta. Nabídka spolupráce, pravidla redakce a informace pro hosty i tipy na témata.',
    socialPreviewImageAlt: AI_TA_KRAJTA_BRAND_NAME + ', media kit a spolupráce',
    socialPreviewImagePath: AI_TA_KRAJTA_COVER_IMAGE_PATH,
    keywords: [
        'AI ta Krajta media kit',
        'AI ta Krajta partnerství',
        'AI podcast sponzoring',
        'AI podcast host',
        'český podcast o AI',
    ],
    sitemapPriority: 0.6,
    sitemapChangeFrequency: 'monthly',
};

/**
 * Search and sharing metadata of the brand kit, which keeps the podcast identity the same way the media kit does
 */
export const AI_TA_KRAJTA_BRANDING_PAGE_DEFINITION: PageMetadataDefinition = {
    path: AI_TA_KRAJTA_BRANDING_PATH,
    language: 'cs',
    brand: {
        name: AI_TA_KRAJTA_BRAND_NAME,
        socialHandle: AI_TA_KRAJTA_X_HANDLE,
    },
    title: AI_TA_KRAJTA_BRAND_NAME + ' | Brand kit a logo ke stažení',
    socialTitle: 'Brand kit | ' + AI_TA_KRAJTA_BRAND_NAME,
    description:
        'Logo AI ta Krajta ke stažení, barvy pořadu, psaní názvu a pravidla použití pro novináře, partnery i pořadatele.',
    socialPreviewImageAlt: AI_TA_KRAJTA_BRAND_NAME + ', brand kit a logo ke stažení',
    socialPreviewImagePath: AI_TA_KRAJTA_COVER_IMAGE_PATH,
    keywords: [
        'AI ta Krajta logo',
        'AI ta Krajta brand kit',
        'logo podcastu ke stažení',
        'barvy AI ta Krajta',
        'český podcast o AI',
    ],
    sitemapPriority: 0.4,
    sitemapChangeFrequency: 'yearly',
};

/**
 * Route-level metadata which must use the podcast identity instead of the site's default one
 */
const AI_TA_KRAJTA_PAGE_METADATA = createPageMetadata(AI_TA_KRAJTA_PAGE_DEFINITION);

export const AI_TA_KRAJTA_METADATA: Metadata = {
    ...AI_TA_KRAJTA_PAGE_METADATA,
    alternates: {
        ...AI_TA_KRAJTA_PAGE_METADATA.alternates,
        types: {
            ...AI_TA_KRAJTA_PAGE_METADATA.alternates?.types,
            [AI_TA_KRAJTA_RSS_FEED_MEDIA_TYPE]: [
                {
                    title: AI_TA_KRAJTA_RSS_FEED_PLATFORM.label,
                    url: AI_TA_KRAJTA_RSS_FEED_PLATFORM.url,
                },
            ],
        },
    },
    icons: {
        // Note: A browser which cannot draw the scalable icon falls back to the raster one below it.
        icon: [
            {
                url: AI_TA_KRAJTA_APP_ICONS.SCALABLE.path,
                sizes: AI_TA_KRAJTA_APP_ICONS.SCALABLE.sizes,
                type: AI_TA_KRAJTA_APP_ICONS.SCALABLE.type,
            },
            {
                url: AI_TA_KRAJTA_APP_ICONS.RASTER.path,
                sizes: AI_TA_KRAJTA_APP_ICONS.RASTER.sizes,
                type: AI_TA_KRAJTA_APP_ICONS.RASTER.type,
            },
        ],

        // Note: iOS ignores a scalable touch icon and rounds the raster one itself.
        apple: [
            {
                url: AI_TA_KRAJTA_APP_ICONS.RASTER.path,
                sizes: AI_TA_KRAJTA_APP_ICONS.RASTER.sizes,
                type: AI_TA_KRAJTA_APP_ICONS.RASTER.type,
            },
        ],
    },
    manifest: AI_TA_KRAJTA_MANIFEST_PATH,
    appleWebApp: {
        capable: true,
        title: AI_TA_KRAJTA_BRAND_NAME,
        statusBarStyle: 'black-translucent',
    },
    other: {
        'msapplication-TileColor': AI_TA_KRAJTA_THEME_COLOR,
    },
};

/**
 * Route-level metadata of the media kit. Reusing the podcast metadata preserves its icons and manifest while this
 * page gets its own canonical URL, title and sharing copy.
 */
export const AI_TA_KRAJTA_MEDIA_KIT_METADATA: Metadata = {
    ...AI_TA_KRAJTA_METADATA,
    ...createPageMetadata(AI_TA_KRAJTA_MEDIA_KIT_PAGE_DEFINITION),
};

/**
 * Route-level metadata of the brand kit, built the same way as the metadata of the media kit above it
 */
export const AI_TA_KRAJTA_BRANDING_METADATA: Metadata = {
    ...AI_TA_KRAJTA_METADATA,
    ...createPageMetadata(AI_TA_KRAJTA_BRANDING_PAGE_DEFINITION),
};

/**
 * Browser chrome of the dark podcast page
 */
export const AI_TA_KRAJTA_VIEWPORT: Viewport = {
    themeColor: AI_TA_KRAJTA_THEME_COLOR,
    colorScheme: 'dark',
};

/**
 * Manifest of the installable podcast page, read by its route file
 */
export function createAiTaKrajtaManifest(): MetadataRoute.Manifest {
    return {
        name: AI_TA_KRAJTA_BRAND_NAME,
        short_name: AI_TA_KRAJTA_BRAND_NAME,
        description: AI_TA_KRAJTA_PAGE_DEFINITION.description,
        start_url: AI_TA_KRAJTA_PATH,
        display: 'standalone',
        background_color: AI_TA_KRAJTA_THEME_COLOR,
        theme_color: AI_TA_KRAJTA_THEME_COLOR,
        icons: [
            {
                src: AI_TA_KRAJTA_APP_ICONS.SCALABLE.path,
                sizes: AI_TA_KRAJTA_APP_ICONS.SCALABLE.sizes,
                type: AI_TA_KRAJTA_APP_ICONS.SCALABLE.type,
                purpose: 'any',
            },
            {
                src: AI_TA_KRAJTA_APP_ICONS.RASTER.path,
                sizes: AI_TA_KRAJTA_APP_ICONS.RASTER.sizes,
                type: AI_TA_KRAJTA_APP_ICONS.RASTER.type,
                purpose: 'any',
            },
            {
                // Note: The raster icon fills its whole tile, so a launcher which cuts its own shape out of an icon
                //       has something to cut into and the snake still sits inside the safe area of that cut. A
                //       launcher reads the very same file for both purposes, which is why it is offered twice.
                src: AI_TA_KRAJTA_APP_ICONS.RASTER.path,
                sizes: AI_TA_KRAJTA_APP_ICONS.RASTER.sizes,
                type: AI_TA_KRAJTA_APP_ICONS.RASTER.type,
                purpose: 'maskable',
            },
        ],
    };
}

export const AI_TA_KRAJTA_SOCIAL_PREVIEW_OPTIONS: SocialPreviewImageOptions = createSocialPreviewOptions(
    AI_TA_KRAJTA_PAGE_DEFINITION,
    {
        brandLabel: AI_TA_KRAJTA_BRAND_NAME,
        eyebrow: 'Podcast',
        artwork: 'podcast',
        paletteSeed: {
            backgroundStart: AI_TA_KRAJTA_COLORS.MOSS_DEEP,
            backgroundEnd: AI_TA_KRAJTA_COLORS.MOSS,
            accent: AI_TA_KRAJTA_COLORS.CORAL,
            accentSoft: AI_TA_KRAJTA_COLORS.INDIGO,
        },
    },
);

/**
 * Schema.org nodes of the page and of the show
 *
 * Note: The episodes come from the same feed the page renders, so a search engine never learns about an episode which
 *       the page cannot play.
 *
 * @param episodes archive of the show, newest first
 */
export function createAiTaKrajtaStructuredData(episodes: readonly AiTaKrajtaEpisode[]): readonly StructuredDataNode[] {
    return [
        createOrganizationStructuredData({
            id: AI_TA_KRAJTA_ORGANIZATION_STRUCTURED_DATA_ID,
            name: AI_TA_KRAJTA_BRAND_NAME,
            description: AI_TA_KRAJTA_PAGE_DEFINITION.description,
            url: AI_TA_KRAJTA_STRUCTURED_DATA_URL,
            logoPath: AI_TA_KRAJTA_COVER_IMAGE_PATH,
            socialUrls: AI_TA_KRAJTA_SOCIAL_URLS,
        }),
        createWebSiteStructuredData({
            id: AI_TA_KRAJTA_WEBSITE_STRUCTURED_DATA_ID,
            name: AI_TA_KRAJTA_BRAND_NAME,
            description: AI_TA_KRAJTA_PAGE_DEFINITION.description,
            url: AI_TA_KRAJTA_STRUCTURED_DATA_URL,
            languageCodes: ['cs-CZ'],
            publisherId: AI_TA_KRAJTA_ORGANIZATION_STRUCTURED_DATA_ID,
        }),
        createWebPageStructuredData(AI_TA_KRAJTA_PAGE_DEFINITION, {
            websiteId: AI_TA_KRAJTA_WEBSITE_STRUCTURED_DATA_ID,
            organizationId: AI_TA_KRAJTA_ORGANIZATION_STRUCTURED_DATA_ID,
        }),
        createPodcastSeriesStructuredData({
            name: AI_TA_KRAJTA_BRAND_NAME,
            description: AI_TA_KRAJTA_PAGE_DEFINITION.description,
            path: AI_TA_KRAJTA_PATH,
            imagePath: AI_TA_KRAJTA_COVER_IMAGE_PATH,
            language: 'cs',
            author: { name: AI_TA_KRAJTA_BRAND_NAME, type: 'Organization' },
            publisherId: AI_TA_KRAJTA_ORGANIZATION_STRUCTURED_DATA_ID,
            channelUrls: AI_TA_KRAJTA_SOCIAL_URLS,
            episodes: episodes.slice(0, STRUCTURED_DATA_EPISODE_COUNT).map((episode) => ({
                name: episode.title,
                url: createAbsoluteUrl(createAiTaKrajtaEpisodePath(episode.slug)),
                audioUrl: episode.audioUrl,
                videoUrl: episode.videoUrl,
                publishedAt: episode.publishedAt,
                episodeNumber: episode.number,
                durationInSeconds: episode.durationInSeconds,
            })),
        }),
    ];
}

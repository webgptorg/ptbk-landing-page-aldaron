import {
    OPEN_GRAPH_LOCALE_BY_LANGUAGE,
    SITE_DESCRIPTION,
    SITE_NAME,
    SITE_THEME_COLOR,
    SITE_TWITTER_HANDLE,
    SITE_URL,
} from '@/lib/metadata/site-config';
import type { Metadata, Viewport } from 'next';
import {
    SOCIAL_PREVIEW_IMAGE_CONTENT_TYPE,
    SOCIAL_PREVIEW_IMAGE_SIZE,
} from '@/lib/metadata/social-preview-image-config';
import { createGeneratedSocialPreviewImagePath } from '@/lib/metadata/social-preview-image-path';

/**
 * Topics the whole site is about, inherited by pages which do not narrow them down
 */
const SITE_KEYWORDS: readonly string[] = [
    'AI',
    'AI agents',
    'AI agendas',
    'artificial intelligence',
    'ongoing responsibilities',
    'background work',
    'Promptbook',
];

/**
 * Sharing preview image inherited by pages which do not render their own
 */
const DEFAULT_SOCIAL_PREVIEW_IMAGE = {
    url: createGeneratedSocialPreviewImagePath(),
    ...SOCIAL_PREVIEW_IMAGE_SIZE,
    type: SOCIAL_PREVIEW_IMAGE_CONTENT_TYPE,
    alt: `${SITE_NAME} - ${SITE_DESCRIPTION}`,
};

/**
 * Document level metadata shared by every page of the site
 *
 * Note: A canonical url is deliberately missing here - it belongs to a page, and inheriting `/` would make every page
 *       which does not set its own canonical claim to be the homepage.
 */
export const SITE_METADATA: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    keywords: [...SITE_KEYWORDS],
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: 'website',
        siteName: SITE_NAME,
        locale: OPEN_GRAPH_LOCALE_BY_LANGUAGE.en,
        alternateLocale: [OPEN_GRAPH_LOCALE_BY_LANGUAGE.cs],
        title: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        images: [DEFAULT_SOCIAL_PREVIEW_IMAGE],
    },
    twitter: {
        card: 'summary_large_image',
        site: SITE_TWITTER_HANDLE,
        creator: SITE_TWITTER_HANDLE,
        title: SITE_NAME,
        description: SITE_DESCRIPTION,
        images: [DEFAULT_SOCIAL_PREVIEW_IMAGE],
    },
    icons: {
        icon: [
            { url: '/favicon.ico' },
            { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
        apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    manifest: '/manifest.webmanifest',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    other: {
        'msapplication-TileColor': SITE_THEME_COLOR,
    },
};

/**
 * Viewport level metadata shared by every page of the site
 */
export const SITE_VIEWPORT: Viewport = {
    themeColor: SITE_THEME_COLOR,
    colorScheme: 'light',
};

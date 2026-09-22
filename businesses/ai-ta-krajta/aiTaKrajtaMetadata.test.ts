import {
    AI_TA_KRAJTA_METADATA,
    AI_TA_KRAJTA_PAGE_DEFINITION,
    createAiTaKrajtaManifest,
    createAiTaKrajtaStructuredData,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMetadata';
import {
    AI_TA_KRAJTA_APP_ICONS,
    AI_TA_KRAJTA_BRAND_NAME,
    AI_TA_KRAJTA_MANIFEST_PATH,
    AI_TA_KRAJTA_PATH,
    AI_TA_KRAJTA_RSS_FEED_MEDIA_TYPE,
    AI_TA_KRAJTA_RSS_FEED_PLATFORM,
    AI_TA_KRAJTA_THEME_COLOR,
    AI_TA_KRAJTA_X_HANDLE,
} from '@/businesses/ai-ta-krajta/config';
import { describe, expect, it } from 'vitest';

describe('AI ta Krajta metadata', () => {
    it('uses the podcast identity for browser, sharing and app metadata', () => {
        expect(AI_TA_KRAJTA_METADATA).toMatchObject({
            title: `${AI_TA_KRAJTA_BRAND_NAME} | Český podcast o umělé inteligenci`,
            applicationName: AI_TA_KRAJTA_BRAND_NAME,
            authors: [{ name: AI_TA_KRAJTA_BRAND_NAME, url: 'https://ptbk.io/ai-ta-krajta' }],
            creator: AI_TA_KRAJTA_BRAND_NAME,
            publisher: AI_TA_KRAJTA_BRAND_NAME,
            manifest: AI_TA_KRAJTA_MANIFEST_PATH,
            alternates: {
                canonical: AI_TA_KRAJTA_PATH,
                types: {
                    [AI_TA_KRAJTA_RSS_FEED_MEDIA_TYPE]: [
                        {
                            title: AI_TA_KRAJTA_RSS_FEED_PLATFORM.label,
                            url: AI_TA_KRAJTA_RSS_FEED_PLATFORM.url,
                        },
                    ],
                },
            },
            icons: {
                icon: [{ url: AI_TA_KRAJTA_APP_ICONS.SCALABLE.path }, { url: AI_TA_KRAJTA_APP_ICONS.RASTER.path }],
                apple: [{ url: AI_TA_KRAJTA_APP_ICONS.RASTER.path }],
            },
            openGraph: {
                siteName: AI_TA_KRAJTA_BRAND_NAME,
                title: AI_TA_KRAJTA_BRAND_NAME,
            },
            twitter: {
                site: AI_TA_KRAJTA_X_HANDLE,
                creator: AI_TA_KRAJTA_X_HANDLE,
                title: AI_TA_KRAJTA_BRAND_NAME,
            },
        });
    });

    it('keeps the drawn icons and dark palette in its manifest', () => {
        expect(createAiTaKrajtaManifest()).toMatchObject({
            name: AI_TA_KRAJTA_BRAND_NAME,
            short_name: AI_TA_KRAJTA_BRAND_NAME,
            start_url: AI_TA_KRAJTA_PATH,
            background_color: AI_TA_KRAJTA_THEME_COLOR,
            theme_color: AI_TA_KRAJTA_THEME_COLOR,
            icons: [
                { src: AI_TA_KRAJTA_APP_ICONS.SCALABLE.path, purpose: 'any' },
                { src: AI_TA_KRAJTA_APP_ICONS.RASTER.path, purpose: 'any' },
                { src: AI_TA_KRAJTA_APP_ICONS.RASTER.path, purpose: 'maskable' },
            ],
        });
    });

    it('does not connect the podcast schema to the parent brand', () => {
        const serializedStructuredData = JSON.stringify(createAiTaKrajtaStructuredData([]));

        expect(serializedStructuredData).toContain(AI_TA_KRAJTA_BRAND_NAME);
        expect(serializedStructuredData).toContain(AI_TA_KRAJTA_PAGE_DEFINITION.description);
        expect(serializedStructuredData).not.toContain('Promptbook');
    });
});

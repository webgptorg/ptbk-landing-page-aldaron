import { INDEXED_PAGE_METADATA_DEFINITIONS } from '@/lib/metadata/page-registry';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import { createGeneratedSocialPreviewImagePath } from '@/lib/metadata/social-preview-image-path';
import {
    createPublicUrl,
    getInternalPathname,
    getPublicDomainRouteByHostname,
} from '@/lib/domains/publicDomainRouting';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('public sharing preview coverage', () => {
    it('versions generated artwork without propagating participant query parameters or fragments', () => {
        expect(
            createGeneratedSocialPreviewImagePath('/cs/online-workshop/participant?email=private@example.test#chat'),
        ).toBe('/cs/online-workshop/participant/opengraph-image?v=2');
        expect(createGeneratedSocialPreviewImagePath()).toBe('/opengraph-image?v=2');
    });

    it.each(INDEXED_PAGE_METADATA_DEFINITIONS)(
        'serves a dedicated card for $path on its canonical domain',
        (definition) => {
            const metadata = createPageMetadata(definition);
            const imagePath = `${definition.path}/opengraph-image`;
            const imageUrl = new URL(createPublicUrl(`${imagePath}?v=2`));
            const domain = getPublicDomainRouteByHostname(imageUrl.hostname);

            expect(definition.isSocialPreviewImageGenerated).toBe(true);
            expect(existsSync(join(process.cwd(), 'app', definition.path, 'opengraph-image.tsx'))).toBe(true);
            if (domain) {
                expect(getInternalPathname(domain, imageUrl.pathname)).toBe(imagePath);
            }

            expect(metadata.openGraph?.images).toEqual(metadata.twitter?.images);
            expect(metadata.openGraph?.images).toEqual([
                {
                    url: imageUrl.toString(),
                    width: 1200,
                    height: 630,
                    type: 'image/png',
                    alt: definition.socialPreviewImageAlt ?? definition.socialTitle ?? definition.title,
                },
            ]);
        },
    );

    it('derives the visible brand, localized copy and hostname from the same page definition', () => {
        const options = createSocialPreviewOptions({
            path: '/en/pavol?fullname=Private&email=private@example.test',
            language: 'en',
            title: 'Document title',
            socialTitle: 'Public title',
            description: 'Document description',
            socialDescription: 'Public description',
            brand: { name: 'Pavol Hejný' },
        });

        expect(options).toMatchObject({
            brandLabel: 'Pavol Hejný',
            hostname: 'pavolhejny.com',
            title: 'Public title',
            description: 'Public description',
        });
        expect(JSON.stringify(options)).not.toMatch(/Private|private@example/);
    });
});

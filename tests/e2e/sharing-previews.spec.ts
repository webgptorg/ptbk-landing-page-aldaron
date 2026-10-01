import { SOCIAL_PREVIEW_IMAGE_VERSION } from '@/lib/metadata/social-preview-image-config';
import { expect, test } from '@playwright/test';
import sharp from 'sharp';

const SHARING_PREVIEW_PAGES = [
    { hostname: 'ptbk.io', path: '/cs', title: /Dejte AI na starost celou agendu/ },
    { hostname: 'ptbk.io', path: '/en', title: /Hand AI a whole agenda/ },
    { hostname: 'ptbk.io', path: '/cs/pro-firmy', title: /Promptbook pro firmy/ },
    { hostname: 'ptbk.io', path: '/contact', title: /Let’s talk/ },
    { hostname: 'ptbk.io', path: '/en/privacy-policy', title: /Privacy Policy/ },
    { hostname: 'ptbk.io', path: '/cs/komunita/projects', title: /Co tvoří/ },
    { hostname: 'ptbk.io', path: '/cs/online-workshop/participant', title: /Živý online workshop/ },
    { hostname: 'ai-ta-krajta.cz', path: '/media-kit', title: /Media kit/ },
    { hostname: 'ai-ta-krajta.cz', path: '/branding', title: /Brand kit/ },
    { hostname: 'pavolhejny.cz', path: '/', title: /Pavol Hejný/ },
    { hostname: 'pavolhejny.com', path: '/', title: /Pavol Hejný/ },
] as const;

for (const preview of SHARING_PREVIEW_PAGES) {
    test(`shares the correct PNG and public metadata: ${preview.hostname}${preview.path}`, async ({
        page,
        request,
    }) => {
        // Exercise the production middleware mapping while using the local development server.
        await page.setExtraHTTPHeaders({ 'x-forwarded-host': preview.hostname });
        await page.goto(`${preview.path}?fullname=PrivatePreview&email=preview@example.test`, {
            waitUntil: 'domcontentloaded',
        });

        // The design version busts the long-lived cache of social crawlers, so it is read from the one constant which
        // sets it rather than repeated here - a bumped design must not look like a broken page.
        const expectedImageUrl = `https://${preview.hostname}${preview.path.replace(/\/$/, '')}/opengraph-image?v=${SOCIAL_PREVIEW_IMAGE_VERSION}`;
        await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', preview.title);
        await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', expectedImageUrl);
        await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', expectedImageUrl);
        await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
        await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
        await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
        await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute('content', 'image/png');
        const socialMetadata = await page
            .locator('meta[property^="og:"], meta[name^="twitter:"]')
            .evaluateAll((elements) => elements.map((element) => element.getAttribute('content')).join(' '));
        expect(socialMetadata).not.toMatch(/PrivatePreview|preview@example/);

        const imageUrl = new URL(expectedImageUrl);
        const imageResponse = await request.get(`${imageUrl.pathname}${imageUrl.search}`, {
            headers: { 'x-forwarded-host': preview.hostname },
            maxRedirects: 0,
        });
        expect(imageResponse.status()).toBe(200);
        expect(imageResponse.headers()['content-type']).toContain('image/png');
        const imageBuffer = await imageResponse.body();
        expect(await sharp(imageBuffer).metadata()).toMatchObject({ format: 'png', width: 1200, height: 630 });
        expect(imageBuffer.length).toBeLessThan(5 * 1024 * 1024);
    });
}

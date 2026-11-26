import { expect, test } from '@playwright/test';

test('the Business trial tab selects one transparent favicon for the current browser theme', async ({ page, context }) => {
    await page.goto('/cs/pricing/zkouska', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('head link[rel~="icon"]')).toHaveCount(2);

    const iconPage = await context.newPage();
    for (const scheme of ['light', 'dark', 'light'] as const) {
        await page.emulateMedia({ colorScheme: scheme });
        const active = await page.evaluate(() => Array.from(document.head.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'))
            .filter(link => !link.media || window.matchMedia(link.media).matches)
            .map(link => ({ url: link.href, type: link.type })));
        const url = new URL(`/favicon.svg?scheme=${scheme}`, page.url()).href;
        expect(active).toEqual([{ url, type: 'image/svg+xml' }]);

        await iconPage.emulateMedia({ colorScheme: scheme });
        await iconPage.goto(active[0].url);
        const color = scheme === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(23, 56, 108)';
        await expect(iconPage.locator('svg path').first()).toHaveCSS('fill', color);
    }
});

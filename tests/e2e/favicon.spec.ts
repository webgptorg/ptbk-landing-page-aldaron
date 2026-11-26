import { expect, test } from '@playwright/test';

test('the Business trial page offers one tab icon that follows the browser theme', async ({ page }) => {
    await page.goto('/cs/pricing/zkouska', { waitUntil: 'domcontentloaded' });
    const icon = page.locator('head link[rel~="icon"]');
    await expect(icon).toHaveCount(1);
    await expect(icon).toHaveAttribute('type', 'image/svg+xml');

    const url = await icon.evaluate((link: HTMLLinkElement) => link.href);
    await page.goto(url);
    const mark = page.locator('svg path').first();
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(mark).toHaveCSS('fill', 'rgb(255, 255, 255)');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(mark).toHaveCSS('fill', 'rgb(23, 56, 108)');
});

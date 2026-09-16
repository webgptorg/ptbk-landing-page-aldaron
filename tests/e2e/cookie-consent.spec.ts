import { expect, test, type Locator, type Page } from '@playwright/test';

const COOKIE_PANEL_SELECTOR = '[data-cookie-consent-panel]';
const DESKTOP_VIEWPORT = { width: 1440, height: 900 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };
const PAGE_APPEARANCES = [
    { path: '/cs', theme: 'light', language: 'cs' },
    { path: '/en', theme: 'light', language: 'en' },
    { path: '/cs/ochrana-osobnich-udaju', theme: 'light', language: 'cs' },
    { path: '/cs/komunita', theme: 'dark', language: 'cs' },
    { path: '/ai-supervize', theme: 'dark', language: 'cs' },
    { path: '/ai-supervize-mini', theme: 'dark', language: 'cs' },
    { path: '/ai-ta-krajta', theme: 'podcast', language: 'cs' },
    { path: '/ai-ta-krajta/branding', theme: 'podcast', language: 'cs' },
    { path: '/cs/komunita/clenstvi', theme: 'light', language: 'cs' },
] as const;

async function expectControlsToClearBar(page: Page, controls: Locator): Promise<void> {
    await expect(controls).toBeVisible();
    await expect.poll(async () => {
        const panelBounds = await page.locator(COOKIE_PANEL_SELECTOR).boundingBox();
        const controlBounds = await controls.boundingBox();
        return panelBounds !== null && controlBounds !== null &&
            controlBounds.y + controlBounds.height <= panelBounds.y + 1;
    }).toBe(true);
}

async function expectResponsiveCookieBar(page: Page): Promise<void> {
    const panel = page.locator(COOKIE_PANEL_SELECTOR);
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('button')).toHaveCount(3);

    await expect.poll(async () => panel.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const reservedHeight = Number.parseFloat(getComputedStyle(document.body).paddingBottom);
        return bounds.left >= 0 && bounds.right <= window.innerWidth &&
            Math.abs(bounds.bottom - window.innerHeight) <= 1 &&
            Math.abs(bounds.height - reservedHeight) <= 1 &&
            element.scrollWidth <= element.clientWidth;
    })).toBe(true);

    for (const button of await panel.getByRole('button').all()) {
        await expect(button).toBeInViewport();
        const bounds = await button.boundingBox();
        expect(bounds?.height).toBeGreaterThanOrEqual(44);
    }
}

for (const appearance of PAGE_APPEARANCES) {
    test(`cookie bar fits its page on desktop and mobile: ${appearance.path}`, async ({ page }, testInfo) => {
        await page.goto(appearance.path, { waitUntil: 'domcontentloaded' });
        // Room data may compile on the first request after the shell. Capture the usable page, not its spinner.
        await page.getByRole('heading', { level: 1 }).first().waitFor();
        const panel = page.locator(COOKIE_PANEL_SELECTOR);
        await expect(panel).toHaveAttribute('data-theme', appearance.theme);
        await expect(panel).toHaveAttribute('lang', appearance.language);

        for (const [viewportName, viewport] of Object.entries({ desktop: DESKTOP_VIEWPORT, mobile: MOBILE_VIEWPORT })) {
            await page.setViewportSize(viewport);
            await expectResponsiveCookieBar(page);
            await page.screenshot({ path: testInfo.outputPath(`${viewportName}.png`) });
        }

        if (appearance.path === '/cs/ochrana-osobnich-udaju') {
            await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
            await expectControlsToClearBar(page, page.locator('footer'));
        }
    });
}

test('cookie choices persist and the privacy link reopens saved settings repeatedly', async ({ page }) => {
    await page.goto('/en/privacy-policy?source=cookie-check', { waitUntil: 'domcontentloaded' });
    const panel = page.locator(COOKIE_PANEL_SELECTOR);
    await panel.getByRole('button', { name: 'Accept all', exact: true }).click();
    await expect(panel).toHaveCount(0);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(panel).toHaveCount(0);

    for (const isInitiallyAllowed of [true, false]) {
        await page.getByRole('link', { name: 'cookie settings', exact: true }).click();
        await panel.getByRole('button', { name: 'Customize', exact: true }).click();
        const dialog = page.getByRole('dialog', { name: 'Cookie settings' });
        await expect(dialog.getByRole('switch', { name: /Analytics cookies/ }))
            .toHaveAttribute('aria-checked', String(isInitiallyAllowed));
        await expect(dialog.getByRole('switch', { name: /Marketing cookies/ }))
            .toHaveAttribute('aria-checked', String(isInitiallyAllowed));
        await page.keyboard.press('Escape');
        await expect(panel.getByRole('button', { name: 'Customize', exact: true })).toBeFocused();
        await panel.getByRole('button', { name: 'Only necessary', exact: true }).click();
        await expect(panel).toHaveCount(0);
        await expect(page).toHaveURL('/en/privacy-policy?source=cookie-check');
    }

    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('cookiePreferences') ?? 'null')))
        .toEqual({ necessary: true, analytics: false, marketing: false });
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).paddingBottom)).toBe('0px');
});

test('individual settings are usable on a narrow screen and in landscape', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/cs/ochrana-osobnich-udaju', { waitUntil: 'domcontentloaded' });
    await expectResponsiveCookieBar(page);
    await page.locator(COOKIE_PANEL_SELECTOR).getByRole('button', { name: 'Nastavit', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Nastavení cookies' });
    await expect(dialog.getByRole('switch', { name: /Nutné cookies/ })).toBeDisabled();
    await dialog.getByRole('switch', { name: /Analytické cookies/ }).click();
    await page.setViewportSize({ width: 667, height: 320 });
    await expect(dialog).toBeInViewport();
    await dialog.getByRole('button', { name: 'Uložit nastavení', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.locator(COOKIE_PANEL_SELECTOR)).toHaveCount(0);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('cookiePreferences') ?? 'null')))
        .toEqual({ necessary: true, analytics: true, marketing: false });
});

test('podcast player and coder badge clear cookies through resizing and dismissal', async ({ page }) => {
    await page.goto('/ai-ta-krajta?episode=63', { waitUntil: 'domcontentloaded' });
    const player = page.locator('[data-ai-ta-krajta-mini-player]');
    const badge = page.locator('[data-promptbook-coder-badge]');

    for (const viewport of [DESKTOP_VIEWPORT, MOBILE_VIEWPORT]) {
        await page.setViewportSize(viewport);
        await expectControlsToClearBar(page, player);
        await expectControlsToClearBar(page, badge);
        await expect.poll(async () => {
            const playerBounds = await player.boundingBox();
            const badgeBounds = await badge.boundingBox();
            return playerBounds !== null && badgeBounds !== null &&
                badgeBounds.y + badgeBounds.height < playerBounds.y;
        }).toBe(true);
    }

    await page.locator(COOKIE_PANEL_SELECTOR).getByRole('button', { name: 'Pouze nutné', exact: true }).click();
    await expect.poll(async () => {
        const playerBounds = await player.boundingBox();
        return playerBounds === null ? null : Math.round(playerBounds.y + playerBounds.height);
    }).toBe(MOBILE_VIEWPORT.height);
    await player.getByRole('button', { name: 'Zavřít přehrávač', exact: true }).click();
    await expect(player).toHaveCount(0);
    await expect(badge).toBeInViewport();
});

test('homepage booking notice clears the cookie actions', async ({ page }) => {
    await page.goto('/cs', { waitUntil: 'domcontentloaded' });
    await expectControlsToClearBar(page, page.locator('[data-booking-notification]'));
});

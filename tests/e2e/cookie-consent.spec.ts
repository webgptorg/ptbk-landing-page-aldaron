import { expect, test, type Locator, type Page } from '@playwright/test';

const COOKIE_PANEL_SELECTOR = '[data-cookie-consent-panel]';
const VIEWPORTS = [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 568 },
    { width: 667, height: 320 },
];
const COOKIE_PAGE_PATHS = [
    '/cs',
    '/en',
    '/cs/ochrana-osobnich-udaju',
    '/cs/komunita',
    '/ai-supervize',
    '/ai-supervize-mini',
    '/ai-ta-krajta',
    '/admin/login',
];

async function expectWithinViewport(page: Page, element: Locator): Promise<void> {
    await expect(element).toBeVisible();
    await expect.poll(async () => {
        const bounds = await element.boundingBox();
        const viewport = page.viewportSize()!;
        return bounds !== null && bounds.x >= 0 && bounds.y >= 0 &&
            bounds.x + bounds.width <= viewport.width && bounds.y + bounds.height <= viewport.height;
    }).toBe(true);
}

async function expectAbove(upper: Locator, lower: Locator): Promise<void> {
    await expect.poll(async () => {
        const upperBounds = await upper.boundingBox();
        const lowerBounds = await lower.boundingBox();
        return upperBounds !== null && lowerBounds !== null && upperBounds.y + upperBounds.height < lowerBounds.y;
    }).toBe(true);
}

for (const path of COOKIE_PAGE_PATHS) {
    test(`cookie controls fit desktop, phone and landscape viewports: ${path}`, async ({ page }) => {
        const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
        test.skip(path === '/cs/komunita' && response?.status() === 404, 'No published community in the test database.');
        expect(response?.ok()).toBe(true);
        const panel = page.getByRole('region', { name: 'Cookies', exact: true });

        for (const viewport of VIEWPORTS) {
            await page.setViewportSize(viewport);
            await expectWithinViewport(page, panel);
            for (const button of await panel.getByRole('button').all()) {
                await expectWithinViewport(page, button);
                await button.click({ trial: true });
            }
        }

        await panel.getByRole('button').first().click();
        const dialog = page.getByRole('dialog');
        await expectWithinViewport(page, dialog);
        const saveButton = dialog.getByRole('button', { name: /Uložit nastavení|Save settings/ });
        await saveButton.click();
        await expect(panel).toHaveCount(0);
    });
}

test('cookie choices persist and the privacy link reopens settings after client navigation', async ({ page }) => {
    await page.goto('/ai-ta-krajta', { waitUntil: 'domcontentloaded' });
    const panel = page.locator(COOKIE_PANEL_SELECTOR);
    await expect(panel).toHaveCSS('background-color', 'rgb(26, 32, 28)');
    await panel.getByRole('link').click();
    await expect(page).toHaveURL('/cs/ochrana-osobnich-udaju');
    await expect(panel).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await panel.getByRole('button', { name: 'Přijmout vše', exact: true }).click();
    await expect(panel).toHaveCount(0);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(panel).toHaveCount(0);

    await page.getByRole('link', { name: 'nastavení cookies', exact: true }).click();
    await expect(panel).toBeVisible();
    await panel.getByRole('button', { name: 'Nastavit', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Nastavení cookies', exact: true });
    await expect(dialog.getByRole('switch', { name: /Nutné cookies/ })).toBeDisabled();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await panel.getByRole('button', { name: 'Nastavit', exact: true }).click();
    await dialog.getByRole('switch', { name: /Analytické cookies/ }).click();
    await dialog.getByRole('button', { name: 'Uložit nastavení', exact: true }).click();
    await expect(panel).toHaveCount(0);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('cookiePreferences')!))).toEqual({
        necessary: true, analytics: true, marketing: false,
    });
});

test('cookie panel and coder badge clear a player opened later, resized and closed', async ({ page }) => {
    await page.goto('/ai-ta-krajta', { waitUntil: 'domcontentloaded' });
    const panel = page.locator(COOKIE_PANEL_SELECTOR);
    const player = page.locator('[data-ai-ta-krajta-mini-player]');
    const coderBadge = page.locator('[data-promptbook-coder-badge]');
    await expect(panel).toBeVisible();
    await expect(player).toHaveCount(0);
    await page.getByRole('button', { name: 'Poslouchat', exact: true }).click();
    await expect(player).toBeVisible();

    for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
        await expectWithinViewport(page, panel);
        await expectAbove(panel, player);
        const panelBounds = await panel.boundingBox();
        const badgeBounds = await coderBadge.boundingBox();
        const isBadgeAbovePanel = panelBounds!.x + panelBounds!.width > badgeBounds!.x;
        await expectAbove(coderBadge, isBadgeAbovePanel ? panel : player);
        await player.getByRole('button', { name: 'Zavřít přehrávač', exact: true }).click({ trial: true });
    }

    await page.setViewportSize(VIEWPORTS[1]!);
    await player.getByRole('button', { name: 'Zavřít přehrávač', exact: true }).click();
    await expect(player).toHaveCount(0);
    await expect.poll(async () => {
        const bounds = await panel.boundingBox();
        return Math.round(VIEWPORTS[1]!.height - bounds!.y - bounds!.height);
    }).toBe(12);
    await expectAbove(coderBadge, panel);
});

test('a booking notice leaves cookie choices clickable and the footer can be scrolled clear', async ({ page }) => {
    await page.clock.install();
    await page.goto('/cs', { waitUntil: 'domcontentloaded' });
    const panel = page.locator(COOKIE_PANEL_SELECTOR);
    const notification = page.locator('[data-booking-notification]');
    await expect(panel).toBeVisible();
    await page.clock.fastForward(6000);
    await expect(notification).toBeVisible();
    await expectAbove(notification, panel);
    await page.setViewportSize(VIEWPORTS[1]!);
    await expectAbove(notification, panel);
    await panel.getByRole('button', { name: 'Přijmout vše', exact: true }).click({ trial: true });
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await expectAbove(page.locator('footer').last(), panel);
});

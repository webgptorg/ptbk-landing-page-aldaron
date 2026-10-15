import { expect, test } from '@playwright/test';

for (const path of ['/new', '/new/partnership']) {
    test(`${path} presents the two-plan offer and truthful availability`, async ({ page }) => {
        await page.goto(path);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        const pricing = page.locator('#cenik');
        await expect(pricing.getByRole('heading', { name: 'Start', exact: true })).toBeVisible();
        await expect(pricing.getByRole('heading', { name: 'Business', exact: true })).toBeVisible();
        await expect(pricing).toContainText('19 USD');
        await expect(pricing).toContainText('100 USD');
        await expect(pricing).toContainText('Instance není server');
        await expect(pricing).not.toContainText('Starter');
        await expect(pricing).not.toContainText('10 agentů');
        await expect(page.locator('#podpora')).toContainText('16 pracovních hodin');
        await expect(page.locator('#podpora')).toContainText('Europe/Prague');
        await expect(page.locator('#dostupnost')).toContainText('20. listopadu 2026');
        await expect(page.locator('#dostupnost')).toContainText('připravuje');
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
        await expect(page.locator('a[href^="mailto:"]').first()).toHaveAttribute('href', /^mailto:jiri@ptbk.io/);
    });
}

test('company economics changes, supports five scenarios and exports', async ({ page }) => {
    await page.goto('/new');
    const nav = page.getByRole('navigation', { name: 'Hlavní navigace' });
    await expect(nav.getByRole('link', { name: 'Pro agentury' })).toHaveAttribute('href', '/new/partnership');
    await expect(page.getByRole('tab', { name: 'Mám vlastní agendu' })).toHaveAttribute('aria-selected', 'true');
    await page.getByLabel('Dokladů za měsíc', { exact: true }).fill('0');
    await expect(page.getByTestId('net-benefit')).toContainText('-');
    await expect(page.getByText('Nevychází', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Obnovit příklad' }).click();
    await expect(page.getByLabel('Dokladů za měsíc', { exact: true })).toHaveValue('300');
    for (const scenario of ['email', 'social', 'video', 'coding', 'documents']) {
        await page.getByLabel('Co chcete automatizovat?').selectOption(scenario);
        await expect(page.getByTestId('net-benefit')).not.toContainText('NaN');
    }
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Stáhnout výpočet' }).click();
    expect((await download).suggestedFilename()).toBe('promptbook-company-documents.txt');
});

test('Start never becomes a monthly plan or automatic Business', async ({ page }) => {
    await page.goto('/new/partnership');
    await page.getByLabel('Komerční licence', { exact: true }).selectOption('start');
    await expect(page.getByLabel('Horizont výpočtu (měsíce)', { exact: true })).toHaveCount(0);
    await expect(page.getByLabel('Instancí na jednoho klienta', { exact: true })).toHaveCount(0);
    await expect(page.getByTestId('pilot-mrr')).toHaveText('0 Kč');
    await expect(page.locator('#kalkulacka')).toContainText('jednou pro koncového klienta');
    await page.getByLabel('Komerční licence', { exact: true }).selectOption('business');
    await expect(page.getByLabel('Horizont výpočtu (měsíce)', { exact: true })).toHaveValue('12');
    await expect(page.getByTestId('pilot-mrr')).toHaveCount(0);
});

test('partner share is fixed, follows payments and survives a 24-month horizon', async ({ page }) => {
    await page.goto('/new/partnership');
    await page.getByLabel('Počet aktivních klientů', { exact: true }).fill('1');
    await page.getByLabel('Horizont výpočtu (měsíce)', { exact: true }).fill('24');
    await expect(page.getByTestId('partner-revenue')).toHaveText('2 940 Kč');
    await page.getByText('Úhrady a vratky licencí', { exact: true }).click();
    await page.getByLabel('Skutečně uhrazené licence (%)', { exact: true }).fill('0');
    await expect(page.getByTestId('partner-revenue')).toHaveText('2 500 Kč');
    await page.getByRole('tab', { name: 'Mám vlastní agendu' }).click();
    await page.getByRole('tab', { name: 'Mám vlastní agendu' }).press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Nasazuji klientům' })).toBeFocused();
    await expect(page.getByLabel('Počet aktivních klientů', { exact: true })).toHaveValue('1');
    await expect(page.getByLabel('Horizont výpočtu (měsíce)', { exact: true })).toHaveValue('24');
    await expect(page.getByLabel('Partnerský podíl z licence (%)')).toHaveCount(0);
});

test('both pages fit a mobile viewport and have working cross-navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const path of ['/new', '/new/partnership']) {
        await page.goto(path);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        await page.locator('#kalkulacka').scrollIntoViewIfNeeded();
        await expect(page.getByRole('tab', { name: 'Nasazuji klientům' })).toBeVisible();
    }
    await page.getByRole('navigation', { name: 'Patička' }).getByRole('link', { name: 'Produkt', exact: true }).click();
    await expect(page).toHaveURL(/\/new$/);
});

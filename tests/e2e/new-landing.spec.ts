import { expect, test } from '@playwright/test';

test('new product page links to partnership and has working economics', async ({ page }) => {
    await page.goto('/new');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('AI, která se stará.');
    await expect(page.getByRole('navigation', { name: 'Hlavní navigace' }).getByRole('link', { name: 'Partnerství' })).toHaveAttribute('href', '/new/partnership');
    await expect(page.getByRole('tab', { name: 'Mám vlastní agendu' })).toHaveAttribute('aria-selected', 'true');
    const initial = await page.getByTestId('net-benefit').textContent();
    await page.getByLabel('Dokladů za měsíc', { exact: true }).fill('0');
    await expect(page.getByTestId('net-benefit')).not.toHaveText(initial!);
    await expect(page.getByText('Nevychází', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Obnovit příklad' }).click();
    await expect(page.getByLabel('Dokladů za měsíc', { exact: true })).toHaveValue('300');
    for (const scenario of ['social', 'video', 'coding', 'documents']) {
        await page.getByLabel('Co chcete automatizovat?').selectOption(scenario);
        await expect(page.getByTestId('net-benefit')).not.toContainText('NaN');
    }
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Stáhnout výpočet' }).click();
    expect((await downloadPromise).suggestedFilename()).toBe('promptbook-company-documents.txt');
});

test('partner page defaults to partner economics and preserves inputs between tabs', async ({ page }) => {
    await page.goto('/new/partnership');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Naše technologie.');
    await expect(page.getByRole('tab', { name: 'Nasazuji klientům' })).toHaveAttribute('aria-selected', 'true');
    await page.getByLabel('Počet aktivních klientů', { exact: true }).fill('0');
    await expect(page.getByTestId('partner-revenue')).toHaveText('0 Kč');
    await page.getByRole('tab', { name: 'Mám vlastní agendu' }).click();
    await page.getByRole('tab', { name: 'Mám vlastní agendu' }).press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Nasazuji klientům' })).toBeFocused();
    await expect(page.getByLabel('Počet aktivních klientů', { exact: true })).toHaveValue('0');
});

test('both new pages are readable on mobile without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const path of ['/new', '/new/partnership']) {
        await page.goto(path);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expect(page.getByRole('navigation', { name: 'Hlavní navigace' }).getByRole('link', { name: 'Kalkulačka' })).toBeVisible();
        const overflow = await page.locator('main').evaluate((element) => element.scrollWidth > element.clientWidth + 1);
        expect(overflow).toBe(false);
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    }
});

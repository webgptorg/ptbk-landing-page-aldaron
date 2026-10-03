import { getHomepageContent } from '@/businesses/homepage/homepageContent';
import { createE2eTestEmail } from '@/lib/e2e/testData';
import { expect, test, type Page } from '@playwright/test';
import { submitAndExpectApiSuccess } from './support/submissions';

async function fillAgendaEnquiry(page: Page, email: string) {
    const dialog = page.getByRole('dialog');
    await dialog
        .locator('#agenda-responsibility')
        .fill('Maintain our application, test changes and ask us before releases.');
    await dialog.locator('#agenda-fullname').fill('E2E Agenda');
    await dialog.locator('#agenda-company').fill('E2E Project');
    await dialog.locator('#agenda-email').fill(email);
    return dialog;
}

for (const language of ['cs', 'en'] as const) {
    const content = getHomepageContent(language);

    test(`agenda homepage explains ongoing work and switches examples in ${language}`, async ({ page }) => {
        await page.clock.install();
        await page.goto(`/${language}`);
        await expect(page.getByRole('heading', { level: 1 })).toContainText(
            language === 'cs' ? 'odpovědnost' : 'responsibility',
        );
        await expect(page.locator('#jak-to-funguje')).toContainText(content.comparison.oneShot.request);
        await expect(page.locator('#jak-to-funguje')).toContainText(content.comparison.agenda.request);
        await expect(page.locator('#agenda')).toContainText(content.model.definition);
        for (const part of content.model.parts)
            await expect(page.locator('#agenda').getByRole('heading', { name: part.title, exact: true })).toBeVisible();

        const examples = page.locator('#agendy');
        await expect(examples.locator('#agenda-example')).toContainText(content.examples.items[0]!.steps[2]!.title);
        await expect(examples.locator('#agenda-example')).toContainText(content.examples.items[0]!.steps[3]!.title);
        for (const example of content.examples.items) {
            const button = examples.getByRole('button', { name: example.label, exact: true });
            await button.click();
            await expect(button).toHaveAttribute('aria-pressed', 'true');
            await expect(examples.getByRole('region', { name: example.label, exact: true })).toContainText(
                example.humanDecision,
            );
        }
        await expect(page.locator('#pod-kapotou')).toContainText('OpenAI Codex');
        await expect(page.locator('#pod-kapotou')).toContainText('Claude Code');
        await expect(page.locator('#pod-kapotou')).toContainText('OpenCode');
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://ptbk.io/${language}`);
        const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
        const pageSchema = schemas
            .map((schema) => JSON.parse(schema) as Record<string, unknown>)
            .find((schema) => schema['@type'] === 'WebPage');
        expect(pageSchema).toMatchObject({
            url: `https://ptbk.io/${language}`,
            inLanguage: language === 'cs' ? 'cs-CZ' : 'en-US',
        });
        expect(pageSchema?.description).toMatch(/agend/i);
        // Delayed booking claims belong to the preserved company page, not either agenda homepage.
        await page.clock.fastForward(6000);
        await expect(page.locator('[data-booking-notification]')).toHaveCount(0);
    });

    test(`agenda lead reaches the real API and localized confirmation in ${language}`, async ({ page }) => {
        await page.goto(`/${language}`);
        await page.locator('#hero-cta').click();
        const email = createE2eTestEmail(`agenda-${language}`);
        const dialog = await fillAgendaEnquiry(page, email);
        const requestPromise = page.waitForRequest(
            (request) => request.method() === 'POST' && new URL(request.url()).pathname === '/api/waitlist',
        );
        const navigationPromise = page.waitForURL(/\/dekujeme\?source=agenda/);
        await submitAndExpectApiSuccess(page, '/api/waitlist', () =>
            dialog.getByRole('button', { name: content.callToAction, exact: true }).click(),
        );
        const payload = (await requestPromise).postDataJSON();
        expect(payload).toMatchObject({ fullname: 'E2E Agenda', email, placeName: 'qualification-popup' });
        expect(JSON.parse(payload.userNote)).toMatchObject({
            proposition: 'ongoing-agenda',
            language,
            company: 'E2E Project',
            responsibility: 'Maintain our application, test changes and ask us before releases.',
        });
        await navigationPromise;
        expect(new URL(page.url()).searchParams.get('language')).toBe(language);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(content.confirmation.title);
        await expect(page.getByText(email, { exact: true })).toBeVisible();
        await expect(page.getByRole('link', { name: content.confirmation.back })).toHaveAttribute(
            'href',
            `/${language}`,
        );
    });
}

test('all CTA entry points open one dialog, retain drafts and restore focus on close', async ({ page }) => {
    await page.goto('/cs');
    for (const selector of ['#header-cta', '#hero-cta', '#final-cta']) {
        const trigger = page.locator(selector);
        await trigger.click();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toHaveCount(1);
        await expect(dialog.getByRole('heading', { name: 'Proberme vaši první agendu' })).toBeVisible();
        await dialog.locator('#agenda-responsibility').fill('Keep this draft');
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();
        await expect(trigger).toBeFocused();
        await trigger.click();
        await expect(dialog.locator('#agenda-responsibility')).toHaveValue('Keep this draft');
        await dialog.getByRole('button', { name: 'Zavřít', exact: true }).click();
    }
    await page.locator('footer').getByRole('link', { name: 'Domluvit hovor zdarma' }).click();
    await expect(page).toHaveURL(/#kontakt$/);
    await expect(page.locator('#final-cta')).toBeInViewport();
});

test('failed agenda enquiries preserve drafts and disable duplicate requests while pending', async ({ page }) => {
    await page.goto('/en');
    await page.locator('#hero-cta').click();
    const dialog = await fillAgendaEnquiry(page, createE2eTestEmail('agenda-retry'));
    let requestCount = 0;
    let resolvePendingRequest: (() => void) | undefined;
    const pendingRequest = new Promise<void>((resolve) => {
        resolvePendingRequest = resolve;
    });
    await page.route('**/api/waitlist', async (route) => {
        requestCount += 1;
        await pendingRequest;
        await route.fulfill({
            status: 503,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Temporary failure' }),
        });
    });
    await dialog.getByRole('button', { name: 'Book a free strategy call', exact: true }).click();
    await expect(dialog.getByRole('button', { name: 'Sending…' })).toBeDisabled();
    await expect(dialog.locator('#agenda-responsibility')).toBeDisabled();
    await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeDisabled();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
    expect(requestCount).toBe(1);
    resolvePendingRequest!();
    await expect(dialog.getByRole('alert')).toContainText('Your details are still here');
    await expect(dialog.locator('#agenda-company')).toHaveValue('E2E Project');
    await expect(dialog.locator('#agenda-responsibility')).toHaveValue(
        'Maintain our application, test changes and ask us before releases.',
    );
    await expect(dialog.getByRole('button', { name: 'Book a free strategy call', exact: true })).toBeEnabled();
    await page.unroute('**/api/waitlist');
    await submitAndExpectApiSuccess(page, '/api/waitlist', () =>
        dialog.getByRole('button', { name: 'Book a free strategy call', exact: true }).click(),
    );
    await expect(page).toHaveURL(/\/dekujeme\?source=agenda/);
});

for (const width of [320, 390, 768, 1440]) {
    test(`homepage and enquiry stay within the viewport at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/cs');
        // Check content bounds directly: global overflow-x:hidden could otherwise conceal a clipped layout.
        const overflowingElements = await page
            .locator('header, main h1, main h2, main h3, main p, main a, main button, main ol, footer')
            .evaluateAll((elements) =>
                elements
                    .filter((element) => {
                        const bounds = element.getBoundingClientRect();
                        return bounds.width > 0 && (bounds.left < -1 || bounds.right > window.innerWidth + 1);
                    })
                    .map((element) => element.textContent?.slice(0, 80)),
            );
        expect(overflowingElements).toEqual([]);
        await page.locator('#hero-cta').click();
        const dialog = page.getByRole('dialog');
        const bounds = await dialog.boundingBox();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
        expect(bounds!.y).toBeGreaterThanOrEqual(0);
        expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(900);
        await dialog.getByRole('button', { name: 'Domluvit hovor zdarma', exact: true }).scrollIntoViewIfNeeded();
        await expect(dialog.getByRole('button', { name: 'Domluvit hovor zdarma', exact: true })).toBeInViewport();
    });
}

test('root language routing and the preserved company page remain independent', async ({ page, request }) => {
    for (const language of ['cs', 'en']) {
        const response = await request.get('/', { headers: { 'accept-language': language }, maxRedirects: 0 });
        expect(response.status()).toBe(307);
        expect(response.headers().location).toBe(`/${language}`);
    }
    await page.goto('/cs');
    await page.getByRole('link', { name: 'English', exact: true }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Give AI a responsibility');
    await page
        .locator('#kontakt')
        .getByRole('link', { name: 'Promptbook for company data (Czech)', exact: true })
        .click();
    await expect(page).toHaveURL(/\/cs\/pro-firmy$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('firma kdy napsala');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://ptbk.io/cs/pro-firmy');
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
    const legacyResponse = await request.get('/pro-firmy', { maxRedirects: 0 });
    expect(legacyResponse.status()).toBe(301);
    expect(new URL(legacyResponse.headers().location!, legacyResponse.url()).pathname).toBe('/cs/pro-firmy');
});

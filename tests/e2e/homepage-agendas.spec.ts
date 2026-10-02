import { expect, test, type Page } from '@playwright/test';
import { createE2eTestEmail } from '@/lib/e2e/testData';
import { submitAndExpectApiSuccess } from './support/submissions';

const LOCALIZATIONS = {
    cs: {
        title: /Svěřte AI agendu/,
        heading: /Svěřte AI agendu/,
        oneShot: 'Jednorázový úkol',
        agenda: 'Dlouhodobá agenda',
        software: 'Web a aplikace',
        accounting: 'Účetní administrativa',
        accountingHeading: 'Udržovat podklady a termíny v pořádku',
        softwareHeading: 'Udržovat a rozvíjet naši aplikaci',
        diagram: 'Od jednoho úkolu k průběžné péči',
        option: 'Web nebo aplikace',
        support: 'Navázat na existující projekt nebo proces',
        urgency: 'Příští kvartál',
        name: 'Jméno',
        company: 'Firma nebo projekt',
        email: 'E-mail',
        phone: 'Telefon',
        submit: 'Domluvit hovor zdarma',
        confirmation: 'Děkujeme za váš zájem',
        close: 'Zavřít',
    },
    en: {
        title: /Give AI a responsibility/,
        heading: /Give AI a responsibility/,
        oneShot: 'One-shot task',
        agenda: 'Ongoing agenda',
        software: 'Websites & apps',
        accounting: 'Accounting admin',
        accountingHeading: 'Keep records and deadlines in order',
        softwareHeading: 'Maintain and improve our application',
        diagram: 'From a single task to ongoing care',
        option: 'A website or application',
        support: 'Build on an existing project or process',
        urgency: 'Next quarter',
        name: 'Name',
        company: 'Company or project',
        email: 'Email',
        phone: 'Phone',
        submit: 'Arrange a free call',
        confirmation: 'Thank you for getting in touch',
        close: 'Close',
    },
} as const;

async function fillAgendaLead(page: Page, language: keyof typeof LOCALIZATIONS) {
    const CONTENT = LOCALIZATIONS[language];
    await page.goto(`/${language}`);
    await page.locator('#hero-cta').click();
    const DIALOG = page.getByRole('dialog');
    await DIALOG.getByRole('button', { name: CONTENT.option, exact: true }).click();
    await DIALOG.getByRole('button', { name: CONTENT.support, exact: true }).click();
    await DIALOG.getByRole('button', { name: CONTENT.urgency, exact: true }).click();
    await DIALOG.getByLabel(CONTENT.name, { exact: true }).fill('E2E Agenda');
    await DIALOG.getByLabel(CONTENT.company, { exact: true }).fill('E2E Project');
    await DIALOG.getByLabel(CONTENT.email, { exact: true }).fill(createE2eTestEmail(`agenda-${language}`));
    await DIALOG.getByLabel(CONTENT.phone, { exact: true }).fill('+420 777 000 001');
    return DIALOG;
}

for (const LANGUAGE of ['cs', 'en'] as const) {
    const CONTENT = LOCALIZATIONS[LANGUAGE];
    test(`agenda homepage explains continuation and switches examples in ${LANGUAGE}`, async ({ page }) => {
        const ERRORS: string[] = [];
        page.on('pageerror', (error) => ERRORS.push(error.message));
        await page.goto(`/${LANGUAGE}`);
        await expect(page).toHaveTitle(CONTENT.title);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(CONTENT.heading);
        const DIAGRAM = page.getByRole('figure');
        await expect(DIAGRAM).toContainText(CONTENT.oneShot);
        await expect(DIAGRAM).toContainText(CONTENT.agenda);
        await expect(DIAGRAM).toBeInViewport();
        await expect(page.locator('#agenda')).toContainText(LANGUAGE === 'cs' ? 'více agentů' : 'Several agents');
        await expect(page.locator('#agenda')).toContainText(
            LANGUAGE === 'cs' ? 'jednorázové i opakované' : 'one-off and recurring',
        );
        await expect(page.locator('#agenda-example')).toContainText(CONTENT.softwareHeading);
        const ACCOUNTING_BUTTON = page.getByRole('button', { name: CONTENT.accounting, exact: true });
        await ACCOUNTING_BUTTON.focus();
        await page.keyboard.press('Enter');
        await expect(ACCOUNTING_BUTTON).toHaveAttribute('aria-pressed', 'true');
        await expect(page.locator('#agenda-example')).toContainText(CONTENT.accountingHeading);
        await page.getByRole('button', { name: CONTENT.software, exact: true }).click();
        await expect(page.locator('#agenda-example')).toContainText(CONTENT.softwareHeading);
        await expect(page.locator('#agenda-example')).toContainText(
            LANGUAGE === 'cs' ? 'Pokračovat v péči' : 'Continue the maintenance',
        );
        await expect(page.locator('a[href="/cs/pro-firmy"]').first()).toBeVisible();
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://ptbk.io/${LANGUAGE}`);
        const WEBPAGE = await page
            .locator('script[type="application/ld+json"]')
            .evaluateAll((elements) =>
                elements
                    .map((element) => JSON.parse(element.textContent || '{}'))
                    .find(
                        (node): node is Record<string, unknown> =>
                            typeof node === 'object' && node !== null && '@type' in node && node['@type'] === 'WebPage',
                    ),
            );
        expect(WEBPAGE).toMatchObject({
            url: `https://ptbk.io/${LANGUAGE}`,
            inLanguage: LANGUAGE === 'cs' ? 'cs-CZ' : 'en-US',
        });
        expect(WEBPAGE?.description).toMatch(/agend/i);
        expect(ERRORS).toEqual([]);
    });

    test(`agenda lead reaches the real contact API and localized confirmation in ${LANGUAGE}`, async ({ page }) => {
        const DIALOG = await fillAgendaLead(page, LANGUAGE);
        const REQUEST_PROMISE = page.waitForRequest(
            (request) => request.method() === 'POST' && request.url().endsWith('/api/waitlist'),
        );
        await submitAndExpectApiSuccess(page, '/api/waitlist', () =>
            DIALOG.getByRole('button', { name: CONTENT.submit }).click(),
        );
        const PAYLOAD = (await REQUEST_PROMISE).postDataJSON();
        expect(PAYLOAD.placeName).toBe('qualification-popup');
        expect(JSON.parse(PAYLOAD.userNote)).toMatchObject({
            agenda: CONTENT.option,
            support: CONTENT.support,
            urgency: CONTENT.urgency,
        });
        await expect(page).toHaveURL(new RegExp(`/dekujeme\\?.*context=agenda&lang=${LANGUAGE}`));
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(CONTENT.confirmation);
        await expect(page.getByText(PAYLOAD.email, { exact: true })).toBeVisible();
    });
}

test('failed agenda submission keeps the draft and prevents edits or duplicate requests while pending', async ({
    page,
}) => {
    const DIALOG = await fillAgendaLead(page, 'en');
    let releaseRequest: (() => void) | undefined;
    const REQUEST_GATE = new Promise<void>((resolve) => {
        releaseRequest = resolve;
    });
    let requestCount = 0;
    await page.route('**/api/waitlist', async (route) => {
        requestCount += 1;
        if (requestCount > 1) return route.continue();
        await REQUEST_GATE;
        await route.fulfill({
            status: 503,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Temporary test failure' }),
        });
    });
    await DIALOG.getByRole('button', { name: 'Arrange a free call' }).click();
    await expect(DIALOG.getByLabel('Name', { exact: true })).toBeDisabled();
    await expect(DIALOG.getByRole('button', { name: 'Sending…' })).toBeDisabled();
    await page.keyboard.press('Escape');
    await expect(DIALOG).toBeVisible();
    releaseRequest!();
    await expect(DIALOG.getByRole('alert')).toContainText('Your answers are still here');
    await expect(DIALOG.getByLabel('Name', { exact: true })).toHaveValue('E2E Agenda');
    await expect(DIALOG.getByLabel('Company or project')).toHaveValue('E2E Project');
    expect(requestCount).toBe(1);
    await submitAndExpectApiSuccess(page, '/api/waitlist', () =>
        DIALOG.getByRole('button', { name: 'Arrange a free call' }).click(),
    );
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(LOCALIZATIONS.en.confirmation);
    expect(requestCount).toBe(2);
});

test('all CTA entry points open the same dialog and restore focus on close', async ({ page }) => {
    await page.goto('/en');
    for (const SELECTOR of ['#header-cta', '#hero-cta', '#final-cta']) {
        await page.locator(SELECTOR).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
        await expect(page.getByRole('dialog')).not.toBeVisible();
        await expect(page.locator(SELECTOR)).toBeFocused();
    }
});

for (const WIDTH of [320, 360, 390, 768, 1440]) {
    test(`homepage stays within the viewport at ${WIDTH}px`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width: WIDTH, height: 900 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/cs');
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        // The global page stylesheet clips horizontal overflow. Check actual content bounds, not just scrollWidth.
        const CLIPPED_CONTENT = await page
            .locator('main h1, main h2, main h3, main p, main figure, main button, main a')
            .evaluateAll((elements) =>
                elements
                    .filter((element) => {
                        const BOUNDS = element.getBoundingClientRect();
                        return BOUNDS.width > 0 && (BOUNDS.left < -1 || BOUNDS.right > window.innerWidth + 1);
                    })
                    .map((element) => element.textContent?.trim().slice(0, 100)),
            );
        expect(CLIPPED_CONTENT).toEqual([]);
        await page.screenshot({ path: testInfo.outputPath('homepage.png'), fullPage: true });
        await page.locator('#hero-cta').click();
        const DIALOG = page.getByRole('dialog');
        await expect(DIALOG).toBeVisible();
        const BOUNDS = await DIALOG.boundingBox();
        expect(BOUNDS!.x).toBeGreaterThanOrEqual(0);
        expect(BOUNDS!.width).toBeLessThanOrEqual(WIDTH);
        expect(BOUNDS!.y + BOUNDS!.height).toBeLessThanOrEqual(900);
    });
}

test('root still selects a homepage by Accept-Language and the company page remains separate', async ({
    request,
    page,
}) => {
    for (const LANGUAGE of ['cs-CZ,cs;q=0.9', 'en-US,en;q=0.9']) {
        const RESPONSE = await request.get('/', { headers: { 'Accept-Language': LANGUAGE }, maxRedirects: 0 });
        expect(RESPONSE.status()).toBe(307);
        expect(RESPONSE.headers().location).toMatch(new RegExp(`/${LANGUAGE.slice(0, 2)}$`));
    }
    await page.goto('/cs/pro-firmy');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('firma kdy napsala');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://ptbk.io/cs/pro-firmy');
});

test('the agenda explanation and first maintenance example are readable before hydration', async ({ browser }) => {
    const CONTEXT = await browser.newContext({ javaScriptEnabled: false });
    const PAGE = await CONTEXT.newPage();
    await PAGE.goto('/en');
    await expect(PAGE.getByRole('heading', { level: 1 })).toContainText('Give AI a responsibility');
    await expect(PAGE.locator('#agenda')).toContainText('Several agents');
    await expect(PAGE.locator('#agenda-example')).toContainText('Continue the maintenance');
    await CONTEXT.close();
});

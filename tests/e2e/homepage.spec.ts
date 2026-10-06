import { expect, test } from '@playwright/test';
import { HOMEPAGE_CONTENT } from '../../businesses/homepage/homepageContent';
import { HOMEPAGE_SCENARIOS } from '../../businesses/homepage/homepageScenarios';
import { createE2eTestEmail } from '@/lib/e2e/testData';
import { submitAndExpectApiSuccess } from './support/submissions';

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem('cookiesAccepted', 'true');
        localStorage.setItem(
            'cookiePreferences',
            JSON.stringify({ necessary: true, analytics: false, marketing: false }),
        );
    });
});

for (const language of ['cs', 'en'] as const) {
    const CONTENT = HOMEPAGE_CONTENT[language];
    const SCENARIOS = HOMEPAGE_SCENARIOS[language];

    test(`keeps every story coherent through selection, navigation, replay and rapid changes (${language})`, async ({
        page,
    }) => {
        const errors: string[] = [];
        const businessRequests: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('request', (request) => {
            if (/\/api\//.test(request.url()) || /openai\.com|anthropic\.com/.test(request.url()))
                businessRequests.push(`${request.method()} ${request.url()}`);
        });
        await page.goto(`/${language}`, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('h1')).toContainText(CONTENT.hero.title);
        const story = page.locator('.hp-story');
        await expect(story).toHaveAttribute('data-step', '1');
        for (const scenario of SCENARIOS) {
            const selector = story.getByRole('button', { name: scenario.name, exact: true });
            await selector.click();
            await expect(selector).toHaveAttribute('aria-pressed', 'true');
            await expect(story).toHaveAttribute('data-scenario', scenario.id);
            await expect(story.locator('.hp-story-bottom')).toContainText(scenario.benefit);
            await story.getByRole('button', { name: CONTENT.stories.replay }).click();
            for (const [index, step] of Array.from(scenario.steps.entries())) {
                await expect(story.getByRole('heading', { level: 3 })).toHaveText(step.title);
                await expect(story.locator('.hp-artifact-sheet')).toContainText(step.artifact.note);
                await expect(story.locator('.hp-status')).toHaveText(CONTENT.stories.statuses[step.status]);
                await expect(story.locator('.hp-artifact-sheet')).toHaveCount(1);
                if (index < scenario.steps.length - 1)
                    await story.getByRole('button', { name: CONTENT.stories.next, exact: true }).click();
            }
            await expect(story.getByRole('button', { name: CONTENT.stories.next, exact: true })).toBeDisabled();
            await story.getByRole('button', { name: CONTENT.stories.previous, exact: true }).click();
            await expect(story).toHaveAttribute('data-step', String(scenario.steps.length - 2));
        }
        // Dispatch while the visual reveal is still running: no queued transition may restore stale content.
        await story.locator('.hp-scenario-picker').evaluate((element) => {
            const buttons = element.querySelectorAll('button');
            for (const index of [0, 1, 2, 1, 0, 2]) buttons[index].click();
        });
        await expect(story).toHaveAttribute('data-scenario', 'documents');
        await expect(story).toHaveAttribute('data-step', '1');
        await expect(story.getByRole('heading', { level: 3 })).toHaveText(SCENARIOS[2].steps[1].title);
        await expect(story.locator('.hp-artifact-sheet')).toHaveCount(1);
        expect(businessRequests).toEqual([]);
        expect(errors).toEqual([]);
    });

    test(`validates, retains a closed/failed draft, prevents duplicate sends and delivers the lead (${language})`, async ({
        page,
    }) => {
        await page.goto(`/${language}`, { waitUntil: 'domcontentloaded' });
        const story = page.locator('.hp-story');
        await story.getByRole('button', { name: SCENARIOS[1].name, exact: true }).click();
        await page.locator('#hero-cta').click();
        const dialog = page.getByRole('dialog');
        await dialog.getByRole('button', { name: CONTENT.enquiry.submit, exact: true }).click();
        await expect(dialog.locator('#enquiry-agenda')).toHaveAttribute('aria-invalid', 'true');
        await expect(dialog.locator('#enquiry-agenda')).toBeFocused();
        await dialog.getByLabel(CONTENT.enquiry.agenda).selectOption(SCENARIOS[0].name);
        await dialog.getByLabel(CONTENT.enquiry.message, { exact: true }).fill('E2E ongoing product care enquiry.');
        await dialog.getByLabel(CONTENT.enquiry.name, { exact: true }).fill('E2E Homepage');
        await dialog.getByLabel(CONTENT.enquiry.company, { exact: true }).fill('E2E Example');
        await dialog.getByLabel(CONTENT.enquiry.email, { exact: true }).fill('invalid');
        await dialog.getByRole('button', { name: CONTENT.enquiry.submit, exact: true }).click();
        await expect(dialog.getByText(CONTENT.enquiry.invalidEmail)).toBeVisible();
        const email = createE2eTestEmail(`homepage-${language}`);
        await dialog.getByLabel(CONTENT.enquiry.email, { exact: true }).fill(email);
        await page.keyboard.press('Escape');
        await expect(dialog).not.toBeVisible();
        await expect(page.locator('#hero-cta')).toBeFocused();
        await expect(story).toHaveAttribute('data-scenario', 'communication');
        await expect(story).toHaveAttribute('data-step', '1');
        await page.locator('#hero-cta').click();
        await expect(dialog.getByLabel(CONTENT.enquiry.email, { exact: true })).toHaveValue(email);
        let attempts = 0;
        let releaseFailure!: () => void;
        const failureReady = new Promise<void>((resolve) => {
            releaseFailure = resolve;
        });
        await page.route('**/api/waitlist', async (route) => {
            attempts++;
            if (attempts === 1) {
                await failureReady;
                await route.fulfill({
                    status: 503,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: 'Controlled test failure' }),
                });
            } else {
                await route.continue();
            }
        });
        const submitButton = dialog.getByRole('button', { name: CONTENT.enquiry.submit, exact: true });
        await submitButton.click();
        try {
            await expect(dialog.getByRole('button', { name: CONTENT.enquiry.submitting })).toBeDisabled();
            await expect(dialog.getByLabel(CONTENT.enquiry.email, { exact: true })).toBeDisabled();
            // Even an explicit second form event cannot duplicate the in-flight request.
            await dialog.locator('form').dispatchEvent('submit');
            await page.keyboard.press('Escape');
            await expect(dialog).toBeVisible();
        } finally {
            releaseFailure();
        }
        await expect(dialog.getByRole('alert')).toHaveText(CONTENT.enquiry.failure);
        await expect(dialog.getByLabel(CONTENT.enquiry.email, { exact: true })).toHaveValue(email);
        expect(attempts).toBe(1);
        const requestPromise = page.waitForRequest(
            (request) => request.url().endsWith('/api/waitlist') && request.method() === 'POST',
        );
        await submitAndExpectApiSuccess(page, '/api/waitlist', () => submitButton.click());
        const request = await requestPromise;
        expect(request.postDataJSON()).toMatchObject({
            email,
            placeName: 'qualification-popup',
            fullname: 'E2E Homepage',
        });
        expect(JSON.parse(request.postDataJSON().userNote)).toMatchObject({
            proposition: 'autonomous-agendas',
            language,
        });
        await expect(page).toHaveURL(`/dekujeme?flow=homepage&lang=${language}`);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(CONTENT.enquiry.success);
        expect(page.url()).not.toContain(email);
        expect(attempts).toBe(2);
    });

    test(`offers readable native content without JavaScript (${language})`, async ({ browser, baseURL }) => {
        const context = await browser.newContext({
            javaScriptEnabled: false,
            baseURL,
            viewport: { width: 375, height: 812 },
        });
        const page = await context.newPage();
        await page.goto(`/${language}`, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('h1')).toContainText(CONTENT.hero.title);
        await expect(page.locator('#hero-cta')).toHaveAttribute('href', '#contact');
        await expect(page.locator('.hp-story-narrative')).toContainText(SCENARIOS[0].steps[1].result);
        await expect(page.locator('.hp-scenario-picker button').first()).toBeDisabled();
        await page.locator('#homepage-reader summary').click();
        for (const scenario of SCENARIOS)
            await expect(page.locator('#homepage-reader')).toContainText(scenario.benefit);
        await expect(page.getByRole('link', { name: 'jiri@ptbk.io' })).toHaveAttribute('href', 'mailto:jiri@ptbk.io');
        await expect(page.getByRole('link', { name: CONTENT.contact.paper, exact: true })).toHaveAttribute(
            'href',
            `/${language}/whitepaper`,
        );
        await expect(page.locator('footer')).toContainText(language === 'cs' ? 'Technologická inkubace' : 'Technology');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await context.close();
    });
}

test('supports phone touch, keyboard, reduced motion, background return and real navigation', async ({
    browser,
    baseURL,
}) => {
    const context = await browser.newContext({
        baseURL,
        viewport: { width: 375, height: 812 },
        hasTouch: true,
        reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto('/en');
    const story = page.locator('.hp-story');
    const scenarioButton = story.getByRole('button', { name: HOMEPAGE_SCENARIOS.en[2].name, exact: true });
    await scenarioButton.tap();
    await expect(scenarioButton).toHaveAttribute('aria-pressed', 'true');
    const next = story.getByRole('button', { name: HOMEPAGE_CONTENT.en.stories.next, exact: true });
    await next.focus();
    await page.keyboard.press('Enter');
    await expect(next).toBeFocused();
    await expect(story).toHaveAttribute('data-step', '2');
    expect(
        await story.locator('.hp-artifact-sheet').evaluate((element) => getComputedStyle(element).animationName),
    ).toBe('none');
    expect(await story.locator('.hp-artifact-sheet').evaluate((element) => getComputedStyle(element).transform)).toBe(
        'none',
    );
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await expect(story).toHaveAttribute('data-motion-active', 'false');
    const session = await context.newCDPSession(page);
    await session.send('Page.setWebLifecycleState', { state: 'frozen' });
    await session.send('Page.setWebLifecycleState', { state: 'active' });
    await story.scrollIntoViewIfNeeded();
    await expect(story).toHaveAttribute('data-step', '2');
    await expect(story).toHaveAttribute('data-scenario', 'documents');
    await page.locator('#hero-cta').tap();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Close', exact: true }).tap();
    await expect(story).toHaveAttribute('data-step', '2');
    await page.locator('.hp-mobile-nav summary').tap();
    await page.locator('.hp-mobile-nav').getByRole('link', { name: HOMEPAGE_CONTENT.en.navigation.control }).tap();
    await expect(page.locator('.hp-mobile-nav')).not.toHaveAttribute('open');
    await expect(page).toHaveURL(/#control$/);
    await page.getByRole('link', { name: 'Česky', exact: true }).click();
    await expect(page.locator('.hp-page')).toHaveAttribute('lang', 'cs');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    // Keep the cookie panel present: the last footer/legal content must still be reachable.
    await expect(page.locator('[data-cookie-consent-panel]')).toBeVisible();
    await expect
        .poll(async () =>
            page.evaluate(() => {
                window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
                const footerBottom = document.querySelector('footer')!.getBoundingClientRect().bottom;
                const cookieTop = document.querySelector('[data-cookie-consent-panel]')!.getBoundingClientRect().top;
                return footerBottom <= cookieTop;
            }),
        )
        .toBe(true);
    await context.close();
});

test('delayed or failed client scripts leave an outcome, all three stories and conversion available', async ({
    page,
}) => {
    await page.route(/\/_next\/static\/.*\.js(?:\?|$)/, (route) => route.abort('failed'));
    await page.goto('/cs', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.hp-story-narrative')).toContainText(HOMEPAGE_SCENARIOS.cs[0].steps[1].result);
    await page.locator('#homepage-reader summary').click();
    await expect(page.locator('#homepage-reader article')).toHaveCount(3);
    await page.locator('#hero-cta').click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.getByRole('link', { name: 'jiri@ptbk.io' })).toBeVisible();
});

test('keeps language routing, the preserved offer, sitemap membership and real homepage anchors', async ({
    page,
    request,
}) => {
    for (const language of ['cs', 'en']) {
        const response = await request.get('/', { headers: { 'Accept-Language': language }, maxRedirects: 0 });
        expect(response.status()).toBe(307);
        expect(new URL(response.headers().location, response.url()).pathname).toBe(`/${language}`);
    }
    const companyRedirect = await request.get('/pro-firmy', { maxRedirects: 0 });
    expect(companyRedirect.status()).toBe(301);
    expect(new URL(companyRedirect.headers().location, companyRedirect.url()).pathname).toBe('/cs/pro-firmy');
    const sitemap = await request.get('/sitemap.xml', { headers: { 'x-forwarded-host': 'ptbk.io' } });
    const sitemapText = await sitemap.text();
    for (const path of ['/cs', '/en', '/cs/pro-firmy', '/cs/whitepaper', '/en/whitepaper']) {
        expect(sitemapText).toContain(`<loc>https://ptbk.io${path}</loc>`);
    }
    expect(sitemapText).not.toContain('/en/pro-firmy');
    await page.goto('/cs', { waitUntil: 'domcontentloaded' });
    expect(
        await page
            .locator('a[href^="#"]')
            .evaluateAll((links) =>
                links.every((link) => document.getElementById(link.getAttribute('href')!.slice(1))),
            ),
    ).toBe(true);
});

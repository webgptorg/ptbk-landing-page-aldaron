import { expect, test } from '@playwright/test';
import { HOMEPAGE_CONTENT } from '../../businesses/homepage/homepageContent';
import { HOMEPAGE_SCENARIOS } from '../../businesses/homepage/homepageScenarios';
import { getHomepageEnquiry, getHomepageEnquiryThanks } from '../../businesses/homepage/homepageEnquiry';
import { createE2eTestEmail } from '../../lib/e2e/testData';
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
    const ENQUIRY = getHomepageEnquiry(language);

    test(`keeps selection, all story states, rapid switching and replay coherent without business requests (${language})`, async ({
        page,
        baseURL,
    }) => {
        const errors: string[] = [];
        const businessRequests: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('request', (request) => {
            const requestUrl = new URL(request.url());
            // The shared site already sends analytics; Next's development overlay also posts diagnostics.
            // Exempt only those known destinations, retaining the guard against unexpected external writes.
            const isExistingTelemetry = /(^|\.)(google-analytics\.com|logr-in\.com|facebook\.com)$/.test(
                requestUrl.hostname,
            );
            const isDevelopmentDiagnostic =
                requestUrl.origin === new URL(baseURL!).origin &&
                requestUrl.pathname === '/__nextjs_original-stack-frames';
            if (
                (!['GET', 'HEAD'].includes(request.method()) && !isExistingTelemetry && !isDevelopmentDiagnostic) ||
                requestUrl.pathname.startsWith('/api/') ||
                /openai|dashscope|anthropic/.test(requestUrl.hostname)
            )
                businessRequests.push(request.url());
        });
        await page.goto(`/${language}`);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(CONTENT.title.join(''));
        const story = page.getByTestId('homepage-story');
        const picker = page.getByRole('group', { name: CONTENT.story.choose });
        await expect(story).toHaveAttribute('data-step', '1');
        for (const scenario of SCENARIOS) {
            const selection = picker.getByRole('button', { name: new RegExp(scenario.name) });
            await selection.click();
            await expect(selection).toHaveAttribute('aria-pressed', 'true');
            await expect(story).toHaveAttribute('data-step', '1');
            await story.getByRole('button', { name: CONTENT.story.replay }).click();
            for (const [index, step] of Array.from(scenario.steps.entries())) {
                await expect(story).toHaveAttribute('data-step', String(index));
                await expect(story.getByRole('heading', { name: step.title, exact: true })).toBeVisible();
                await expect(story.locator('.ah-project')).toContainText(step.artifactDetail);
                await expect(story.locator('.ah-step-result')).toContainText(step.result);
                if (index < scenario.steps.length - 1)
                    await story.getByRole('button', { name: CONTENT.story.next, exact: true }).click();
            }
            await expect(story.getByRole('button', { name: CONTENT.story.next, exact: true })).toBeDisabled();
            await story.getByRole('button', { name: CONTENT.story.previous }).click();
            await expect(story).toHaveAttribute('data-step', '3');
        }
        // Dispatch in the same browser turn, without waiting for any animation or a network round trip.
        await picker.locator('button').evaluateAll((buttons) => {
            for (let index = 0; index < 24; index++) (buttons[index % buttons.length] as HTMLButtonElement).click();
            (buttons[0] as HTMLButtonElement).click();
        });
        await expect(story).toHaveAttribute('data-scenario', 'software');
        await expect(story).toHaveAttribute('data-step', '1');
        await expect(story.locator('.ah-project')).toHaveCount(1);
        await expect(story.locator('.ah-task')).toHaveCount(1);
        await expect(story.getByRole('heading', { name: SCENARIOS[0].steps[1].title, exact: true })).toBeVisible();
        expect(businessRequests).toEqual([]);
        expect(errors).toEqual([]);
    });

    test(`enquiry validates, preserves drafts on close/failure, fences pending requests and succeeds (${language})`, async ({
        page,
    }) => {
        let attempts = 0;
        let releaseResponse!: () => void;
        const pendingResponse = new Promise<void>((resolve) => {
            releaseResponse = resolve;
        });
        const submissions: Record<string, string>[] = [];
        await page.route('**/api/waitlist', async (route) => {
            attempts++;
            submissions.push(route.request().postDataJSON());
            if (attempts === 1) {
                await pendingResponse;
                await route.fulfill({ status: 503, json: { error: 'Unavailable' } });
            } else await route.fulfill({ json: { success: true } });
        });
        await page.goto(`/${language}`);
        await page.locator('#hero-cta').click();
        const dialog = page.getByRole('dialog');
        await dialog.getByRole('button', { name: ENQUIRY.submit, exact: true }).click();
        await expect(dialog.getByText(ENQUIRY.requiredError).first()).toBeVisible();
        expect(attempts).toBe(0);
        await dialog.getByLabel(ENQUIRY.agendaLabel).selectOption(SCENARIOS[1].name);
        await dialog.getByLabel(ENQUIRY.messageLabel).fill('Repeated work needs consistent follow-through.');
        for (const field of ENQUIRY.fields) {
            if (field.id !== 'phone')
                await dialog
                    .getByLabel(field.label, { exact: true })
                    .fill(field.id === 'email' ? 'invalid' : `Example ${field.id}`);
        }
        await dialog.getByRole('button', { name: ENQUIRY.submit, exact: true }).click();
        await expect(dialog.getByText(ENQUIRY.emailError)).toBeVisible();
        const emailLabel = ENQUIRY.fields.find((field) => field.id === 'email')!.label;
        await dialog.getByLabel(emailLabel, { exact: true }).fill('homepage@example.com');
        await page.keyboard.press('Escape');
        await expect(dialog).not.toBeVisible();
        await expect(page.locator('#hero-cta')).toBeFocused();
        const story = page.getByTestId('homepage-story');
        await expect(story).toHaveAttribute('data-step', '1');
        await page
            .getByRole('group', { name: CONTENT.story.choose })
            .getByRole('button', { name: new RegExp(SCENARIOS[2].name) })
            .click();
        await story.getByRole('link', { name: CONTENT.cta }).click();
        await expect(dialog.getByLabel(ENQUIRY.messageLabel)).toHaveValue(
            'Repeated work needs consistent follow-through.',
        );
        await expect(dialog.getByLabel(ENQUIRY.agendaLabel)).toHaveValue(SCENARIOS[1].name);
        await dialog.getByRole('button', { name: ENQUIRY.submit, exact: true }).click();
        await expect(dialog.getByRole('button', { name: ENQUIRY.submitting, exact: true })).toBeDisabled();
        await expect(dialog.getByLabel(emailLabel, { exact: true })).toBeDisabled();
        await dialog.locator('form').evaluate((form) => {
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        });
        releaseResponse();
        await expect(dialog.getByRole('alert')).toHaveText(ENQUIRY.sendingError);
        expect(attempts).toBe(1);
        await expect(dialog.getByLabel(emailLabel, { exact: true })).toHaveValue('homepage@example.com');
        await dialog.getByRole('button', { name: ENQUIRY.submit, exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`/dekujeme\\?source=autonomous-agendas&lang=${language}`));
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(
            getHomepageEnquiryThanks(language).successTitle,
        );
        expect(attempts).toBe(2);
        expect(submissions[1]).toMatchObject({ placeName: 'qualification-popup', email: 'homepage@example.com' });
        expect(submissions[1].userNote).toContain('autonomous-agenda');
        expect(page.url()).not.toContain('homepage@example');
    });

    test(`phone, keyboard, reduced motion, real anchors and depth links (${language})`, async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
        await page.goto(`/${language}`);
        const selected = page
            .getByRole('group', { name: CONTENT.story.choose })
            .getByRole('button', { name: new RegExp(SCENARIOS[1].name) });
        await selected.focus();
        await page.keyboard.press('Enter');
        await expect(selected).toHaveAttribute('aria-pressed', 'true');
        await expect(selected).toBeFocused();
        const transform = await page
            .locator('.ah-scene-stack')
            .evaluate((element) => getComputedStyle(element).transform);
        await page.locator('#control').scrollIntoViewIfNeeded();
        expect(await page.locator('.ah-scene-stack').evaluate((element) => getComputedStyle(element).transform)).toBe(
            transform,
        );
        expect(await page.locator('.ah-page').evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
            'rgb(255, 255, 255)',
        );
        await page.getByLabel(CONTENT.menu, { exact: true }).click();
        await page.locator('.ah-mobile-navigation').getByRole('link', { name: CONTENT.examples }).click();
        await expect(page.locator('.ah-mobile-navigation')).not.toHaveAttribute('open', '');
        expect(
            await page.evaluate(() =>
                Array.from(document.querySelectorAll('.ah-page a[href^="#"]')).every((link) =>
                    document.getElementById(link.getAttribute('href')!.slice(1)),
                ),
            ),
        ).toBe(true);
        await expect(page.getByRole('link', { name: CONTENT.depth.paper, exact: true })).toHaveAttribute(
            'href',
            `https://ptbk.io/${language}/whitepaper`,
        );
        await expect(page.getByRole('link', { name: CONTENT.depth.companyLink, exact: true }).first()).toHaveAttribute(
            'href',
            'https://ptbk.io/cs/pro-firmy',
        );
        for (const width of [320, 375, 768]) {
            await page.setViewportSize({ width, height: 812 });
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        }
        await page.getByRole('link', { name: language === 'cs' ? 'English' : 'Česky', exact: true }).click();
        await expect(page).toHaveURL(language === 'cs' ? /\/en$/ : /\/cs$/);
    });

    test(`readable scenarios, boundaries and conversion without JavaScript (${language})`, async ({
        browser,
        baseURL,
    }) => {
        const context = await browser.newContext({
            javaScriptEnabled: false,
            baseURL,
            viewport: { width: 375, height: 812 },
        });
        const page = await context.newPage();
        await page.goto(`/${language}`, { waitUntil: 'domcontentloaded' });
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(CONTENT.title.join(''));
        await page.locator('#agenda-summaries summary').click();
        for (const scenario of SCENARIOS)
            await expect(
                page.locator('#agenda-summaries').getByText(scenario.ownerDecision, { exact: true }),
            ).toBeVisible();
        await expect(page.locator('.ah-scenario-picker button').first()).toBeDisabled();
        await page.locator('#hero-cta').click();
        await expect(page.getByRole('heading', { name: CONTENT.closing.title })).toBeInViewport();
        await expect(page.getByRole('link', { name: CONTENT.closing.contactLink })).toHaveAttribute('href', '/contact');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        await context.close();
    });

    test.describe(`touch layouts (${language})`, () => {
        test.use({ hasTouch: true });
        test('touch controls and artifact text remain usable at phone, tablet and desktop widths', async ({ page }) => {
            await page.emulateMedia({ reducedMotion: 'reduce' });
            await page.goto(`/${language}`);
            const story = page.getByTestId('homepage-story');
            for (const width of [320, 375, 768, 1440]) {
                await page.setViewportSize({ width, height: 900 });
                for (const scenario of SCENARIOS) {
                    await story.getByRole('button', { name: new RegExp(scenario.name) }).tap();
                    for (const [index, step] of Array.from(scenario.steps.entries())) {
                        await story.locator('.ah-story-steps button').nth(index).tap();
                        await expect(story.locator('.ah-step-result')).toHaveText(
                            `${CONTENT.story.result}${step.result}`,
                        );
                        const coveredText = await story.evaluate((element) => {
                            const task = element.querySelector('.ah-task')!.getBoundingClientRect();
                            return Array.from(
                                element.querySelectorAll(
                                    '.ah-artifact-detail, .ah-artifact-title, .ah-message, .ah-mini-form, .ah-document-list',
                                ),
                            ).flatMap((artifact) => {
                                const range = document.createRange();
                                range.selectNodeContents(artifact);
                                const isCovered = Array.from(range.getClientRects()).some(
                                    (rectangle) =>
                                        rectangle.left < task.right &&
                                        rectangle.right > task.left &&
                                        rectangle.top < task.bottom &&
                                        rectangle.bottom > task.top,
                                );
                                return isCovered ? [artifact.textContent] : [];
                            });
                        });
                        expect(coveredText, `${width}px / ${scenario.id} / ${step.label}`).toEqual([]);
                    }
                }
                expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
            }
            // Each layered surface is a direct story control, never an action that runs the illustrated work.
            for (const [label, stepIndex] of [
                [CONTENT.story.projectAction, 1],
                [CONTENT.story.agentAction, 3],
                [CONTENT.story.taskAction, 2],
            ] as const) {
                await story.getByRole('button', { name: label, exact: true }).tap();
                await expect(story).toHaveAttribute('data-step', String(stepIndex));
            }
        });
    });
}

test('the real qualification API accepts the homepage enquiry and preserves attribution', async ({ page }) => {
    const content = getHomepageEnquiry('en');
    await page.goto('/en');
    await page.locator('#hero-cta').click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(content.agendaLabel).selectOption('Websites & applications');
    await dialog.getByLabel(content.messageLabel).fill('E2E fictional maintenance enquiry.');
    await dialog.getByLabel('Name *', { exact: true }).fill('E2E Homepage');
    await dialog.getByLabel('Company *', { exact: true }).fill('E2E Example');
    await dialog.getByLabel('Email *', { exact: true }).fill(createE2eTestEmail('homepage'));
    const request = page.waitForRequest(
        (candidate) => candidate.url().endsWith('/api/waitlist') && candidate.method() === 'POST',
    );
    await submitAndExpectApiSuccess(page, '/api/waitlist', () =>
        dialog.getByRole('button', { name: content.submit, exact: true }).click(),
    );
    expect((await request).postDataJSON()).toMatchObject({ placeName: 'qualification-popup' });
    await expect(page).toHaveURL(/\/dekujeme\?source=autonomous-agendas&lang=en/);
});

test('background and offscreen return preserve a chosen story without catch-up', async ({ page, context }) => {
    await page.goto('/en');
    const story = page.getByTestId('homepage-story');
    await story.getByRole('button', { name: 'Next step', exact: true }).click();
    await expect(story).toHaveAttribute('data-step', '2');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    const otherPage = await context.newPage();
    await otherPage.goto('about:blank');
    await otherPage.bringToFront();
    await page.bringToFront();
    await story.scrollIntoViewIfNeeded();
    await expect(story).toHaveAttribute('data-step', '2');
    await expect(story.locator('.ah-step-detail')).toContainText('Going live has its own rules.');
    await otherPage.close();
});

test('failed client scripts leave the complete static offer and native navigation usable', async ({ page }) => {
    await page.route(/\/_next\/static\/.*\.js(?:\?|$)/, (route) => route.abort());
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Hand over the routine.');
    await page.locator('#agenda-summaries summary').click();
    await expect(page.locator('#agenda-summaries').getByText(HOMEPAGE_SCENARIOS.en[2].ownerDecision)).toBeVisible();
    await page.locator('#hero-cta').click();
    await expect(page.getByRole('heading', { name: HOMEPAGE_CONTENT.en.closing.title })).toBeInViewport();
});

test('Promptbook keeps language routing, the legacy company redirect and independent sitemap entries', async ({
    request,
}) => {
    for (const [acceptedLanguages, language] of [
        ['cs-CZ,cs;q=0.9,en;q=0.5', 'cs'],
        ['en-US,en;q=0.9', 'en'],
    ]) {
        const response = await request.get('/', {
            headers: { 'x-forwarded-host': 'ptbk.io', 'Accept-Language': acceptedLanguages },
            maxRedirects: 0,
        });
        expect(response.status()).toBe(307);
        expect(response.headers().location).toBe(`/${language}`);
    }
    const companyRedirect = await request.get('/pro-firmy', { maxRedirects: 0 });
    expect(companyRedirect.status()).toBe(301);
    expect(new URL(companyRedirect.headers().location).pathname).toBe('/cs/pro-firmy');
    expect((await request.get('/en/pro-firmy')).status()).toBe(404);
    const sitemap = await request.get('/sitemap.xml', { headers: { 'x-forwarded-host': 'ptbk.io' } });
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    for (const path of ['/cs', '/en', '/cs/pro-firmy', '/cs/whitepaper', '/en/whitepaper']) {
        expect(xml).toContain(`<loc>https://ptbk.io${path}</loc>`);
    }
    expect(xml).not.toContain('<loc>https://ptbk.io/en/pro-firmy</loc>');
});

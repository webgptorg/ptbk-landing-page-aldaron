import { expect, test } from '@playwright/test';
import { WHITEPAPER_CONTENT } from '../../businesses/whitepaper/whitepaperContent';

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem('cookiesAccepted', 'true');
        localStorage.setItem('cookiePreferences', JSON.stringify({ necessary: true, analytics: false, marketing: false }));
    });
});

test('keeps APT selection controls disabled until their first interaction can be handled', async ({ page }) => {
    let releaseClientScripts!: () => void;
    const clientScriptsReady = new Promise<void>((resolve) => { releaseClientScripts = resolve; });
    await page.route(/\/_next\/static\/.*\.js(?:\?|$)/, async (route) => {
        await clientScriptsReady;
        await route.continue();
    });
    const content = WHITEPAPER_CONTENT.cs.framework;
    const taskButton = page.getByRole('group', { name: content.hint })
        .getByRole('button', { name: new RegExp(content.parts.task.name) });
    try {
        await page.goto('/cs/whitepaper', { waitUntil: 'commit' });
        await expect(taskButton).toBeDisabled();
        await expect(page.locator('.wp-apt-task')).toBeDisabled();
    } finally {
        releaseClientScripts();
    }
    await expect(taskButton).toBeEnabled();
    await taskButton.click();
    await expect(page.locator('#apt-explanation')).toContainText(content.parts.task.description);
    await expect(page.locator('.wp-apt-task')).toHaveAttribute('aria-pressed', 'true');
});

for (const language of ['cs', 'en'] as const) {
    const CONTENT = WHITEPAPER_CONTENT[language];

    test(`explains APT, verifies before accepting, and keeps external effects after a revert (${language})`, async ({
        page,
        request,
    }) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(`/${language}/whitepaper`, { waitUntil: 'domcontentloaded' });
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(CONTENT.hero.title.join(''));
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
            'href',
            `https://ptbk.io/${language}/whitepaper`,
        );
        await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
            'content',
            `https://ptbk.io/${language}/whitepaper/opengraph-image?v=2`,
        );

        const picker = page.getByRole('group', { name: CONTENT.framework.hint });
        await picker.getByRole('button', { name: new RegExp(CONTENT.framework.parts.task.name) }).click();
        await expect(page.locator('#apt-explanation')).toContainText(CONTENT.framework.parts.task.description);
        await expect(page.locator('.wp-apt-task')).toHaveAttribute('aria-pressed', 'true');

        const cycle = page.locator('.wp-cycle-demo');
        await cycle.getByRole('radio', { name: CONTENT.cycle.scenarios[1], exact: true }).check();
        for (let step = 0; step < 4; step++) {
            await cycle
                .getByRole('button', { name: step === 0 ? CONTENT.cycle.start : CONTENT.cycle.next, exact: true })
                .click();
        }
        await expect(cycle.getByRole('heading')).toHaveText(CONTENT.cycle.stages.repair.title);
        await expect(cycle.locator('.wp-cycle-result')).toHaveAttribute('data-is-accepted', 'false');
        await cycle.getByRole('button', { name: CONTENT.cycle.next, exact: true }).click();
        await cycle.getByRole('button', { name: CONTENT.cycle.next, exact: true }).click();
        await expect(cycle.locator('.wp-cycle-result')).toHaveAttribute('data-is-accepted', 'true');
        await expect(page.locator('.wp-navigation')).toBeInViewport();

        await cycle.getByRole('radio', { name: CONTENT.cycle.scenarios[2], exact: true }).check();
        for (let step = 0; step < 6; step++) {
            await cycle
                .getByRole('button', { name: step === 0 ? CONTENT.cycle.start : CONTENT.cycle.next, exact: true })
                .click();
        }
        await expect(cycle.locator('.wp-cycle-result')).toHaveAttribute('data-is-paused', 'true');
        await expect(cycle.locator('.wp-cycle-result')).toHaveAttribute('data-is-accepted', 'false');
        await cycle.getByRole('button', { name: CONTENT.cycle.restart }).click();
        await expect(cycle.getByRole('heading')).toHaveText(CONTENT.cycle.stages.observe.title);

        const history = page.locator('.wp-history-demo');
        await history.getByRole('button', { name: CONTENT.history.states[1], exact: true }).click();
        await expect(history.locator('.wp-history-files')).toContainText(CONTENT.history.taskStates[1]);
        await history.getByRole('button', { name: CONTENT.history.states[2], exact: true }).click();
        await expect(history.locator('.wp-history-files')).toContainText(CONTENT.history.taskStates[2]);
        await expect(history.locator('.wp-history-external')).toContainText(CONTENT.history.externalStates[2]);

        await page
            .locator('.wp-practice-picker')
            .getByRole('button', { name: CONTENT.practice.scenarios[1].name })
            .click();
        await expect(page.locator('#practice-scenario')).toContainText(CONTENT.practice.scenarios[1].boundary);
        await page.getByRole('link', { name: CONTENT.boundaries.link }).click();
        await expect(page.locator('#chapter-10')).toHaveAttribute('open', '');
        await page.locator('#chapter-10 summary').click();
        await page.getByRole('link', { name: CONTENT.boundaries.link }).click();
        await expect(page.locator('#chapter-10')).toHaveAttribute('open', '');

        await page.getByRole('button', { name: CONTENT.reader.expand }).click();
        await expect(page.locator('.wp-chapter[open]')).toHaveCount(14);
        await page.getByRole('button', { name: CONTENT.reader.collapse }).click();
        await expect(page.locator('.wp-chapter[open]')).toHaveCount(0);
        const response = await request.get(`/${language}/whitepaper/download`);
        expect(response.ok()).toBe(true);
        expect(response.headers()['content-type']).toContain('text/markdown');
        const markdown = await response.text();
        expect(markdown).toContain('## 12.');
        expect(markdown).toContain('https://opengitops.dev/');
        expect(markdown).not.toMatch(/^\[-\]/);
        expect(errors).toEqual([]);
    });
}

test('works on a phone with keyboard controls, reduced motion, and shared chapter language links', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
    await page.goto('/en/whitepaper#chapter-6', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#chapter-6')).toHaveAttribute('open', '');
    const beforeTransform = await page
        .locator('.wp-apt-stack')
        .evaluate((element) => getComputedStyle(element).transform);
    await page.locator('#framework').scrollIntoViewIfNeeded();
    expect(await page.locator('.wp-apt-stack').evaluate((element) => getComputedStyle(element).transform)).toBe(
        beforeTransform,
    );
    expect(await page.locator('.wp-page').evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
        'rgb(255, 255, 255)',
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    const taskButton = page
        .getByRole('group', { name: WHITEPAPER_CONTENT.en.framework.hint })
        .getByRole('button', { name: /Task/ });
    await taskButton.focus();
    await page.keyboard.press('Enter');
    await expect(taskButton).toHaveAttribute('aria-pressed', 'true');
    await page.locator('.wp-mobile-navigation summary').click();
    await page.locator('.wp-mobile-navigation').getByRole('link', { name: 'The cycle' }).click();
    await expect(page.locator('.wp-mobile-navigation')).not.toHaveAttribute('open', '');

    await page.getByRole('link', { name: WHITEPAPER_CONTENT.en.boundaries.link }).click();
    await page.getByRole('link', { name: 'Česky', exact: true }).click();
    await expect(page).toHaveURL(/\/cs\/whitepaper#chapter-10$/);
    await expect(page.locator('#chapter-10')).toHaveAttribute('open', '');
    await expect(page.locator('.wp-page')).toHaveAttribute('lang', 'cs');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('delivers the complete paper and native reading controls without JavaScript', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await context.newPage();
    await page.goto('/cs/whitepaper', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Od úkolování AI.');
    await page.locator('#chapter-12 summary').click();
    await expect(page.locator('#chapter-12')).toContainText('Popsané existující jádro');
    await expect(page.locator('#chapter-12 .wp-prose')).toBeVisible();
    await expect(page.locator('.wp-chapter')).toHaveCount(14);
    await context.close();
});

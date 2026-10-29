import { PAVOL_PAGE_CONTENT } from '@/businesses/pavol/pavolContent';
import { expect, test } from '@playwright/test';

const LOCAL_SERVER_URL = new URL(process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4009');
const PERSONAL_SITES = [
    { hostname: 'pavolhejny.cz', language: 'cs', otherLanguage: 'English', otherUrl: 'https://pavolhejny.com/' },
    { hostname: 'pavolhejny.com', language: 'en', otherLanguage: 'Čeština', otherUrl: 'https://pavolhejny.cz/' },
] as const;

/** A real recording with byte ranges keeps transport checks independent of publisher availability. */
function createTestRecording(): Buffer {
    const samples = 8000 * 45;
    const audio = Buffer.alloc(44 + samples * 2);
    audio.write('RIFF', 0); audio.writeUInt32LE(audio.length - 8, 4); audio.write('WAVEfmt ', 8);
    audio.writeUInt32LE(16, 16); audio.writeUInt16LE(1, 20); audio.writeUInt16LE(1, 22);
    audio.writeUInt32LE(8000, 24); audio.writeUInt32LE(16000, 28); audio.writeUInt16LE(2, 32); audio.writeUInt16LE(16, 34);
    audio.write('data', 36); audio.writeUInt32LE(samples * 2, 40);
    return audio;
}

test.use({
    launchOptions: {
        args: ['--host-resolver-rules=MAP pavolhejny.cz 127.0.0.1,MAP pavolhejny.com 127.0.0.1', '--no-proxy-server'],
    },
});

for (const SITE of PERSONAL_SITES) {
    const CONTENT = PAVOL_PAGE_CONTENT[SITE.language];
    const SITE_URL = new URL(LOCAL_SERVER_URL);
    SITE_URL.hostname = SITE.hostname;

    test(`${SITE.hostname} supports keyboard navigation on a narrow screen`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.setViewportSize({ width: 320, height: 740 });
        await page.goto(SITE_URL.toString());
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pavol Hejný');
        await expect(page.getByRole('link', { name: SITE.otherLanguage, exact: true })).toHaveAttribute(
            'href',
            SITE.otherUrl,
        );
        await page.keyboard.press('Tab');
        await expect(page.getByRole('link', { name: CONTENT.header.skipLinkLabel })).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(page.locator('main')).toBeFocused();

        const MENU = page.locator('header details');
        const TOGGLE = MENU.locator('summary');
        await TOGGLE.focus();
        await page.keyboard.press('Enter');
        await expect(MENU).toHaveAttribute('open', '');
        await page.keyboard.press('Escape');
        await expect(MENU).not.toHaveAttribute('open');
        await expect(TOGGLE).toBeFocused();
        await page.keyboard.press('Enter');
        await MENU.locator('a[href="#projects"]').click();
        await expect(page).toHaveURL(/#projects$/);
        await expect(MENU).not.toHaveAttribute('open');
        await expect
            .poll(() => page.locator('#projects').evaluate((ELEMENT) => ELEMENT.getBoundingClientRect().top))
            .toBeGreaterThanOrEqual(80);

        const HEADER_BOUNDS = await page.locator('header summary').boundingBox();
        expect(HEADER_BOUNDS!.x + HEADER_BOUNDS!.width).toBeLessThanOrEqual(320);
        expect(
            await page.evaluate(() => ({
                isReducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
                scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
            })),
        ).toEqual({ isReducedMotion: true, scrollBehavior: 'auto' });
    });

    test(`${SITE.hostname} preserves a custom enquiry through service changes and a failed submission`, async ({
        page,
    }) => {
        const REQUESTS: Record<string, string>[] = [];
        let finishSubmission: (() => void) | undefined;
        await page.route('**/api/waitlist', async (ROUTE) => {
            REQUESTS.push(ROUTE.request().postDataJSON());
            if (REQUESTS.length === 1) {
                await ROUTE.fulfill({ status: 503, json: { error: 'Temporary test failure' } });
                return;
            }
            await new Promise<void>((resolve) => {
                finishSubmission = resolve;
            });
            await ROUTE.fulfill({ status: 200, json: { success: true } });
        });
        await page.goto(SITE_URL.toString());
        const CONTACT = page.locator('#contact');
        const MESSAGE = CONTACT.getByLabel(CONTENT.contact.formMessageLabel, { exact: true });
        const NAME = CONTACT.getByLabel(CONTENT.contact.formNameLabel, { exact: true });
        const EMAIL = CONTACT.getByLabel(CONTENT.contact.formEmailLabel, { exact: true });
        const INQUIRY = CONTACT.getByLabel(CONTENT.contact.inquiryLabel, { exact: true });
        const [CONSULTING, WORKSHOP] = CONTENT.services.items;

        await page.getByRole('link', { name: CONSULTING.buttonLabel, exact: true }).click();
        await expect(MESSAGE).toHaveValue(CONSULTING.prefillMessage);
        await INQUIRY.selectOption(WORKSHOP.id);
        await expect(MESSAGE).toHaveValue(WORKSHOP.prefillMessage);
        await INQUIRY.selectOption('');
        await expect(MESSAGE).toHaveValue('');

        await NAME.fill('  Test Visitor  ');
        await EMAIL.fill('visitor@example.com');
        await CONTACT.getByLabel(CONTENT.contact.formCompanyLabel, { exact: false }).fill('Example Company');
        await MESSAGE.fill('My own description.\nPlease keep this second line.');
        await page.getByRole('link', { name: CONSULTING.buttonLabel, exact: true }).click();
        await expect(INQUIRY).toHaveValue(CONSULTING.id);
        await expect(NAME).toHaveValue('  Test Visitor  ');
        await expect(MESSAGE).toHaveValue('My own description.\nPlease keep this second line.');

        await CONTACT.getByRole('button', { name: CONTENT.contact.submitLabel }).click();
        await expect(CONTACT.getByRole('alert')).toHaveText(CONTENT.contact.submissionErrorMessage);
        await expect(MESSAGE).toHaveValue('My own description.\nPlease keep this second line.');
        expect(REQUESTS[0]).toMatchObject({
            fullname: 'Test Visitor',
            email: 'visitor@example.com',
            placeName: `PavolPersonalPage-${SITE.language}`,
        });
        expect(REQUESTS[0].userNote).toContain(`Selected inquiry: ${CONSULTING.id}`);
        expect(REQUESTS[0].userNote).toContain('Company: Example Company');
        expect(REQUESTS[0].userNote).toContain('My own description.\nPlease keep this second line.');

        await CONTACT.getByRole('button', { name: CONTENT.contact.submitLabel }).click();
        await expect(NAME).toBeDisabled();
        await expect(INQUIRY).toBeDisabled();
        await expect(CONTACT.getByRole('button', { name: CONTENT.contact.submittingLabel })).toBeDisabled();
        await expect.poll(() => REQUESTS.length).toBe(2);
        finishSubmission!();
        await expect(CONTACT.getByRole('status')).toBeFocused();
        await expect(CONTACT.getByRole('heading', { name: CONTENT.contact.successTitle })).toBeVisible();
        await CONTACT.getByRole('button', { name: CONTENT.contact.anotherMessageLabel }).click();
        await expect(NAME).toHaveValue('');
        await expect(NAME).toBeFocused();
        await expect(MESSAGE).toHaveValue('');
    });

    test(`${SITE.hostname} plays a podcast through the article-style player and restores it paused`, async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.route('https://www.buzzsprout.com/**/*.mp3*', (route) => {
            const recording = createTestRecording();
            const range = /bytes=(\d+)-(\d*)/.exec(route.request().headers().range ?? '');
            const start = range ? Number(range[1]) : 0;
            const end = range?.[2] ? Math.min(Number(range[2]), recording.length - 1) : recording.length - 1;
            return route.fulfill({ status: range ? 206 : 200, contentType: 'audio/wav',
                headers: { 'Accept-Ranges': 'bytes', ...(range ? { 'Content-Range': `bytes ${start}-${end}/${recording.length}` } : {}) },
                body: recording.subarray(start, end + 1),
            });
        });
        await page.goto(SITE_URL.toString());
        const CARD = page.locator('#podcasts article').filter({ has: page.getByRole('heading', { name: 'Podcastový průřez feat. AI ta Krajta' }) });
        if (SITE.language === 'en') await expect(CARD.getByLabel('Audio in Czech', { exact: true })).toBeVisible();
        await CARD.getByRole('button', { name: /^(Poslechnout|Listen):/ }).click();
        const PLAYER = page.locator('[data-article-player]');
        const AUDIO = page.locator('audio');
        await expect(PLAYER).toBeVisible();
        await expect(page.locator('[data-ai-ta-krajta-mini-player]')).toHaveCount(0);
        await expect.poll(() => AUDIO.evaluate((element: HTMLAudioElement) => element.currentTime)).toBeGreaterThan(0);
        await PLAYER.getByRole('button', { name: SITE.language === 'cs' ? 'Pozastavit' : 'Pause', exact: true }).click();
        const RANGE = PLAYER.getByRole('slider');
        const RANGE_BOUNDS = await RANGE.boundingBox();
        await RANGE.click({ position: { x: RANGE_BOUNDS!.width * 0.3, y: RANGE_BOUNDS!.height / 2 } });
        await expect.poll(() => AUDIO.evaluate((element: HTMLAudioElement) => element.currentTime)).toBeGreaterThan(10);
        await expect(PLAYER.getByRole('link')).toHaveAttribute('href', 'https://www.datatalk.cz/podcast/epizoda-157');
        await page.reload();
        await expect(PLAYER).toBeVisible();
        await expect(PLAYER.getByRole('button', { name: SITE.language === 'cs' ? 'Přehrát' : 'Play', exact: true })).toBeVisible();
        await expect.poll(() => AUDIO.evaluate((element: HTMLAudioElement) => element.currentTime)).toBeGreaterThan(10);
        expect(await AUDIO.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true);
        await expect(AUDIO).toHaveCount(1);
        const BOUNDS = await PLAYER.boundingBox();
        expect(BOUNDS!.x).toBeGreaterThanOrEqual(0);
        expect(BOUNDS!.x + BOUNDS!.width).toBeLessThanOrEqual(390);
    });

    test.describe(`${SITE.hostname} without JavaScript`, () => {
        test.use({ javaScriptEnabled: false });
        test('keeps its content and media archive readable', async ({ page }) => {
            await page.goto(SITE_URL.toString());
            await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
            await expect(page.locator('#testimonials blockquote').first().locator('..')).toHaveCSS('opacity', '1');
            const ARCHIVE = page.locator('#media details');
            await ARCHIVE.locator('summary').click();
            await expect(ARCHIVE.getByRole('heading', { name: /Most interesting browser APIs/ })).toBeVisible();
            await expect(ARCHIVE.locator('article')).toHaveCount(4);
            await expect(page.locator('#podcasts').getByRole('heading', { name: /Podcastový průřez/ })).toBeVisible();
            const FALLBACK = page.locator('#contact noscript p');
            await expect(FALLBACK).toBeVisible();
            await expect(FALLBACK).toHaveText(CONTENT.contact.javascriptRequiredMessage);
            await expect(
                page.locator('#contact').getByRole('button', { name: CONTENT.contact.submitLabel }),
            ).toBeDisabled();
        });
    });
}

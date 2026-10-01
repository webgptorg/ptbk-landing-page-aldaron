/**
 * Throwaway script which photographs the repositioned homepage at a phone and a desktop width, so the result can be
 * looked at rather than assumed.
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE_URL = 'http://localhost:4009';
const OUTPUT_DIRECTORY = 'tmp/homepage-screenshots';

const VIEWPORTS = [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'desktop', width: 1440, height: 900 },
];

const PAGE_PATHS = ['/cs', '/en', '/cs/pro-firmy'];

await mkdir(OUTPUT_DIRECTORY, { recursive: true });

const browser = await chromium.launch();

for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
    });

    // The cookie bar covers the bottom of every page and would block the photograph of the end of it.
    await context.addInitScript(() => {
        window.localStorage.setItem('cookiesAccepted', 'true');
    });

    for (const pagePath of PAGE_PATHS) {
        const page = await context.newPage();
        await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'load', timeout: 180_000 });
        await page.waitForTimeout(2500);

        const fileName = `${pagePath.replace(/\//g, '_') || '_root'}-${viewport.name}.png`;
        await page.screenshot({ path: `${OUTPUT_DIRECTORY}/${fileName}`, fullPage: true });
        console.info(`saved ${fileName}`);

        await page.close();
    }

    await context.close();
}

await browser.close();

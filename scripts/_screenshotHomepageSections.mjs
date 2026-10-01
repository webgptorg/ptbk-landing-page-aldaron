/**
 * Throwaway script photographing one section of the homepage at a time, at full resolution, so details which are
 * invisible in a whole-page photograph can be judged.
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE_URL = 'http://localhost:4009';
const OUTPUT_DIRECTORY = 'tmp/homepage-screenshots';

const [pagePath = '/cs', viewportWidth = '1440'] = process.argv.slice(2);

await mkdir(OUTPUT_DIRECTORY, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
    viewport: { width: Number(viewportWidth), height: 900 },
    deviceScaleFactor: 1,
});
await context.addInitScript(() => {
    window.localStorage.setItem('cookiesAccepted', 'true');
});

const page = await context.newPage();
await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'load', timeout: 180_000 });
await page.waitForTimeout(2500);

const sections = page.locator('main > section');
const sectionCount = await sections.count();
const label = `${pagePath.replace(/\//g, '_') || '_root'}-${viewportWidth}`;

for (let sectionIndex = 0; sectionIndex < sectionCount; sectionIndex++) {
    const section = sections.nth(sectionIndex);
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await section.screenshot({ path: `${OUTPUT_DIRECTORY}/${label}-section-${sectionIndex}.png` });
    console.info(`saved ${label}-section-${sectionIndex}.png`);
}

await browser.close();

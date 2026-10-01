/**
 * Throwaway script reporting whether anything in the homepage header is pushed outside the viewport at narrow
 * widths, which a photograph can only hint at.
 */
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:4009';
const WIDTHS = [320, 360, 390, 414];
const PAGE_PATHS = ['/cs', '/en'];

const browser = await chromium.launch();

for (const pagePath of PAGE_PATHS) {
    for (const width of WIDTHS) {
        const context = await browser.newContext({ viewport: { width, height: 800 } });
        await context.addInitScript(() => window.localStorage.setItem('cookiesAccepted', 'true'));

        const page = await context.newPage();
        await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'load', timeout: 180_000 });
        await page.waitForTimeout(800);

        const report = await page.evaluate((viewportWidth) => {
            const header = document.querySelector('header');
            const cta = document.querySelector('#header-cta');
            const headerRight = header ? header.getBoundingClientRect().right : 0;
            const ctaRect = cta ? cta.getBoundingClientRect() : null;

            return {
                documentScrollWidth: document.documentElement.scrollWidth,
                viewportWidth,
                headerRight,
                ctaRight: ctaRect ? Math.round(ctaRect.right) : null,
                ctaWidth: ctaRect ? Math.round(ctaRect.width) : null,
                ctaText: cta ? cta.textContent : null,
            };
        }, width);

        console.info(pagePath, width, JSON.stringify(report));
        await context.close();
    }
}

await browser.close();

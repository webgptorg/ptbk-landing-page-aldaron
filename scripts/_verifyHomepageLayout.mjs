/**
 * Throwaway script checking the two things a photograph cannot settle: whether the page overflows sideways at narrow
 * widths, and whether the hero's "what an agenda is" link lands the heading below the sticky header rather than
 * underneath it.
 */
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:4009';
const WIDTHS = [320, 360, 390, 414, 768, 1024, 1440];
const PAGE_PATHS = ['/cs', '/en'];

const browser = await chromium.launch();
let failureCount = 0;

for (const pagePath of PAGE_PATHS) {
    for (const width of WIDTHS) {
        const context = await browser.newContext({ viewport: { width, height: 800 } });
        await context.addInitScript(() => window.localStorage.setItem('cookiesAccepted', 'true'));

        const page = await context.newPage();
        await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'load', timeout: 180_000 });
        await page.waitForTimeout(900);

        const overflow = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            headerHeight: Math.round(document.querySelector('header')?.getBoundingClientRect().height ?? 0),
        }));

        const isOverflowing = overflow.scrollWidth > overflow.clientWidth + 1;

        // Follow the hero's own secondary action rather than a hand-written anchor, so this checks what a visitor does.
        await page.locator('a[href="#agenda"]').first().click();
        await page.waitForTimeout(1200);

        const anchor = await page.evaluate(() => {
            const section = document.querySelector('#agenda');
            const heading = section?.querySelector('h2');
            const headerRect = document.querySelector('header')?.getBoundingClientRect();
            const headingRect = heading?.getBoundingClientRect();

            return {
                headingTop: headingRect ? Math.round(headingRect.top) : null,
                headerBottom: headerRect ? Math.round(headerRect.bottom) : null,
                headingText: heading?.textContent?.slice(0, 40) ?? null,
            };
        });

        const isHeadingHidden =
            anchor.headingTop === null || anchor.headerBottom === null || anchor.headingTop < anchor.headerBottom;

        if (isOverflowing || isHeadingHidden) {
            failureCount++;
        }

        console.info(
            `${isOverflowing || isHeadingHidden ? 'FAIL' : 'ok  '} ${pagePath} @${width}`,
            `scroll=${overflow.scrollWidth}/${overflow.clientWidth}`,
            `header=${overflow.headerHeight}`,
            `headingTop=${anchor.headingTop} headerBottom=${anchor.headerBottom}`,
        );

        await context.close();
    }
}

await browser.close();
console.info(failureCount === 0 ? '\nAll widths ok' : `\n${failureCount} width(s) failed`);
process.exit(failureCount === 0 ? 0 : 1);

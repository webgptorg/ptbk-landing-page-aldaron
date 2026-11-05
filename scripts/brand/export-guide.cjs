/** Print the actual localized brand pages. Start the local website before running. */
const { chromium } = require('playwright');
const path = require('node:path');

const base = process.argv[2] ?? 'http://localhost:4009';
const output = path.resolve(__dirname, '../../public/brand');
const publicOrigin = 'https://www.ptbk.io';

async function main() {
    const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE });
    try {
        const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
        for (const language of ['cs', 'en']) {
            const response = await page.goto(new URL(`/${language}/branding`, base).href, { waitUntil: 'domcontentloaded', timeout: 180_000 });
            if (!response?.ok()) throw new Error(`Brand page ${language}: HTTP ${response?.status()}`);
            await page.locator('[data-promptbook-brand-kit]').waitFor();
            await page.evaluate(async (origin) => {
                const guide = document.querySelector('[data-promptbook-brand-kit]');
                for (const link of guide.querySelectorAll('a[href^="/"]')) {
                    link.href = new URL(link.getAttribute('href'), origin).href;
                }
                await Promise.all([...guide.querySelectorAll('img')].map(async (img) => {
                    img.loading = 'eager';
                    await img.decode();
                }));
                await document.fonts.ready;
            }, publicOrigin);
            await page.pdf({
                path: path.join(output, `promptbook-brand-guide-${language}.pdf`),
                printBackground: true,
                preferCSSPageSize: true,
                tagged: true,
            });
        }
    } finally {
        await browser.close();
    }
}

main().catch(error => { console.error(error); process.exitCode = 1; });

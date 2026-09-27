import { expect, test, type Page, type TestInfo } from '@playwright/test';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { FIELD_MARGIN_IN_PIXELS } from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeSimulation';

const TERRARIUM = '[data-ai-ta-krajta-terrarium]';
const ACTIVATION_NAME = 'Spustit minihru s krajtou';
const CLOCK_START_TIME = new Date('2026-09-27T00:00:00Z');
const CLOCK_PAUSE_TIME = new Date('2026-09-27T01:00:00Z');
test.use({ launchOptions: { args: ['--host-resolver-rules=MAP ai-ta-krajta.cz 127.0.0.1', '--no-proxy-server'] } });
const SCENARIOS = [
    { name: 'desktop-1', width: 1440, height: 1000, pixelRatio: 1, activation: 'click' },
    { name: 'desktop-1.25', width: 1279, height: 1000, pixelRatio: 1.25, activation: 'Enter' },
    { name: 'desktop-2', width: 1440, height: 1000, pixelRatio: 2, activation: 'Space' },
    { name: 'desktop-3', width: 1280, height: 1000, pixelRatio: 3, activation: 'click' },
    { name: 'mobile-1', width: 375, height: 900, pixelRatio: 1, activation: 'touch' },
    { name: 'mobile-2', width: 390, height: 900, pixelRatio: 2, activation: 'touch' },
    { name: 'mobile-3', width: 375, height: 900, pixelRatio: 3, activation: 'touch' },
    { name: 'small-mobile-3', width: 320, height: 800, pixelRatio: 3, activation: 'touch' },
] as const;

async function preparePage(page: Page, url = '/ai-ta-krajta') {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.locator(TERRARIUM).scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    // Freeze after hydration, so installing the controlled clock cannot prevent React from attaching activation.
    await expect(page.getByRole('button', { name: ACTIVATION_NAME })).toBeEnabled();
    // Reset both ends of the clock explicitly on every visit. The browser can be ahead of the host after runFor;
    // a short host-time deadline also races a busy browser. Fast-forwarding this idle page does not move the snake.
    await page.clock.install({ time: CLOCK_START_TIME });
    await page.clock.pauseAt(CLOCK_PAUSE_TIME);
    // The independent coder terminal reacts to the same pointer and can overlap the terrarium on phones.
    await page.addStyleTag({ content: `${TERRARIUM} output, [data-promptbook-coder-badge] { visibility: hidden !important; }` });
    await page.evaluate((selector) => {
        const mark = document.querySelector(`${selector} svg`)!;
        (window as unknown as { snakeOriginalMark: Element }).snakeOriginalMark = mark;
    }, TERRARIUM);
}

async function measureDifference(first: Buffer, second: Buffer) {
    const reference = await sharp(first).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const candidate = await sharp(second).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    expect(candidate.info).toEqual(reference.info);
    const difference = Buffer.alloc(reference.data.length);
    let changedPixels = 0;
    let maximumDifference = 0;
    let differenceSum = 0;
    for (let offset = 0; offset < difference.length; offset += 4) {
        let pixelDifference = 0;
        for (let channel = 0; channel < 3; channel++) {
            const value = Math.abs(reference.data[offset + channel] - candidate.data[offset + channel]);
            pixelDifference = Math.max(pixelDifference, value);
            differenceSum += value;
            difference[offset + channel] = Math.min(255, value * 12);
        }
        difference[offset + 3] = 255;
        if (pixelDifference > 0) changedPixels++;
        maximumDifference = Math.max(maximumDifference, pixelDifference);
    }
    return {
        changedPixels,
        maximumDifference,
        meanDifference: differenceSum / reference.data.length,
        image: await sharp(difference, { raw: reference.info }).png().toBuffer(),
        overlay: await sharp(first).composite([{ input: await sharp(second).removeAlpha().ensureAlpha(0.5).png().toBuffer() }]).png().toBuffer(),
    };
}

async function saveImage(testInfo: TestInfo, name: string, data: Buffer) {
    await writeFile(testInfo.outputPath(name), data);
    await testInfo.attach(name, { body: data, contentType: 'image/png' });
}

async function readArtworkMarkup(page: Page): Promise<string> {
    return page.locator(`${TERRARIUM} svg`).evaluate((mark) =>
        Array.from(mark.children).filter((element) => element.tagName !== 'g').map((element) => element.outerHTML).join(''),
    );
}

for (const scenario of SCENARIOS) {
    test.describe(scenario.name, () => {
        test.use({
            viewport: { width: scenario.width, height: scenario.height },
            deviceScaleFactor: scenario.pixelRatio,
            hasTouch: scenario.activation === 'touch',
            isMobile: scenario.activation === 'touch',
        });

        test('the original logo starts moving without a replacement shape', async ({ page }, testInfo) => {
            await preparePage(page);
            const clip = (await page.locator(TERRARIUM).boundingBox())!;
            const initialMarkup = await readArtworkMarkup(page);
            const frames: { name: string; image: Buffer }[] = [];
            const capture = async (name: string) => {
                const image = await page.screenshot({ clip });
                frames.push({ name, image });
                await saveImage(testInfo, `${name}.png`, image);
                return image;
            };
            const staticFrame = await capture('00-static');
            const button = page.getByRole('button', { name: ACTIVATION_NAME });
            if (scenario.activation === 'touch') await button.tap();
            else if (scenario.activation === 'click') await button.click();
            else await button.press(scenario.activation);
            await expect(page.locator(`${TERRARIUM} canvas`)).toBeVisible();
            await page.mouse.move(0, 0);
            const firstFrame = await capture('01-first-game');
            const difference = await measureDifference(staticFrame, firstFrame);
            await saveImage(testInfo, 'handoff-difference-12x.png', difference.image);
            await saveImage(testInfo, 'handoff-overlay.png', difference.overlay);
            expect(difference.changedPixels).toBe(0);
            expect(await readArtworkMarkup(page)).toBe(initialMarkup);

            await page.clock.runFor(16);
            const firstAnimationFrame = await capture('02-first-animation');
            expect((await measureDifference(staticFrame, firstAnimationFrame)).changedPixels).toBe(0);
            let elapsed = 0;
            let firstMovementMetrics: { changedPixels: number; maximumDifference: number; meanDifference: number } | null = null;
            const releaseDifferences: { elapsed: number; changedPixels: number; maximumDifference: number; meanDifference: number }[] = [];
            let previousFrame = firstAnimationFrame;
            for (const duration of [16, 16, 32, 64, 128, 256, 188, 200, 600]) {
                await page.clock.runFor(duration);
                elapsed += duration;
                const currentFrame = await capture(`release-${String(elapsed).padStart(4, '0')}ms`);
                const releaseDifference = await measureDifference(previousFrame, currentFrame);
                releaseDifferences.push({
                    elapsed, changedPixels: releaseDifference.changedPixels,
                    maximumDifference: releaseDifference.maximumDifference, meanDifference: releaseDifference.meanDifference,
                });
                await saveImage(testInfo, `release-${elapsed}ms-difference-12x.png`, releaseDifference.image);
                await saveImage(testInfo, `release-${elapsed}ms-overlay.png`, releaseDifference.overlay);
                previousFrame = currentFrame;
                if (elapsed === 16) {
                    // Inspect the real first moving outline in the page, at its actual subpixel position. Exclude
                    // food and opening eyes only from this extra comparison; the release captures retain both.
                    const style = await page.addStyleTag({ content: `${TERRARIUM} canvas, ${TERRARIUM} svg > g { visibility: hidden !important; }` });
                    const movingBody = await page.screenshot({ clip });
                    await style.evaluate((element) => (element as HTMLStyleElement).remove());
                    const firstMovementDifference = await measureDifference(staticFrame, movingBody);
                    firstMovementMetrics = {
                        changedPixels: firstMovementDifference.changedPixels,
                        maximumDifference: firstMovementDifference.maximumDifference,
                        meanDifference: firstMovementDifference.meanDifference,
                    };
                    await saveImage(testInfo, 'first-movement-body.png', movingBody);
                    await saveImage(testInfo, 'first-movement-difference-12x.png', firstMovementDifference.image);
                    await saveImage(testInfo, 'first-movement-overlay.png', firstMovementDifference.overlay);
                    // At 16 ms the head has travelled 0.064 CSS pixels. A replacement silhouette, color flash or
                    // coordinate-origin shift is much larger than this subpixel movement and cubic edge coverage.
                    expect(firstMovementDifference.maximumDifference).toBeLessThan(100);
                    expect(firstMovementDifference.meanDifference).toBeLessThan(0.04);
                    expect(await readArtworkMarkup(page)).not.toBe(initialMarkup);
                }
                expect(await page.evaluate((selector) => {
                    const mark = document.querySelector(`${selector} svg`)!;
                    return mark === (window as unknown as { snakeOriginalMark: Element }).snakeOriginalMark &&
                        getComputedStyle(mark).opacity === '1' && mark.querySelectorAll('path').length === 3;
                }, TERRARIUM)).toBe(true);
            }
            expect(await readArtworkMarkup(page)).not.toBe(initialMarkup);
            await expect(page.locator(`${TERRARIUM} output`)).toContainText('Skóre:');

            const contactSheet = await sharp({ create: { width: 280 * 4, height: 306 * 3, channels: 4, background: '#232a25' } })
                .composite(await Promise.all(frames.map(async (frame, index) => ({
                    input: await sharp(frame.image).resize(280, 280).extend({ bottom: 26, background: '#232a25' })
                        .composite([{ input: Buffer.from(`<svg width="280" height="26"><text x="8" y="18" fill="white" font-size="13">${frame.name}</text></svg>`), top: 280, left: 0 }]).png().toBuffer(),
                    left: (index % 4) * 280, top: Math.floor(index / 4) * 306,
                }))))
                .png().toBuffer();
            await saveImage(testInfo, 'release-contact-sheet.png', contactSheet);
            const archive = path.resolve('.tmp/snake-handoff/verified', scenario.name);
            await mkdir(archive, { recursive: true });
            await writeFile(path.join(archive, 'release-contact-sheet.png'), contactSheet);
            await writeFile(path.join(archive, 'handoff-difference-12x.png'), difference.image);
            await writeFile(path.join(archive, 'metrics.json'), JSON.stringify({
                scenario, changedPixels: difference.changedPixels, maximumDifference: difference.maximumDifference,
                meanDifference: difference.meanDifference, elapsed, firstMovement: firstMovementMetrics, releaseDifferences,
            }, null, 2));
        });
    });
}

/** Artwork outlines in the canvas's CSS coordinate system, independent of SVG view-box and device pixel ratio. */
async function readOutlineInField(page: Page) {
    return page.locator(TERRARIUM).evaluate((terrarium) => {
        const bounds = terrarium.querySelector('canvas')!.getBoundingClientRect();
        return {
            bounds: { width: bounds.width, height: bounds.height },
            points: Array.from(terrarium.querySelectorAll<SVGPathElement>('svg path')).flatMap((element) => {
                const matrix = element.getScreenCTM()!;
                const length = element.getTotalLength();
                return Array.from({ length: 80 }, (_, index) => {
                    const point = element.getPointAtLength(length * index / 79).matrixTransform(matrix);
                    return { x: point.x - bounds.left, y: point.y - bounds.top };
                });
            }),
        };
    });
}

test('resizing the moving snake scales its whole outline without a second width correction', async ({ page }, testInfo) => {
    await preparePage(page);
    await page.getByRole('button', { name: ACTIVATION_NAME }).click();
    await expect(page.locator(`${TERRARIUM} canvas`)).toBeVisible();
    await page.clock.runFor(144);
    const initial = await readOutlineInField(page);
    for (const width of [390, 768, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.locator(TERRARIUM).scrollIntoViewIfNeeded();
        // ResizeObserver paints in a rendering cycle even while the animation clock stays paused.
        await expect.poll(async () => (await page.locator(`${TERRARIUM} canvas`).evaluate((canvas: HTMLCanvasElement) =>
            canvas.width === Math.round(canvas.getBoundingClientRect().width * devicePixelRatio),
        ))).toBe(true);
        const resized = await readOutlineInField(page);
        const margin = FIELD_MARGIN_IN_PIXELS;
        const horizontalScale = (resized.bounds.width - 2 * margin) / (initial.bounds.width - 2 * margin);
        const verticalScale = (resized.bounds.height - 2 * margin) / (initial.bounds.height - 2 * margin);
        resized.points.forEach((point, index) => {
            // The field has 26 px walls. Length, width and head must follow the same field transform.
            expect(Math.abs(point.x - (margin + (initial.points[index].x - margin) * horizontalScale))).toBeLessThan(0.04);
            expect(Math.abs(point.y - (margin + (initial.points[index].y - margin) * verticalScale))).toBeLessThan(0.04);
        });
        await saveImage(testInfo, `resized-${width}.png`, await page.locator(TERRARIUM).screenshot());
    }
});

test('a changed SVG aspect ratio keeps its centered logo pose at activation and release', async ({ page }, testInfo) => {
    await preparePage(page);
    await page.addStyleTag({ content: `${TERRARIUM} svg { height: 160px; width: 208px; }` });
    const clip = (await page.locator(TERRARIUM).boundingBox())!;
    const staticFrame = await page.screenshot({ clip });
    await page.getByRole('button', { name: ACTIVATION_NAME }).click();
    await expect(page.locator(`${TERRARIUM} canvas`)).toBeVisible();
    expect((await measureDifference(staticFrame, await page.screenshot({ clip }))).changedPixels).toBe(0);
    await page.clock.runFor(32);
    await page.addStyleTag({ content: `${TERRARIUM} canvas, ${TERRARIUM} svg > g { visibility: hidden !important; }` });
    const difference = await measureDifference(staticFrame, await page.screenshot({ clip }));
    await saveImage(testInfo, 'non-square-first-movement-difference-12x.png', difference.image);
    expect(difference.meanDifference).toBeLessThan(0.04);
    expect(difference.maximumDifference).toBeLessThan(100);
});

test('changing only the SVG frame preserves the running artwork in field coordinates', async ({ page }, testInfo) => {
    await preparePage(page);
    await page.getByRole('button', { name: ACTIVATION_NAME }).click();
    await expect(page.locator(`${TERRARIUM} canvas`)).toBeVisible();
    await page.clock.runFor(144);
    const initial = await readOutlineInField(page);
    const clip = (await page.locator(TERRARIUM).boundingBox())!;
    const before = await page.screenshot({ clip });
    await page.addStyleTag({ content: `${TERRARIUM} svg { width: 180px; height: 150px; }` });
    await expect.poll(async () => {
        const resized = await readOutlineInField(page);
        return Math.max(...resized.points.map((point, index) => Math.hypot(
            point.x - initial.points[index].x, point.y - initial.points[index].y,
        )));
    }).toBeLessThan(0.04);
    const difference = await measureDifference(before, await page.screenshot({ clip }));
    await saveImage(testInfo, 'svg-frame-resize-difference-12x.png', difference.image);
    expect(difference.meanDifference).toBeLessThan(0.015);
});

test.describe('canonical podcast domain', () => {
    test('the branded root uses the same uninterrupted handoff', async ({ page }, testInfo) => {
        const url = new URL(process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4009');
        test.skip(!['127.0.0.1', 'localhost'].includes(url.hostname), 'The branded domain is mapped to the local development server.');
        url.hostname = 'ai-ta-krajta.cz';
        url.pathname = '/';
        await preparePage(page, url.toString());
        const clip = (await page.locator(TERRARIUM).boundingBox())!;
        const staticFrame = await page.screenshot({ clip });
        await page.getByRole('button', { name: ACTIVATION_NAME }).click();
        await expect(page.locator(`${TERRARIUM} canvas`)).toBeVisible();
        const difference = await measureDifference(staticFrame, await page.screenshot({ clip }));
        await saveImage(testInfo, 'canonical-root-handoff-difference-12x.png', difference.image);
        expect(difference.changedPixels).toBe(0);
        await page.clock.runFor(800);
        await saveImage(testInfo, 'canonical-root-release.png', await page.screenshot({ clip }));
        await expect(page.locator(`${TERRARIUM} output`)).toContainText('Skóre:');
    });
});

test('resize and another visit retain the logo and running path', async ({ page }) => {
    for (let visit = 0; visit < 2; visit++) {
        await preparePage(page);
        const mark = page.locator(`${TERRARIUM} svg`);
        const originalPaths = await mark.locator('path').evaluateAll((paths) => paths.map((element) => element.getAttribute('d')));
        await page.getByRole('button', { name: ACTIVATION_NAME }).click();
        await expect(page.locator(`${TERRARIUM} canvas`)).toBeVisible();
        await page.setViewportSize({ width: 391, height: 900 });
        await page.locator(TERRARIUM).scrollIntoViewIfNeeded();
        expect(await mark.locator('path').evaluateAll((paths) => paths.map((element) => element.getAttribute('d')))).toEqual(originalPaths);
        await page.clock.runFor(48);
        expect(await mark.locator('path').evaluateAll((paths) => paths.map((element) => element.getAttribute('d')))).not.toEqual(originalPaths);
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.locator(TERRARIUM).scrollIntoViewIfNeeded();
        await page.clock.runFor(32);
        const canvas = page.locator(`${TERRARIUM} canvas`);
        const dimensions = await canvas.evaluate((element: HTMLCanvasElement) => ({
            width: element.width, expectedWidth: Math.round(element.getBoundingClientRect().width * devicePixelRatio),
        }));
        expect(dimensions.width).toBe(dimensions.expectedWidth);
        expect(await mark.locator('path').evaluateAll((paths) => paths.every((element) => !/NaN|Infinity/.test(element.getAttribute('d') ?? '')))).toBe(true);
        await page.clock.resume();
    }
});

test('pointer steering still eats food and grows the original artwork', async ({ page }) => {
    await preparePage(page);
    // Deterministic food in the real game, with real pointer events and scoring.
    await page.evaluate(() => { Math.random = () => 0.8; });
    await page.getByRole('button', { name: ACTIVATION_NAME }).click();
    const canvas = page.locator(`${TERRARIUM} canvas`);
    await expect(canvas).toBeVisible();
    const bounds = (await canvas.boundingBox())!;
    await page.mouse.move(bounds.x + 26 + (bounds.width - 52) * 0.8, bounds.y + 26 + (bounds.height - 52) * 0.8);
    await page.clock.runFor(4000);
    const score = Number((await page.locator(`${TERRARIUM} output`).textContent())!.replace(/\D/g, ''));
    expect(score).toBeGreaterThan(0);
    expect(await page.locator(`${TERRARIUM} svg path`).evaluateAll((paths) => paths.every((element) => !/NaN|Infinity/.test(element.getAttribute('d') ?? '')))).toBe(true);
});

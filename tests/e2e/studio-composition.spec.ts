import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { ALL_FORMATS, BufferSource, EncodedPacketSink, Input } from 'mediabunny';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { createAdminSessionValueOrNull } from '@/lib/admin/adminSession';
import { getStudioCompositionLayers } from '@/lib/recording-studio/studioComposition';
import type { StudioProject } from '@/lib/recording-studio/studioProjectTypes';
import { EDITOR_FIXTURE_ID, storeRecordingEditorFixture } from './recordingStudioEditorFixtures';

test.use({ serviceWorkers: 'allow' });

/** Inspect every decoded output frame, including the intervals between keyframes. */
async function inspectCompositionFrames(page: Page, bytes: Uint8Array) {
    const input = new Input({ formats: ALL_FORMATS, source: new BufferSource(bytes) });
    try {
        const track = await input.getPrimaryVideoTrack();
        const configuration = await track!.getDecoderConfig();
        const packets = [];
        for await (const packet of new EncodedPacketSink(track!).packets()) packets.push({
            data: Buffer.from(packet.data).toString('base64'), type: packet.type,
            timestamp: Math.round(packet.timestamp * 1_000_000), duration: Math.round(packet.duration * 1_000_000),
        });
        return await page.evaluate(async ({ configuration, packets }) => {
            const canvas = document.createElement('canvas'); canvas.width = 160; canvas.height = 90;
            const context = canvas.getContext('2d')!;
            const frames: { seconds: number; brightPixels: number; timecode: number }[] = [];
            let failure: DOMException | undefined;
            const decoder = new VideoDecoder({ error: (error) => { failure = error; }, output: (frame) => {
                try {
                    context.drawImage(frame, 0, 0, 160, 90);
                    const pixels = context.getImageData(0, 0, 160, 90).data;
                    let brightPixels = 0, ticks = 0;
                    for (let index = 0; index < pixels.length; index += 4) if (pixels[index] > 180) brightPixels++;
                    for (let bit = 0; bit < 12; bit++) if (pixels[(20 * 160 + 13 + bit * 12) * 4] > 128) ticks += 1 << bit;
                    frames.push({ seconds: frame.timestamp / 1_000_000, brightPixels, timecode: ticks / 100 });
                } finally { frame.close(); }
            } });
            try {
                decoder.configure(configuration!);
                for (const packet of packets) {
                    decoder.decode(new EncodedVideoChunk({ ...packet, data: Uint8Array.from(atob(packet.data), (character) => character.charCodeAt(0)) }));
                    // Bound decoded frames even when inspecting a longer fixture.
                    if (decoder.decodeQueueSize > 8) await new Promise<void>((resolve) => decoder.addEventListener('dequeue', () => resolve(), { once: true }));
                    if (failure) throw failure;
                }
                await decoder.flush();
                if (failure) throw failure;
                return frames.sort((a, b) => a.seconds - b.seconds);
            } finally { if (decoder.state !== 'closed') decoder.close(); }
        }, { configuration, packets });
    } finally { input.dispose(); }
}

async function projectState(page: Page) {
    return page.evaluate(async () => {
        const database = await new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open('promptbook-recording-studio');
            request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
        });
        const read = <Value,>(store: string, operation: (value: IDBObjectStore) => IDBRequest<Value>) => new Promise<Value>((resolve, reject) => {
            const request = operation(database.transaction(store).objectStore(store));
            request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
        });
        const projects = await read('projects', (store) => store.getAll());
        const chunks = await read('chunks', (store) => store.getAll());
        const hashes = await Promise.all(chunks.map(async (chunk: { data: Blob }) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await chunk.data.arrayBuffer()))).join(',')));
        database.close();
        return { hashes, projects, chunkCount: chunks.length, rawBytes: chunks.reduce((sum: number, chunk: { data: Blob }) => sum + chunk.data.size, 0) };
    });
}

test('one local studio cuts all tracks, saves a smooth camera-to-circle composition and exports real synchronized video/audio', async ({ page, baseURL }, testInfo) => {
    test.skip(!process.env.ADMIN_PASSWORD, 'Needs the isolated test admin password.');
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.context().addCookies([{ name: ADMIN_SESSION_COOKIE_NAME, value: createAdminSessionValueOrNull()!, url: baseURL!, httpOnly: true, sameSite: 'Lax' }]);
    await page.addInitScript(() => { Object.defineProperty(window, 'showSaveFilePicker', { value: undefined, configurable: true }); });
    await page.goto('/admin/studio/editor');
    await expect(page.getByRole('button', { name: 'Nový projekt', exact: true })).toBeEnabled();
    const acceptCookies = page.getByRole('button', { name: /^(Accept all|Přijmout vše)$/ });
    if (await acceptCookies.count()) await acceptCookies.click();
    await storeRecordingEditorFixture(page);
    await page.goto(`/admin/studio/recording/${EDITOR_FIXTURE_ID}`);
    await expect(page.getByRole('button', { name: 'Exportovat kompozici', exact: true })).toBeEnabled();
    const before = await projectState(page);
    const start = page.getByRole('spinbutton', { name: 'Začátek (sekundy)', exact: true });
    const end = page.getByRole('spinbutton', { name: 'Konec (sekundy)', exact: true });
    await start.fill('2'); await end.fill('3');
    await page.getByRole('button', { name: 'Vystřihnout vybraný úsek', exact: true }).click();
    await expect(page.getByLabel('Společný čas', { exact: true })).toContainText('/ 00:00:07.000');
    await page.getByRole('button', { name: 'Vygenerovat smart layout', exact: true }).click();
    await expect(page.getByRole('status').filter({ hasText: /Smart layout připravený/ })).toBeVisible();
    await page.getByRole('button', { name: 'Na začátek', exact: true }).click();
    await page.getByRole('button', { name: 'Kamera', exact: true }).click();
    await page.getByText('Další možnosti střihu a rozložení', { exact: true }).click();
    const seek = page.getByRole('spinbutton', { name: 'Přejít na čas projektu', exact: true });
    await seek.fill('1');
    await page.getByRole('button', { name: 'Obrazovka + kruh', exact: true }).click();
    await page.getByLabel('Přechod celé kompozice', { exact: true }).selectOption('smooth');
    await page.getByLabel('Délka přechodu', { exact: true }).fill('0.7');
    await start.fill('0.5'); await end.fill('4');
    await expect(page.locator('form input:invalid')).toHaveCount(0);
    await expect(page.getByRole('status').filter({ hasText: /^Uloženo$/ })).toBeVisible();
    const saved = await projectState(page);
    expect(saved.chunkCount).toBe(before.chunkCount); expect(saved.rawBytes).toBe(before.rawBytes); expect(saved.hashes).toEqual(before.hashes);
    expect(saved.projects[0].groups).toHaveLength(2);
    expect(saved.projects[0].transition).toEqual({ type: 'smooth', durationSeconds: 0.7 });
    await seek.fill('1.35');
    await expect(page.locator('[data-source-state=ready]')).toHaveCount(3);
    await page.screenshot({ path: testInfo.outputPath('unified-studio.png'), fullPage: true });
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exportovat kompozici', exact: true }).click();
    const download = await downloadPromise;
    await expect(page.getByRole('status').filter({ hasText: /Kompozice je vyexportovaná/ })).toBeVisible();
    const bytes = await readFile((await download.path())!);
    const input = new Input({ formats: ALL_FORMATS, source: new BufferSource(new Uint8Array(bytes)) });
    try {
        const video = await input.getPrimaryVideoTrack(), audio = await input.getPrimaryAudioTrack();
        expect(video).not.toBeNull(); expect(audio).not.toBeNull();
        expect(await video!.getDisplayWidth()).toBe(1920); expect(await video!.getDisplayHeight()).toBe(1080);
        expect(await video!.computeDuration()).toBeCloseTo(3.5, 1);
        expect(await audio!.computeDuration()).toBeCloseTo(3.5, 1);
    } finally { input.dispose(); }
    const frames = await inspectCompositionFrames(page, new Uint8Array(bytes));
    expect(frames).toHaveLength(105);
    expect(frames.filter((frame) => frame.brightPixels < 10), 'No unexpected black frames anywhere in the exported composition').toEqual([]);
    // Read full-size source bands across keyframes/cuts. During a morph the moving, cropped bands
    // cannot be interpreted as a timecode; picture continuity is still checked on every such frame above.
    const readableFrames = frames.filter((frame) => getStudioCompositionLayers(saved.projects[0] as StudioProject, frame.seconds + 0.5).every((layer) =>
        layer.opacity === 1 && (layer.rectangle.width === 1 && layer.rectangle.height === 1 || layer.rectangle.y > 40 / 90)));
    expect(readableFrames.length).toBeGreaterThan(30);
    for (const frame of readableFrames) {
        const projectSeconds = frame.seconds + 0.5;
        const originalSeconds = projectSeconds + (projectSeconds >= 2 ? 1 : 0);
        expect(Math.abs(frame.timecode - originalSeconds), JSON.stringify(frame)).toBeLessThan(0.09);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('unified-studio-mobile.png'), fullPage: true });
    await page.evaluate(() => Object.defineProperty(window, 'showSaveFilePicker', { configurable: true, value: async () => { throw new DOMException('Save cancelled', 'AbortError'); } }));
    await page.getByRole('button', { name: 'Exportovat kompozici', exact: true }).click();
    await expect(page.getByRole('status').filter({ hasText: /Zpracování zrušeno/ })).toBeVisible();
    await page.reload();
    await expect(start).toHaveValue('0.5'); await expect(end).toHaveValue('4');
    await expect(page.getByLabel('Přechod celé kompozice', { exact: true })).toHaveValue('smooth');
    const after = await projectState(page);
    expect(after.projects).toHaveLength(1); expect(after.rawBytes).toBe(before.rawBytes); expect(after.hashes).toEqual(before.hashes);
    expect(errors).toEqual([]);
});

test('exports every frame of a variable-cadence recorder camera across GOP boundaries without black dropouts', async ({ page, baseURL }) => {
    test.skip(!process.env.ADMIN_PASSWORD, 'Needs the isolated test admin password.');
    await page.context().addCookies([{ name: ADMIN_SESSION_COOKIE_NAME, value: createAdminSessionValueOrNull()!, url: baseURL!, httpOnly: true, sameSite: 'Lax' }]);
    await page.addInitScript(() => { Object.defineProperty(window, 'showSaveFilePicker', { value: undefined, configurable: true }); });
    await page.goto('/admin/studio/editor');
    await expect(page.getByRole('button', { name: 'Nový projekt', exact: true })).toBeEnabled();
    const acceptCookies = page.getByRole('button', { name: /^(Accept all|Přijmout vše)$/ });
    if (await acceptCookies.count()) await acceptCookies.click();
    await storeRecordingEditorFixture(page, { isVariableFrameRate: true });
    await page.goto(`/admin/studio/recording/${EDITOR_FIXTURE_ID}`);
    await expect(page.getByRole('button', { name: 'Exportovat kompozici', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'Na začátek', exact: true }).click();
    await page.getByRole('button', { name: 'Kamera', exact: true }).click();
    await page.getByRole('spinbutton', { name: 'Začátek (sekundy)', exact: true }).fill('0.5');
    await page.getByRole('spinbutton', { name: 'Konec (sekundy)', exact: true }).fill('4.5');
    const before = await projectState(page);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exportovat kompozici', exact: true }).click();
    const download = await downloadPromise;
    await expect(page.getByRole('status').filter({ hasText: /Kompozice je vyexportovaná/ })).toBeVisible();
    const bytes = new Uint8Array(await readFile((await download.path())!));
    const frames = await inspectCompositionFrames(page, bytes);
    expect(frames).toHaveLength(120);
    expect(frames.filter((frame) => frame.brightPixels < 10), 'The recorder fixture has visible white text on every original frame').toEqual([]);
    expect((await projectState(page)).hashes).toEqual(before.hashes);
});

import { expect, test, type Page } from '@playwright/test';
import { ADMIN_REDIRECT_PATH_QUERY_PARAMETER, ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { createAdminSessionValueOrNull } from '@/lib/admin/adminSession';
import { EDITOR_FIXTURE_ID, storeRecordingEditorFixture } from './recordingStudioEditorFixtures';
import { join } from 'node:path';
import { performance as NODE_PERFORMANCE } from 'node:perf_hooks';
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { parseStudioByteRange } from '@/public/studio-range-reader.mjs';

test.use({ serviceWorkers: 'allow' });
async function openEditorSection(page: Page, baseURL: string | undefined) {
    test.skip(!process.env.ADMIN_PASSWORD, 'Needs the local admin test password.');
    await page.context().addCookies([
        {
            name: ADMIN_SESSION_COOKIE_NAME,
            value: createAdminSessionValueOrNull()!,
            url: baseURL!,
            httpOnly: true,
            sameSite: 'Lax',
        },
    ]);
    await page.addInitScript(() => {
        Object.assign(window, { studioCaptureRequests: 0 });
        if (navigator.mediaDevices) {
            const rejectCapture = async () => {
                (window as unknown as { studioCaptureRequests: number }).studioCaptureRequests += 1;
                throw new DOMException('No capture allowed in this editor test', 'NotAllowedError');
            };
            navigator.mediaDevices.getUserMedia = rejectCapture;
            navigator.mediaDevices.getDisplayMedia = rejectCapture;
        }
    });
    await page.goto('/admin/studio/editor');
    await expect(page.getByRole('button', { name: 'Nový projekt', exact: true })).toBeEnabled();
}

async function databaseCounts(page: Page) {
    return page.evaluate(async () => {
        const database = await new Promise<IDBDatabase>((resolve) => {
            const request = indexedDB.open('promptbook-recording-studio');
            request.onsuccess = () => resolve(request.result);
        });
        const read = <Value>(request: IDBRequest<Value>) =>
            new Promise<Value>((resolve) => {
                request.onsuccess = () => resolve(request.result);
            });
        const transaction = database.transaction(['chunks', 'projects', 'assets']);
        const [chunks, projects, assets] = await Promise.all([
            read(transaction.objectStore('chunks').getAll()),
            read(transaction.objectStore('projects').getAll()),
            read(transaction.objectStore('assets').getAll()),
        ]);
        database.close();
        return {
            chunkCount: chunks.length,
            byteLength: chunks.reduce((total: number, chunk: { data: Blob }) => total + chunk.data.size, 0),
            projectCount: projects.length,
            assetCount: assets.length,
        };
    });
}

async function readStudioPreviewSignature(page: Page) {
    return page.getByLabel('Náhled uložené kompozice', { exact: true }).evaluate(async (element) => {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        const canvas = element as HTMLCanvasElement;
        const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
        let checksum = 2166136261;
        for (let index = 0; index < pixels.length; index += 1)
            checksum = Math.imul(checksum ^ pixels[index], 16777619) >>> 0;
        return checksum;
    });
}

test('Studio creates an editor-only project and imports a read-only file without capture or browser-media copies', async ({
    page,
    baseURL,
}) => {
    await openEditorSection(page, baseURL);
    await page.getByRole('button', { name: 'Nový projekt', exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/studio\/editor\/[a-f0-9-]+$/);
    await expect(page.getByRole('heading', { name: 'Střižna · workshop', exact: true })).toBeVisible();
    const before = await databaseCounts(page);
    // This ordinary picker is the honest session-local File fallback. No device permission is involved.
    await page
        .locator('input[type=file]')
        .setInputFiles(join(process.cwd(), 'tests/e2e/fixtures/recording-studio/screen.webm'));
    await expect(page.getByRole('article', { name: 'Zdroj screen.webm', exact: true })).toBeVisible();
    await expect(page.locator('[data-source-state=ready]')).toHaveCount(1);
    await expect.poll(async () => (await databaseCounts(page)).assetCount).toBe(1);
    const after = await databaseCounts(page);
    expect(after.chunkCount).toBe(before.chunkCount);
    expect(after.byteLength).toBe(before.byteLength);
    expect(
        await page.evaluate(() => (window as unknown as { studioCaptureRequests: number }).studioCaptureRequests),
    ).toBe(0);
    await expect(page.getByRole('status').filter({ hasText: /^Uloženo$/ })).toBeVisible();
    const projectUrl = page.url();
    await page.reload();
    await expect(page).toHaveURL(projectUrl);
    await expect(page.getByText(/Znovu vyberte původní soubor/)).toBeVisible();
    expect((await databaseCounts(page)).projectCount).toBe(1);
});

test('Studio seeks a real five-hour three-part/four-track assembly with bounded active decoders', async ({
    page,
    baseURL,
}, testInfo) => {
    const directory = process.env.STUDIO_LONG_MEDIA_DIRECTORY;
    test.skip(!directory, 'Separate long-container performance run; provide STUDIO_LONG_MEDIA_DIRECTORY.');
    await openEditorSection(page, baseURL);
    await page.getByRole('button', { name: 'Nový projekt', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Střižna · workshop', exact: true })).toBeVisible();
    const measurements: {
        seconds: number;
        seekMilliseconds: number;
        maximumDeviationSeconds: number;
        renderedEditorDeviationSeconds: number;
        decoderCount: number;
        heapBytes: number | null;
    }[] = [];
    let totalDuration = 0;
    const filenames = ['editor-long.webm', 'camera-long.webm', 'application-long.webm', 'audio-long.webm'];
    for (let part = 0; part < 3; part += 1) {
        for (let index = 0; index < filenames.length; index += 1) {
            const filename = filenames[index];
            const groupPicker = page.getByRole('combobox', { name: 'Přidat zdroj do části', exact: true });
            const trackPicker = page.getByRole('combobox', { name: 'Logická stopa', exact: true });
            if (index === 0) await groupPicker.selectOption('');
            else
                await groupPicker.selectOption(
                    (await groupPicker.locator('option').last().getAttribute('value')) as string,
                );
            if (part === 0) await trackPicker.selectOption('');
            else
                await trackPicker.selectOption(
                    (await trackPicker
                        .locator('option')
                        .nth(index + 1)
                        .getAttribute('value')) as string,
                );
            await page.locator('input[type=file]').setInputFiles(join(directory!, filename));
            await expect.poll(async () => (await databaseCounts(page)).assetCount).toBe(part * 4 + index + 1);
            await expect(page.getByRole('status').filter({ hasText: /^Uloženo$/ })).toBeVisible();
        }
    }
    const parts = page.getByRole('article', { name: /^Část/ });
    await parts.first().getByRole('spinbutton', { name: 'Zdrojové IN (s)', exact: true }).fill('1');
    await parts.first().getByRole('spinbutton', { name: 'Zdrojové OUT (s)', exact: true }).fill('6000');
    await parts.nth(2).getByRole('button', { name: 'Dříve', exact: true }).click();
    await parts.nth(1).getByRole('button', { name: 'Dříve', exact: true }).click();
    await parts.nth(2).getByText('Mapování rolí a ruční posun zdrojů', { exact: true }).click();
    await parts.nth(2).getByRole('spinbutton', { name: 'Posun v části (s)', exact: true }).nth(2).fill('0.25');
    const rolePickers = page
        .getByRole('region', { name: 'Surové stopy', exact: true })
        .getByRole('combobox', { name: 'Role', exact: true });
    for (const [index, role] of Array.from(['editor', 'webcam', 'application', 'audio'].entries()))
        await rolePickers.nth(index).selectOption(role);
    const scenePicker = page.getByRole('combobox', { name: 'Scéna', exact: true });
    for (let index = 0; index < 3; index += 1) {
        await scenePicker.selectOption((await scenePicker.locator('option').nth(index).getAttribute('value'))!);
        await page
            .getByRole('combobox', { name: 'Předvolba', exact: true })
            .selectOption(index === 1 ? 'circle' : 'rectangle');
        const audioPicker = page.getByRole('combobox', { name: 'Jediný zvuk', exact: true });
        await audioPicker.selectOption((await audioPicker.locator('option').last().getAttribute('value'))!);
    }
    await expect(page.getByRole('status').filter({ hasText: /^Uloženo$/ })).toBeVisible();
    const project = await page.evaluate(async () => {
        const database = await new Promise<IDBDatabase>((resolve) => {
            const request = indexedDB.open('promptbook-recording-studio');
            request.onsuccess = () => resolve(request.result);
        });
        const request = database.transaction('projects').objectStore('projects').getAll();
        const projects = await new Promise<any[]>((resolve) => {
            request.onsuccess = () => resolve(request.result);
        });
        database.close();
        return projects[0];
    });
    totalDuration = project.groups.reduce(
        (end: number, group: { projectStartSeconds: number; sourceOutSeconds: number; sourceInSeconds: number }) =>
            Math.max(end, group.projectStartSeconds + group.sourceOutSeconds - group.sourceInSeconds),
        0,
    );
    expect(totalDuration).toBeGreaterThanOrEqual(18_000);
    expect(project.tracks).toHaveLength(4);
    expect(project.groups).toHaveLength(3);
    expect((await databaseCounts(page)).byteLength).toBe(0);
    const joins = project.groups.slice(1).map((group: { projectStartSeconds: number }) => group.projectStartSeconds);
    for (const seconds of [1, ...joins.flatMap((join: number) => [join - 0.5, join + 0.5]), totalDuration - 1]) {
        const start = NODE_PERFORMANCE.now();
        await page.getByRole('spinbutton', { name: 'Přejít na čas projektu', exact: true }).fill(String(seconds));
        await expect(page.locator('[data-source-state=ready]')).toHaveCount(4);
        await expect(page.getByRole('status').filter({ hasText: /^Pozastaveno$/ })).toBeVisible();
        const group = project.groups.find(
            (candidate: { projectStartSeconds: number; sourceInSeconds: number; sourceOutSeconds: number }) =>
                seconds >= candidate.projectStartSeconds &&
                seconds < candidate.projectStartSeconds + candidate.sourceOutSeconds - candidate.sourceInSeconds,
        )!;
        const clips = project.clips.filter((clip: { groupId: string }) => clip.groupId === group.id);
        const expectedSourceTimes = Object.fromEntries(
            clips.map((clip: { trackId: string; sourceInSeconds: number; groupOffsetSeconds: number }) => [
                clip.trackId,
                seconds -
                    group.projectStartSeconds +
                    group.sourceInSeconds -
                    clip.groupOffsetSeconds +
                    clip.sourceInSeconds,
            ]),
        );
        const result = await page.evaluate(async (sourceTimes) => {
            // The composite paints the same settled frames on the next animation turn.
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            const elements = Array.from(document.querySelectorAll<HTMLMediaElement>('[data-source-id]'));
            const editor = elements[0] as HTMLVideoElement;
            const localSeconds = sourceTimes[editor.dataset.sourceId!];
            const canvas = document.createElement('canvas');
            canvas.width = 160;
            canvas.height = 90;
            const drawing = canvas.getContext('2d')!;
            drawing.drawImage(editor, 0, 0, 160, 90);
            let ticks = 0;
            for (let bit = 0; bit < 12; bit += 1)
                if (drawing.getImageData(13 + bit * 12, 20, 1, 1).data[0] > 128) ticks += 1 << bit;
            const frameDifference = Math.abs(ticks / 100 - (localSeconds % 8));
            return {
                decoderCount: elements.length,
                maximumDeviationSeconds: Math.max(
                    ...elements.map((element) =>
                        Math.abs(element.currentTime - sourceTimes[element.dataset.sourceId!]),
                    ),
                ),
                renderedEditorDeviationSeconds: Math.min(frameDifference, 8 - frameDifference),
                heapBytes:
                    (window.performance as Performance & { memory?: { usedJSHeapSize: number } }).memory
                        ?.usedJSHeapSize ?? null,
            };
        }, expectedSourceTimes);
        expect(result.maximumDeviationSeconds).toBeLessThanOrEqual(0.1);
        expect(result.renderedEditorDeviationSeconds).toBeLessThanOrEqual(0.1);
        expect(result.decoderCount).toBe(4);
        expect(
            await page
                .locator('[data-source-id]')
                .evaluateAll((elements) => elements.filter((element) => !(element as HTMLMediaElement).muted).length),
        ).toBe(1);
        measurements.push({ seconds, seekMilliseconds: NODE_PERFORMANCE.now() - start, ...result });
    }
    const report = {
        totalDuration,
        measurements,
        mediaBytesCopied: (await databaseCounts(page)).byteLength,
        limitation:
            'Native long indexed containers with repeated encoded fixture content. This run measures seeks, assembly and memory; it is not a five-hour capture/playback soak or high-bitrate workshop test.',
    };
    await writeFile(join(directory!, 'studio-long-run.json'), JSON.stringify(report, null, 2));
    await testInfo.attach('long-container-performance', {
        body: JSON.stringify(report),
        contentType: 'application/json',
    });
});

test('Studio opens a finalized multitrack recording without copying, renders saved composition, settles joins and reopens the same project', async ({
    page,
    baseURL,
}, testInfo) => {
    await openEditorSection(page, baseURL);
    await storeRecordingEditorFixture(page, { isAppendedSession: true });
    await page.reload();
    const before = await databaseCounts(page);
    await page.getByRole('button', { name: 'Otevřít ve střižně', exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/studio\/editor\/[a-f0-9-]+$/);
    await expect(page.getByRole('heading', { name: 'Střižna · workshop', exact: true })).toBeVisible();
    const projectUrl = page.url();
    const seek = page.getByRole('spinbutton', { name: 'Přejít na čas projektu', exact: true });
    const deviations: { seconds: number; maximumDeviationSeconds: number }[] = [];
    for (const seconds of [1.5, 7.8, 8.1, 9.5, 15.5]) {
        await seek.fill(String(seconds));
        await expect
            .poll(async () => page.locator('[data-source-state=loading], [data-source-state=buffering]').count())
            .toBe(0);
        const result = await page.evaluate(async (projectSeconds) => {
            const database = await new Promise<IDBDatabase>((resolve) => {
                const request = indexedDB.open('promptbook-recording-studio');
                request.onsuccess = () => resolve(request.result);
            });
            const read = <Value>(request: IDBRequest<Value>) =>
                new Promise<Value>((resolve) => {
                    request.onsuccess = () => resolve(request.result);
                });
            const transaction = database.transaction(['projects', 'assets']);
            const projects = await read(transaction.objectStore('projects').getAll());
            const assets = await read(transaction.objectStore('assets').getAll());
            database.close();
            const project = projects[0];
            const group = project.groups.find(
                (entry: { projectStartSeconds: number; sourceOutSeconds: number; sourceInSeconds: number }) =>
                    projectSeconds >= entry.projectStartSeconds &&
                    projectSeconds < entry.projectStartSeconds + entry.sourceOutSeconds - entry.sourceInSeconds,
            );
            const sourceSeconds = projectSeconds - group.projectStartSeconds + group.sourceInSeconds;
            const deviations: number[] = [];
            for (const clip of project.clips.filter((entry: { groupId: string }) => entry.groupId === group.id)) {
                const element = document.querySelector<HTMLMediaElement>(`[data-source-id="${clip.trackId}"]`);
                const asset = assets.find((entry: { id: string }) => entry.id === clip.assetId);
                const isPresent =
                    sourceSeconds >= clip.groupOffsetSeconds &&
                    sourceSeconds < clip.groupOffsetSeconds + clip.sourceOutSeconds - clip.sourceInSeconds;
                if (
                    isPresent &&
                    element &&
                    element.closest('[data-source-state]')?.getAttribute('data-source-state') === 'ready'
                )
                    deviations.push(
                        Math.abs(
                            element.currentTime -
                                asset.bounds.firstTimestampSeconds -
                                clip.sourceInSeconds -
                                sourceSeconds +
                                clip.groupOffsetSeconds,
                        ),
                    );
            }
            return { maximumDeviationSeconds: Math.max(0, ...deviations), readyCount: deviations.length };
        }, seconds);
        expect(result.readyCount).toBeGreaterThan(0);
        expect(result.maximumDeviationSeconds).toBeLessThanOrEqual(0.1);
        deviations.push({ seconds, maximumDeviationSeconds: result.maximumDeviationSeconds });
    }
    await testInfo.attach('post-settle-deviations', {
        body: JSON.stringify(deviations),
        contentType: 'application/json',
    });
    await seek.fill('9.5');
    await page.getByRole('button', { name: 'Nová scéna v tomto čase', exact: true }).click();
    const sceneOffset = page.getByRole('spinbutton', { name: 'Začátek v části (s)', exact: true });
    const sceneBoundary = page.getByRole('slider', { name: /^Hranice scény:/ }).nth(2);
    await expect(sceneOffset).toHaveValue('1.5');
    await sceneBoundary.press('ArrowRight');
    await expect(sceneOffset).toHaveValue('2.5');
    await page.getByRole('button', { name: 'Vrátit střih / kompozici', exact: true }).click();
    await expect(sceneOffset).toHaveValue('1.5');
    await sceneBoundary.scrollIntoViewIfNeeded();
    const boundaryRectangle = (await sceneBoundary.boundingBox())!;
    await page.mouse.move(boundaryRectangle.x + boundaryRectangle.width / 2, boundaryRectangle.y + 10);
    await page.mouse.down();
    await page.mouse.move(boundaryRectangle.x + boundaryRectangle.width / 2 + 35, boundaryRectangle.y + 10, {
        steps: 8,
    });
    await page.mouse.up();
    await expect.poll(async () => Number(await sceneOffset.inputValue())).toBeGreaterThan(1.5);
    await page.getByRole('button', { name: 'Vrátit střih / kompozici', exact: true }).click();
    await expect(sceneOffset).toHaveValue('1.5');
    const secondPart = page.getByRole('article', { name: /^Část/ }).nth(1);
    await secondPart.getByText('Mapování rolí a ruční posun zdrojů', { exact: true }).click();
    await secondPart.getByRole('button', { name: 'Odebrat klip z části', exact: true }).first().click();
    await expect(secondPart.getByRole('button', { name: 'Odebrat klip z části', exact: true })).toHaveCount(2);
    await page.getByRole('button', { name: 'Vrátit střih / kompozici', exact: true }).click();
    await expect(secondPart.getByRole('button', { name: 'Odebrat klip z části', exact: true })).toHaveCount(3);
    await seek.fill('9.5');
    await expect(page.locator('[data-source-state=ready]')).toHaveCount(3);
    await expect(page.getByRole('status').filter({ hasText: /^Pozastaveno$/ })).toBeVisible();
    await page.getByRole('combobox', { name: 'Předvolba', exact: true }).selectOption('rectangle');
    const rectangularPreview = await readStudioPreviewSignature(page);
    await page.getByRole('combobox', { name: 'Předvolba', exact: true }).selectOption('circle');
    await expect.poll(() => readStudioPreviewSignature(page)).not.toBe(rectangularPreview);
    const circularPreview = await readStudioPreviewSignature(page);
    await page.getByRole('combobox', { name: 'Předvolba', exact: true }).selectOption('fullscreen');
    await expect.poll(() => readStudioPreviewSignature(page)).not.toBe(circularPreview);
    await page.getByRole('button', { name: 'Vrátit střih / kompozici', exact: true }).click();
    await expect.poll(() => readStudioPreviewSignature(page)).toBe(circularPreview);
    await expect(page.getByRole('button', { name: 'Vrátit střih / kompozici', exact: true })).toBeEnabled();
    await expect(page.getByRole('status').filter({ hasText: /^Uloženo$/ })).toBeVisible();
    const after = await databaseCounts(page);
    expect(after.chunkCount).toBe(before.chunkCount);
    expect(after.byteLength).toBe(before.byteLength);
    expect(after.projectCount).toBe(1);
    await page.reload();
    await expect(page).toHaveURL(projectUrl);
    // The saved scene starts in the second part; seek there to select it again.
    await page.getByRole('spinbutton', { name: 'Přejít na čas projektu', exact: true }).fill('9.5');
    await expect(page.locator('[data-source-state=ready]')).toHaveCount(3);
    await expect(page.getByRole('combobox', { name: 'Předvolba', exact: true })).toHaveValue('circle');
    await expect.poll(() => readStudioPreviewSignature(page)).toBe(circularPreview);
    await page.screenshot({ path: testInfo.outputPath('studio-composition.png'), fullPage: true });
    await page.getByRole('link', { name: 'Střižna', exact: true }).click();
    await page.getByRole('button', { name: 'Otevřít ve střižně', exact: true }).click();
    await expect(page).toHaveURL(projectUrl);
    expect((await databaseCounts(page)).projectCount).toBe(1);
    expect(
        await page.evaluate(() => (window as unknown as { studioCaptureRequests: number }).studioCaptureRequests),
    ).toBe(0);
});

test('Studio progressively seeks URL media, diagnoses CORS/range/authorization failures and explicitly relinks the same source', async ({
    page,
    baseURL,
}) => {
    const filename = join(process.cwd(), 'tests/e2e/fixtures/recording-studio/screen.webm');
    const byteLength = statSync(filename).size;
    const ranges: { start: number; end: number }[] = [];
    let isOriginalExpired = false;
    const server = createServer((request, response) => {
        const address = new URL(request.url!, 'http://localhost');
        if (address.pathname !== '/no-cors') response.setHeader('Access-Control-Allow-Origin', baseURL!);
        response.setHeader('Access-Control-Expose-Headers', 'Content-Range,Content-Length,Accept-Ranges');
        if (request.method === 'OPTIONS') {
            response.writeHead(204, {
                'Access-Control-Allow-Headers': 'Range',
                'Access-Control-Allow-Methods': 'GET,HEAD',
            });
            response.end();
            return;
        }
        if (
            address.pathname === '/expired' ||
            (address.searchParams.get('signature') === 'original' && isOriginalExpired)
        ) {
            response.writeHead(403);
            response.end();
            return;
        }
        const range = parseStudioByteRange(request.headers.range ?? null, byteLength);
        if (!range) {
            response.writeHead(416);
            response.end();
            return;
        }
        ranges.push(range);
        const isRangeResponse = address.pathname !== '/no-range' && range.isPartial;
        response.writeHead(isRangeResponse ? 206 : 200, {
            'Content-Type': 'video/webm',
            'Accept-Ranges': 'bytes',
            'Content-Length': range.end - range.start,
            ...(isRangeResponse ? { 'Content-Range': `bytes ${range.start}-${range.end - 1}/${byteLength}` } : {}),
        });
        createReadStream(filename, { start: range.start, end: range.end - 1 }).pipe(response);
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const endpoint = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    try {
        await openEditorSection(page, baseURL);
        await page.getByRole('button', { name: 'Nový projekt', exact: true }).click();
        const address = page.getByRole('textbox', { name: 'Přímá HTTPS / CDN adresa', exact: true });
        for (const [path, message] of [
            ['no-cors', /CORS/],
            ['no-range', /byte ranges/],
            ['expired', /vypršely/],
        ] as const) {
            await address.fill(`${endpoint}/${path}`);
            await page.getByRole('button', { name: 'Připojit URL', exact: true }).click();
            await expect(page.getByRole('alert').filter({ hasText: message })).toBeVisible();
            expect((await databaseCounts(page)).assetCount).toBe(0);
        }
        await address.fill(`${endpoint}/media?signature=original`);
        await page.getByRole('button', { name: 'Připojit URL', exact: true }).click();
        await expect(page.locator('[data-source-state=ready]')).toHaveCount(1);
        const before = await databaseCounts(page);
        expect(before.byteLength).toBe(0);
        await page.getByRole('spinbutton', { name: 'Přejít na čas projektu', exact: true }).fill('7.5');
        await expect(page.locator('[data-source-state=ready]')).toHaveCount(1);
        expect(
            await page
                .locator('video[data-source-id]')
                .evaluate((video: HTMLVideoElement) => Math.abs(video.currentTime - 7.5)),
        ).toBeLessThanOrEqual(0.1);
        // Reload only an acknowledged recipe. Native navigation protection intentionally warns about dirty drafts;
        // Playwright's reload can accept that warning before a freshly imported source's debounced save finishes.
        await expect(page.getByRole('status').filter({ hasText: /^Uloženo$/ })).toBeVisible();
        isOriginalExpired = true;
        await page.reload();
        await expect(page.locator('[data-source-state=error]')).toHaveCount(1);
        await address.fill(`${endpoint}/media?signature=renewed`);
        await page.getByRole('button', { name: 'Obnovit URL zdroje z adresního pole', exact: true }).click();
        await expect(page.locator('[data-source-state=ready]')).toHaveCount(1);
        const after = await databaseCounts(page);
        expect(after).toEqual(before);
        expect(ranges.some((range) => range.end - range.start === 1)).toBe(true);
    } finally {
        server.closeAllConnections();
        await new Promise<void>((resolve) => server.close(() => resolve()));
    }
});

test('Studio authenticates project links and preserves legacy recording identities through permanent redirects', async ({
    page,
    baseURL,
}) => {
    const projectPath = '/admin/studio/editor/11111111-1111-4111-8111-111111111111';
    await page.goto(projectPath);
    await expect(page).toHaveURL(/\/admin\/login\?/);
    expect(new URL(page.url()).searchParams.get(ADMIN_REDIRECT_PATH_QUERY_PARAMETER)).toBe(projectPath);
    await openEditorSection(page, baseURL);
    await storeRecordingEditorFixture(page);
    const legacyRecordingPath = `/admin/recording-studio/${EDITOR_FIXTURE_ID}`;
    const response = await page.request.get(legacyRecordingPath, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(`/admin/studio/recording/${EDITOR_FIXTURE_ID}`);
    await page.goto(legacyRecordingPath);
    await expect(page).toHaveURL(`/admin/studio/recording/${EDITOR_FIXTURE_ID}`);
    await expect(page.getByRole('region', { name: 'Pracovní prostor záznamu', exact: true })).toBeVisible();
    await page.goto('/admin/recording-studio');
    await expect(page).toHaveURL('/admin/studio/recording');
});

test('Studio seeks a long unindexed recorder container directly from its existing IndexedDB media', async ({
    page,
    baseURL,
}, testInfo) => {
    const filename = process.env.STUDIO_UNINDEXED_MEDIA_FILE;
    test.skip(
        !filename,
        'Provide the separate 6001-second live WebM fixture; this is a seek test, not a capture soak.',
    );
    await openEditorSection(page, baseURL);
    const bytes = await readFile(filename!);
    await page.evaluate(
        async ({ encoded, byteLength }) => {
            const database = await new Promise<IDBDatabase>((resolve) => {
                const request = indexedDB.open('promptbook-recording-studio');
                request.onsuccess = () => resolve(request.result);
            });
            const data = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
            await new Promise<void>((resolve, reject) => {
                const transaction = database.transaction(['recordings', 'chunks'], 'readwrite');
                transaction.objectStore('recordings').put({
                    id: 'unindexed-long',
                    title: 'Long live WebM',
                    createdAt: '2026-10-05T18:00:00.000Z',
                    status: 'complete',
                    durationSeconds: 6001,
                    trim: null,
                    errorMessage: null,
                    tracks: [
                        {
                            id: 'editor',
                            label: 'Editor',
                            kind: 'screen',
                            mimeType: 'video/webm',
                            byteLength,
                            chunkCount: 1,
                            startOffsetSeconds: 0,
                            durationSeconds: 6001,
                            width: 160,
                            height: 90,
                            frameRate: 25,
                            isAudioIncluded: false,
                            parts: [
                                {
                                    id: 'editor',
                                    takeId: 'unindexed-long',
                                    sessionStartSeconds: 0,
                                    durationSeconds: 6001,
                                    byteLength,
                                    chunkCount: 1,
                                    mimeType: 'video/webm',
                                    indexStatus: 'unindexed',
                                    mediaBounds: {
                                        firstTimestampSeconds: 0,
                                        availableStartTimestampSeconds: 0,
                                        endTimestampSeconds: 6001,
                                        components: [
                                            { kind: 'video', firstTimestampSeconds: 0, endTimestampSeconds: 6001 },
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
                });
                transaction
                    .objectStore('chunks')
                    .put({
                        recordingId: 'unindexed-long',
                        trackId: 'editor',
                        sequence: 0,
                        byteStart: 0,
                        data: new Blob([data], { type: 'video/webm' }),
                    });
                transaction.oncomplete = () => resolve();
                transaction.onabort = () => reject(transaction.error);
            });
            database.close();
        },
        { encoded: bytes.toString('base64'), byteLength: bytes.length },
    );
    await page.reload();
    const before = await databaseCounts(page);
    await page.getByRole('button', { name: 'Otevřít ve střižně', exact: true }).click();
    const measurements: {
        seconds: number;
        deviationSeconds: number;
        frameDeviationSeconds: number;
        milliseconds: number;
    }[] = [];
    for (const seconds of [1, 3000, 5999]) {
        const start = NODE_PERFORMANCE.now();
        await page.getByRole('spinbutton', { name: 'Přejít na čas projektu', exact: true }).fill(String(seconds));
        await expect(page.locator('[data-source-state=ready]')).toHaveCount(1);
        await expect(page.getByRole('status').filter({ hasText: /^Pozastaveno$/ })).toBeVisible();
        const result = await page.locator('video[data-source-id]').evaluate((element, seconds) => {
            const video = element as HTMLVideoElement;
            const canvas = document.createElement('canvas');
            canvas.width = 160;
            canvas.height = 90;
            const drawing = canvas.getContext('2d')!;
            drawing.drawImage(video, 0, 0, 160, 90);
            let ticks = 0;
            for (let bit = 0; bit < 12; bit += 1)
                if (drawing.getImageData(13 + bit * 12, 20, 1, 1).data[0] > 128) ticks += 1 << bit;
            return {
                deviationSeconds: Math.abs(video.currentTime - seconds),
                frameDeviationSeconds: Math.abs(ticks / 100 - (seconds % 8)),
            };
        }, seconds);
        expect(result.deviationSeconds).toBeLessThanOrEqual(0.1);
        expect(result.frameDeviationSeconds).toBeLessThanOrEqual(0.1);
        measurements.push({ seconds, milliseconds: NODE_PERFORMANCE.now() - start, ...result });
    }
    const after = await databaseCounts(page);
    expect(after.chunkCount).toBe(before.chunkCount);
    expect(after.byteLength).toBe(before.byteLength);
    await testInfo.attach('unindexed-recorder-seeks', {
        body: JSON.stringify(measurements),
        contentType: 'application/json',
    });
});

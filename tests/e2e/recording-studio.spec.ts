import { expect, test, type Page } from '@playwright/test';
import { ZipReader, Uint8ArrayReader, Uint8ArrayWriter } from '@zip.js/zip.js';
import { ALL_FORMATS, BufferSource, Input } from 'mediabunny';
import { readFile } from 'node:fs/promises';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { createAdminSessionValueOrNull } from '@/lib/admin/adminSession';
import type { RecordingArchiveManifest } from '@/lib/recording-studio/recordingStudioTypes';

test.use({ serviceWorkers: 'block' });

async function openStudio(page: Page, baseURL: string | undefined) {
    test.skip(!process.env.ADMIN_PASSWORD, 'Needs the local test server admin password.');
    await page.context().addCookies([{ name: ADMIN_SESSION_COOKIE_NAME, value: createAdminSessionValueOrNull()!, url: baseURL!, httpOnly: true, sameSite: 'Lax' }]);
    await page.addInitScript(() => {
        // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
        const streams: MediaStream[] = [];
        Object.assign(window, { studioTestStreams: streams });
        const createStream = async (isVideo: boolean, isAudio: boolean) => {
            const stream = new MediaStream();
            if (isVideo) {
                const canvas = document.createElement('canvas');
                canvas.width = 320; canvas.height = 180;
                const context = canvas.getContext('2d')!;
                const draw = () => {
                    context.fillStyle = streams.length % 2 ? '#08b' : '#b60';
                    context.fillRect(0, 0, 320, 180);
                    context.fillStyle = '#fff'; context.font = '24px sans-serif';
                    context.fillText(String(performance.now()), 20, 90);
                };
                draw();
                const interval = setInterval(draw, 33);
                const videoTrack = canvas.captureStream(30).getVideoTracks()[0];
                videoTrack.addEventListener('ended', () => clearInterval(interval));
                stream.addTrack(videoTrack);
            }
            if (isAudio) {
                // Render real audio without a physical output device, whose clock may stall on a headless host.
                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                const oscillator = context.createOscillator();
                const destination = context.createMediaStreamDestination();
                oscillator.connect(destination); oscillator.start();
                stream.addTrack(destination.stream.getAudioTracks()[0]);
                await context.resume();
            }
            streams.push(stream);
            return stream;
        };
        Object.defineProperties(navigator.mediaDevices, {
            getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },
            getDisplayMedia: { value: () => createStream(true, true) },
            enumerateDevices: { value: () => Promise.resolve([]) },
        });
        Object.defineProperty(window, 'showSaveFilePicker', { value: undefined, configurable: true });
    });
    await page.goto('/admin/recording-studio');
    await expect(page.getByRole('button', { name: 'Přidat zdroj', exact: true })).toBeEnabled();
}

async function addSource(page: Page, kind: 'camera' | 'screen' | 'microphone') {
    await page.getByRole('button', { name: 'Přidat zdroj', exact: true }).click();
    await page.getByLabel('Typ zdroje').selectOption(kind);
    await page.getByRole('button', { name: 'Připojit zdroj', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
}

async function readArchive(pathname: string) {
    const reader = new ZipReader(new Uint8ArrayReader(await readFile(pathname)));
    const entries = await reader.getEntries();
    const files = new Map<string, Uint8Array>();
    for (const entry of entries) {
        if (!entry.directory) files.set(entry.filename, await entry.getData(new Uint8ArrayWriter()));
    }
    await reader.close();
    return files;
}

test('requires admin authentication for the recording studio', async ({ page }) => {
    await page.goto('/admin/recording-studio');
    await expect(page).toHaveURL(/\/admin\/login\?redirectPath=%2Fadmin%2Frecording-studio/);
});

test('records separate sources, restores them, trims every track and exports playable editor material', async ({ page, baseURL }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await openStudio(page, baseURL);
    await addSource(page, 'camera');
    await addSource(page, 'camera');
    await addSource(page, 'screen');
    await addSource(page, 'screen');
    await addSource(page, 'microphone');
    await page.getByRole('button', { name: 'Nahrávat všechny zdroje', exact: true }).click();
    await expect(page.getByLabel('Délka záznamu', { exact: true })).toHaveText('00:00:04');
    await page.getByRole('button', { name: 'Zastavit všechny stopy', exact: true }).click();
    await expect(page.getByText('Uloženo', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Odebrat zdroj' })).toHaveCount(0);

    const originalDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Originály ZIP', exact: true }).click();
    const originals = await readArchive((await (await originalDownload).path())!);
    expect(Array.from(originals.keys()).filter((name) => name.startsWith('originals/'))).toHaveLength(5);
    // Exercise the streaming disk path with a real writable file, without automating an OS save dialog.
    await page.evaluate(() => Object.defineProperty(window, 'showSaveFilePicker', {
        configurable: true, value: async () => (await navigator.storage.getDirectory()).getFileHandle('test-studio-export.zip', { create: true }),
    }));
    await page.getByRole('button', { name: 'Originály ZIP', exact: true }).click();
    await expect(page.getByText('ZIP je připravený.', { exact: true })).toBeVisible();
    const diskBytes = await page.evaluate(async () => Array.from(new Uint8Array(await (await (await (await navigator.storage.getDirectory()).getFileHandle('test-studio-export.zip')).getFile()).arrayBuffer())));
    const diskReader = new ZipReader(new Uint8ArrayReader(new Uint8Array(diskBytes)));
    expect((await diskReader.getEntries()).map((entry) => entry.filename)).toEqual(Array.from(originals.keys()));
    await diskReader.close();
    await page.evaluate(() => Object.defineProperty(window, 'showSaveFilePicker', { value: undefined, configurable: true }));
    await page.getByRole('button', { name: 'Náhled a ořez', exact: true }).click();
    await page.getByLabel('Název záznamu', { exact: true }).fill('Synchronized editing take');
    await page.getByLabel('Začátek (sekundy)', { exact: true }).fill('0.5');
    await page.getByLabel('Konec (sekundy)', { exact: true }).fill('2.5');
    await expect(page.getByRole('dialog').getByText('Změny se ukládají automaticky.', { exact: true })).toBeVisible();
    const preview = page.getByRole('dialog').locator('video').first();
    await preview.evaluate(async (video: HTMLVideoElement) => { video.muted = true; await video.play(); });
    await expect.poll(() => preview.evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(0.65);
    await expect.poll(() => preview.evaluate((video: HTMLVideoElement) => video.paused)).toBe(true);
    expect(await preview.evaluate((video: HTMLVideoElement) => video.currentTime)).toBeLessThan(2.8);
    await page.screenshot({ path: testInfo.outputPath('recording-studio-editor.png') });
    await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Synchronized editing take', exact: true })).toBeVisible();
    const trimmedDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'ZIP s ořezem', exact: true }).click();
    const files = await readArchive((await (await trimmedDownload).path())!);
    const manifest = JSON.parse(new TextDecoder().decode(files.get('recording.json'))) as RecordingArchiveManifest;
    expect(manifest.trim).toEqual({ startSeconds: 0.5, endSeconds: 2.5 });
    expect(manifest.tracks).toHaveLength(5);
    for (let index = 0; index < manifest.tracks.length; index += 1) {
        const track = manifest.tracks[index];
        if (!track.originalFile || !track.trimmedFile) throw new Error('Expected original and trimmed files for every source.');
        expect(files.get(track.originalFile)).toEqual(originals.get(track.originalFile));
        const input = new Input({ formats: ALL_FORMATS, source: new BufferSource(files.get(track.trimmedFile)!) });
        try {
            expect(await input.canRead()).toBe(true);
            expect(await input.computeDuration()).toBeGreaterThan(1.8);
            expect(await input.computeDuration()).toBeLessThan(2.2);
            const videoTracks = await input.getVideoTracks();
            expect(videoTracks.length).toBe(index === 4 ? 0 : 1);
            if (videoTracks.length > 0) {
                expect(videoTracks[0].displayWidth).toBe(320);
                expect(videoTracks[0].displayHeight).toBe(180);
            }
            expect((await input.getAudioTracks()).length).toBe(index < 2 ? 0 : 1);
        } finally { input.dispose(); }
    }
    await page.screenshot({ path: testInfo.outputPath('recording-studio-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole('button', { name: 'ZIP s ořezem', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('recording-studio-mobile.png'), fullPage: true });
    await page.getByRole('button', { name: 'Smazat', exact: true }).click();
    await page.getByRole('button', { name: 'Smazat záznam a všechny stopy', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Synchronized editing take' })).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('button', { name: 'Originály ZIP', exact: true })).toHaveCount(0);
    expect(errors).toEqual([]);
});

test('stops the whole take on disconnect and prevents a second tab from changing it', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    await addSource(page, 'camera');
    await addSource(page, 'screen');
    await page.getByRole('button', { name: 'Nahrávat všechny zdroje', exact: true }).click();
    await expect(page.getByLabel('Délka záznamu', { exact: true })).toHaveText('00:00:02');
    const secondPage = await page.context().newPage();
    await secondPage.goto('/admin/recording-studio');
    await expect(secondPage.getByRole('alert').filter({ hasText: 'Studio už' })).toContainText('jiné kartě');
    await secondPage.close();
    await page.evaluate(() => {
        const streams = (window as unknown as { studioTestStreams: MediaStream[] }).studioTestStreams;
        const track = streams[1].getVideoTracks()[0];
        track.stop(); track.dispatchEvent(new Event('ended'));
    });
    await expect(page.getByText('Přerušený záznam', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Originály ZIP', exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Zastavit všechny stopy', exact: true })).toHaveCount(0);
});

test('recovers persisted chunks after an interrupted page and waits for stop before admin navigation', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    await addSource(page, 'camera');
    await addSource(page, 'screen');
    await page.getByRole('button', { name: 'Nahrávat všechny zdroje', exact: true }).click();
    await expect(page.getByLabel('Délka záznamu', { exact: true })).toHaveText('00:00:03');
    const dialogPromise = page.waitForEvent('dialog');
    const reload = page.evaluate(() => window.location.reload());
    const dialog = await dialogPromise;
    expect(dialog.type()).toBe('beforeunload');
    await dialog.accept();
    await reload.catch(() => undefined);
    await expect(page.getByText('Přerušený záznam', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Originály ZIP', exact: true })).toBeEnabled();
    await addSource(page, 'camera');
    await page.getByRole('button', { name: 'Nahrávat všechny zdroje', exact: true }).click();
    await expect(page.getByLabel('Délka záznamu', { exact: true })).toHaveText('00:00:02');
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/recording-studio$/);
    await page.getByRole('button', { name: 'Zastavit všechny stopy', exact: true }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.getByRole('link', { name: 'Nahrávací studio', exact: true }).click();
    await expect(page.getByText('Uloženo', { exact: true })).toBeVisible();
    await expect(page.getByText('Přerušený záznam', { exact: true })).toBeVisible();
});

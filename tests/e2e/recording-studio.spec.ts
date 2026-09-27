import { expect, test, type Page } from '@playwright/test';
import { ZipReader, Uint8ArrayReader, Uint8ArrayWriter } from '@zip.js/zip.js';
import { ALL_FORMATS, BufferSource, Input } from 'mediabunny';
import { readFile } from 'node:fs/promises';
import { platform, release } from 'node:os';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { createAdminSessionValueOrNull } from '@/lib/admin/adminSession';
import type { RecordingArchiveManifest } from '@/lib/recording-studio/recordingStudioTypes';

test.use({ serviceWorkers: 'block' });

test.beforeEach(async ({ browser }, testInfo) => {
    await testInfo.attach('platform-and-browser', { body: JSON.stringify({ platform: platform(), release: release(), browser: browser.browserType().name(), version: browser.version() }), contentType: 'application/json' });
});

async function openStudio(page: Page, baseURL: string | undefined) {
    test.skip(!process.env.ADMIN_PASSWORD, 'Needs the local test server admin password.');
    await page.context().addCookies([{ name: ADMIN_SESSION_COOKIE_NAME, value: createAdminSessionValueOrNull()!, url: baseURL!, httpOnly: true, sameSite: 'Lax' }]);
    await page.addInitScript(() => {
        // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
        const streams: MediaStream[] = [];
        const mediaRequests: MediaStreamConstraints[] = [];
        const testSettings = { cameraAudioErrorName: null as string | null };
        const markerPeriodMilliseconds = 700;
        const markerDurationSeconds = 0.24;
        const markerTimeOrigin = performance.now();
        Object.assign(window, { studioTestStreams: streams, studioTestMediaRequests: mediaRequests, studioTestSettings: testSettings });
        const createStream = async (isVideo: boolean, isAudio: boolean) => {
            const stream = new MediaStream();
            if (isVideo) {
                const canvas = document.createElement('canvas');
                canvas.width = 320; canvas.height = 180;
                const context = canvas.getContext('2d')!;
                const draw = () => {
                    const isMarkerVisible = (performance.now() - markerTimeOrigin) % markerPeriodMilliseconds < markerDurationSeconds * 1000;
                    context.fillStyle = isMarkerVisible ? '#fff' : '#102030';
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
                // Render real audio into a captured stream without connecting the fixture oscillator to speakers.
                const context = new AudioContext();
                const oscillator = context.createOscillator();
                const gain = context.createGain();
                const destination = context.createMediaStreamDestination();
                gain.gain.value = 0;
                oscillator.frequency.value = 880;
                oscillator.connect(gain); gain.connect(destination); oscillator.start();
                stream.addTrack(destination.stream.getAudioTracks()[0]);
                await context.resume();
                const elapsedSeconds = (performance.now() - markerTimeOrigin) / 1000;
                const audioTimeAtOrigin = context.currentTime - elapsedSeconds;
                const nextMarkerIndex = Math.max(0, Math.ceil(elapsedSeconds / (markerPeriodMilliseconds / 1000)));
                for (let markerIndex = nextMarkerIndex; markerIndex < 100; markerIndex += 1) {
                    const markerTime = audioTimeAtOrigin + markerIndex * markerPeriodMilliseconds / 1000;
                    if (markerTime < context.currentTime) continue;
                    gain.gain.setValueAtTime(0.2, markerTime);
                    gain.gain.setValueAtTime(0, markerTime + markerDurationSeconds);
                }
            }
            streams.push(stream);
            return stream;
        };
        Object.defineProperties(navigator.mediaDevices, {
            getUserMedia: { value: (constraints: MediaStreamConstraints) => {
                mediaRequests.push(constraints);
                if (testSettings.cameraAudioErrorName && Boolean(constraints.video) && Boolean(constraints.audio)) {
                    return Promise.reject(new DOMException('Synthetic camera/microphone acquisition failure', testSettings.cameraAudioErrorName));
                }
                return createStream(Boolean(constraints.video), Boolean(constraints.audio));
            } },
            getDisplayMedia: { value: () => createStream(true, true) },
            enumerateDevices: { value: () => Promise.resolve([]) },
        });
        Object.defineProperty(window, 'showSaveFilePicker', { value: undefined, configurable: true });
    });
    await page.goto('/admin/recording-studio');
    await expect(page.getByRole('button', { name: 'Přidat zdroj', exact: true })).toBeEnabled();
    expect(await page.evaluate(() => (window as unknown as { studioTestMediaRequests: MediaStreamConstraints[] }).studioTestMediaRequests)).toEqual([]);
    // Complete the unrelated cookie choice so a moving bottom panel cannot intercept studio controls.
    const cookiePanel = page.getByRole('region', { name: 'Cookies', exact: true });
    await cookiePanel.getByRole('button').first().click();
    await page.getByRole('dialog').getByRole('button', { name: /Uložit nastavení|Save settings/ }).click();
    await expect(cookiePanel).toHaveCount(0);
}

async function addSource(page: Page, kind: 'camera' | 'screen' | 'microphone', isAudioEnabled = true) {
    await page.getByRole('button', { name: 'Přidat zdroj', exact: true }).click();
    await page.getByLabel('Typ zdroje').selectOption(kind);
    if (kind === 'camera' && !isAudioEnabled) await page.getByLabel('Nahrávat zvuk', { exact: true }).uncheck();
    await page.getByRole('button', { name: 'Připojit zdroj', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
}

async function connectPendingSources(page: Page) {
    const connectButtons = page.getByRole('button', { name: 'Připojit', exact: true });
    while (await connectButtons.count() > 0) {
        const sourceCountBeforeConnect = await connectButtons.count();
        await connectButtons.first().click();
        await expect(connectButtons).toHaveCount(sourceCountBeforeConnect - 1);
    }
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

async function inspectAudioVideoMarkers(page: Page, bytes: Uint8Array, mimeType: string) {
    await page.evaluate(({ data, mediaType }) => {
        const video = document.createElement('video');
        video.controls = false;
        video.playsInline = true;
        video.muted = false;
        const encodedBytes = Uint8Array.from(atob(data), (character) => character.charCodeAt(0));
        video.src = URL.createObjectURL(new Blob([encodedBytes], { type: mediaType }));
        video.style.width = '320px'; video.style.height = '180px';
        const canvas = document.createElement('canvas');
        canvas.width = 1; canvas.height = 1;
        const canvasContext = canvas.getContext('2d')!;
        const audioContext = new AudioContext();
        const audioSource = audioContext.createMediaElementSource(video);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        const silentOutput = audioContext.createGain();
        silentOutput.gain.value = 0;
        audioSource.connect(analyser); analyser.connect(silentOutput); silentOutput.connect(audioContext.destination);
        const samples: { timestamp: number; isVideoMarkerVisible: boolean; audioRms: number }[] = [];
        const sampleBuffer = new Uint8Array(analyser.fftSize);
        const controls = document.createElement('button');
        controls.type = 'button'; controls.textContent = 'Spustit A/V kontrolu markerů';
        let isComplete = false;
        let errorMessage: string | null = null;
        controls.addEventListener('click', () => {
            void audioContext.resume().then(() => video.play()).catch((error: unknown) => {
                errorMessage = error instanceof Error ? error.message : 'Playback failed'; isComplete = true;
            });
            const sampleFrame = () => {
                if (!video.paused && !video.ended && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
                    canvasContext.drawImage(video, 0, 0, 1, 1);
                    const isVideoMarkerVisible = canvasContext.getImageData(0, 0, 1, 1).data[0] > 220;
                    analyser.getByteTimeDomainData(sampleBuffer);
                    const meanSquare = sampleBuffer.reduce((total, sample) => {
                        const normalizedSample = (sample - 128) / 128;
                        return total + normalizedSample * normalizedSample;
                    }, 0) / sampleBuffer.length;
                    samples.push({ timestamp: video.currentTime, isVideoMarkerVisible, audioRms: Math.sqrt(meanSquare) });
                }
                if (video.ended || errorMessage) { isComplete = true; return; }
                requestAnimationFrame(sampleFrame);
            };
            requestAnimationFrame(sampleFrame);
        });
        Object.assign(window, { studioAvMarkerCheck: { video, audioContext, samples, get isComplete() { return isComplete; }, get errorMessage() { return errorMessage; } } });
        document.body.append(video, controls);
    }, { data: Buffer.from(bytes).toString('base64'), mediaType: mimeType });
    await page.getByRole('button', { name: 'Spustit A/V kontrolu markerů', exact: true }).click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { studioAvMarkerCheck: { isComplete: boolean } }).studioAvMarkerCheck.isComplete)).toBe(true);
    const result = await page.evaluate(() => {
        const check = (window as unknown as { studioAvMarkerCheck: { video: HTMLVideoElement; samples: { timestamp: number; isVideoMarkerVisible: boolean; audioRms: number }[]; errorMessage: string | null } }).studioAvMarkerCheck;
        return { duration: check.video.duration, errorMessage: check.errorMessage, samples: check.samples };
    });
    if (result.errorMessage) throw new Error(`A/V marker playback failed: ${result.errorMessage}`);
    const getPulseStarts = (isActive: (sample: typeof result.samples[number]) => boolean, startSeconds: number, endSeconds: number) => {
        const windowSamples = result.samples.filter((sample) => sample.timestamp >= startSeconds && sample.timestamp <= endSeconds);
        return windowSamples.filter((sample, index) => isActive(sample) && (index === 0 || !isActive(windowSamples[index - 1]))).map((sample) => sample.timestamp);
    };
    const compareWindows = [
        [0.25, Math.min(1.25, result.duration / 2)],
        [Math.max(result.duration - 1.25, result.duration / 2), result.duration - 0.25],
    ];
    return compareWindows.map(([startSeconds, endSeconds]) => {
        const videoStarts = getPulseStarts((sample) => sample.isVideoMarkerVisible, startSeconds, endSeconds);
        const audioStarts = getPulseStarts((sample) => sample.audioRms > 0.025, startSeconds, endSeconds);
        const gaps = videoStarts.flatMap((videoStart) => audioStarts.map((audioStart) => Math.abs(videoStart - audioStart)));
        return {
            nearestGap: gaps.length ? Math.min(...gaps) : null,
            videoStarts,
            audioStarts,
            sampleCount: result.samples.filter((sample) => sample.timestamp >= startSeconds && sample.timestamp <= endSeconds).length,
        };
    });
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
    await expect(page.getByText('Zvuková stopa: přítomna', { exact: true })).toHaveCount(3);
    await expect(page.getByRole('meter', { name: 'Úroveň živého zvuku', exact: true })).toHaveCount(5);
    await expect.poll(async () => page.getByRole('meter', { name: 'Úroveň živého zvuku', exact: true }).evaluateAll((meters) =>
        meters.some((meter) => Number(meter.getAttribute('aria-valuenow')) > 0),
    )).toBe(true);
    const mediaRequests = await page.evaluate(() => (window as unknown as { studioTestMediaRequests: MediaStreamConstraints[] }).studioTestMediaRequests);
    expect(mediaRequests.filter((request) => Boolean(request.audio))).toHaveLength(1);
    expect(mediaRequests[0].audio).toEqual({});
    expect(mediaRequests[1].audio).toBe(false);
    await page.getByRole('button', { name: 'Nahrávat všechny zdroje', exact: true }).click();
    await expect(page.getByLabel('Délka záznamu', { exact: true })).toHaveText('00:00:04');
    await page.getByRole('button', { name: 'Zastavit všechny stopy', exact: true }).click();
    await expect(page.getByText('Uloženo', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Odebrat zdroj' })).toHaveCount(5);

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
    await expect(page.getByRole('dialog').getByText('Čeká na uložení…', { exact: true })).toBeVisible();
    const preview = page.getByRole('dialog').locator('video').first();
    await preview.evaluate(async (video: HTMLVideoElement) => { video.muted = true; await video.play(); });
    await expect.poll(() => preview.evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(0.65);
    await expect.poll(() => preview.evaluate((video: HTMLVideoElement) => video.paused)).toBe(true);
    expect(await preview.evaluate((video: HTMLVideoElement) => video.currentTime)).toBeLessThan(2.8);
    await page.screenshot({ path: testInfo.outputPath('recording-studio-editor.png') });
    await page.getByRole('dialog').getByRole('button', { name: 'Zavřít', exact: true }).click();
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Synchronized editing take', exact: true })).toBeVisible();
    const trimmedDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'ZIP s ořezem', exact: true }).click();
    const files = await readArchive((await (await trimmedDownload).path())!);
    const manifest = JSON.parse(new TextDecoder().decode(files.get('recording.json'))) as RecordingArchiveManifest;
    expect(manifest.schemaVersion).toBe(2);
    expect(manifest.trim).toEqual({ startSeconds: 0.5, endSeconds: 2.5 });
    expect(manifest.tracks).toHaveLength(5);
    expect(manifest.sourceConfiguration?.[0]).toMatchObject({ kind: 'camera', isAudioEnabled: true });
    expect(manifest.tracks.slice(0, 2).every((track) => track.kind === 'camera' && track.isAudioIncluded)).toBe(true);
    const firstCameraTrack = manifest.tracks[0];
    if (!firstCameraTrack.originalFile) throw new Error('Expected a camera original file.');
    const alignmentGaps = await inspectAudioVideoMarkers(page, originals.get(firstCameraTrack.originalFile)!, firstCameraTrack.mimeType);
    expect(alignmentGaps).toHaveLength(2);
    expect(alignmentGaps.every((window) => window.nearestGap !== null && window.nearestGap <= 0.15), JSON.stringify(alignmentGaps)).toBe(true);
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
            expect((await input.getAudioTracks()).length).toBe(1);
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
    await expect(page.getByRole('button', { name: 'Připojit', exact: true })).toHaveCount(5);
    expect(await page.evaluate(() => (window as unknown as { studioTestMediaRequests: MediaStreamConstraints[] }).studioTestMediaRequests)).toEqual([]);
    await page.getByRole('button', { name: 'Nastavení', exact: true }).first().click();
    await expect(page.getByLabel('Nahrávat zvuk')).toBeChecked();
    await page.getByRole('dialog').getByRole('button', { name: 'Zavřít', exact: true }).click();
    expect(errors).toEqual([]);
});

test('retains a failed camera-plus-microphone request and lets the owner explicitly retry without sound', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    await page.evaluate(() => {
        (window as unknown as { studioTestSettings: { cameraAudioErrorName: string | null } }).studioTestSettings.cameraAudioErrorName = 'NotAllowedError';
    });
    await page.getByRole('button', { name: 'Přidat zdroj', exact: true }).click();
    await expect(page.getByLabel('Nahrávat zvuk')).toBeChecked();
    await page.getByRole('button', { name: 'Připojit zdroj', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('zamítl přístup ke kameře či mikrofonu');
    await page.evaluate(() => {
        (window as unknown as { studioTestSettings: { cameraAudioErrorName: string | null } }).studioTestSettings.cameraAudioErrorName = 'NotReadableError';
    });
    await page.getByRole('button', { name: 'Zkusit znovu', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('jiná aplikace');
    await page.evaluate(() => {
        (window as unknown as { studioTestSettings: { cameraAudioErrorName: string | null } }).studioTestSettings.cameraAudioErrorName = 'NotFoundError';
    });
    await page.getByRole('button', { name: 'Zkusit znovu', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Kamera nebo mikrofon nejsou dostupné');
    await page.evaluate(() => {
        (window as unknown as { studioTestSettings: { cameraAudioErrorName: string | null } }).studioTestSettings.cameraAudioErrorName = null;
    });
    await page.getByLabel('Nahrávat zvuk').uncheck();
    await page.getByRole('button', { name: 'Zkusit znovu', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByText('Záměrně tiché video; mikrofon se nevyžaduje.', { exact: true })).toBeVisible();
    const mediaRequests = await page.evaluate(() => (window as unknown as { studioTestMediaRequests: MediaStreamConstraints[] }).studioTestMediaRequests);
    expect(mediaRequests[0].audio).toEqual({});
    expect(mediaRequests.at(-1)?.audio).toBe(false);
    await page.reload();
    await page.getByRole('button', { name: 'Nastavení', exact: true }).first().click();
    await expect(page.getByLabel('Nahrávat zvuk')).not.toBeChecked();
    await page.getByLabel('Typ zdroje').selectOption('screen');
    await page.getByLabel('Typ zdroje').selectOption('camera');
    await expect(page.getByLabel('Nahrávat zvuk')).not.toBeChecked();
    await page.getByRole('dialog').getByRole('button', { name: 'Zavřít', exact: true }).click();
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
    await connectPendingSources(page);
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

test('explains constant 10 GiB estimates while committed multi-source bytes and bitrate update', async ({ page, baseURL }) => {
    await page.addInitScript(() => {
        let usage = 0;
        Object.defineProperties(navigator.storage, {
            estimate: { value: async () => { usage += 1024 ** 2; return { usage, quota: usage + 10 * 1024 ** 3 }; } },
            persist: { value: async () => false }, persisted: { value: async () => false },
        });
    });
    await openStudio(page, baseURL);
    const panel = page.getByRole('region', { name: 'Úložiště záznamu' });
    await expect(panel.getByText('≈ 10 GiB', { exact: true })).toBeVisible();
    await expect(panel).toContainText('Skutečné volné místo nelze v tomto prohlížeči zjistit');
    await page.getByRole('button', { name: 'Požádat o trvalé úložiště' }).click();
    await expect(panel).toContainText('Prohlížeč žádost o trvalé úložiště zamítl.');
    await addSource(page, 'camera'); await addSource(page, 'screen'); await addSource(page, 'microphone');
    await page.getByRole('button', { name: 'Nahrávat všechny zdroje', exact: true }).click();
    await expect(page.getByTestId('recording-committed-bytes')).not.toHaveText('0 B');
    await expect(page.getByTestId('recording-bitrate')).toContainText('/s');
    const measuredBefore = await page.getByTestId('recording-committed-bytes').innerText();
    await expect(page.getByTestId('recording-committed-bytes')).not.toHaveText(measuredBefore);
    await expect(panel.getByText('≈ 10 GiB', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Zastavit všechny stopy', exact: true }).click();
    await expect(page.getByText('Uloženo', { exact: true })).toBeVisible();
    await expect(page.getByTestId('recording-pending-bytes')).toHaveText('0 B');
    await expect(page.getByTestId('recording-committed-bytes')).not.toHaveText('0 B');
    await page.getByRole('button', { name: 'Smazat', exact: true }).click();
    await page.getByRole('button', { name: 'Smazat záznam a všechny stopy', exact: true }).click();
    await expect(page.getByTestId('recording-committed-bytes')).toHaveText('0 B');
});

test('records with missing estimate and persistence APIs and downloads individual originals', async ({ page, baseURL }) => {
    await page.addInitScript(() => Object.defineProperties(navigator.storage, {
        estimate: { value: undefined }, persist: { value: undefined }, persisted: { value: undefined },
    }));
    await openStudio(page, baseURL);
    await expect(page.getByRole('region', { name: 'Úložiště záznamu' })).toContainText('Prohlížeč neposkytl aktuální odhad.');
    await addSource(page, 'camera');
    await page.getByRole('button', { name: 'Nahrávat všechny zdroje', exact: true }).click();
    await expect(page.getByTestId('recording-committed-bytes')).not.toHaveText('0 B');
    await page.getByRole('button', { name: 'Zastavit všechny stopy', exact: true }).click();
    await expect(page.getByText('Uloženo', { exact: true })).toBeVisible();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Stáhnout originál 1', exact: true }).click();
    const bytes = await readFile((await (await download).path())!);
    const input = new Input({ formats: ALL_FORMATS, source: new BufferSource(bytes) });
    try { expect(await input.canRead()).toBe(true); expect(await input.computeDuration()).toBeGreaterThan(0); }
    finally { input.dispose(); }
});

test('commits folder chunks without IndexedDB media, reloads and imports its checkpoint (OPFS test double for the picker)', async ({ page, baseURL }) => {
    await page.addInitScript(() => Object.defineProperty(window, 'showDirectoryPicker', {
        configurable: true,
        // Real filesystem API and commits. OPFS here replaces only the OS picker; this does NOT test quota bypass.
        value: async () => (await navigator.storage.getDirectory()).getDirectoryHandle('studio-directory-test', { create: true }),
    }));
    await openStudio(page, baseURL);
    await page.getByRole('button', { name: 'Vybrat složku pro nahrávání' }).click();
    await expect(page.getByRole('region', { name: 'Úložiště záznamu' })).toContainText('Složka studio-directory-test');
    await addSource(page, 'camera'); await addSource(page, 'screen'); await addSource(page, 'microphone');
    await page.getByRole('button', { name: 'Nahrávat všechny zdroje', exact: true }).click();
    await expect(page.getByTestId('recording-committed-bytes')).not.toHaveText('0 B');
    // Origin metadata is a cache for this backend: it must not roll back closed directory checkpoints.
    await page.evaluate(() => {
        const originalPut = IDBObjectStore.prototype.put;
        IDBObjectStore.prototype.put = function (value, key) {
            const request = key === undefined ? originalPut.call(this, value) : originalPut.call(this, value, key);
            if (this.name === 'recordings') this.transaction.abort();
            return request;
        };
    });
    await page.getByRole('button', { name: 'Zastavit všechny stopy', exact: true }).click();
    await expect(page.getByText('Uloženo', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText('Uloženo', { exact: true })).toBeVisible();
    const metadata = await page.evaluate(async () => {
        const database = await new Promise<IDBDatabase>((resolve) => { const request = indexedDB.open('promptbook-recording-studio'); request.onsuccess = () => resolve(request.result); });
        const recordings = await new Promise<import('@/lib/recording-studio/recordingStudioTypes').StudioRecording[]>((resolve) => {
            const request = database.transaction('recordings').objectStore('recordings').getAll(); request.onsuccess = () => resolve(request.result);
        });
        const chunks = await new Promise<number>((resolve) => { const request = database.transaction('chunks').objectStore('chunks').count(); request.onsuccess = () => resolve(request.result); });
        database.close();
        return { recording: recordings[0], chunks };
    });
    expect(metadata.chunks).toBe(0);
    expect(metadata.recording.tracks.every((track) => track.byteLength > 0)).toBe(true);
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Originály ZIP', exact: true }).click();
    const files = await readArchive((await (await download).path())!);
    for (const [name, bytes] of Array.from(files)) {
        if (!name.startsWith('originals/')) continue;
        const input = new Input({ formats: ALL_FORMATS, source: new BufferSource(bytes) });
        try { expect(await input.canRead()).toBe(true); expect(await input.computeDuration()).toBeGreaterThan(3); }
        finally { input.dispose(); }
    }
    await page.evaluate(async (recordingId) => {
        const parent = await (await navigator.storage.getDirectory()).getDirectoryHandle('studio-directory-test');
        const directory = await parent.getDirectoryHandle(`promptbook-recording-${recordingId}`);
        Object.defineProperty(window, 'showDirectoryPicker', { configurable: true, value: async () => directory });
        const database = await new Promise<IDBDatabase>((resolve) => { const request = indexedDB.open('promptbook-recording-studio'); request.onsuccess = () => resolve(request.result); });
        await new Promise<void>((resolve, reject) => {
            const transaction = database.transaction(['recordings', 'directories'], 'readwrite');
            transaction.objectStore('recordings').clear(); transaction.objectStore('directories').clear();
            transaction.oncomplete = () => resolve(); transaction.onabort = () => reject(transaction.error);
        });
        database.close();
    }, metadata.recording.id);
    await page.getByRole('button', { name: 'Obnovit záznam ze složky' }).click();
    await expect(page.getByRole('button', { name: 'Obnovit záznam ze složky' })).toBeEnabled();
    await page.reload();
    await expect(page.getByText('Uloženo', { exact: true })).toHaveCount(1);

    // A separate visit with no cached handle must recover even if both destinations refuse further writes.
    await page.evaluate(async () => {
        const database = await new Promise<IDBDatabase>((resolve) => { const request = indexedDB.open('promptbook-recording-studio'); request.onsuccess = () => resolve(request.result); });
        await new Promise<void>((resolve) => {
            const transaction = database.transaction(['recordings', 'directories'], 'readwrite');
            transaction.objectStore('recordings').clear(); transaction.objectStore('directories').clear();
            transaction.oncomplete = () => resolve();
        });
        database.close();
    });
    await page.reload();
    await expect(page.getByRole('button', { name: 'Obnovit záznam ze složky' })).toBeEnabled();
    await page.evaluate(async (recordingId) => {
        const parent = await (await navigator.storage.getDirectory()).getDirectoryHandle('studio-directory-test');
        const directory = await parent.getDirectoryHandle(`promptbook-recording-${recordingId}`);
        Object.defineProperty(window, 'showDirectoryPicker', { configurable: true, value: async () => directory });
        const originalPut = IDBObjectStore.prototype.put;
        IDBObjectStore.prototype.put = function (value, key) {
            const request = key === undefined ? originalPut.call(this, value) : originalPut.call(this, value, key);
            this.transaction.abort();
            return request;
        };
        FileSystemFileHandle.prototype.createWritable = async () => { throw new DOMException('Simulated full disk', 'QuotaExceededError'); };
    }, metadata.recording.id);
    await page.getByRole('button', { name: 'Obnovit záznam ze složky' }).click();
    await expect(page.getByText('Uloženo', { exact: true })).toHaveCount(1);
    const recoveredDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Stáhnout originál 1', exact: true }).click();
    expect(await readFile((await (await recoveredDownload).path())!)).toEqual(Buffer.from(files.get('originals/01-camera.webm')!));
});

test('keeps committed multi-source data after a real IndexedDB transaction abort and offers recovery', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    await addSource(page, 'camera'); await addSource(page, 'screen');
    await page.getByRole('button', { name: 'Nahrávat všechny zdroje', exact: true }).click();
    await expect(page.getByTestId('recording-bitrate')).toContainText('/s');
    await page.evaluate(() => {
        const originalAdd = IDBObjectStore.prototype.add;
        IDBObjectStore.prototype.add = function (value, key) {
            const request = key === undefined ? originalAdd.call(this, value) : originalAdd.call(this, value, key);
            if (this.name === 'chunks') this.transaction.abort();
            return request;
        };
    });
    await expect(page.getByText('Přerušený záznam', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Zastavit všechny stopy', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Originály ZIP', exact: true })).toBeEnabled();
    await page.reload();
    await expect(page.getByText('Přerušený záznam', { exact: true })).toBeVisible();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Originály ZIP', exact: true }).click();
    const files = await readArchive((await (await download).path())!);
    const manifest = JSON.parse(new TextDecoder().decode(files.get('recording.json'))) as RecordingArchiveManifest;
    expect(manifest.status).toBe('interrupted'); expect(manifest.missingRanges.length).toBeGreaterThan(0);
    expect(manifest.tracks.every((track) => track.byteLength > 0)).toBe(true);
});

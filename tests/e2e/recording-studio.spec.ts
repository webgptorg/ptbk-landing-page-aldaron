import { expect, test, type Page } from '@playwright/test';
import { ZipReader, Uint8ArrayReader, Uint8ArrayWriter } from '@zip.js/zip.js';
import { ALL_FORMATS, BufferSource, Input } from 'mediabunny';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir, platform, release } from 'node:os';
import { resolve, sep, join } from 'node:path';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { createAdminSessionValueOrNull } from '@/lib/admin/adminSession';
import type { RecordingArchiveManifest, StudioRecording } from '@/lib/recording-studio/recordingStudioTypes';
import { EDITOR_FIXTURE_PATH, readEditorFrameTimecodes, seedRecordingEditorFixture } from './recordingStudioEditorFixtures';
import { inspectAudioVideoMarkers } from './recordingStudioMarkerInspection';

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
        const displayRequests: DisplayMediaStreamOptions[] = [];
        const testSettings = { cameraAudioErrorName: null as string | null, displayErrorName: null as string | null, displayInitiallyMuted: false };
        const MARKER_PERIOD_MILLISECONDS = 700;
        const MARKER_DURATION_SECONDS = 0.24;
        const MARKER_TIME_ORIGIN = performance.now();
        Object.assign(window, { studioTestStreams: streams, studioTestMediaRequests: mediaRequests, studioTestDisplayRequests: displayRequests, studioTestSettings: testSettings });
        const createStream = async (isVideo: boolean, isAudio: boolean) => {
            const stream = new MediaStream();
            let audioAnalyser: AnalyserNode | null = null;
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
                // Observe the captured audio after the stream destination. Browser load can delay its samples
                // relative to the wall clock, so the visual pulse must follow this signal rather than a timer.
                audioAnalyser = context.createAnalyser();
                audioAnalyser.fftSize = 256;
                context.createMediaStreamSource(destination.stream).connect(audioAnalyser);
                await context.resume();
                const elapsedSeconds = (performance.now() - MARKER_TIME_ORIGIN) / 1000;
                const audioTimeAtOrigin = context.currentTime - elapsedSeconds;
                const nextMarkerIndex = Math.max(0, Math.ceil(elapsedSeconds / (MARKER_PERIOD_MILLISECONDS / 1000)));
                for (let markerIndex = nextMarkerIndex; markerIndex < 100; markerIndex += 1) {
                    const markerTime = audioTimeAtOrigin + markerIndex * MARKER_PERIOD_MILLISECONDS / 1000;
                    if (markerTime < context.currentTime) continue;
                    gain.gain.setValueAtTime(0.2, markerTime);
                    gain.gain.setValueAtTime(0, markerTime + MARKER_DURATION_SECONDS);
                }
            }
            if (isVideo) {
                const canvas = document.createElement('canvas');
                canvas.width = 320; canvas.height = 180;
                const context = canvas.getContext('2d')!;
                const audioLevelSamples = new Float32Array(256);
                const draw = () => {
                    let isMarkerVisible: boolean;
                    if (audioAnalyser) {
                        audioAnalyser.getFloatTimeDomainData(audioLevelSamples);
                        isMarkerVisible = audioLevelSamples.some((sample) => Math.abs(sample) > 0.04);
                    } else {
                        isMarkerVisible = (performance.now() - MARKER_TIME_ORIGIN) % MARKER_PERIOD_MILLISECONDS < MARKER_DURATION_SECONDS * 1000;
                    }
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
            getDisplayMedia: { value: (options: DisplayMediaStreamOptions = {}) => {
                displayRequests.push(options);
                if (testSettings.displayErrorName) return Promise.reject(new DOMException('Synthetic display capture cancellation', testSettings.displayErrorName));
                return createStream(true, options.audio !== false).then((stream) => {
                    const videoTrack = stream.getVideoTracks()[0];
                    if (testSettings.displayInitiallyMuted) Object.defineProperty(videoTrack, 'muted', { configurable: true, value: true });
                    return stream;
                });
            } },
            enumerateDevices: { value: () => Promise.resolve([]) },
        });
        Object.defineProperty(window, 'showSaveFilePicker', { value: undefined, configurable: true });
    });
    await page.goto('/admin/recording-studio');
    await expect(page.getByRole('button', { name: 'Přidat zdroj', exact: true })).toBeEnabled();
    expect(await page.evaluate(() => (window as unknown as { studioTestMediaRequests: MediaStreamConstraints[] }).studioTestMediaRequests)).toEqual([]);
    // Complete the unrelated cookie choice so a moving bottom panel cannot intercept studio controls.
    const cookiePanel = page.getByRole('region', { name: 'Cookies', exact: true });
    if (await cookiePanel.count()) {
        await cookiePanel.getByRole('button').first().click();
        await page.getByRole('dialog').getByRole('button', { name: /Uložit nastavení|Save settings/ }).click();
        await expect(cookiePanel).toHaveCount(0);
    }
}

async function waitForRecordingSeconds(page: Page, minimumSeconds: number) {
    await expect.poll(async () => {
        const timecode = await page.getByLabel('Délka záznamu', { exact: true }).textContent();
        const [hours = NaN, minutes = NaN, seconds = NaN] = (timecode ?? '').split(':').map(Number);
        return [hours, minutes, seconds].every(Number.isFinite) ? hours * 3_600 + minutes * 60 + seconds : -1;
    }).toBeGreaterThanOrEqual(minimumSeconds);
}

async function waitForCommittedRecordingSources(page: Page, sourceCount: number) {
    await expect.poll(() => page.evaluate(async () => {
        const database = await new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open('promptbook-recording-studio');
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        try {
            const recordings = await new Promise<StudioRecording[]>((resolve, reject) => {
                const request = database.transaction('recordings').objectStore('recordings').getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
            const activeRecording = recordings.find((recording) => recording.status === 'recording');
            return activeRecording?.tracks.filter((track) => track.parts?.some((part) => part.byteLength > 0)).length ?? 0;
        } finally {
            database.close();
        }
    })).toBe(sourceCount);
}

async function addSource(page: Page, kind: 'camera' | 'screen' | 'microphone', isAudioEnabled = true) {
    await page.getByRole('button', { name: 'Přidat zdroj', exact: true }).click();
    await page.getByLabel('Typ zdroje').selectOption(kind);
    if (kind === 'screen') {
        const sourceDialog = page.getByRole('dialog');
        await expect(sourceDialog.getByText('macOS Spaces: okno může v prohlížeči chybět nebo přestat posílat obraz', { exact: true })).toBeVisible();
        await expect(sourceDialog.getByRole('link', { name: 'Otevřít základní test výběru a průběžného obrazu' })).toBeVisible();
    }
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

test('requires admin authentication for the recording studio', async ({ page }) => {
    await page.goto('/admin/recording-studio');
    await expect(page).toHaveURL(/\/admin\/login\?redirectPath=%2Fadmin%2Frecording-studio/);
});

test('requires admin authentication for a stable recording workspace address', async ({ page }) => {
    await page.goto(EDITOR_FIXTURE_PATH);
    await expect(page).toHaveURL(/\/admin\/login\?redirectPath=%2Fadmin%2Frecording-studio%2Fsynchronized-fixture/);
});

test('requires admin authentication before accepting browser-local transcription audio', async ({ request }) => {
    const response = await request.post('/api/admin/recording-studio/transcribe', {
        multipart: { language: 'cs', file: { name: 'recording.wav', mimeType: 'audio/wav', buffer: Buffer.from('untrusted') } },
    });
    expect(response.status()).toBe(401);
});

test('persists reviewed workshop annotations and rebases them beside every prepared source', async ({ page, baseURL }, testInfo) => {
    await openStudio(page, baseURL);
    await seedRecordingEditorFixture(page);
    const editor = page.getByRole('region', { name: 'Metadata workshopu' });
    await editor.getByRole('button', { name: 'Založit metadata workshopu' }).click();
    await editor.getByRole('checkbox', { name: 'Výchozí scénu jsem zkontroloval(a)' }).check();
    await editor.getByRole('button', { name: 'Přidat událost u hlavy' }).click();
    await editor.getByLabel('Čas události').fill('2.25');
    await editor.getByLabel('Název události').fill('Agent finished the first pass');
    await expect(editor.getByText('Metadata jsou připravená k exportu.')).toBeVisible();
    await expect.poll(() => page.evaluate(async () => {
        const database = await new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open('promptbook-recording-studio');
            request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
        });
        const recording = await new Promise<import('@/lib/recording-studio/recordingStudioTypes').StudioRecording>((resolve, reject) => {
            const request = database.transaction('recordings', 'readonly').objectStore('recordings').get('synchronized-fixture');
            request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
        });
        database.close();
        return recording.workshopMetadata?.events[0]?.title ?? null;
    })).toBe('Agent finished the first pass');
    await page.reload();
    await expect(page.getByRole('region', { name: 'Metadata workshopu' }).getByLabel('Název události')).toHaveValue('Agent finished the first pass');
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'ZIP s ořezem', exact: true }).click();
    const archivePath = testInfo.outputPath('workshop-metadata.zip');
    await (await downloadPromise).saveAs(archivePath);
    const files = await readArchive(archivePath);
    const manifest = JSON.parse(new TextDecoder().decode(files.get('recording.json'))) as RecordingArchiveManifest;
    const preparedFilename = manifest.workshopMetadata?.preparedFile;
    if (!preparedFilename) throw new Error('Missing prepared workshop metadata');
    const prepared = JSON.parse(new TextDecoder().decode(files.get(preparedFilename))) as {
        readonly preparedTimeZeroSessionSeconds: number;
        readonly events: readonly { readonly seconds: number; readonly originalSeconds: number; readonly title: string }[];
        readonly activityIntervals: readonly { readonly startSeconds: number; readonly endSeconds: number; readonly classification: string }[];
    };
    expect(manifest.tracks.filter((track) => track.trimmedFile).length).toBeGreaterThan(1);
    expect(prepared.preparedTimeZeroSessionSeconds).toBe(1.25);
    expect(prepared.events).toMatchObject([{ seconds: 1, originalSeconds: 2.25, title: 'Agent finished the first pass' }]);
    expect(prepared.activityIntervals).toMatchObject([{ startSeconds: 0, endSeconds: 5, classification: 'unclassified' }]);
});

test('aligns reviewed workshop events, activity, scenes and Git anchors with prepared appended-take sources', async ({ page, baseURL }, testInfo) => {
    await openStudio(page, baseURL);
    await seedRecordingEditorFixture(page, { isAppendedSession: true });
    await page.route('**/api/admin/workshops/repository/commit', async (route) => {
        const commitId = (route.request().postDataJSON() as { lookup: { commitId: string } }).lookup.commitId;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
            commit: { sha: commitId, committedAt: '2026-09-28T08:20:00.000Z', message: 'Selected branch commit' },
        }) });
    });
    const playhead = page.getByRole('slider', { name: 'Přehrávací hlava', exact: true });
    await playhead.press('Home');
    for (let second = 0; second < 11; second += 1) await playhead.press('ArrowRight');
    await expect(page.getByLabel('Společný čas')).toHaveAttribute('data-session-seconds', '11');
    const editor = page.getByRole('region', { name: 'Metadata workshopu' });
    await editor.getByRole('button', { name: 'Založit metadata workshopu' }).click();
    const activity = editor.getByRole('heading', { name: 'Aktivita' }).locator('..');
    await activity.getByRole('button', { name: 'Rozdělit u hlavy' }).click();
    await activity.getByLabel('Typ').nth(1).selectOption('automatic-coding');
    await activity.getByRole('checkbox', { name: 'Ručně potvrzeno' }).check();
    await editor.getByRole('button', { name: 'Přidat událost u hlavy' }).click();
    await editor.getByLabel('Název události').fill('Agent started unattended pass');
    await editor.getByLabel('Zdroj application').selectOption('camera');
    await editor.getByRole('checkbox', { name: 'Výchozí scénu jsem zkontroloval(a)' }).check();
    await editor.getByRole('button', { name: 'Přechod u hlavy' }).click();
    await editor.getByRole('checkbox', { name: 'Zkontrolováno' }).check();
    await editor.getByLabel('Repozitář workshopu').fill('example/workshop');
    await editor.getByLabel('Větve workshopu').fill('main');
    await editor.getByRole('button', { name: 'Uložit repozitář' }).click();
    await editor.getByLabel('Počáteční SHA').fill('a'.repeat(40));
    await editor.getByRole('button', { name: 'Ověřit a uložit' }).click();
    await expect(editor.getByText(/Počáteční commit:/)).toBeVisible();
    await editor.getByLabel('SHA nové kotvy').fill('b'.repeat(40));
    await editor.getByRole('button', { name: 'Ověřit a přidat kotvu' }).click();
    await expect(editor.getByText('Metadata jsou připravená k exportu.')).toBeVisible();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'ZIP s ořezem', exact: true }).click();
    const archivePath = testInfo.outputPath('appended-workshop-metadata.zip');
    await (await downloadPromise).saveAs(archivePath);
    const files = await readArchive(archivePath);
    const manifest = JSON.parse(new TextDecoder().decode(files.get('recording.json'))) as RecordingArchiveManifest;
    const preparedFilename = manifest.workshopMetadata?.preparedFile;
    if (!preparedFilename) throw new Error('Missing prepared workshop metadata');
    const prepared = JSON.parse(new TextDecoder().decode(files.get(preparedFilename))) as {
        readonly preparedTimeZeroSessionSeconds: number;
        readonly commitAtSelectionStart: { readonly state: string; readonly sha: string };
        readonly events: readonly { readonly seconds: number; readonly originalSeconds: number }[];
        readonly activityIntervals: readonly { readonly startSeconds: number; readonly endSeconds: number; readonly classification: string }[];
        readonly autoView: { readonly transitions: readonly { readonly seconds: number; readonly originalSeconds: number }[] };
        readonly commitAnchors: readonly { readonly seconds: number; readonly originalSeconds: number; readonly commit: { readonly sha: string } }[];
    };
    expect(manifest.tracks.filter((track) => track.trimmedFile).length).toBe(3);
    expect(manifest.tracks.every((track) => track.preparation?.preparedTimeZeroSessionSeconds === 9.25)).toBe(true);
    expect(prepared.preparedTimeZeroSessionSeconds).toBe(9.25);
    expect(prepared.commitAtSelectionStart).toMatchObject({ state: 'known', sha: 'a'.repeat(40) });
    expect(prepared.events).toMatchObject([{ seconds: 1.75, originalSeconds: 11 }]);
    expect(prepared.activityIntervals).toMatchObject([
        { startSeconds: 0, endSeconds: 1.75, classification: 'unclassified' },
        { startSeconds: 1.75, endSeconds: 5, classification: 'automatic-coding' },
    ]);
    expect(prepared.autoView.transitions).toMatchObject([{ seconds: 1.75, originalSeconds: 11 }]);
    expect(prepared.commitAnchors).toMatchObject([{ seconds: 1.75, originalSeconds: 11, commit: { sha: 'b'.repeat(40) } }]);
});

test('generates separate Czech subtitles and speech activity from chosen camera and microphone audio', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    await seedRecordingEditorFixture(page);
    let transcriptionRequests = 0;
    await page.route('**/api/admin/recording-studio/transcribe', async (route) => {
        transcriptionRequests += 1;
        expect(route.request().postDataBuffer()?.byteLength).toBeGreaterThan(1_000);
        expect(route.request().postData()).toContain('name="language"');
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
            cues: [{ startSeconds: 1, endSeconds: 2, text: 'Dobrý den' }],
        }) });
    });
    const subtitleSource = page.getByLabel('Zvuk pro titulky');
    const activitySource = page.getByLabel('Zvuk pro aktivitu');
    await expect(subtitleSource.locator('option[value="screen"]')).toHaveAttribute('disabled', '');
    await expect(subtitleSource.locator('option[value="camera"]')).not.toHaveAttribute('disabled');
    await subtitleSource.selectOption('camera');
    await page.getByRole('button', { name: 'Generovat titulky · nová revize' }).click();
    const cameraSubtitles = page.getByRole('article', { name: 'Titulky Fixture camera' });
    await expect(cameraSubtitles).toBeVisible();
    await expect(cameraSubtitles.locator('textarea')).toHaveValue('Dobrý den');
    await cameraSubtitles.locator('textarea').fill('Opravený český text');
    await expect(cameraSubtitles.locator('textarea')).toHaveValue('Opravený český text');

    await subtitleSource.selectOption('microphone');
    await page.getByRole('button', { name: 'Generovat titulky · nová revize' }).click();
    const microphoneSubtitles = page.getByRole('article', { name: 'Titulky Fixture microphone' });
    await expect(microphoneSubtitles).toBeVisible();
    await expect(cameraSubtitles.locator('textarea')).toHaveValue('Opravený český text');
    await expect(microphoneSubtitles.locator('textarea')).toHaveValue('Dobrý den');

    await activitySource.selectOption('camera');
    await page.getByRole('button', { name: 'Analyzovat řeč · nová revize' }).click();
    await expect(page.getByRole('article', { name: 'Aktivita řeči Fixture camera' })).toBeVisible();
    await activitySource.selectOption('microphone');
    await page.getByRole('button', { name: 'Analyzovat řeč · nová revize' }).click();
    await expect(page.getByRole('article', { name: 'Aktivita řeči Fixture microphone' })).toBeVisible();
    expect(transcriptionRequests).toBe(2);

    const readStoredTracks = () => page.evaluate(async () => {
        const database = await new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open('promptbook-recording-studio');
            request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
        });
        const recording = await new Promise<import('@/lib/recording-studio/recordingStudioTypes').StudioRecording>((resolve, reject) => {
            const request = database.transaction('recordings').objectStore('recordings').get('synchronized-fixture');
            request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
        });
        database.close();
        return recording.derivedTracks ?? [];
    });
    await expect.poll(async () => (await readStoredTracks()).length).toBe(4);
    const storedTracks = await readStoredTracks();
    expect(storedTracks.map((track) => [track.kind, track.provenance.sourceId])).toEqual([
        ['subtitles', 'camera'], ['subtitles', 'microphone'], ['speech-activity', 'camera'], ['speech-activity', 'microphone'],
    ]);
    const cameraCue = storedTracks[0].kind === 'subtitles' ? storedTracks[0].cues[0] : null;
    const microphoneCue = storedTracks[1].kind === 'subtitles' ? storedTracks[1].cues[0] : null;
    expect(cameraCue?.startSeconds).toBeGreaterThan(1.3);
    expect(microphoneCue?.startSeconds).toBeGreaterThan((cameraCue?.startSeconds ?? 0) + 0.2);
    expect(cameraCue?.text).toBe('Opravený český text');
    await page.reload();
    await expect(page.getByRole('article', { name: 'Titulky Fixture camera' }).locator('textarea')).toHaveValue('Opravený český text');
});

test('keeps a caption returned by only one long-audio chunk at the overlap boundary', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    const recordingId = 'long-audio-overlap-fixture';
    await page.goto('/admin/recording-studio');
    await page.evaluate(async (id) => {
        const SAMPLE_RATE = 16_000;
        const DURATION_SECONDS = 75;
        const sampleCount = SAMPLE_RATE * DURATION_SECONDS;
        const wav = new ArrayBuffer(44 + sampleCount * 2);
        const view = new DataView(wav);
        const writeText = (offset: number, value: string) => {
            for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index));
        };
        writeText(0, 'RIFF'); view.setUint32(4, wav.byteLength - 8, true); writeText(8, 'WAVE');
        writeText(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
        view.setUint16(22, 1, true); view.setUint32(24, SAMPLE_RATE, true);
        view.setUint32(28, SAMPLE_RATE * 2, true); view.setUint16(32, 2, true);
        view.setUint16(34, 16, true); writeText(36, 'data'); view.setUint32(40, sampleCount * 2, true);
        const recording: import('@/lib/recording-studio/recordingStudioTypes').StudioRecording = {
            id, title: 'Long overlap reference', createdAt: '2026-09-29T08:00:00.000Z',
            status: 'complete', durationSeconds: DURATION_SECONDS, captureEndSeconds: DURATION_SECONDS,
            trim: null, errorMessage: null,
            tracks: [{ id: 'microphone', kind: 'microphone', label: 'Long microphone', mimeType: 'audio/wav',
                byteLength: wav.byteLength, chunkCount: 1, startOffsetSeconds: 0, durationSeconds: DURATION_SECONDS,
                width: null, height: null, frameRate: null, isAudioIncluded: true }],
        };
        const database = await new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open('promptbook-recording-studio', 2);
            request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
        });
        await new Promise<void>((resolve, reject) => {
            const transaction = database.transaction(['recordings', 'chunks'], 'readwrite');
            transaction.objectStore('recordings').put(recording);
            transaction.objectStore('chunks').put({ recordingId: id, trackId: 'microphone', sequence: 0,
                data: new Blob([wav], { type: 'audio/wav' }) });
            transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error);
        });
        database.close();
    }, recordingId);
    let transcriptionRequests = 0;
    await page.route('**/api/admin/recording-studio/transcribe', async (route) => {
        transcriptionRequests += 1;
        expect(route.request().postDataBuffer()?.byteLength).toBeLessThan(3_000_000);
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ cues: transcriptionRequests === 1
            ? [{ startSeconds: 69.7, endSeconds: 70.3, text: 'Hraniční věta' }] : [] }) });
    });
    await page.goto(`/admin/recording-studio/${recordingId}`);
    await page.getByRole('button', { name: 'Generovat titulky · nová revize' }).click();
    const generated = page.getByRole('article', { name: 'Titulky Long microphone' });
    await expect(generated.locator('textarea')).toHaveValue('Hraniční věta');
    await expect(generated.getByLabel('Začátek titulku')).toHaveValue('69.7');
    await expect(generated.getByLabel('Konec titulku')).toHaveValue('70.3');
    expect(transcriptionRequests).toBe(2);
});

test('checks actual legacy audio despite incorrect saved flags', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    await seedRecordingEditorFixture(page);
    await page.evaluate(async () => {
        const database = await new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open('promptbook-recording-studio');
            request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
        });
        await new Promise<void>((resolve, reject) => {
            const transaction = database.transaction('recordings', 'readwrite');
            const store = transaction.objectStore('recordings');
            const read = store.get('synchronized-fixture');
            read.onsuccess = () => {
                const recording = read.result as import('@/lib/recording-studio/recordingStudioTypes').StudioRecording;
                store.put({ ...recording, tracks: recording.tracks.map((track) => track.id === 'screen'
                    ? { ...track, isAudioIncluded: true } : track.id === 'camera'
                        ? { ...track, isAudioIncluded: false } : track) });
            };
            transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error);
        });
        database.close();
    });
    await page.reload();
    const subtitleSource = page.getByLabel('Zvuk pro titulky');
    await expect(subtitleSource.locator('option[value="screen"]')).toHaveAttribute('disabled', '');
    await expect(subtitleSource.locator('option[value="screen"]')).toContainText('bez zpracovatelného zvuku');
    await expect(subtitleSource.locator('option[value="camera"]')).not.toHaveAttribute('disabled');
    await page.route('**/api/admin/recording-studio/transcribe', (route) => route.fulfill({
        status: 200, contentType: 'application/json', body: JSON.stringify({ cues: [{ startSeconds: 1, endSeconds: 2, text: 'Ověřený zvuk' }] }),
    }));
    await subtitleSource.selectOption('camera');
    await page.getByRole('button', { name: 'Generovat titulky · nová revize' }).click();
    await expect(page.getByRole('article', { name: 'Titulky Fixture camera' }).locator('textarea')).toHaveValue('Ověřený zvuk');
});

test('keeps caption corrections through retry, cancellation and a stale generation', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    await seedRecordingEditorFixture(page);
    let responseMode: 'failure' | 'success' | 'blocked' = 'failure';
    const blockedRequest: { release: (() => void) | null } = { release: null };
    const releaseBlockedRequest = () => {
        (blockedRequest.release as (() => void) | null)?.();
        blockedRequest.release = null;
    };
    await page.route('**/api/admin/recording-studio/transcribe', async (route) => {
        if (responseMode === 'blocked') await new Promise<void>((resolve) => { blockedRequest.release = resolve; });
        if (responseMode === 'failure') await route.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ error: 'Přepis selhal; opakujte požadavek.' }) });
        else await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
            cues: [{ startSeconds: 1, endSeconds: 2, text: 'Původní návrh' }],
        }) }).catch(() => undefined);
    });
    await page.getByLabel('Zvuk pro titulky').selectOption('camera');
    await page.getByRole('button', { name: 'Generovat titulky · nová revize' }).click();
    const derivedEditor = page.getByRole('region', { name: 'Odvozené stopy řeči' });
    await expect(derivedEditor.getByRole('alert')).toContainText('Přepis selhal');
    responseMode = 'success';
    await page.getByRole('button', { name: 'Zkusit znovu' }).click();
    const cameraRevisions = page.getByRole('article', { name: 'Titulky Fixture camera' });
    await expect(cameraRevisions).toHaveCount(1);
    await cameraRevisions.first().locator('textarea').fill('Ruční oprava');
    await expect(page.getByText('Uloženo', { exact: true }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Generovat titulky · nová revize' }).click();
    await expect(cameraRevisions).toHaveCount(2);
    await expect(cameraRevisions.first().locator('textarea')).toHaveValue('Ruční oprava');
    await expect(cameraRevisions.nth(1).locator('textarea')).toHaveValue('Původní návrh');

    responseMode = 'blocked';
    await page.getByRole('button', { name: 'Generovat titulky · nová revize' }).click();
    await expect.poll(() => blockedRequest.release !== null).toBe(true);
    await page.getByRole('button', { name: 'Zrušit generování' }).click();
    releaseBlockedRequest();
    await expect(page.getByText('Generování bylo zrušeno.', { exact: false })).toBeVisible();
    await expect(cameraRevisions).toHaveCount(2);
    await expect(cameraRevisions.first().locator('textarea')).toHaveValue('Ruční oprava');

    await page.getByRole('button', { name: 'Generovat titulky · nová revize' }).click();
    await expect.poll(() => blockedRequest.release !== null).toBe(true);
    await page.evaluate(async () => {
        const database = await new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open('promptbook-recording-studio');
            request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
        });
        await new Promise<void>((resolve, reject) => {
            const transaction = database.transaction('recordings', 'readwrite');
            const store = transaction.objectStore('recordings');
            const read = store.get('synchronized-fixture');
            read.onsuccess = () => store.put({ ...read.result, takes: [{ id: 'new-take', startedAt: '2026-09-29T08:00:00.000Z',
                sessionStartSeconds: 8, durationSeconds: 1, sourceIds: ['camera'] }] });
            transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error);
        });
        database.close();
    });
    releaseBlockedRequest();
    await expect(derivedEditor.getByRole('alert')).toContainText('Výsledek je zastaralý');
    await expect(cameraRevisions).toHaveCount(2);
    await expect(cameraRevisions.first().locator('textarea')).toHaveValue('Ruční oprava');
});

test('synchronizes rendered timecodes, monitoring and prepared separate-source files', async ({ page, baseURL }, testInfo) => {
    await openStudio(page, baseURL);
    await seedRecordingEditorFixture(page);
    const workspace = page.getByRole('region', { name: 'Pracovní prostor záznamu' });
    const playhead = page.getByRole('slider', { name: 'Přehrávací hlava', exact: true });
    const waitForSources = async () => expect.poll(() => workspace.locator('[data-source-state="ready"]').count()).toBe(3);
    const measured: unknown[] = [];
    for (const seconds of [1, 4, 7, 2]) {
        await playhead.press('Home');
        for (let step = 0; step < seconds; step++) await playhead.press('ArrowRight');
        await waitForSources();
        const frames = await readEditorFrameTimecodes(page);
        expect(frames.every((frame) => Math.abs(frame.seconds - seconds) <= 0.1), JSON.stringify(frames)).toBe(true);
        const audioSeconds = await workspace.locator('audio').evaluate((audio: HTMLAudioElement) => audio.currentTime + 0.71);
        expect(Math.abs(audioSeconds - seconds)).toBeLessThan(0.1);
        measured.push({ seconds, frames, audioSeconds });
    }
    expect(await workspace.locator('video, audio').evaluateAll((elements) => elements.filter((element) => !(element as HTMLMediaElement).muted).length)).toBe(1);
    const camera = page.getByRole('article', { name: 'Monitor Fixture camera' });
    const screen = page.getByRole('article', { name: 'Monitor Fixture screen' });
    await camera.getByRole('button', { name: 'Skrýt obraz' }).click();
    await expect(camera.locator('video')).toBeHidden();
    await screen.getByRole('button', { name: 'Sólo obraz' }).click();
    await camera.getByRole('button', { name: 'Sólo zvuk' }).click();
    expect(await workspace.locator('video, audio').evaluateAll((elements) => elements.filter((element) => !(element as HTMLMediaElement).muted).map((element) => (element as HTMLElement).dataset.sourceId))).toEqual(['camera']);
    // Delay acknowledgment of a real decoder start. Already-started media must wait without advancing.
    await page.evaluate(() => {
        const originalPlay = HTMLMediaElement.prototype.play;
        HTMLMediaElement.prototype.play = async function () {
            await originalPlay.call(this);
            if (this.dataset.sourceId === 'camera') await new Promise((resolve) => setTimeout(resolve, 600));
        };
    });
    await page.getByRole('button', { name: 'Přehrát vše', exact: true }).click();
    await expect(workspace.getByText('Čekám na společný čas zdrojů…', { exact: true })).toBeVisible();
    expect(Number(await page.getByLabel('Společný čas').getAttribute('data-session-seconds'))).toBe(2);
    await expect.poll(async () => Number(await page.getByLabel('Společný čas').getAttribute('data-session-seconds'))).toBeGreaterThan(3);
    const liveAlignment = await workspace.locator('video, audio').evaluateAll((elements) => {
        const sessionSeconds = Number(document.querySelector('[data-session-seconds]')!.getAttribute('data-session-seconds'));
        return elements.map((element) => {
            const media = element as HTMLMediaElement;
            const offset = media.dataset.sourceId === 'camera' ? 0.37 : media.dataset.sourceId === 'microphone' ? 0.71 : 0;
            return { id: media.dataset.sourceId, sessionSeconds, sourceSessionSeconds: media.currentTime + offset };
        });
    });
    expect(liveAlignment.every((source) => Math.abs(source.sourceSessionSeconds - source.sessionSeconds) <= 0.1), JSON.stringify(liveAlignment)).toBe(true);
    measured.push({ liveAlignment });
    await page.getByRole('button', { name: 'Pozastavit vše', exact: true }).click();
    await waitForSources();
    const pausedSeconds = Number(await page.getByLabel('Společný čas').getAttribute('data-session-seconds'));
    const runningFrames = await readEditorFrameTimecodes(page);
    expect(runningFrames.every((frame) => Math.abs(frame.seconds - pausedSeconds) <= 0.1), JSON.stringify({ pausedSeconds, runningFrames })).toBe(true);
    measured.push({ pausedSeconds, runningFrames });
    await camera.getByRole('button', { name: 'Skrýt obraz' }).click();
    await screen.getByRole('button', { name: 'Sólo obraz' }).click();
    await expect(camera.locator('video')).toBeVisible();
    // Leave enough fixture duration for the speed assertion even on a slow browser/test machine.
    await playhead.press('Home');
    await playhead.press('ArrowRight');
    await playhead.press('ArrowRight');
    await waitForSources();
    await page.getByLabel('Rychlost přehrávání').selectOption('2');
    await page.getByRole('button', { name: 'Přehrát vše', exact: true }).click();
    // Decoders may briefly vary by up to 15% to close drift against the shared 2x clock.
    await expect.poll(() => workspace.locator('video, audio').evaluateAll((elements) => elements.every((element) => Math.abs((element as HTMLMediaElement).playbackRate - 2) <= 0.3))).toBe(true);
    await page.getByRole('button', { name: 'Pozastavit vše', exact: true }).click();
    await waitForSources();
    const fasterPausedSeconds = Number(await page.getByLabel('Společný čas').getAttribute('data-session-seconds'));
    const fasterFrames = await readEditorFrameTimecodes(page);
    expect(fasterFrames.every((frame) => Math.abs(frame.seconds - fasterPausedSeconds) <= 0.1), JSON.stringify({ fasterPausedSeconds, fasterFrames })).toBe(true);
    measured.push({ speed: 2, pausedSeconds: fasterPausedSeconds, runningFrames: fasterFrames });

    // Pointer trim and keyboard trim both edit one shared recipe; undo never changes source bytes.
    const startHandle = page.getByRole('slider', { name: 'Začátek výběru', exact: true });
    const rectangle = (await startHandle.boundingBox())!;
    await page.mouse.move(rectangle.x + rectangle.width / 2, rectangle.y + 15);
    await page.mouse.down(); await page.mouse.move(rectangle.x + 60, rectangle.y + 15, { steps: 4 }); await page.mouse.up();
    await expect(page.getByLabel('Začátek (sekundy)', { exact: true })).not.toHaveValue('1.25');
    await page.getByRole('button', { name: 'Vrátit ořez' }).click();
    await expect(page.getByLabel('Začátek (sekundy)', { exact: true })).toHaveValue('1.25');
    await startHandle.press('Alt+ArrowRight');
    await expect(page.getByLabel('Začátek (sekundy)', { exact: true })).toHaveValue('1.26');
    await page.getByRole('button', { name: 'Vrátit ořez' }).click();
    await page.getByLabel('Konec (sekundy)', { exact: true }).fill('6.25');
    // Export flushes the newest edit, even before the debounce expires; monitoring remains excluded.
    const archiveDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'ZIP s ořezem', exact: true }).click();
    const archive = await archiveDownload;
    const archivePath = testInfo.outputPath('prepared-fixture.zip');
    await archive.saveAs(archivePath);
    const files = await readArchive(archivePath);
    const manifest = JSON.parse(new TextDecoder().decode(files.get('recording.json'))) as RecordingArchiveManifest;
    expect(manifest.isTrimIncluded).toBe(true);
    expect(manifest.tracks.every((track) => track.preparation?.status === 'prepared' && track.originalFile && track.trimmedFile)).toBe(true);
    expect(manifest.tracks).toHaveLength(3);
    for (const track of manifest.tracks) {
        expect(track.preparation!.components!.every((component) => component.firstTimestampSeconds <= 0.05 && Math.abs(component.endTimestampSeconds - 5) <= 0.05)).toBe(true);
        if (track.kind !== 'screen') expect(track.preparation!.components!.some(({ kind }) => kind === 'audio')).toBe(true);
    }
    await testInfo.attach('prepared-fixture', { path: archivePath, contentType: 'application/zip' });
    await testInfo.attach('measured-timecodes', { body: JSON.stringify(measured, null, 2), contentType: 'application/json' });
    await writeFile(testInfo.outputPath('measured-timecodes.json'), JSON.stringify(measured, null, 2));
    await page.reload();
    await expect(page.getByLabel('Začátek (sekundy)', { exact: true })).toHaveValue('1.25');
    await page.getByRole('link', { name: 'Studio · nastavení a záznamy' }).click();
    await expect(page).toHaveURL('/admin/recording-studio');
    await page.goBack();
    await expect(page).toHaveURL(EDITOR_FIXTURE_PATH);
    await expect(page.getByLabel('Konec (sekundy)', { exact: true })).toHaveValue('6.25');
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('timeline-mobile.png'), fullPage: true });
});

test('keeps late session gaps, local missing media, autosave failure and retry honest', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    await seedRecordingEditorFixture(page, { isLongSession: true });
    const workspace = page.getByRole('region', { name: 'Pracovní prostor záznamu' });
    const playhead = page.getByRole('slider', { name: 'Přehrávací hlava', exact: true });
    await playhead.press('End');
    await expect(page.getByLabel('Společný čas')).toContainText('10:00:00.000');
    await expect(workspace.locator('[data-source-state="gap"]')).toHaveCount(3);
    await playhead.press('Shift+ArrowLeft'); await playhead.press('ArrowRight');
    await expect.poll(() => workspace.locator('[data-source-state="ready"]').count()).toBe(3);
    const frames = await readEditorFrameTimecodes(page);
    expect(frames.every((frame) => Math.abs(frame.seconds - 5) <= 0.1), JSON.stringify(frames)).toBe(true);
    await playhead.press('Shift+ArrowLeft');
    await expect(workspace.locator('[data-source-state="gap"]')).toHaveCount(3);
    await expect(workspace.locator('video').first()).toBeHidden();
    const fallbackDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'ZIP s ořezem', exact: true }).click();
    const fallbackFiles = await readArchive((await (await fallbackDownload).path())!);
    const fallbackManifest = JSON.parse(new TextDecoder().decode(fallbackFiles.get('recording.json'))) as RecordingArchiveManifest;
    expect(fallbackManifest.isTrimIncluded).toBe(false);
    expect(fallbackManifest.tracks.every((track) => track.originalFile && track.trimmedFile === null && track.preparation?.status === 'original-and-recipe')).toBe(true);
    expect(fallbackManifest.missingRanges.some((range) => range.startSeconds === 4 && range.endSeconds === 35_990)).toBe(true);
    // Export temporarily disables fields. That must not make an incomplete numeric draft valid or save it as zero.
    await page.getByLabel('Začátek (sekundy)', { exact: true }).fill('');
    await page.getByRole('button', { name: 'ZIP s ořezem', exact: true }).click();
    await expect(page.getByText('Export čeká na platné uložené změny.', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Začátek (sekundy)', { exact: true })).toBeEnabled();
    await expect(page.getByLabel('Začátek (sekundy)', { exact: true })).toHaveValue('');
    await page.getByLabel('Začátek (sekundy)', { exact: true }).fill('1.25');
    await expect(workspace.getByRole('alert')).toHaveCount(0);
    await page.evaluate(() => {
        const original = IDBObjectStore.prototype.put;
        Object.assign(window, { studioEditorShouldFailSave: true });
        IDBObjectStore.prototype.put = function (...args: Parameters<IDBObjectStore['put']>) {
            if (this.name === 'recordings' && (window as unknown as { studioEditorShouldFailSave: boolean }).studioEditorShouldFailSave) throw new DOMException('Fixture write failed', 'QuotaExceededError');
            return original.apply(this, args);
        };
    });
    await page.getByLabel('Název záznamu', { exact: true }).fill('Recoverable editor draft');
    await expect(workspace.getByRole('alert')).toContainText('Fixture write failed');
    await page.getByRole('link', { name: 'Studio · nastavení a záznamy' }).click();
    await expect(page).toHaveURL(EDITOR_FIXTURE_PATH);
    await expect(page.getByLabel('Název záznamu', { exact: true })).toHaveValue('Recoverable editor draft');
    await page.evaluate(() => Object.assign(window, { studioEditorShouldFailSave: false }));
    await workspace.getByRole('button', { name: 'Zkusit znovu', exact: true }).click();
    await expect(workspace.getByRole('alert')).toHaveCount(0);
    await page.reload();
    await expect(page.getByLabel('Název záznamu', { exact: true })).toHaveValue('Recoverable editor draft');
    await page.goto('/admin/recording-studio/absent-on-this-computer');
    await expect(page.getByRole('heading', { name: 'Místní záznam není dostupný' })).toBeVisible();
    await expect(page.getByLabel('Název záznamu', { exact: true })).toHaveCount(0);
});

test('recovers a corrupt preview and cancels preparation without losing originals', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    const recording = await seedRecordingEditorFixture(page);
    const originalBytes = await page.evaluate(async (recordingId) => {
        const database = await new Promise<IDBDatabase>((resolve) => { const request = indexedDB.open('promptbook-recording-studio'); request.onsuccess = () => resolve(request.result); });
        const chunk = await new Promise<{ data: Blob }>((resolve) => { const request = database.transaction('chunks').objectStore('chunks').get([recordingId, 'camera', 0]); request.onsuccess = () => resolve(request.result); });
        const bytes = Array.from(new Uint8Array(await chunk.data.arrayBuffer()));
        await new Promise<void>((resolve) => {
            const transaction = database.transaction('chunks', 'readwrite');
            transaction.objectStore('chunks').put({ recordingId, trackId: 'camera', sequence: 0, data: new Blob([new Uint8Array(bytes.length)]) });
            transaction.oncomplete = () => resolve();
        });
        database.close(); return bytes;
    }, recording.id);
    await page.reload();
    const camera = page.getByRole('article', { name: 'Monitor Fixture camera' });
    await page.getByRole('slider', { name: 'Přehrávací hlava', exact: true }).press('ArrowRight');
    await expect(camera).toHaveAttribute('data-source-state', 'error');
    await expect(camera.locator('video')).toHaveCount(0);
    await expect(page.getByRole('article', { name: 'Monitor Fixture screen' })).toHaveAttribute('data-source-state', 'ready');
    await page.evaluate(async ({ recordingId, bytes }) => {
        const database = await new Promise<IDBDatabase>((resolve) => { const request = indexedDB.open('promptbook-recording-studio'); request.onsuccess = () => resolve(request.result); });
        await new Promise<void>((resolve) => {
            const transaction = database.transaction('chunks', 'readwrite');
            transaction.objectStore('chunks').put({ recordingId, trackId: 'camera', sequence: 0, data: new Blob([new Uint8Array(bytes)], { type: 'video/webm' }) });
            transaction.oncomplete = () => resolve();
        });
        database.close();
    }, { recordingId: recording.id, bytes: originalBytes });
    await camera.getByRole('button', { name: 'Načíst náhled znovu' }).click();
    await expect(camera).toHaveAttribute('data-source-state', 'ready');
    expect((await readEditorFrameTimecodes(page)).every((frame) => Math.abs(frame.seconds - 1) <= 0.1)).toBe(true);

    // Hold the destination chooser so cancellation is deterministic without mocking codecs or media writes.
    await page.evaluate(() => Object.defineProperty(window, 'showSaveFilePicker', { configurable: true, value: () => new Promise<FileSystemFileHandle>((resolve) => {
        Object.assign(window, { finishStudioTestPicker: async () => resolve(await (await navigator.storage.getDirectory()).getFileHandle('cancelled-export.zip', { create: true })) });
    }) }));
    await page.getByRole('button', { name: 'ZIP s ořezem', exact: true }).click();
    await expect(page.getByLabel('Začátek (sekundy)', { exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Zrušit export' }).click();
    await page.evaluate(() => (window as unknown as { finishStudioTestPicker: () => Promise<void> }).finishStudioTestPicker());
    await expect(page.getByRole('status').filter({ hasText: 'Export byl zrušen.' })).toBeVisible();
    await expect(page.getByLabel('Začátek (sekundy)', { exact: true })).toBeEnabled();
    await page.evaluate(() => Object.defineProperty(window, 'showSaveFilePicker', { configurable: true, value: undefined }));
    const originalDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Stáhnout originál 2', exact: true }).click();
    const downloaded = await originalDownload;
    expect(downloaded.suggestedFilename()).toContain('-2-camera.webm');
    expect(await readFile((await downloaded.path())!)).toEqual(Buffer.from(originalBytes));
    const preparedDownload = page.waitForEvent('download', (download) => download.suggestedFilename().endsWith('.webm'));
    await page.getByRole('button', { name: 'Stáhnout ořez 2', exact: true }).click();
    const preparedFile = await preparedDownload;
    expect(preparedFile.suggestedFilename()).toContain('-2-camera-prepared.webm');
    await expect(page.getByText('Oříznutý soubor a jeho předpis jsou připravené.')).toBeVisible();
    // The file must remain readable after its OPFS working file has been removed.
    const downloadedMedia = new Input({ formats: ALL_FORMATS, source: new BufferSource(await readFile((await preparedFile.path())!)) });
    try {
        expect((await downloadedMedia.getVideoTracks()).length).toBe(1);
        expect((await downloadedMedia.getAudioTracks()).length).toBe(1);
        expect(Math.abs(await downloadedMedia.computeDuration() - 5)).toBeLessThan(0.05);
    } finally { downloadedMedia.dispose(); }
});

test('prepares the full boundary of a variable-frame-rate camera with its audio and explicit cadence', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    await seedRecordingEditorFixture(page, { isVariableFrameRate: true });
    const preparedDownload = page.waitForEvent('download', (download) => download.suggestedFilename().endsWith('.webm'));
    const manifestDownload = page.waitForEvent('download', (download) => download.suggestedFilename().endsWith('.json'));
    await page.getByRole('button', { name: 'Stáhnout ořez 2', exact: true }).click();
    const prepared = new Input({ formats: ALL_FORMATS, source: new BufferSource(await readFile((await (await preparedDownload).path())!)) });
    try {
        const tracks = await prepared.getTracks();
        expect(tracks).toHaveLength(2);
        for (const track of tracks) {
            expect(await track.getFirstTimestamp()).toBeLessThan(0.05);
            expect(Math.abs(await track.computeDuration() - 2)).toBeLessThan(0.05);
        }
    } finally { prepared.dispose(); }
    const manifest = JSON.parse(await readFile((await (await manifestDownload).path())!, 'utf8')) as RecordingArchiveManifest;
    expect(manifest.tracks[1].preparation).toMatchObject({ status: 'prepared', videoFrameRate: 30, preparedTimeZeroSessionSeconds: 0.5 });
});

test('plain capture diagnostic requests a user-selected display without studio preferences', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    await page.goto('/admin/recording-studio/capture-probe');
    await page.getByRole('button', { name: 'Vybrat zdroj a spustit základní test' }).click();
    await expect(page.getByText('Stav: live', { exact: true })).toBeVisible();
    const displayRequests = await page.evaluate(() => (window as unknown as { studioTestDisplayRequests: DisplayMediaStreamOptions[] }).studioTestDisplayRequests);
    expect(displayRequests).toEqual([{ video: true, audio: false }]);
    await expect(page.getByText(/Video snímky/)).toBeVisible();
    await page.getByRole('button', { name: 'Zastavit testovací stream' }).click();
    await expect(page.getByText('Stav: stopped', { exact: true })).toBeVisible();
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
    await page.getByRole('button', { name: 'Nahrávat připravené zdroje', exact: true }).click();
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
    await page.getByRole('link', { name: 'Náhled a ořez', exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/recording-studio\/[^/]+$/);
    const workspaceUrl = page.url();
    const workspace = page.getByRole('region', { name: 'Pracovní prostor záznamu' });
    await page.getByLabel('Název záznamu', { exact: true }).fill('Synchronized editing take');
    await page.getByLabel('Začátek (sekundy)', { exact: true }).fill('0.5');
    await page.getByLabel('Konec (sekundy)', { exact: true }).fill('2.5');
    await page.getByRole('slider', { name: 'Přehrávací hlava', exact: true }).press('ArrowRight');
    const preview = workspace.locator('video').first();
    await expect(preview).toHaveAttribute('data-source-id');
    await expect.poll(() => workspace.locator('video, audio').evaluateAll((elements) => elements.length === 5 && elements.every((element) => !(element as HTMLMediaElement).controls))).toBe(true);
    await expect.poll(() => preview.evaluate((video: HTMLVideoElement) => Math.abs(video.currentTime - 1))).toBeLessThan(0.1);
    await page.getByRole('button', { name: 'Přehrát vše', exact: true }).click();
    await expect.poll(() => preview.evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(1.5);
    await page.getByRole('button', { name: 'Pozastavit vše', exact: true }).click();
    await expect.poll(() => workspace.locator('video, audio').evaluateAll((elements) => elements.every((element) => (element as HTMLMediaElement).paused))).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('recording-studio-editor.png') });
    await expect(workspace.getByText('Uloženo', { exact: true }).first()).toBeVisible();
    await page.reload();
    expect(page.url()).toBe(workspaceUrl);
    await expect(page.getByLabel('Začátek (sekundy)', { exact: true })).toHaveValue('0.5');
    await expect(page.getByRole('heading', { name: 'Synchronized editing take', exact: true })).toBeVisible();
    const trimmedDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'ZIP s ořezem', exact: true }).click();
    const captureArchivePath = testInfo.outputPath('captured-preparation.zip');
    await (await trimmedDownload).saveAs(captureArchivePath);
    const files = await readArchive(captureArchivePath);
    const manifest = JSON.parse(new TextDecoder().decode(files.get('recording.json'))) as RecordingArchiveManifest;
    expect(manifest.schemaVersion).toBe(5);
    expect(manifest.editRecipe.preparedTimeZeroSessionSeconds).toBe(0.5);
    expect(manifest.trim).toEqual({ startSeconds: 0.5, endSeconds: 2.5 });
    expect(manifest.tracks).toHaveLength(5);
    expect(manifest.sourceConfiguration?.[0]).toMatchObject({ kind: 'camera', isAudioEnabled: true });
    expect(manifest.tracks.slice(0, 2).every((track) => track.kind === 'camera' && track.isAudioIncluded)).toBe(true);
    const firstCameraTrack = manifest.tracks[0];
    if (!firstCameraTrack.originalFile) throw new Error('Expected a camera original file.');
    const alignmentGaps = await inspectAudioVideoMarkers(page, originals.get(firstCameraTrack.originalFile)!);
    expect(alignmentGaps).toHaveLength(2);
    expect(alignmentGaps.every((window) => window.nearestGap !== null && window.nearestGap <= 0.15), JSON.stringify(alignmentGaps)).toBe(true);
    for (let index = 0; index < manifest.tracks.length; index += 1) {
        const track = manifest.tracks[index];
        if (!track.originalFile || !track.trimmedFile) throw new Error(`Expected original and trimmed files for every source: ${JSON.stringify(track)}`);
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
    await expect(page.getByRole('heading', { name: 'Místní záznam není dostupný' })).toBeVisible();
    await page.getByRole('link', { name: 'Studio · nastavení a záznamy' }).click();
    await expect(page.getByRole('button', { name: 'Připojit', exact: true })).toHaveCount(5);
    expect(await page.evaluate(() => (window as unknown as { studioTestMediaRequests: MediaStreamConstraints[] }).studioTestMediaRequests)).toEqual([]);
    await page.getByRole('button', { name: 'Nastavení', exact: true }).first().click();
    await expect(page.getByLabel('Nahrávat zvuk')).toBeChecked();
    await page.getByRole('dialog').getByRole('button', { name: 'Zavřít', exact: true }).click();
    expect(errors).toEqual([]);
});

test('keeps all three sources through monitor layouts, global pauses and an appended take', async ({ page, baseURL }, testInfo) => {
    await openStudio(page, baseURL);
    await addSource(page, 'camera');
    await addSource(page, 'screen');
    await addSource(page, 'microphone');
    await page.getByRole('button', { name: 'Nahrávat připravené zdroje', exact: true }).evaluate((button: HTMLButtonElement) => {
        button.click(); button.click();
    });
    await expect(page.getByRole('button', { name: 'Pozastavit všechny stopy', exact: true })).toBeEnabled();

    for (const layout of ['Jeden zdroj', 'Připnutý zdroj', 'Mřížka', 'Jeden zdroj', 'Připnutý zdroj'] as const) {
        await page.getByRole('button', { name: layout, exact: true }).click();
        await expect(page.getByText('3 z 3 zapnutých zdrojů', { exact: false })).toBeVisible();
    }
    await page.getByLabel('Hlavní zdroj monitoru').selectOption({ index: 1 });
    await page.getByRole('button', { name: 'Minimalizovat náhled' }).first().click();
    await page.getByRole('button', { name: 'Zapnout poslech' }).first().click();
    await page.getByRole('button', { name: 'Mřížka', exact: true }).click();
    await page.getByRole('button', { name: 'Zrcadlit náhled' }).click();
    await page.getByRole('button', { name: 'Skrýt dlaždici z monitoru' }).first().click();
    await page.getByRole('button', { name: 'Jeden zdroj', exact: true }).click();
    expect(await page.locator('main video, main audio').count()).toBe(3);

    const backgroundTab = await page.context().newPage();
    await backgroundTab.goto('about:blank');
    await backgroundTab.bringToFront();
    const backgroundVisibility = await page.evaluate(() => document.visibilityState);
    await page.waitForTimeout(1_200);
    await page.bringToFront();
    await backgroundTab.close();
    await expect(page.getByRole('button', { name: 'Pozastavit všechny stopy', exact: true })).toBeEnabled();
    await testInfo.attach('background-tab-visibility', { body: backgroundVisibility, contentType: 'text/plain' });

    for (let pauseIndex = 0; pauseIndex < 2; pauseIndex += 1) {
        await page.waitForTimeout(2_000);
        await page.getByRole('button', { name: 'Pozastavit všechny stopy', exact: true }).evaluate((button: HTMLButtonElement) => {
            button.click(); button.click();
        });
        await expect(page.getByRole('button', { name: 'Pokračovat ve všech stopách' })).toBeEnabled();
        const pausedClock = await page.getByLabel('Délka záznamu', { exact: true }).textContent();
        await page.waitForTimeout(1_250);
        expect(await page.getByLabel('Délka záznamu', { exact: true }).textContent()).toBe(pausedClock);
        await expect(page.locator('article:visible').getByText('Pauza · pouze živý náhled')).toBeVisible();
        await page.getByRole('button', { name: 'Pokračovat ve všech stopách' }).evaluate((button: HTMLButtonElement) => {
            button.click(); button.click();
        });
        await expect(page.getByRole('button', { name: 'Pozastavit všechny stopy', exact: true })).toBeEnabled();
    }
    await page.waitForTimeout(2_000);
    await page.getByRole('button', { name: 'Zastavit všechny stopy', exact: true }).click();
    await expect(page.getByText('Uloženo', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Náhled a ořez', exact: true })).toHaveCount(1);
    await page.getByRole('button', { name: 'Připnutý zdroj', exact: true }).click();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Připnutý zdroj', exact: true })).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('link', { name: 'Náhled a ořez', exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/recording-studio\/[^/]+$/);
    const workspaceUrl = page.url();
    await page.getByLabel('Začátek (sekundy)', { exact: true }).fill('0.2');
    await page.getByLabel('Konec (sekundy)', { exact: true }).fill('1');
    await page.getByRole('button', { name: 'Donahrát do tohoto projektu' }).click();
    await expect(page.getByRole('button', { name: 'Start · donahrát do projektu' })).toBeVisible();
    const reconnectButtons = page.getByLabel('Zdroje k připojení').getByRole('button');
    await page.evaluate(() => {
        (window as unknown as { studioTestSettings: { displayErrorName: string | null } }).studioTestSettings.displayErrorName = 'NotAllowedError';
    });
    await reconnectButtons.filter({ hasText: 'Sdílení obrazovky' }).click();
    await expect(reconnectButtons).toHaveCount(3);
    await expect(page.getByRole('button', { name: 'Start · donahrát do projektu' })).toBeDisabled();
    await page.evaluate(() => {
        (window as unknown as { studioTestSettings: { displayErrorName: string | null } }).studioTestSettings.displayErrorName = null;
    });
    while (await reconnectButtons.count() > 0) {
        const remaining = await reconnectButtons.count();
        await reconnectButtons.first().click();
        await expect(reconnectButtons).toHaveCount(remaining - 1);
    }
    await page.getByRole('button', { name: 'Start · donahrát do projektu' }).click();
    await expect(page.getByRole('button', { name: 'Zastavit všechny stopy', exact: true })).toBeEnabled();
    await page.waitForTimeout(2_000);
    await page.getByRole('button', { name: 'Zastavit všechny stopy', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Donahrát do tohoto projektu' })).toBeVisible();
    await expect(page.getByLabel('Začátek (sekundy)', { exact: true })).toHaveValue('0.2');
    await expect(page.getByLabel('Konec (sekundy)', { exact: true })).toHaveValue('1');
    await page.reload();
    expect(page.url()).toBe(workspaceUrl);
    await expect(page.getByLabel('Konec (sekundy)', { exact: true })).toHaveValue('1');

    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Originály ZIP', exact: true }).click();
    const archive = await readArchive((await (await download).path())!);
    const manifest = JSON.parse(new TextDecoder().decode(archive.get('recording.json'))) as RecordingArchiveManifest;
    expect(manifest.id).toBe(workspaceUrl.split('/').at(-1));
    expect(manifest.status).toBe('complete');
    expect(manifest.takes).toHaveLength(2);
    expect(manifest.trim).toEqual({ startSeconds: 0.2, endSeconds: 1 });
    expect(manifest.editRecipe.selection).toEqual(manifest.trim);
    expect(manifest.tracks).toHaveLength(3);
    expect(manifest.tracks.every((track) => track.parts?.length === 4 && track.parts.every((part) => part.byteLength > 0 && part.mediaBounds))).toBe(true);
    const appendStart = manifest.takes![1].sessionStartSeconds;
    const durationMeasurements: { sourceId: string; partId: string; mappedSeconds: number; encodedSeconds: number }[] = [];
    for (const track of manifest.tracks) {
        const parts = track.parts!;
        expect(Math.abs(parts[3].sessionStartSeconds - appendStart)).toBeLessThan(0.1);
        expect(parts.every((part, index) => index === 0 || part.sessionStartSeconds >= parts[index - 1].sessionStartSeconds + parts[index - 1].durationSeconds - 0.1)).toBe(true);
        for (const originalPart of manifest.tracks.find((source) => source.id === track.id)!.originalParts!) {
            const input = new Input({ formats: ALL_FORMATS, source: new BufferSource(archive.get(originalPart.file)!) });
            try {
                expect(await input.canRead()).toBe(true);
                const encodedSeconds = await input.computeDuration();
                durationMeasurements.push({ sourceId: track.id, partId: originalPart.partId,
                    mappedSeconds: originalPart.durationSeconds, encodedSeconds });
                // The persisted part boundary comes from this closed container, not the earlier Stop call.
                const mediaOriginSeconds = parts.find((part) => part.id === originalPart.partId)!.mediaBounds!.firstTimestampSeconds;
                expect(Math.abs(encodedSeconds - mediaOriginSeconds - originalPart.durationSeconds)).toBeLessThan(0.1);
            }
            finally { input.dispose(); }
        }
    }
    const cameraParts = manifest.tracks.find((track) => track.kind === 'camera')?.originalParts;
    expect(cameraParts).toHaveLength(4);
    for (const partIndex of [0, 3]) {
        const markerWindows = await inspectAudioVideoMarkers(page, archive.get(cameraParts![partIndex].file)!);
        expect(markerWindows.some((window) => window.nearestGap !== null && window.nearestGap <= 0.1), JSON.stringify(markerWindows)).toBe(true);
    }
    expect(archive.size).toBeGreaterThanOrEqual(14);
    const selectedStart = Math.max(...manifest.tracks.map((track) => track.parts![3].sessionStartSeconds)) + 0.2;
    const selectedEnd = Math.min(...manifest.tracks.map((track) => track.parts![3].sessionStartSeconds + track.parts![3].durationSeconds)) - 0.2;
    expect(selectedEnd - selectedStart).toBeGreaterThan(0.5);
    const audioSourceIds = manifest.tracks.filter((track) => track.isAudioIncluded).map((track) => track.id);
    await page.evaluate(async ({ recordingId, sourceIds, selectedStart, selectedEnd }) => {
        const database = await new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open('promptbook-recording-studio');
            request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
        });
        await new Promise<void>((resolve, reject) => {
            const transaction = database.transaction('recordings', 'readwrite');
            const store = transaction.objectStore('recordings');
            const read = store.get(recordingId);
            read.onsuccess = () => {
                const recording = read.result as import('@/lib/recording-studio/recordingStudioTypes').StudioRecording;
                const derivedTracks = sourceIds.flatMap((sourceId) => {
                    const source = recording.tracks.find((track) => track.id === sourceId)!;
                    const provenance = { sourceId, sourceLabel: source.label, mediaRevision: 'a'.repeat(64), createdAt: '2026-09-29T08:00:00.000Z',
                        language: 'cs' as const, processor: 'fixture', settings: { fixture: true } };
                    return [
                        { id: `subtitle-${sourceId}`, kind: 'subtitles', provenance, cues: [
                            { id: `start-${sourceId}`, startSeconds: selectedStart - 0.2, endSeconds: selectedStart + 0.3,
                                text: 'Přes začátek', isEnabled: true, origin: 'manual' },
                            { id: `end-${sourceId}`, startSeconds: selectedEnd - 0.3, endSeconds: selectedEnd + 0.2,
                                text: 'Přes konec', isEnabled: true, origin: 'manual' },
                        ] },
                        { id: `activity-${sourceId}`, kind: 'speech-activity', provenance: { ...provenance, language: null }, intervals: [
                            { id: `speech-${sourceId}`, type: 'speech', startSeconds: selectedStart - 0.2,
                                endSeconds: selectedStart + 0.3, origin: 'manual' },
                            { id: `silence-${sourceId}`, type: 'silence', startSeconds: selectedEnd - 0.3,
                                endSeconds: selectedEnd + 0.2, origin: 'manual' },
                        ] },
                    ];
                });
                store.put({ ...recording, derivedTracks });
            };
            transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error);
        });
        database.close();
    }, { recordingId: manifest.id, sourceIds: audioSourceIds, selectedStart, selectedEnd });
    await page.reload();
    await page.getByLabel('Začátek (sekundy)', { exact: true }).fill(String(selectedStart));
    await page.getByLabel('Konec (sekundy)', { exact: true }).fill(String(selectedEnd));
    const preparedDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'ZIP s ořezem', exact: true }).click();
    const preparedArchive = await readArchive((await (await preparedDownload).path())!);
    const preparedManifest = JSON.parse(new TextDecoder().decode(preparedArchive.get('recording.json'))) as RecordingArchiveManifest;
    expect(preparedManifest.editRecipe.preparedTimeZeroSessionSeconds).toBeCloseTo(selectedStart, 6);
    const preparedAudioSources = preparedManifest.tracks.filter((track) => track.trimmedFile && audioSourceIds.includes(track.id));
    expect(preparedAudioSources.length).toBeGreaterThan(0);
    for (const source of preparedAudioSources) {
        const sourceSidecars = preparedManifest.derivedTracks.filter((track) => track.provenance.sourceId === source.id);
        expect(sourceSidecars).toHaveLength(2);
        expect(sourceSidecars.every((track) => track.preparedFiles.every((filename) => preparedArchive.has(filename)))).toBe(true);
        const subtitleFile = sourceSidecars.find((track) => track.kind === 'subtitles')!.preparedFiles.find((filename) => filename.endsWith('.srt'))!;
        const subtitleText = new TextDecoder().decode(preparedArchive.get(subtitleFile));
        expect(subtitleText).toContain('00:00:00,000 --> 00:00:00,300');
        expect(subtitleText).toContain('Přes konec');
        const activityFile = sourceSidecars.find((track) => track.kind === 'speech-activity')!.preparedFiles.find((filename) => filename.endsWith('.json'))!;
        const activity = JSON.parse(new TextDecoder().decode(preparedArchive.get(activityFile))) as {
            coordinate: string; intervals: { type: string; startSeconds: number; endSeconds: number }[];
        };
        expect(activity.coordinate).toBe('prepared-export');
        const speech = activity.intervals.find((interval) => interval.type === 'speech');
        expect(speech?.startSeconds).toBe(0);
        expect(speech?.endSeconds).toBeCloseTo(0.3, 6);
        expect(activity.intervals.find((interval) => interval.type === 'silence')?.endSeconds).toBeCloseTo(selectedEnd - selectedStart, 6);
    }
    await testInfo.attach('studio-pause-append-durations', { body: JSON.stringify(durationMeasurements, null, 2), contentType: 'application/json' });
    await testInfo.attach('studio-pause-append-manifest', { body: JSON.stringify(manifest, null, 2), contentType: 'application/json' });
});

test('keeps a multi-source setup through stops, release, and reload without restoring capture', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    await addSource(page, 'camera');
    await addSource(page, 'microphone');
    await addSource(page, 'screen');
    await expect(page.getByRole('button', { name: 'Nahrávat připravené zdroje', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'Nahrávat připravené zdroje', exact: true }).click();
    await waitForRecordingSeconds(page, 2);
    await waitForCommittedRecordingSources(page, 3);
    await page.getByRole('button', { name: 'Zastavit všechny stopy', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Uložené záznamy' }).getByRole('article').first().getByText('Uloženo', { exact: true })).toBeVisible();
    await expect(page.getByText('Náhled aktivní', { exact: true })).toHaveCount(3);
    expect(await page.evaluate(() => (window as unknown as { studioTestDisplayRequests: DisplayMediaStreamOptions[] }).studioTestDisplayRequests)).toHaveLength(1);

    await page.getByRole('button', { name: 'Nahrávat připravené zdroje', exact: true }).click();
    await waitForRecordingSeconds(page, 2);
    await waitForCommittedRecordingSources(page, 3);
    await page.getByRole('button', { name: 'Zastavit všechny stopy', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Uložené záznamy' }).getByRole('article').first().getByText('Uloženo', { exact: true })).toBeVisible();
    await expect(page.getByText('Náhled aktivní', { exact: true })).toHaveCount(3);
    await expect(page.getByRole('button', { name: 'Odebrat zdroj', exact: true })).toHaveCount(3);

    await page.getByRole('button', { name: 'Uvolnit všechna zařízení', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Připojit', exact: true })).toHaveCount(3);
    await expect.poll(() => page.evaluate(() => (window as unknown as { studioTestStreams: MediaStream[] }).studioTestStreams.every((stream) => stream.getTracks().every((track) => track.readyState === 'ended')))).toBe(true);
    await page.reload();
    await expect(page.getByRole('button', { name: 'Připojit', exact: true })).toHaveCount(3);
    expect(await page.evaluate(() => (window as unknown as { studioTestMediaRequests: MediaStreamConstraints[]; studioTestDisplayRequests: DisplayMediaStreamOptions[] }).studioTestMediaRequests.length + (window as unknown as { studioTestDisplayRequests: DisplayMediaStreamOptions[] }).studioTestDisplayRequests.length)).toBe(0);

    await page.getByRole('button', { name: 'Resetovat nastavení zdrojů', exact: true }).click();
    await page.getByRole('button', { name: 'Resetovat zdroje', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Odebrat zdroj', exact: true })).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('button', { name: 'Odebrat zdroj', exact: true })).toHaveCount(0);
});

test('blocks Start when a live camera preview loses its required microphone input', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    await addSource(page, 'camera');
    const startButton = page.getByRole('button', { name: 'Nahrávat připravené zdroje', exact: true });
    await expect(startButton).toBeEnabled();
    await page.evaluate(() => {
        const audioTrack = (window as unknown as { studioTestStreams: MediaStream[] }).studioTestStreams[0].getAudioTracks()[0];
        Object.defineProperty(audioTrack, 'muted', { configurable: true, value: true });
        audioTrack.dispatchEvent(new Event('mute'));
    });
    await expect(startButton).toBeDisabled();
    await expect(page.getByRole('alert').filter({ hasText: 'dočasně neposílá zvuk' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Zkusit znovu', exact: true })).toBeVisible();
    await page.evaluate(() => {
        const audioTrack = (window as unknown as { studioTestStreams: MediaStream[] }).studioTestStreams[0].getAudioTracks()[0];
        Object.defineProperty(audioTrack, 'muted', { configurable: true, value: false });
        audioTrack.dispatchEvent(new Event('unmute'));
    });
    await expect(startButton).toBeEnabled();
});

test('shows a muted display source as temporarily unavailable and requests reconnection', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    await addSource(page, 'screen');
    const startButton = page.getByRole('button', { name: 'Nahrávat připravené zdroje', exact: true });
    await expect(startButton).toBeEnabled();
    await expect(page.getByText('macOS Spaces: okno může v prohlížeči chybět nebo přestat posílat obraz')).toBeVisible();
    await page.evaluate(() => {
        const videoTrack = (window as unknown as { studioTestStreams: MediaStream[] }).studioTestStreams[0].getVideoTracks()[0];
        Object.defineProperty(videoTrack, 'muted', { configurable: true, value: true });
        videoTrack.dispatchEvent(new Event('mute'));
    });
    await expect(startButton).toBeDisabled();
    await expect(page.getByRole('alert').filter({ hasText: 'dočasně neposílá' }).last()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Zkusit znovu', exact: true })).toBeVisible();
    await page.evaluate(() => {
        const videoTrack = (window as unknown as { studioTestStreams: MediaStream[] }).studioTestStreams[0].getVideoTracks()[0];
        Object.defineProperty(videoTrack, 'muted', { configurable: true, value: false });
        videoTrack.dispatchEvent(new Event('unmute'));
    });
    await expect(startButton).toBeEnabled();
});

test('reports a display track that is already muted when selection returns', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    await page.evaluate(() => {
        (window as unknown as { studioTestSettings: { displayInitiallyMuted: boolean } }).studioTestSettings.displayInitiallyMuted = true;
    });
    await addSource(page, 'screen');

    await expect(page.getByRole('button', { name: 'Nahrávat připravené zdroje', exact: true })).toBeDisabled();
    await expect(page.getByRole('alert').filter({ hasText: 'dočasně neposílá obraz' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Zkusit znovu', exact: true })).toBeVisible();
});

test('keeps the Space guidance available when reusing a historic screen-source configuration', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    await addSource(page, 'screen');
    await page.getByRole('button', { name: 'Nahrávat připravené zdroje', exact: true }).click();
    await expect(page.getByLabel('Délka záznamu', { exact: true })).toHaveText('00:00:02');
    await page.getByRole('button', { name: 'Zastavit všechny stopy', exact: true }).click();
    await expect(page.getByText('Uloženo', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Uvolnit všechna zařízení', exact: true }).click();

    await page.getByRole('button', { name: 'Použít tuto konfiguraci zdrojů', exact: true }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Sdílenou obrazovku nebo okno vyberte znovu' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Připojit', exact: true })).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { studioTestDisplayRequests: DisplayMediaStreamOptions[] }).studioTestDisplayRequests)).toHaveLength(1);
    const historicScreenHelp = page.getByText('macOS Spaces: okno může v prohlížeči chybět nebo přestat posílat obraz', { exact: true });
    await expect(historicScreenHelp).toBeVisible();
    await historicScreenHelp.click();
    await expect(page.getByRole('link', { name: 'Otevřít základní test výběru a průběžného obrazu' })).toBeVisible();
});

test('restores source preferences after closing and reopening the same browser profile', async ({ browser, baseURL }, testInfo) => {
    test.skip(!process.env.ADMIN_PASSWORD, 'Needs the local test server admin password.');
    const temporaryRoot = resolve(tmpdir());
    const profileDirectory = await mkdtemp(join(temporaryRoot, 'promptbook-recording-studio-profile-'));
    const resolvedProfileDirectory = resolve(profileDirectory);
    if (!resolvedProfileDirectory.startsWith(`${temporaryRoot}${sep}`)) {
        throw new Error('The temporary browser profile is outside the system temporary directory.');
    }
    const launchProfile = () => browser.browserType().launchPersistentContext(resolvedProfileDirectory, {
        channel: process.env.E2E_BROWSER_CHANNEL || undefined,
        headless: true,
        recordVideo: { dir: testInfo.outputPath('profile-visits') },
    });
    let context: Awaited<ReturnType<typeof launchProfile>> | null = null;

    try {
        context = await launchProfile();
        let page = await context.newPage();
        await openStudio(page, baseURL);
        await addSource(page, 'camera');
        await addSource(page, 'microphone');
        await addSource(page, 'screen');
        const savedSourceIds = await page.evaluate(() => JSON.parse(localStorage.getItem('promptbook.recording-studio.source-configurations') ?? 'null') as {
            configurations: { id: string; kind: string; isAudioEnabled: boolean; isCaptureEnabled: boolean }[];
        });
        expect(savedSourceIds.configurations.map(({ kind }) => kind)).toEqual(['camera', 'microphone', 'screen']);
        expect(savedSourceIds.configurations.every(({ isCaptureEnabled }) => isCaptureEnabled)).toBe(true);
        expect(savedSourceIds.configurations[0].isAudioEnabled).toBe(true);
        await page.getByRole('button', { name: 'Nahrávat připravené zdroje', exact: true }).click();
        await expect(page.getByLabel('Délka záznamu', { exact: true })).toHaveText('00:00:02');
        await page.getByRole('button', { name: 'Zastavit všechny stopy', exact: true }).click();
        await expect(page.getByText('Uloženo', { exact: true })).toBeVisible();
        await context.close();
        context = null;

        context = await launchProfile();
        page = await context.newPage();
        await openStudio(page, baseURL);
        await expect(page.getByRole('button', { name: 'Připojit', exact: true })).toHaveCount(3);
        expect(await page.evaluate(() => (window as unknown as { studioTestMediaRequests: MediaStreamConstraints[]; studioTestDisplayRequests: DisplayMediaStreamOptions[] }).studioTestMediaRequests.length + (window as unknown as { studioTestDisplayRequests: DisplayMediaStreamOptions[] }).studioTestDisplayRequests.length)).toBe(0);
        const restoredConfigurations = await page.evaluate(() => JSON.parse(localStorage.getItem('promptbook.recording-studio.source-configurations') ?? 'null') as {
            configurations: { id: string; kind: string; isAudioEnabled: boolean; isCaptureEnabled: boolean }[];
        });
        expect(restoredConfigurations.configurations).toEqual(savedSourceIds.configurations);
        const restoredScreenHelp = page.getByText('macOS Spaces: okno může v prohlížeči chybět nebo přestat posílat obraz', { exact: true });
        await expect(restoredScreenHelp).toBeVisible();
        await restoredScreenHelp.click();
        await expect(page.getByRole('link', { name: 'Otevřít základní test výběru a průběžného obrazu' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Nahrávat připravené zdroje', exact: true })).toBeDisabled();
    } finally {
        await context?.close();
        await rm(resolvedProfileDirectory, { recursive: true, force: true });
    }
});

test('retains a cancelled display-selection intent and retries it only from a new user action', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    await page.evaluate(() => {
        (window as unknown as { studioTestSettings: { displayErrorName: string | null } }).studioTestSettings.displayErrorName = 'AbortError';
    });
    await page.getByRole('button', { name: 'Přidat zdroj', exact: true }).click();
    await page.getByLabel('Název zdroje').fill('Presentation window');
    await page.getByRole('combobox', { name: 'Typ zdroje' }).selectOption('screen');
    await page.getByLabel('Preferovaný typ sdílené plochy').selectOption('window');
    await page.getByRole('button', { name: 'Připojit zdroj', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Výběr sdílené plochy byl zrušen');
    const savedConfiguration = await page.evaluate(() => JSON.parse(localStorage.getItem('promptbook.recording-studio.source-configurations') ?? 'null') as {
        configurations: { id: string; kind: string; label: string; displaySurface: string | null; isCaptureEnabled: boolean }[];
    });
    expect(savedConfiguration.configurations[0]).toMatchObject({
        id: expect.any(String), kind: 'screen', label: 'Presentation window', displaySurface: 'window', isCaptureEnabled: true,
    });
    expect(await page.evaluate(() => (window as unknown as { studioTestDisplayRequests: DisplayMediaStreamOptions[] }).studioTestDisplayRequests)).toHaveLength(1);

    await page.evaluate(() => {
        (window as unknown as { studioTestSettings: { displayErrorName: string | null } }).studioTestSettings.displayErrorName = null;
    });
    await page.getByRole('button', { name: 'Zkusit znovu', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByText('Presentation window', { exact: true })).toBeVisible();
    const displayRequests = await page.evaluate(() => (window as unknown as { studioTestDisplayRequests: DisplayMediaStreamOptions[] }).studioTestDisplayRequests);
    expect(displayRequests).toHaveLength(2);
    expect(displayRequests.every((request) => request.audio === true)).toBe(true);
    const displaySurfaceHintSupport = await page.evaluate(() => navigator.mediaDevices.getSupportedConstraints().displaySurface === true);
    if (displaySurfaceHintSupport) expect((displayRequests[1].video as MediaTrackConstraints).displaySurface).toBe('window');
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
    await expect(page.getByLabel('Typ zdroje')).toBeDisabled();
    await expect(page.getByLabel('Typ zdroje')).toHaveValue('camera');
    await expect(page.getByLabel('Nahrávat zvuk')).not.toBeChecked();
    await page.getByRole('dialog').getByRole('button', { name: 'Zavřít', exact: true }).click();
});

test('stops the whole take on disconnect and prevents a second tab from changing it', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    await addSource(page, 'camera');
    await addSource(page, 'screen');
    await page.getByRole('button', { name: 'Nahrávat připravené zdroje', exact: true }).click();
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
    await page.getByRole('button', { name: 'Nahrávat připravené zdroje', exact: true }).click();
    await waitForRecordingSeconds(page, 3);
    const dialogPromise = page.waitForEvent('dialog');
    const reload = page.evaluate(() => window.location.reload());
    const dialog = await dialogPromise;
    expect(dialog.type()).toBe('beforeunload');
    await dialog.accept();
    await reload.catch(() => undefined);
    await expect(page.getByText('Přerušený záznam', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Originály ZIP', exact: true })).toBeEnabled();
    await connectPendingSources(page);
    await page.getByRole('button', { name: 'Nahrávat připravené zdroje', exact: true }).click();
    await waitForRecordingSeconds(page, 2);
    await waitForCommittedRecordingSources(page, 2);
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
    await page.getByRole('button', { name: 'Nahrávat připravené zdroje', exact: true }).click();
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
    await page.getByRole('button', { name: 'Nahrávat připravené zdroje', exact: true }).click();
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
    await page.getByRole('button', { name: 'Nahrávat připravené zdroje', exact: true }).click();
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
    const firstOriginal = Array.from(files.keys()).find((name) => name.startsWith('originals/01-camera'));
    expect(firstOriginal).toBeDefined();
    expect(await readFile((await (await recoveredDownload).path())!)).toEqual(Buffer.from(files.get(firstOriginal!)!));
});

test('keeps committed multi-source data after a real IndexedDB transaction abort and offers recovery', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    await addSource(page, 'camera'); await addSource(page, 'screen');
    await page.getByRole('button', { name: 'Nahrávat připravené zdroje', exact: true }).click();
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

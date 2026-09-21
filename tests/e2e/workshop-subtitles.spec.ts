import { expect, test, type Page } from '@playwright/test';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { createAdminSessionValueOrNull } from '@/lib/admin/adminSession';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { WorkshopAdminSnapshot } from '@/lib/workshops/workshopTypes';
import type { WorkshopSubtitleTrack } from '@/lib/workshops/subtitles/workshopSubtitleTypes';

const ROOM_ID = '11111111-1111-4111-8111-111111111111';
const VIDEO_ID = 'dQw4w9WgXcQ';
const SUBTITLE_TEXT = 'WEBVTT\n\n00:00:02.000 --> 00:00:05.000\nVítejte. Let’s write code.';
const SNAPSHOT: WorkshopAdminSnapshot = {
    workshop: { id: ROOM_ID, kind: 'workshop', event: DEFAULT_EVENT_DETAILS, slug: 'subtitle-test', title: 'Subtitle test workshop',
        description: '', startsAt: '2026-01-01T12:00:00Z', endsAt: '2026-01-01T13:00:00Z', youtubeVideoId: VIDEO_ID,
        recordingStartOffsetSeconds: 60, previewYoutubeVideoId: null, presentationUrl: null, repository: null,
        isPublished: true, allowedReactions: ['👏'], disabledPanels: [], createdAt: '2026-01-01T12:00:00Z', updatedAt: '2026-01-01T12:00:00Z' },
    contentBlocks: [], polls: [], attachedPolls: [], comments: [], pinnedComment: null, stageComment: null,
    participants: [], participantCount: 0, commentCount: 0, reactionCount: 0, artificialReactionCount: 0,
};

async function installSubtitleFixture(page: Page, baseURL: string) {
    test.skip(!process.env.ADMIN_PASSWORD, 'This admin UI test needs the local test admin password.');
    const session = createAdminSessionValueOrNull();
    await page.context().addCookies([{ name: ADMIN_SESSION_COOKIE_NAME, value: session!, url: baseURL, httpOnly: true, sameSite: 'Lax' }]);
    let tracks: WorkshopSubtitleTrack[] = [];
    let transcriptionCount = 0;
    const audioRequestSizes: number[] = [];
    await page.route('**/api/admin/workshops**', async (route) => {
        const request = route.request();
        const pathname = new URL(request.url()).pathname;
        if (pathname.endsWith('/subtitles/youtube')) {
            if (request.postDataJSON().language === 'en') {
                await route.fulfill({ status: 502, json: { error: 'YouTube neposkytl titulky ve vybraném jazyce.' } });
            } else {
                await route.fulfill({ json: { cues: [{ startSeconds: 2, endSeconds: 5, text: 'Titulky z YouTube.' }], sourceYoutubeVideoId: VIDEO_ID } });
            }
        } else if (pathname.endsWith('/subtitles/transcribe')) {
            transcriptionCount++;
            audioRequestSizes.push(request.postDataBuffer()!.byteLength);
            await route.fulfill({ json: { cues: [{ startSeconds: 0.25, endSeconds: 1.5, text: `Část ${transcriptionCount}. English speech.` }] } });
        } else if (pathname.endsWith('/subtitles')) {
            if (request.method() === 'POST') {
                const track = { ...request.postDataJSON(), id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
                tracks.push(track);
                await route.fulfill({ status: 201, json: { track } });
            } else { await route.fulfill({ json: { tracks, isTranscriptionConfigured: true } }); }
        } else if (pathname.includes('/subtitles/')) {
            const trackId = pathname.split('/').pop();
            if (request.method() === 'DELETE') {
                tracks = tracks.filter((track) => track.id !== trackId);
                await route.fulfill({ json: { isDeleted: true } });
            } else {
                tracks = tracks.map((track) => track.id === trackId ? { ...track, ...request.postDataJSON() } : track);
                await route.fulfill({ json: { track: tracks.find((track) => track.id === trackId) } });
            }
        } else if (pathname === '/api/admin/workshops') {
            await route.fulfill({ json: { workshops: [{ ...SNAPSHOT.workshop, participantCount: 0, registeredParticipantCount: 0 }] } });
        } else if (pathname.endsWith(ROOM_ID)) { await route.fulfill({ json: SNAPSHOT }); }
        else { await route.fulfill({ status: 404, json: { error: 'No fixture for this endpoint' } }); }
    });
    return { readTracks: () => tracks, audioRequestSizes };
}

test('imports, autosaves, reloads and downloads private subtitles through the shared admin editor', async ({ page, baseURL }) => {
    const fixture = await installSubtitleFixture(page, baseURL!);
    await page.goto('/admin/workshops?tab=subtitles');
    await expect(page.getByRole('heading', { name: 'Titulky videa' })).toBeVisible();
    await page.getByRole('button', { name: 'Přidat titulky', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Načíst titulky z YouTube' }).click();
    await expect(dialog.getByLabel('Text titulků (SRT / WebVTT)')).toContainText('Titulky z YouTube.');
    expect(fixture.readTracks()).toHaveLength(0);
    await dialog.getByLabel('Jazyk titulků').selectOption('en');
    await dialog.getByRole('button', { name: 'Načíst titulky z YouTube' }).click();
    await expect(dialog.getByRole('alert')).toContainText('YouTube neposkytl');
    await dialog.getByLabel('Importovat SRT nebo WebVTT').setInputFiles({ name: 'workshop.vtt', mimeType: 'text/vtt', buffer: Buffer.from(SUBTITLE_TEXT) });
    await expect(dialog.getByLabel('Text titulků (SRT / WebVTT)')).toContainText('Vítejte.');
    await dialog.getByRole('button', { name: 'Přidat titulky', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await page.getByRole('button', { name: 'Upravit titulky' }).click();
    await dialog.getByLabel('Text titulků (SRT / WebVTT)').fill('Invalid draft');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Text titulků (SRT / WebVTT)').fill(SUBTITLE_TEXT.replace('Vítejte.', 'Opravené titulky.'));
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'English', exact: true })).toBeVisible();
    await expect(page.getByText('Opravené titulky. Let’s write code.', { exact: true })).toBeVisible();
    await page.screenshot({ path: 'tests/e2e/.artifacts/subtitles-list.png', fullPage: true });
    expect(fixture.readTracks()[0]!.cues[0]!.startSeconds).toBe(2);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Stáhnout SRT' }).click();
    expect((await downloadPromise).suggestedFilename()).toBe('subtitle-test-en.srt');
});

function createRecordingWav(durationSeconds: number): Buffer {
    const sampleRate = 16_000;
    const dataLength = durationSeconds * sampleRate * 2;
    const buffer = Buffer.alloc(44 + dataLength);
    buffer.write('RIFF', 0); buffer.writeUInt32LE(dataLength + 36, 4); buffer.write('WAVEfmt ', 8);
    buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22);
    buffer.writeUInt32LE(sampleRate, 24); buffer.writeUInt32LE(sampleRate * 2, 28); buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34);
    buffer.write('data', 36); buffer.writeUInt32LE(dataLength, 40);
    return buffer;
}

test('decodes a long recording into bounded audio chunks and preserves multilingual timestamps', async ({ page, baseURL }) => {
    const fixture = await installSubtitleFixture(page, baseURL!);
    await page.goto('/admin/workshops?tab=subtitles');
    await page.getByRole('button', { name: 'Přidat titulky', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Jazyk titulků').selectOption('mul');
    await dialog.getByLabel('Video nebo zvuková nahrávka').setInputFiles({ name: 'long-recording.wav', mimeType: 'audio/wav', buffer: createRecordingWav(92) });
    await dialog.getByRole('button', { name: 'Vygenerovat titulky z nahrávky' }).click();
    await expect(dialog.getByLabel('Text titulků (SRT / WebVTT)')).toContainText('Část 2. English speech.');
    await expect(dialog.getByLabel('Text titulků (SRT / WebVTT)')).toContainText('00:01:30.250 --> 00:01:31.500');
    await page.screenshot({ path: 'tests/e2e/.artifacts/subtitles-editor.png', fullPage: true });
    expect(fixture.audioRequestSizes).toHaveLength(2);
    expect(fixture.audioRequestSizes.every((size) => size < 3_020_000)).toBe(true);
    expect(fixture.readTracks()).toHaveLength(0);
    await dialog.getByRole('button', { name: 'Přidat titulky', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Čeština a angličtina', exact: true })).toBeVisible();
    expect(fixture.readTracks()[0]!.cues.map((cue) => cue.startSeconds)).toEqual([0.25, 90.25]);
});

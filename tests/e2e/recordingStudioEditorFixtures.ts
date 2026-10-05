import type { Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RecordingTrack, StudioRecording } from '@/lib/recording-studio/recordingStudioTypes';

export const EDITOR_FIXTURE_ID = 'synchronized-fixture';
export const EDITOR_FIXTURE_PATH = `/admin/recording-studio/${EDITOR_FIXTURE_ID}`;
const FIXTURE_SOURCES = [
    { name: 'screen', kind: 'screen', offset: 0, frameRate: 25, isAudioIncluded: false },
    { name: 'camera', kind: 'camera', offset: 0.37, frameRate: 30, isAudioIncluded: true },
    { name: 'microphone', kind: 'microphone', offset: 0.71, frameRate: null, isAudioIncluded: true },
] as const;

type RecordingEditorFixtureOptions = {
    readonly isLongSession?: boolean;
    readonly isVariableFrameRate?: boolean;
    readonly isAppendedSession?: boolean;
};

/**
 * Writes the fixture recording and its media into the studio database the page already has
 *
 * Note: Imported legacy metadata and real FFmpeg-generated files; the production storage/decoders remain real.
 *       Nothing is opened here, so a test can also store the fixture before the studio first reads its database.
 */
export async function storeRecordingEditorFixture(page: Page, { isLongSession = false, isVariableFrameRate = false,
    isAppendedSession = false }: RecordingEditorFixtureOptions = {}) {
    const files = await Promise.all(FIXTURE_SOURCES.map(async (source) => {
        const isVariableCamera = isVariableFrameRate && source.kind === 'camera';
        return {
            ...source, isVariableCamera, offset: isVariableCamera ? 0.00019999980926513672 : source.offset,
            bytes: await readFile(join(process.cwd(), 'tests/e2e/fixtures/recording-studio', `${isVariableCamera ? 'camera-variable' : source.name}.webm`)),
        };
    }));
    const tracks: RecordingTrack[] = files.map((source) => ({
        id: source.name, kind: source.kind, label: `Fixture ${source.name}`, mimeType: source.kind === 'microphone' ? 'audio/webm' : 'video/webm',
        byteLength: source.bytes.length * (isAppendedSession ? 2 : 1), chunkCount: isAppendedSession ? 2 : 1,
        startOffsetSeconds: source.offset, durationSeconds: isAppendedSession ? 16 - source.offset : source.isVariableCamera ? 5.00460000038147 : 8 - source.offset,
        width: source.kind === 'microphone' ? null : source.isVariableCamera ? 320 : 160, height: source.kind === 'microphone' ? null : source.isVariableCamera ? 180 : 90, frameRate: source.frameRate,
        isAudioIncluded: source.isAudioIncluded,
        ...(isAppendedSession ? { parts: [0, 8].map((sessionStartSeconds, index) => ({
            id: `${source.name}-part-${index + 1}`, takeId: `take-${index + 1}`,
            sessionStartSeconds: sessionStartSeconds + source.offset, durationSeconds: 8 - source.offset,
            byteLength: source.bytes.length, chunkCount: 1,
            mimeType: source.kind === 'microphone' ? 'audio/webm' : 'video/webm', isAudioIncluded: source.isAudioIncluded,
        })) } : {}),
        ...(isLongSession ? { segments: [
            { sourceStartSeconds: 0, sessionStartSeconds: source.offset, durationSeconds: 4 - source.offset },
            { sourceStartSeconds: 4 - source.offset, sessionStartSeconds: 35_990, durationSeconds: 4 },
        ] } : {}),
    }));
    const recording: StudioRecording = {
        id: EDITOR_FIXTURE_ID, title: 'Known timecode and clap', createdAt: '2026-09-28T08:00:00.000Z',
        status: 'complete', durationSeconds: isLongSession ? 36_000 : isAppendedSession ? 16 : 8,
        captureEndSeconds: isLongSession ? 36_000 : isAppendedSession ? 16 : 8,
        takes: isAppendedSession ? [
            { id: 'take-1', startedAt: '2026-09-28T08:00:00.000Z', sessionStartSeconds: 0, durationSeconds: 8,
                sourceIds: tracks.map((track) => track.id) },
            { id: 'take-2', startedAt: '2026-09-28T08:20:00.000Z', sessionStartSeconds: 8, durationSeconds: 8,
                sourceIds: tracks.map((track) => track.id) },
        ] : undefined,
        tracks, trim: isAppendedSession ? { startSeconds: 9.25, endSeconds: 14.25 } :
            isVariableFrameRate ? { startSeconds: 0.5, endSeconds: 2.5 } : { startSeconds: 1.25, endSeconds: 6.25 }, errorMessage: null,
    };
    await page.evaluate(async ({ recording, encoded }) => {
        const database = await new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open('promptbook-recording-studio');
            request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
        });
        await new Promise<void>((resolve, reject) => {
            const transaction = database.transaction(['recordings', 'chunks'], 'readwrite');
            transaction.objectStore('recordings').put(recording);
            encoded.forEach((data, index) => {
                const track = recording.tracks[index];
                const storageIds = track.parts?.map((part) => part.id) ?? [track.id];
                storageIds.forEach((trackId) => transaction.objectStore('chunks').put({
                    recordingId: recording.id, trackId, sequence: 0,
                    data: new Blob([Uint8Array.from(atob(data), (character) => character.charCodeAt(0))], { type: track.mimeType }),
                }));
            });
            transaction.oncomplete = () => resolve(); transaction.onabort = () => reject(transaction.error);
        });
        database.close();
    }, { recording, encoded: files.map((source) => source.bytes.toString('base64')) });
    return recording;
}

/** Stores the fixture recording and opens its workspace. */
export async function seedRecordingEditorFixture(page: Page, options: RecordingEditorFixtureOptions = {}) {
    const recording = await storeRecordingEditorFixture(page, options);
    await page.goto(EDITOR_FIXTURE_PATH);
    return recording;
}

/** Read the rendered binary timecode, not the media element's claimed currentTime. */
export async function readEditorFrameTimecodes(page: Page) {
    return page.getByRole('region', { name: 'Pracovní prostor záznamu' }).locator('video').evaluateAll((elements) => elements.map((element) => {
        const video = element as HTMLVideoElement;
        const canvas = document.createElement('canvas'); canvas.width = 160; canvas.height = 90;
        const context = canvas.getContext('2d')!; context.drawImage(video, 0, 0, 160, 90);
        let ticks = 0;
        for (let bit = 0; bit < 12; bit++) if (context.getImageData(13 + bit * 12, 20, 1, 1).data[0] > 128) ticks += 1 << bit;
        return { id: video.dataset.sourceId, seconds: ticks / 100, currentTime: video.currentTime };
    }));
}

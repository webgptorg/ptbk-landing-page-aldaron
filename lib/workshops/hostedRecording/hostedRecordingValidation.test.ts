import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
const STORAGE = vi.hoisted(() => ({ read: vi.fn(), probe: vi.fn() }));
vi.mock('./hostedRecordingStorage', () => ({
    readHostedRecordingSmallObject: STORAGE.read,
    probeHostedRecordingMedia: STORAGE.probe,
}));

import { validateHostedRecordingAssets, type HostedRecordingAssetRow } from './hostedRecordingValidation';

const LIVE_START_AT = '2026-09-29T10:00:00.000Z';
const MANIFEST = {
    schemaVersion: 5, timeUnit: 'seconds', id: 'studio-recording', createdAt: LIVE_START_AT,
    durationSeconds: 60, editRecipe: { schemaVersion: 1, timeUnit: 'seconds',
        selection: { startSeconds: 0, endSeconds: 60 }, preparedTimeZeroSessionSeconds: 0 },
    takes: [{ startedAt: LIVE_START_AT, sessionStartSeconds: 0, durationSeconds: 60 }],
    tracks: [{ id: 'screen-one', kind: 'screen', trimmedFile: 'prepared/editor.webm',
        preparation: { status: 'prepared', preparedTimeZeroSessionSeconds: 0,
            firstTimestampSeconds: 0, endTimestampSeconds: 60,
            components: [{ kind: 'video', firstTimestampSeconds: 0, endTimestampSeconds: 60 },
                { kind: 'audio', firstTimestampSeconds: 0, endTimestampSeconds: 60 }] } }],
    workshopMetadata: null,
};

function createAsset(role: HostedRecordingAssetRow['role'], key: string, filename: string): HostedRecordingAssetRow {
    return { id: key, revision_id: 'revision-one', role, source_id: null, filename,
        content_type: role === 'editor' ? 'video/webm' : 'application/json',
        byte_length: role === 'editor' ? 12_000_000 : 1000, object_key: key, upload_id: 'upload-one',
        status: 'complete', measured_duration_seconds: null };
}

const MANIFEST_ASSET = createAsset('manifest', 'manifest', 'studio.json');
const EDITOR_ASSET = createAsset('editor', 'editor', 'editor.webm');

describe('hosted recording publication validation', () => {
    beforeEach(() => {
        STORAGE.read.mockReset().mockImplementation(async () => new TextEncoder().encode(JSON.stringify(MANIFEST)));
        STORAGE.probe.mockReset().mockResolvedValue({ durationSeconds: 60, firstTimestampSeconds: 0,
            mimeType: 'video/webm', videoCodec: 'vp8', audioCodec: 'opus' });
    });

    it('accepts independent prepared media matched by the basename in an exported manifest', async () => {
        const result = await validateHostedRecordingAssets([MANIFEST_ASSET, EDITOR_ASSET], LIVE_START_AT);
        expect(result.report.isValid).toBe(true);
        expect(result.playerMetadata?.tracks).toEqual([{ role: 'editor', contentType: 'video/webm', hasAudio: true }]);
        expect(result.report.warnings).toContain('application track is absent; its player tab is disabled.');
    });

    it('rejects a media track with a different prepared duration', async () => {
        STORAGE.probe.mockResolvedValueOnce({ durationSeconds: 58, firstTimestampSeconds: 0,
            mimeType: 'video/webm', videoCodec: 'vp8', audioCodec: 'opus' });
        const result = await validateHostedRecordingAssets([MANIFEST_ASSET, EDITOR_ASSET], LIVE_START_AT);
        expect(result.report.isValid).toBe(false);
        expect(result.report.errors.join(' ')).toMatch(/duration differs materially/);
    });

    it('rejects malformed optional sidecars before a revision is publishable', async () => {
        STORAGE.read.mockImplementation(async (key: string) => new TextEncoder().encode(JSON.stringify(
            key === 'events' ? { schemaVersion: 1, coordinate: 'prepared-export', timeUnit: 'seconds',
                events: [{ seconds: 70 }] } : MANIFEST)));
        const result = await validateHostedRecordingAssets([MANIFEST_ASSET, EDITOR_ASSET,
            createAsset('events', 'events', 'events.json')], LIVE_START_AT);
        expect(result.report.isValid).toBe(false);
        expect(result.report.errors.join(' ')).toMatch(/outside the export/);
    });

    it('keeps paused wall time outside the live session clock', async () => {
        STORAGE.read.mockResolvedValue(new TextEncoder().encode(JSON.stringify({ ...MANIFEST,
            takes: [
                { startedAt: LIVE_START_AT, sessionStartSeconds: 0, durationSeconds: 30 },
                { startedAt: '2026-09-29T10:01:00.000Z', sessionStartSeconds: 30,
                    durationSeconds: 30 },
            ],
        })));
        const result = await validateHostedRecordingAssets([MANIFEST_ASSET, EDITOR_ASSET], LIVE_START_AT);
        expect(result.report.isValid).toBe(true);
        expect(result.playerMetadata?.liveSegments).toEqual([
            { startSeconds: 0, endSeconds: 30, startsAt: LIVE_START_AT },
            { startSeconds: 30, endSeconds: 60, startsAt: '2026-09-29T10:01:00.000Z' },
        ]);
    });

    it('rejects a subtitle sidecar without its video track', async () => {
        const subtitle = { ...createAsset('subtitle-camera', 'subtitle', 'camera.srt'),
            content_type: 'application/x-subrip' };
        const result = await validateHostedRecordingAssets([MANIFEST_ASSET, EDITOR_ASSET, subtitle], LIVE_START_AT);
        expect(result.report.isValid).toBe(false);
        expect(result.report.errors.join(' ')).toMatch(/subtitle has no matching video track/);
    });
});

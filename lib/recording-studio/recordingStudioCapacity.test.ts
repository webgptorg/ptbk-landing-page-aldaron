import { afterEach, describe, expect, it, vi } from 'vitest';
import { estimateRecordingStorage, getRecordingStorageErrorMessage, hasPredictableRecordingHeadroom, isRecordingEstimateFresh, isRecordingOriginStorageLow, readRecordingPersistence, requestRecordingPersistence } from './recordingStudioCapacity';
import { addRecordingBytes, formatRecordingBytes, getConfiguredRecordingBytesPerSecond, getRecordingMissingRanges, RecordingBitrateMeter } from './recordingStudioTiming';
import { createTestStudioRecording } from './recordingStudioTestUtilities';
import type { RecordingSource } from './recordingStudioTypes';

describe('honest storage measurements', () => {
    afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

    it('preserves constant usage-plus-10-GiB estimates while actual recording bytes grow', async () => {
        for (const usage of [0, 4 * 1024 ** 3, 12 * 1024 ** 3]) {
            const estimate = await estimateRecordingStorage({ estimate: async () => ({ usage, quota: usage + 10 * 1024 ** 3 }) });
            expect(estimate.headroomBytes).toBe(10 * 1024 ** 3);
            expect(estimate.usageBytes).toBe(usage);
            expect(hasPredictableRecordingHeadroom(estimate)).toBe(true);
            expect(isRecordingOriginStorageLow(estimate)).toBe(false);
        }
    });

    it('refreshes changing usage, recognizes a low estimate, and expires stale values', async () => {
        const values = [{ usage: 1_000, quota: 30 * 1024 ** 3 }, { usage: 29 * 1024 ** 3, quota: 30 * 1024 ** 3 }, { usage: 30 * 1024 ** 3, quota: 30 * 1024 ** 3 }];
        const storage = { estimate: vi.fn().mockImplementation(async () => values.shift()) };
        const first = await estimateRecordingStorage(storage);
        const second = await estimateRecordingStorage(storage);
        expect(second.headroomBytes).toBeLessThan(first.headroomBytes!);
        expect(isRecordingOriginStorageLow(await estimateRecordingStorage(storage))).toBe(true);
        expect(isRecordingEstimateFresh(second, second.measuredAt! + 15_001)).toBe(false);
        expect(isRecordingEstimateFresh(second, second.measuredAt! - 1)).toBe(false);
    });

    it('handles absent, rejected, invalid and hanging APIs without inventing capacity', async () => {
        vi.stubGlobal('navigator', {});
        expect((await estimateRecordingStorage()).status).toBe('unsupported');
        for (const result of [{}, { quota: Infinity, usage: 0 }, { quota: 20, usage: -1 }]) {
            expect((await estimateRecordingStorage({ estimate: async () => result })).headroomBytes).toBeNull();
        }
        expect((await estimateRecordingStorage({ estimate: async () => { throw new Error(); } })).status).toBe('failed');
        vi.useFakeTimers();
        const stalled = estimateRecordingStorage({ estimate: () => new Promise(() => undefined) });
        await vi.advanceTimersByTimeAsync(3_001);
        expect((await stalled).status).toBe('failed');
    });

    it('reports the real persistence outcomes', async () => {
        vi.stubGlobal('navigator', {});
        expect(await readRecordingPersistence()).toBe('unsupported');
        expect(await requestRecordingPersistence()).toBe('unsupported');
        const storage = { persist: vi.fn().mockResolvedValue(false), persisted: vi.fn().mockResolvedValue(false) } as unknown as StorageManager;
        expect(await readRecordingPersistence(storage)).toBe('not-granted');
        expect(await requestRecordingPersistence(storage)).toBe('denied');
        vi.mocked(storage.persist).mockResolvedValue(true);
        expect(await requestRecordingPersistence(storage)).toBe('granted');
        vi.mocked(storage.persist).mockRejectedValue(new Error());
        expect(await requestRecordingPersistence(storage)).toBe('failed');
    });

    it('explains a refused write by its cause and says what stays available', () => {
        const explain = (name: string, isCaptureFailure?: boolean) => getRecordingStorageErrorMessage(new DOMException('Refused', name), isCaptureFailure);
        expect(explain('QuotaExceededError')).toBe('Úložiště je plné nebo byla vyčerpána kvóta. Všechny stopy se zastavují. Již uložené části zůstávají k obnově a exportu.');
        for (const name of ['NotAllowedError', 'SecurityError']) expect(explain(name)).toContain('Oprávnění k úložišti chybí nebo bylo odebráno.');
        expect(explain('UnknownError')).toContain('Přístup k úložišti selhal');
        // Deletion and export share the explanation, but stop no recording.
        expect(explain('NotFoundError', false)).toBe('Soubor záznamu už není dostupný. Již uložené části zůstávají k obnově a exportu.');
        expect(explain('QuotaExceededError', false)).not.toContain('Všechny stopy se zastavují');
    });
});

describe('multi-source bytes and bitrate', () => {
    it('uses every source and includes embedded audio in the configured rate', () => {
        const sources = [[true, false], [true, true], [false, true]].map(([isVideo, isAudio]) => ({ stream: {
            getVideoTracks: () => isVideo ? [{}] : [], getAudioTracks: () => isAudio ? [{}] : [],
        } })) as unknown as RecordingSource[];
        expect(getConfiguredRecordingBytesPerSecond(sources)).toBe((16_000_000 + 384_000) / 8);
    });

    it('measures aggregate VBR, excludes startup and expires a pause or stalled write', () => {
        const meter = new RecordingBitrateMeter();
        const recording = createTestStudioRecording();
        const sample = (seconds: number, sizes: number[]) => ({ ...recording, durationSeconds: seconds, tracks: sizes.map((byteLength, index) => ({ ...recording.tracks[index % 2], byteLength })) });
        expect(meter.update(sample(0, [0, 0, 0]), 0)).toBeNull();
        expect(meter.update(sample(1, [100, 200, 300]), 1_000)).toBeNull();
        expect(meter.update(sample(4, [400, 800, 1200]), 4_000)).toBe(600);
        expect(meter.update(sample(10, [1000, 2000, 6000]), 10_000)).toBe(900);
        expect(meter.read(26_000)).toBeNull();
        expect(meter.update(sample(40, [2000, 4000, 18000]), 40_000)).toBe(500);
    });

    it('keeps exact values across 32-bit boundaries and guards unsafe counters', () => {
        for (const boundary of [2 ** 31, 2 ** 32, 10 * 1024 ** 3]) expect(addRecordingBytes(boundary - 1, 2)).toBe(boundary + 1);
        expect(formatRecordingBytes(10 * 1024 ** 3)).toBe('10 GiB');
        expect(() => addRecordingBytes(Number.MAX_SAFE_INTEGER, 1)).toThrow();
        expect(() => addRecordingBytes(0, NaN)).toThrow();
    });

    it('keeps missing tails on the common clock and a crash end explicitly unknown', () => {
        const recording = { ...createTestStudioRecording(), status: 'interrupted' as const, captureEndSeconds: 12 };
        expect(getRecordingMissingRanges(recording).map((range) => [range.startSeconds, range.endSeconds])).toEqual([[0, 12], [0, 12]]);
        expect(getRecordingMissingRanges({ ...recording, captureEndSeconds: null })[0].endSeconds).toBeNull();
    });
});

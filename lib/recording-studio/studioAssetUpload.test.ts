import { describe, expect, it } from 'vitest';
import { fingerprintStudioUpload, transferStudioParts } from './studioAssetUploadClient';
import { STUDIO_UPLOAD_PART_BYTES } from './studioAssetUploadTypes';
import type { StudioRangeSource } from './studioMediaSource';

function createUploadSource(partCount = 3): StudioRangeSource {
    return {
        byteLength: (partCount - 1) * STUDIO_UPLOAD_PART_BYTES + 37,
        read: async (start, end, signal) => {
            signal.throwIfAborted();
            return new Blob([new Uint8Array(end - start).fill(1 + start / STUDIO_UPLOAD_PART_BYTES)]);
        },
    };
}
describe('direct multipart state machine', () => {
    it('bounds reads/concurrency, reconciles receipts and retries/resumes only the missing bytes', async () => {
        const source = createUploadSource();
        const signal = new AbortController().signal;
        const fingerprint = await fingerprintStudioUpload(source, signal, () => undefined);
        const uploaded: number[] = [];
        const progress: number[] = [];
        let active = 0;
        let maximumActive = 0;
        await transferStudioParts(
            source,
            fingerprint.partChecksums,
            [{ partNumber: 1, byteLength: STUDIO_UPLOAD_PART_BYTES, checksumSha256: fingerprint.partChecksums[0] }],
            signal,
            async (partNumber, blob) => {
                active += 1;
                maximumActive = Math.max(maximumActive, active);
                expect(blob.size).toBeLessThanOrEqual(STUDIO_UPLOAD_PART_BYTES);
                await new Promise((resolve) => setTimeout(resolve, 10));
                uploaded.push(partNumber);
                active -= 1;
            },
            (bytes) => progress.push(bytes),
        );
        expect(uploaded.sort()).toEqual([2, 3]);
        expect(maximumActive).toBeLessThanOrEqual(2);
        expect(progress.at(-1)).toBe(source.byteLength);
    });
    it('refuses a wrong-source resume and changed source bytes before sending them', async () => {
        const source = createUploadSource(2);
        const signal = new AbortController().signal;
        const fingerprint = await fingerprintStudioUpload(source, signal, () => undefined);
        const uploaded: number[] = [];
        await expect(
            transferStudioParts(
                source,
                fingerprint.partChecksums,
                [{ partNumber: 1, byteLength: STUDIO_UPLOAD_PART_BYTES, checksumSha256: 'wrong' }],
                signal,
                async (partNumber) => {
                    uploaded.push(partNumber);
                },
                () => undefined,
            ),
        ).rejects.toThrow(/different bytes/);
        expect(uploaded).toEqual([]);
        const changed = {
            ...source,
            read: async (start: number, end: number) => new Blob([new Uint8Array(end - start).fill(9)]),
        };
        await expect(
            transferStudioParts(
                changed,
                fingerprint.partChecksums,
                [],
                signal,
                async (partNumber) => {
                    uploaded.push(partNumber);
                },
                () => undefined,
            ),
        ).rejects.toThrow(/Source changed/);
        expect(uploaded).toEqual([]);
    });
    it('cancels without inventing completed receipts', async () => {
        const source = createUploadSource();
        const controller = new AbortController();
        const fingerprint = await fingerprintStudioUpload(source, controller.signal, () => undefined);
        controller.abort();
        await expect(
            transferStudioParts(
                source,
                fingerprint.partChecksums,
                [],
                controller.signal,
                async () => {
                    throw new Error('must not upload');
                },
                () => undefined,
            ),
        ).rejects.toThrow();
    });
});

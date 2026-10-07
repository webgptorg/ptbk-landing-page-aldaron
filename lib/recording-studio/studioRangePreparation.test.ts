import { expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { ALL_FORMATS, BlobSource, EncodedPacketSink, Input, type StreamTargetChunk } from 'mediabunny';
import { createStudioRangeInput } from './studioMediaSource';
import { inspectRecordingMedia } from './recordingStudioMedia';
import { withRebuiltRecordingIndex } from './recordingStudioReindex';

it('packet-copies real A/V packets through bounded range reads without changing source timestamps or bytes', async () => {
    const original = new Blob([readFileSync('tests/e2e/fixtures/recording-studio/camera.webm')]);
    const originalInput = new Input({ formats: ALL_FORMATS, source: new BlobSource(original) });
    const bounds = await inspectRecordingMedia(originalInput);
    const reads: number[] = [];
    const source = {
        byteLength: original.size,
        read: async (start: number, end: number) => {
            reads.push(end - start);
            return original.slice(start, end);
        },
    };
    // Only the tiny regression output uses an in-memory test sink; product preparations use one OPFS file.
    const outputBytes = new Uint8Array(original.size * 2 + 4096);
    let outputLength = 0;
    const writable = new WritableStream<StreamTargetChunk>({
        write: ({ position, data }) => {
            outputBytes.set(data, position);
            outputLength = Math.max(outputLength, position + data.length);
        },
    });
    vi.stubGlobal('navigator', { storage: { getDirectory: async () => undefined } });
    let resultInput: Input | null = null;
    try {
        const result = await withRebuiltRecordingIndex({
            input: createStudioRangeInput(source, new AbortController().signal),
            format: 'matroska',
            expectedMedia: bounds,
            signal: new AbortController().signal,
            temporaryFile: {
                writable: writable as unknown as FileSystemWritableFileStream,
                readFile: async () => new File([outputBytes.slice(0, outputLength)], 'indexed.webm'),
            },
            consume: async (file) => file,
        });
        resultInput = new Input({ formats: ALL_FORMATS, source: new BlobSource(result) });
        const originalTracks = await originalInput.getTracks();
        const resultTracks = await resultInput.getTracks();
        expect(resultTracks).toHaveLength(originalTracks.length);
        for (let index = 0; index < originalTracks.length; index += 1) {
            for (const seconds of [0.5, 3.5, 6.5]) {
                const before = await new EncodedPacketSink(originalTracks[index]).getPacket(seconds);
                const after = await new EncodedPacketSink(resultTracks[index]).getPacket(seconds);
                expect(after?.timestamp).toBeCloseTo(before!.timestamp, 6);
                expect(after?.data).toEqual(before!.data);
            }
        }
        expect(Math.max(...reads)).toBeLessThanOrEqual(8 * 1024 * 1024);
    } finally {
        originalInput.dispose();
        resultInput?.dispose();
        vi.unstubAllGlobals();
    }
});

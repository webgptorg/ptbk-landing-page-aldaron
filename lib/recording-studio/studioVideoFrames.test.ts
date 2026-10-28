import { describe, expect, it } from 'vitest';
import type { VideoSample } from 'mediabunny';
import { resampleStudioVideoFrames } from './studioVideoFrames';

function fixture(times: number[], failAfterLast = false) {
    const resources: { timestamp: number; closed: number }[] = [];
    let returned = false;
    const sample = (timestamp: number): VideoSample => {
        const resource = { timestamp, closed: 0 }; resources.push(resource);
        return { timestamp, clone: () => sample(timestamp), close: () => { resource.closed++; } } as VideoSample;
    };
    const samples = (async function* () {
        try {
            for (const timestamp of times) yield sample(timestamp);
            if (failAfterLast) throw new Error('Decoder failed');
        } finally { returned = true; }
    })();
    return { samples, resources, isReturned: () => returned };
}

describe('sequential composition frame resampling', () => {
    it('retains irregular/static frames until the next presentation timestamp without black holes or future frames', async () => {
        const source = fixture([0.007, 0.04, 0.12, 1.08, 2.410, 2.531]);
        const times = [0, 0.007, 0.03, 0.04, 0.1, 0.12, 0.5, 1, 1.08, 2.5, 2.531, 2.55];
        const actual = [];
        for await (const sample of resampleStudioVideoFrames(source.samples, times, new AbortController().signal)) {
            actual.push(sample?.timestamp ?? null); sample?.close();
        }
        expect(actual).toEqual([null, 0.007, 0.007, 0.04, 0.04, 0.12, 0.12, 0.12, 1.08, 2.410, 2.531, 2.531]);
        expect(source.resources.every((sample) => sample.closed === 1)).toBe(true);
        expect(source.isReturned()).toBe(true);
    });

    it('closes retained frames and the decoder when a layout or clip stops using the iterator', async () => {
        const source = fixture([0, 0.04, 0.08, 0.12]);
        const frames = resampleStudioVideoFrames(source.samples, [0, 0.03, 0.06], new AbortController().signal);
        const first = (await frames.next()).value!;
        first.close();
        await frames.return();
        expect(source.isReturned()).toBe(true);
        expect(source.resources.every((sample) => sample.closed === 1)).toBe(true);
    });

    it('propagates cancellation and decoder failure instead of returning successful black output', async () => {
        const source = fixture([0, 0.04, 0.08]);
        const controller = new AbortController();
        const frames = resampleStudioVideoFrames(source.samples, [0, 0.03, 0.06], controller.signal);
        (await frames.next()).value!.close();
        controller.abort();
        await expect(frames.next()).rejects.toMatchObject({ name: 'AbortError' });
        expect(source.resources.every((sample) => sample.closed === 1)).toBe(true);
        expect(source.isReturned()).toBe(true);

        const failed = fixture([0], true);
        await expect(resampleStudioVideoFrames(failed.samples, [0], new AbortController().signal).next()).rejects.toThrow('Decoder failed');
        expect(failed.resources.every((sample) => sample.closed === 1)).toBe(true);
    });
});

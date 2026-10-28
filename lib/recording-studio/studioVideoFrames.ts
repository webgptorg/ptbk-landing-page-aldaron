import type { VideoSample } from 'mediabunny';

/**
 * Resample a continuous decoder in presentation order, retaining only the current and next frame.
 * Sparse timestamp decoding can return null batches for variable-cadence recorder GOPs. Reading each
 * source frame once also preserves long/static frames when converting them to the output's 30 fps.
 * The caller owns each yielded clone; this iterator owns and closes its two lookahead samples.
 */
export async function* resampleStudioVideoFrames(
    samples: AsyncGenerator<VideoSample, void, unknown>,
    timestamps: Iterable<number>,
    signal: AbortSignal,
): AsyncGenerator<VideoSample | null, void, unknown> {
    let current: VideoSample | undefined;
    let next: VideoSample | undefined;
    const requested = timestamps[Symbol.iterator]();
    try {
        signal.throwIfAborted();
        next = (await samples.next()).value || undefined;
        for (let request = requested.next(); !request.done; request = requested.next()) {
            const timestamp = request.value;
            signal.throwIfAborted();
            // Container timestamps and WebCodecs timestamps can differ by a rounded microsecond.
            while (next && next.timestamp <= timestamp + 0.000001) {
                current?.close();
                current = next;
                next = undefined;
                signal.throwIfAborted();
                next = (await samples.next()).value || undefined;
            }
            yield current?.clone() ?? null;
        }
    } finally {
        current?.close();
        next?.close();
        await samples.return();
    }
}

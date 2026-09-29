import { ALL_FORMATS, AudioSampleSink, BlobSource, CanvasSink, Input } from 'mediabunny';
import type { RecordingMediaBounds, RecordingMediaComponent, RecordingTrack } from './recordingStudioTypes';
export type { RecordingMediaBounds } from './recordingStudioTypes';

const THUMBNAIL_COUNT = 10;
const WAVEFORM_SAMPLE_COUNT = 64;
export type RecordingMediaArtwork = { readonly thumbnails: readonly { readonly seconds: number; readonly url: string }[]; readonly peaks: readonly { readonly seconds: number; readonly amplitude: number }[] };

export function openRecordingMedia(blob: Blob) {
    return new Input({ formats: ALL_FORMATS, source: new BlobSource(blob) });
}

/** HTML playback and conversion use the same nonnegative container origin, retaining internal A/V offsets. */
export async function inspectRecordingMedia(input: Input, expectedTrack?: RecordingTrack): Promise<RecordingMediaBounds> {
    const tracks = (await input.getTracks()).filter((track) => track.isAudioTrack() || track.isVideoTrack());
    const components = await Promise.all(tracks.map(async (track): Promise<RecordingMediaComponent> => ({
        kind: track.isVideoTrack() ? 'video' : 'audio',
        firstTimestampSeconds: Math.max(0, await track.getFirstTimestamp()),
        endTimestampSeconds: await track.computeDuration(),
    })));
    if (components.length === 0 || components.some((component) => !Number.isFinite(component.firstTimestampSeconds) ||
        !Number.isFinite(component.endTimestampSeconds) || component.endTimestampSeconds <= component.firstTimestampSeconds)) {
        throw new Error('Médium nemá čitelný časový rozsah. Originál zůstává uložený.');
    }
    if (expectedTrack && ((expectedTrack.kind !== 'microphone' && !components.some(({ kind }) => kind === 'video')) ||
        ((expectedTrack.isAudioIncluded || expectedTrack.kind === 'microphone') && !components.some(({ kind }) => kind === 'audio')))) {
        throw new Error('V médiu chybí zaznamenaná obrazová nebo zvuková část. Originál zůstává uložený.');
    }
    return {
        firstTimestampSeconds: Math.min(...components.map((component) => component.firstTimestampSeconds)),
        availableStartTimestampSeconds: Math.max(...components.map((component) => component.firstTimestampSeconds)),
        // A longer audio stream must not keep a stale last video frame looking available (and vice versa).
        endTimestampSeconds: Math.min(...components.map((component) => component.endTimestampSeconds)), components,
    };
}

/** Reads timing metadata from a closed playable part; Blob references do not copy its full media bytes. */
export async function inspectRecordingBlob(blob: Blob, expectedTrack: RecordingTrack): Promise<RecordingMediaBounds> {
    const input = openRecordingMedia(blob);
    try { return await inspectRecordingMedia(input, expectedTrack); }
    finally { input.dispose(); }
}

/** Bounded sparse samples, never decodeAudioData on an entire ten-hour source. */
export async function readRecordingMediaArtwork(input: Input, bounds: RecordingMediaBounds, signal: AbortSignal): Promise<RecordingMediaArtwork> {
    const thumbnails: { seconds: number; url: string }[] = [];
    const peaks: { seconds: number; amplitude: number }[] = [];
    const timestamps = (count: number) => Array.from({ length: count }, (_, index) =>
        bounds.firstTimestampSeconds + (bounds.endTimestampSeconds - bounds.firstTimestampSeconds) * (index + 0.5) / count);
    const video = await input.getPrimaryVideoTrack();
    if (video && await video.canDecode()) {
        const sink = new CanvasSink(video, { width: 120, poolSize: 1 });
        for await (const frame of sink.canvasesAtTimestamps(timestamps(THUMBNAIL_COUNT))) {
            signal.throwIfAborted();
            if (!frame) continue;
            const canvas = document.createElement('canvas');
            canvas.width = frame.canvas.width; canvas.height = frame.canvas.height;
            canvas.getContext('2d')?.drawImage(frame.canvas, 0, 0);
            thumbnails.push({ seconds: frame.timestamp - bounds.firstTimestampSeconds, url: canvas.toDataURL('image/jpeg', 0.6) });
        }
    }
    const audio = await input.getPrimaryAudioTrack();
    if (audio && await audio.canDecode()) {
        const sink = new AudioSampleSink(audio);
        for await (const sample of sink.samplesAtTimestamps(timestamps(WAVEFORM_SAMPLE_COUNT))) {
            if (!sample) continue;
            try {
                signal.throwIfAborted();
                const values = sample.toAudioBuffer().getChannelData(0);
                let sum = 0;
                for (let index = 0; index < values.length; index += 1) sum += values[index] * values[index];
                peaks.push({ seconds: sample.timestamp - bounds.firstTimestampSeconds, amplitude: Math.sqrt(sum / Math.max(1, values.length)) });
            } finally { sample.close(); }
        }
    }
    return { thumbnails, peaks };
}

import type { Page } from '@playwright/test';
import { ALL_FORMATS, BufferSource, EncodedPacketSink, Input } from 'mediabunny';

/** Decode recorded timestamps directly; speaker/output latency is not an A/V capture measurement. */
export async function inspectAudioVideoMarkers(page: Page, bytes: Uint8Array) {
    const input = new Input({ formats: ALL_FORMATS, source: new BufferSource(bytes) });
    try {
        const duration = await input.computeDuration();
        const tracks = [await input.getPrimaryVideoTrack(), await input.getPrimaryAudioTrack()];
        const sources = await Promise.all(tracks.map(async (track) => {
            if (!track) throw new Error('Missing captured video or audio.');
            const configuration = await track.getDecoderConfig();
            if (!configuration) throw new Error('Missing decoder configuration.');
            const description = configuration.description;
            const descriptionBytes = description ? ('buffer' in description
                ? new Uint8Array(description.buffer, description.byteOffset, description.byteLength)
                : new Uint8Array(description)) : undefined;
            const packets = [];
            for await (const packet of new EncodedPacketSink(track).packets()) packets.push({
                data: Buffer.from(packet.data).toString('base64'), type: packet.type,
                timestamp: Math.round(packet.timestamp * 1_000_000), duration: Math.round(packet.duration * 1_000_000),
            });
            return { kind: track.isVideoTrack() ? 'video' : 'audio', configuration: { ...configuration, description: descriptionBytes ? Array.from(descriptionBytes) : undefined }, packets };
        }));
        const samples = await page.evaluate(async (sources) => {
            return Promise.all(sources.map(async (source) => {
                const samples: { timestamp: number; isActive: boolean }[] = [];
                let decodeError: DOMException | null = null;
                const error = (value: DOMException) => { decodeError = value; };
                const configuration = { ...source.configuration, description: source.configuration.description ? new Uint8Array(source.configuration.description) : undefined };
                const canvas = document.createElement('canvas'); canvas.width = 1; canvas.height = 1;
                const context = canvas.getContext('2d')!;
                const decoder = source.kind === 'video' ? new VideoDecoder({ error, output: (frame) => {
                    try {
                        context.drawImage(frame, 0, 0, 1, 1);
                        samples.push({ timestamp: frame.timestamp / 1_000_000, isActive: context.getImageData(0, 0, 1, 1).data[0] > 220 });
                    } finally { frame.close(); }
                } }) : new AudioDecoder({ error, output: (sample) => {
                    try {
                        const values = new Float32Array(sample.numberOfFrames);
                        sample.copyTo(values, { planeIndex: 0, format: 'f32-planar' });
                        const meanSquare = values.reduce((sum, value) => sum + value * value, 0) / values.length;
                        samples.push({ timestamp: sample.timestamp / 1_000_000, isActive: Math.sqrt(meanSquare) > 0.025 });
                    } finally { sample.close(); }
                } });
                try {
                    if (decoder instanceof VideoDecoder) decoder.configure(configuration as VideoDecoderConfig);
                    else decoder.configure(configuration as AudioDecoderConfig);
                    for (const packet of source.packets) {
                        const data = Uint8Array.from(atob(packet.data), (character) => character.charCodeAt(0));
                        if (decoder instanceof VideoDecoder) decoder.decode(new EncodedVideoChunk({ ...packet, data }));
                        else decoder.decode(new EncodedAudioChunk({ ...packet, data }));
                    }
                    await decoder.flush();
                    if (decodeError) throw decodeError;
                } finally { if (decoder.state !== 'closed') decoder.close(); }
                return { kind: source.kind, samples: samples.sort((first, second) => first.timestamp - second.timestamp) };
            }));
        }, sources);
        const pulseStarts = (kind: string, start: number, end: number) => {
            const values = samples.find((source) => source.kind === kind)!.samples;
            return values.filter((sample, index) => sample.timestamp >= start && sample.timestamp <= end && sample.isActive &&
                (index === 0 || !values[index - 1].isActive)).map((sample) => sample.timestamp);
        };
        return [[0.1, Math.min(1.5, duration / 2)], [Math.max(duration - 1.5, duration / 2), duration - 0.1]].map(([start, end]) => {
            const videoStarts = pulseStarts('video', start, end);
            const audioStarts = pulseStarts('audio', start, end);
            const gaps = videoStarts.flatMap((videoStart) => audioStarts.map((audioStart) => Math.abs(videoStart - audioStart)));
            return { nearestGap: gaps.length ? Math.min(...gaps) : null, videoStarts, audioStarts };
        });
    } finally { input.dispose(); }
}

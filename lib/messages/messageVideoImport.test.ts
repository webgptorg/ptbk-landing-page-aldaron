import { readFile } from 'node:fs/promises';
import { ALL_FORMATS, BlobSource, EncodedPacketSink, Input } from 'mediabunny';
import { expect, it } from 'vitest';
import { extractMessageAudio, isMessageVideoImport } from './messageVideoImport';

async function recording(name: string, type?: string): Promise<File> {
    const bytes = await readFile(new URL(`../../tests/e2e/fixtures/recording-studio/${name}`, import.meta.url));
    return new File([bytes], name, { type });
}

it('extracts only audio from an untyped video and copies its encoded Opus data', async () => {
    const video = await recording('camera.webm');
    expect(isMessageVideoImport(video)).toBe(true);
    const audio = await extractMessageAudio(video, () => undefined);
    expect(audio.type).toBe('audio/webm');
    expect(audio.size).toBeLessThan(video.size);
    const source = new Input({ formats: ALL_FORMATS, source: new BlobSource(video) });
    const extracted = new Input({ formats: ALL_FORMATS, source: new BlobSource(audio) });
    try {
        expect(await extracted.getVideoTracks()).toHaveLength(0);
        const [track] = await extracted.getAudioTracks();
        expect(await track.getCodec()).toBe('opus');
        const primaryAudio = (await source.getAudioTracks())[0];
        const firstOriginalPacket = await new EncodedPacketSink(primaryAudio).getFirstPacket();
        const firstExtractedPacket = await new EncodedPacketSink(track).getFirstPacket();
        expect(firstExtractedPacket?.data).toEqual(firstOriginalPacket?.data);
    } finally {
        source.dispose();
        extracted.dispose();
    }
});

it('keeps an audio-only recording with a generic MIME type and rejects silent video', async () => {
    const audio = await recording('microphone.webm');
    expect(await extractMessageAudio(audio, () => undefined)).toBe(audio);
    const video = await recording('screen.webm', 'video/webm');
    await expect(extractMessageAudio(video, () => undefined)).rejects.toThrow('není zvuková stopa');
});

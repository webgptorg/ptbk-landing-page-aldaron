import { describe, expect, it } from 'vitest';
import { analyzeMessageAudio } from './messageAudioAnalysis';

function wav(signal: boolean): File {
    const frames = 1600, channels = 2;
    const bytes = new Uint8Array(44 + frames * channels * 2);
    const view = new DataView(bytes.buffer);
    const text = (offset: number, value: string) => bytes.set(new TextEncoder().encode(value), offset);
    text(0, 'RIFF'); view.setUint32(4, bytes.length - 8, true); text(8, 'WAVE');
    text(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, channels, true); view.setUint32(24, 16000, true);
    view.setUint32(28, 16000 * channels * 2, true); view.setUint16(32, channels * 2, true); view.setUint16(34, 16, true);
    text(36, 'data'); view.setUint32(40, frames * channels * 2, true);
    // Keep the first channel and the beginning silent. Even a small late signal must be retained.
    if (signal) view.setInt16(44 + (frames - 1) * channels * 2 + 2, 1, true);
    return new File([bytes], 'signal.wav', { type: 'audio/wav' });
}

describe('local audio signal check', () => {
    it('confirms silence only after decoding the complete audio', async () => {
        const result = await analyzeMessageAudio(wav(false));
        expect(result.status).toBe('silent');
        expect(result.peak).toBe(0);
        expect(result.decodedSeconds).toBeCloseTo(0.1);
    });
    it('retains a faint signal in any channel after a silent introduction', async () => {
        const result = await analyzeMessageAudio(wav(true));
        expect(result.status).toBe('signal-detected');
        expect(result.peak).toBeGreaterThan(0);
    });
    it('distinguishes an unsupported or broken file from silence', async () => {
        const result = await analyzeMessageAudio(new File(['not a media file'], 'broken.mp3'));
        expect(result.status).toBe('unavailable');
        expect(result.reason).toBeTruthy();
    });
});

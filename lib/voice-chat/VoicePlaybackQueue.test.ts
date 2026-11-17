import { describe, expect, it, vi } from 'vitest';
import { VoicePlaybackQueue } from './VoicePlaybackQueue';
function fixture() {
    const sources: { connect: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn>; start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn>; onended: null | (() => void) }[] = [];
    const context = { currentTime: 10, destination: {}, createBuffer: (_channels: number, length: number, rate: number) => ({ duration: length / rate, getChannelData: () => new Float32Array(length) }),
        createBufferSource: () => { const source = { connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(), onended: null }; sources.push(source); return source; } } as unknown as AudioContext;
    return { sources, context };
}
describe('audio-clock playback accounting', () => {
    it('counts only fully played phrases and cancels the scheduled tail', () => {
        const { sources, context } = fixture(), queue = new VoicePlaybackQueue(context, vi.fn());
        const event = { type: 'audio' as const, audio: btoa('\0\0\0\0'), phrase: 0, text: 'Finished phrase.', last: true };
        queue.add(event); queue.add({ ...event, phrase: 1, text: 'Unheard tail.' });
        expect(queue.spokenText).toBe('');
        sources[0].onended?.(); expect(queue.spokenText).toBe('Finished phrase.');
        queue.stop();
        expect(sources[1].stop).toHaveBeenCalledOnce();
        expect(sources[1].onended).toBeNull(); expect(queue.spokenText).toBe('Finished phrase.');
    });
    it('waits for the final chunk rather than counting a partly played phrase', () => {
        const { sources, context } = fixture(), queue = new VoicePlaybackQueue(context, vi.fn());
        queue.add({ type: 'audio', audio: btoa('\0\0'), phrase: 0, text: 'Only partly played.', last: false });
        sources[0].onended?.(); queue.stop(); expect(queue.spokenText).toBe('');
    });
});

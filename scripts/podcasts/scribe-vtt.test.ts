import { describe, expect, it } from 'vitest';
import { scribeToVtt } from './scribe-vtt.mjs';
import { parseSubtitleFile } from '@/lib/workshops/subtitles/workshopSubtitleFormat';

describe('archival Scribe conversion', () => {
    it('retains context, actual overlapping times, literal markup and stable known speaker IDs', () => {
        const result = scribeToVtt({ words: [
            { text: 'Opravdu', type: 'word', start: 1, end: 2, speaker_id: 'speaker_0' },
            { text: '?', type: 'word', start: 2, end: 2.1, speaker_id: 'speaker_0' },
            { text: 'Ne, <script> & ne.', type: 'word', start: 1.9, end: 5, speaker_id: 'speaker_1' },
        ] }, 'dialogue-1', { speaker_1: 'pavol-hejny' });
        expect(result.speakers).toEqual(['dialogue-1-speaker_0', 'pavol-hejny']);
        expect(result.vtt).toContain('<v pavol-hejny>Ne, &lt;script&gt; &amp; ne.</v>');
        expect(parseSubtitleFile(result.vtt)).toEqual([
            { startSeconds: 1, endSeconds: 2.1, text: 'Opravdu?' },
            { startSeconds: 1.9, endSeconds: 5, text: 'Ne, <script> & ne.' },
        ]);
    });

    it('keeps explicit spaces and segments a long monologue only at real word boundaries', () => {
        const words = Array.from({ length: 40 }, (_, index) => ({ text: `slovo${index}`, type: 'word', start: index, end: index + 0.8, speaker_id: 'pavol-hejny' }));
        const result = scribeToVtt({ words }, 'monologue');
        const cues = parseSubtitleFile(result.vtt);
        expect(cues.length).toBeGreaterThan(1);
        expect(cues[0].startSeconds).toBe(0);
        expect(cues[cues.length - 1].endSeconds).toBe(39.8);
        expect(cues.map(cue => cue.text).join(' ')).toBe(words.map(word => word.text).join(' '));
    });

    it('never treats an unknown episode-local speaker as Pavol or as a speaker in another episode', () => {
        const response = { words: [{ text: 'Host.', type: 'word', start: 0, end: 1, speaker_id: 'speaker_0' }] };
        expect(scribeToVtt(response, 'episode-a').speakers).toEqual(['episode-a-speaker_0']);
        expect(scribeToVtt(response, 'episode-b').speakers).toEqual(['episode-b-speaker_0']);
    });

    it('refuses to turn an untimed legacy transcript into apparently timed captions', () => {
        expect(() => scribeToVtt({ text: 'Starý text.' }, 'old')).toThrow('word-timed');
        expect(() => scribeToVtt({ words: [{ text: 'Slovo', speaker_id: 'speaker_0' }] }, 'old')).toThrow('no usable timing');
    });

    it('keeps a point-timed interjection under its own voice using surrounding real cue bounds', () => {
        const result = scribeToVtt({ words: [
            { text: 'Rozumím.', type: 'word', start: 1, end: 3, speaker_id: 'speaker_0' },
            { text: 'Jo.', type: 'word', start: 2.8, end: 2.8, speaker_id: 'speaker_1' },
            { text: 'Pokračuj.', type: 'word', start: 3.1, end: 4, speaker_id: 'speaker_0' },
        ] }, 'dialogue', { speaker_1: 'pavol-hejny' });
        expect(result.cues[0]).toMatchObject({ start: 1, end: 3, text: 'Rozumím. Jo.' });
        expect(result.vtt).toContain('<v dialogue-speaker_0>Rozumím.</v>\n<v pavol-hejny>Jo.</v>');
        expect(result.cues).toHaveLength(2);
        expect(() => scribeToVtt({ words: [
            { text: 'Jo.', type: 'word', start: 2.8, end: 2.8, speaker_id: 'speaker_1' },
        ] }, 'isolated')).toThrow('no real positive time interval');
    });
});

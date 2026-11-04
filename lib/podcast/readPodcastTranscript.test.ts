import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { readPodcastTranscript } from './readPodcastTranscript';

vi.mock('node:fs', () => ({ readFileSync: vi.fn() }));

describe('committed podcast transcripts', () => {
    it('keeps an inline transcript searchable without touching the filesystem', () => {
        expect(readPodcastTranscript({ transcript: 'Původní celý rozhovor.' })).toBe('Původní celý rozhovor.');
        expect(readPodcastTranscript({})).toBe('');
        expect(readFileSync).not.toHaveBeenCalled();
    });

    it('uses the complete VTT dialogue while excluding timing and speaker labels from the search text', () => {
        vi.mocked(readFileSync).mockReturnValue(`WEBVTT

NOTE Original source and speaker identities stay in the archive.

1
00:00:01.000 --> 00:00:03.500
<v episode-1-speaker-0>Otázka o čipech &amp; modelech.</v>

2
00:00:03.200 --> 00:00:06.000
<v pavol-hejny>Moje odpověď
včetně kontextu.</v>
`);
        const source = { transcript: 'Zastaralý přepis.', transcriptFile: 'podcasts/transcripts/test-dialogue.vtt' };
        expect(readPodcastTranscript(source)).toBe('Otázka o čipech & modelech. Moje odpověď\nvčetně kontextu.');
        expect(readPodcastTranscript(source)).not.toContain('pavol-hejny');
        expect(readFileSync).toHaveBeenCalledTimes(1);
    });

    it.each(['../../private.vtt', 'podcasts/transcripts/../private.vtt', '/etc/passwd', 'podcasts/transcripts/audio.mp3'])(
        'refuses a path outside the committed VTT archive: %s', transcriptFile => {
            expect(() => readPodcastTranscript({ transcriptFile })).toThrow('within podcasts/transcripts');
        },
    );

    it('reports a missing committed file instead of silently dropping search coverage', () => {
        vi.mocked(readFileSync).mockImplementationOnce(() => { throw new Error('Missing committed transcript'); });
        expect(() => readPodcastTranscript({ transcriptFile: 'podcasts/transcripts/missing.vtt' })).toThrow('Missing committed transcript');
    });
});

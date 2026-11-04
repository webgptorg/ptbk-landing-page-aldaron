import {
    findAiTaKrajtaEpisodeSlugsMatchingTranscriptInEpisodes,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodeTranscriptSearch';
import type { AiTaKrajtaInternalEpisode } from '@/businesses/ai-ta-krajta/aiTaKrajtaInternalEpisodes';
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

vi.mock('node:fs', () => ({ readFileSync: vi.fn() }));

function createInternalEpisode(values: Partial<AiTaKrajtaInternalEpisode>): AiTaKrajtaInternalEpisode {
    return {
        number: 7,
        title: 'AI ta Krajta #7 | Testovací díl',
        publishedAt: '2026-08-01T00:00:00.000Z',
        durationInSeconds: 1800,
        youtubeVideoId: 'aaaaaaaaaaa',
        hosts: [],
        transcript: '',
        ...values,
    };
}

describe('findAiTaKrajtaEpisodeSlugsMatchingTranscriptInEpisodes', () => {
    it('searches migrated and legacy episodes together without searching voice annotations', () => {
        vi.mocked(readFileSync).mockReturnValue('WEBVTT\n\n00:00:01.000 --> 00:00:05.000\n<v pavol-hejny>Lokální modely v podcastech.</v>\n');
        const episodes = [
            createInternalEpisode({ number: 6, transcript: 'Podcastech se věnujeme lokální modely.' }),
            createInternalEpisode({ number: 7, transcript: undefined, transcriptFile: 'podcasts/transcripts/mixed-search.vtt' }),
            createInternalEpisode({ number: 8, transcript: undefined }),
        ];
        expect(findAiTaKrajtaEpisodeSlugsMatchingTranscriptInEpisodes(episodes, 'lokalni modely')).toEqual(['6', '7']);
        expect(findAiTaKrajtaEpisodeSlugsMatchingTranscriptInEpisodes(episodes, 'pavol-hejny')).toEqual([]);
    });

    it('finds every word in a complete transcript without regard to Czech diacritics', () => {
        const episodeSlugs = findAiTaKrajtaEpisodeSlugsMatchingTranscriptInEpisodes(
            [
                createInternalEpisode({ transcript: 'Mluvíme o křemíkových čipech a lokálních modelech.' }),
                createInternalEpisode({ number: 8, transcript: 'Mluvíme o vzdáleném nasazení.' }),
            ],
            'kremikovych modelech',
        );

        expect(episodeSlugs).toEqual(['7']);
    });

    it('does not turn an empty query into every transcript match', () => {
        expect(
            findAiTaKrajtaEpisodeSlugsMatchingTranscriptInEpisodes([createInternalEpisode({ transcript: 'AI' })], ''),
        ).toEqual([]);
    });
});

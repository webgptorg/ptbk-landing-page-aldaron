import { describe, expect, it } from 'vitest';
import { getPavolEpisodeCopy } from './pavolPodcastCopy';
import { AI_TA_KRAJTA_INTERNAL_EPISODES, createAiTaKrajtaInternalEpisodes } from '@/businesses/ai-ta-krajta/aiTaKrajtaInternalEpisodes';
import { mergePodcastEpisodes } from '@/lib/podcast/mergePodcastEpisodes';
import { getPavolAiTaKrajtaPodcasts } from './pavolPodcasts';

const episodes = mergePodcastEpisodes([createAiTaKrajtaInternalEpisodes()], { showTitle: 'AI ta Krajta' }).map(episode => ({ ...episode,
    personIds: episode.hosts.some(name => name.includes('Pavol')) ? ['pavol-hejny'] : [] }));

describe('reviewed English episode metadata', () => {
    it('covers every internally credited appearance without changing recording language or participation', () => {
        const selected = getPavolAiTaKrajtaPodcasts(episodes, 'en');
        const expected = AI_TA_KRAJTA_INTERNAL_EPISODES.filter(episode => episode.hosts.some(name => name.includes('Pavol')));
        expect(selected).toHaveLength(expected.length);
        expect(selected.every(episode => episode.language === 'cs' && episode.textLanguage === 'en')).toBe(true);
        for (const episode of episodes.filter(episode => episode.personIds.length)) {
            const copy = getPavolEpisodeCopy(episode, 'en');
            expect(copy.description).not.toContain('publisher provides');
            expect(copy.originalTitle).toBe(episode.title);
        }
    });
});

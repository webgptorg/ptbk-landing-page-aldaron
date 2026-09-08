import type { AiTaKrajtaEpisode } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import {
    countAiTaKrajtaEpisodesByPerson,
    filterAiTaKrajtaEpisodes,
    getAiTaKrajtaEpisodePeople,
    resolveAiTaKrajtaEpisodePersonIds,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodePeople';
import { AI_TA_KRAJTA_INTERNAL_EPISODES } from '@/businesses/ai-ta-krajta/aiTaKrajtaInternalEpisodes';
import { AI_TA_KRAJTA_PEOPLE, isAiTaKrajtaPersonNamedByText } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
import type { PodcastEpisode } from '@/lib/podcast/PodcastFeed';
import { describe, expect, it } from 'vitest';

function createFeedEpisode(values: Partial<PodcastEpisode>): PodcastEpisode {
    return {
        id: 'episode',
        slug: '1',
        number: 1,
        title: 'AI ta Krajta #1',
        shortTitle: 'Testovací díl',
        summary: '',
        descriptionText: '',
        hosts: [],
        audioUrl: 'https://example.com/1.mp3',
        videoUrl: null,
        pageUrl: null,
        publishedAt: '2026-08-01T00:00:00.000Z',
        durationInSeconds: 1800,
        imageUrl: null,
        ...values,
    };
}

function createPageEpisode(values: Partial<AiTaKrajtaEpisode>): AiTaKrajtaEpisode {
    const { descriptionText, ...feedEpisode } = createFeedEpisode({});

    return { ...feedEpisode, personIds: [], ...values };
}

describe('resolveAiTaKrajtaEpisodePersonIds', () => {
    it('reads the guest list at the end of a description', () => {
        const episode = createFeedEpisode({
            descriptionText: 'Hosté: Roman Baranovič: Pavol Hejný: Jiří Jahn: Sítě, kde nás můžete sledovat:',
        });

        expect(resolveAiTaKrajtaEpisodePersonIds(episode)).toEqual([
            'pavol-hejny',
            'jiri-jahn',
            'roman-baranovic',
        ]);
    });

    it('finds a name however Czech declines it', () => {
        const episode = createFeedEpisode({
            descriptionText: 'Bavíme se s hostem Tomášem Koblížkem, analytickým filozofem.',
        });

        expect(resolveAiTaKrajtaEpisodePersonIds(episode)).toEqual(['tomas-koblizek']);
    });

    it('does not put a face on an episode which names nobody', () => {
        const episode = createFeedEpisode({ descriptionText: 'Řešíme PixelRAG a lokální modely.' });

        expect(resolveAiTaKrajtaEpisodePersonIds(episode)).toEqual([]);
    });

    it('uses a host name from the merged source list when the description names nobody', () => {
        const episode = createFeedEpisode({ hosts: ['Pavol Hejný', 'Jiří Jahn'] });

        expect(resolveAiTaKrajtaEpisodePersonIds(episode)).toEqual(['pavol-hejny', 'jiri-jahn']);
    });

    it('tells two people with the same first name apart', () => {
        const withGlaser = createFeedEpisode({ descriptionText: '35. epizoda s Petrem, Pavolem a Prokopem.' });
        const withBrzek = createFeedEpisode({ descriptionText: 'Povídání si s Petrem Brzkem o Macaly.' });

        expect(resolveAiTaKrajtaEpisodePersonIds(withGlaser)).toContain('petr-glaser');
        expect(resolveAiTaKrajtaEpisodePersonIds(withBrzek)).toEqual(['petr-brzek']);
    });
});

describe('getAiTaKrajtaEpisodePeople', () => {
    it('ignores an identifier which is no longer in the roster', () => {
        const episode = createPageEpisode({ personIds: ['pavol-hejny', 'kdosi-neznamy'] });

        expect(getAiTaKrajtaEpisodePeople(episode).map((person) => person.name)).toEqual(['Pavol Hejný']);
    });
});

describe('the archive against the roster', () => {
    // Note: A host the show credits by name and the page has no card for is the bug this keeps out: the person then
    //       misses every portrait row and the filter of the episode list, however often they sat at the microphone.
    it('has a people card for everyone the written down archive credits', () => {
        const hostNamesWithoutCard = new Set<string>();

        for (const episode of AI_TA_KRAJTA_INTERNAL_EPISODES) {
            for (const hostName of episode.hosts) {
                if (!AI_TA_KRAJTA_PEOPLE.some((person) => isAiTaKrajtaPersonNamedByText(person, hostName))) {
                    hostNamesWithoutCard.add(hostName);
                }
            }
        }

        expect(Array.from(hostNamesWithoutCard)).toEqual([]);
    });

    it('never lets one card answer to the name of another person', () => {
        const collidingNames = AI_TA_KRAJTA_PEOPLE.flatMap((person) =>
            AI_TA_KRAJTA_PEOPLE.filter(
                (otherPerson) => otherPerson.id !== person.id && isAiTaKrajtaPersonNamedByText(person, otherPerson.name),
            ).map((otherPerson) => `${person.name} also answers to ${otherPerson.name}`),
        );

        expect(collidingNames).toEqual([]);
    });
});

describe('filterAiTaKrajtaEpisodes', () => {
    const episodes: readonly AiTaKrajtaEpisode[] = [
        createPageEpisode({ id: 'a', slug: '3', shortTitle: 'Agenti v cloudu', personIds: ['pavol-hejny'] }),
        createPageEpisode({ id: 'b', slug: '2', shortTitle: 'Lokální modely', personIds: ['jiri-jahn'] }),
        createPageEpisode({ id: 'c', slug: '1', shortTitle: 'Dezinformace', summary: 'O agentech a kontextu.' }),
    ];

    it('keeps the whole archive when nothing is asked for', () => {
        expect(
            filterAiTaKrajtaEpisodes(episodes, {
                personId: null,
                searchQuery: '',
                transcriptMatchingEpisodeSlugs: [],
            }),
        ).toHaveLength(3);
    });

    it('keeps only the episodes of one person', () => {
        const filtered = filterAiTaKrajtaEpisodes(episodes, {
            personId: 'jiri-jahn',
            searchQuery: '',
            transcriptMatchingEpisodeSlugs: [],
        });

        expect(filtered.map((episode) => episode.id)).toEqual(['b']);
    });

    it('searches the title and the summary without regard to diacritics', () => {
        const filtered = filterAiTaKrajtaEpisodes(episodes, {
            personId: null,
            searchQuery: 'lokalni',
            transcriptMatchingEpisodeSlugs: [],
        });

        expect(filtered.map((episode) => episode.id)).toEqual(['b']);
    });

    it('asks for every typed word at once', () => {
        expect(
            filterAiTaKrajtaEpisodes(episodes, {
                personId: null,
                searchQuery: 'agenti cloud',
                transcriptMatchingEpisodeSlugs: [],
            }),
        ).toHaveLength(1);
        expect(
            filterAiTaKrajtaEpisodes(episodes, {
                personId: null,
                searchQuery: 'agenti kimi',
                transcriptMatchingEpisodeSlugs: [],
            }),
        ).toHaveLength(0);
    });

    it('does not let the name of the show match every episode', () => {
        expect(
            filterAiTaKrajtaEpisodes(episodes, {
                personId: null,
                searchQuery: 'krajta',
                transcriptMatchingEpisodeSlugs: [],
            }),
        ).toHaveLength(0);
    });

    it('combines the person with the search', () => {
        expect(
            filterAiTaKrajtaEpisodes(episodes, {
                personId: 'pavol-hejny',
                searchQuery: 'lokální',
                transcriptMatchingEpisodeSlugs: [],
            }),
        ).toHaveLength(0);
    });

    it('adds a server-side transcript match without handing its text to the client', () => {
        const filtered = filterAiTaKrajtaEpisodes(episodes, {
            personId: null,
            searchQuery: 'neviditelne slovo',
            transcriptMatchingEpisodeSlugs: ['2'],
        });

        expect(filtered.map((episode) => episode.id)).toEqual(['b']);
    });
});

describe('countAiTaKrajtaEpisodesByPerson', () => {
    it('counts how many episodes each person is named in', () => {
        const counts = countAiTaKrajtaEpisodesByPerson([
            createPageEpisode({ id: 'a', personIds: ['pavol-hejny', 'jiri-jahn'] }),
            createPageEpisode({ id: 'b', personIds: ['pavol-hejny'] }),
        ]);

        expect(counts.get('pavol-hejny')).toBe(2);
        expect(counts.get('jiri-jahn')).toBe(1);
        expect(counts.get('petr-glaser')).toBeUndefined();
    });
});

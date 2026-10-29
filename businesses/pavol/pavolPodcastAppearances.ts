import type { PavolPodcastAppearance } from './pavolPodcasts';

/** Publisher pages and RSS enclosures reviewed on 2026-10-28; see pavolPodcastSources.md. */
export const PAVOL_PODCAST_APPEARANCES: readonly PavolPodcastAppearance[] = [
    {
        id: 'pavol-podcast:natriai-36', source: 'NatřiAI · Vlny', title: '99 % programování už dnes neplatí',
        href: 'https://www.vlny.cz/podcast/natriai/epizoda/pavel-hejny-99-percent-programovani-uz-dnes-neplati-i-natriai-36',
        publishedAt: '2026-07-15T00:00:00+02:00', language: 'cs', audioUrl: null, durationInSeconds: 3354,
        feedUrl: 'https://anchor.fm/s/1093ef828/podcast/rss', feedTitleIncludes: 'Hejný: 99',
        description: {
            cs: 'S Alexem Brunou a Zdeňkem Valutem o vývoji s AI, otevřených modelech a nezávislosti na jednom dodavateli.',
            en: 'With Alex Bruna and Zdeněk Valut on building software with AI, open models, and independence from a single provider.',
        },
    },
    {
        id: 'pavol-podcast:datatalk-18008082', source: 'Data Talk', title: 'Podcastový průřez feat. AI ta Krajta',
        href: 'https://www.datatalk.cz/podcast/epizoda-157', imageSrc: '/pavol/media/datatalk-podcast.jpg',
        publishedAt: '2025-10-16T07:00:00+02:00', language: 'cs', durationInSeconds: 7526,
        audioUrl: 'https://www.buzzsprout.com/2034779/episodes/18008082-data-talk-special-podcastovy-prurez-feat-ai-ta-krajta.mp3',
        feedUrl: 'https://rss.buzzsprout.com/2034779.rss', feedEpisodeId: 'Buzzsprout-18008082',
        description: {
            cs: 'S Jiřím Vicherkem, Petrem Glaserem a Šimonem Podhajským o roli vývojáře, AI nástrojích a vzniku AI ta Krajta.',
            en: 'With Jiří Vicherek, Petr Glaser, and Šimon Podhajský on the developer’s role, AI tools, and the origins of AI ta Krajta.',
        },
    },
    {
        id: 'pavol-podcast:zatisi-58197915', source: 'Zátiší · Rádio 1', title: 'Pavol Hejný & Tomáš Studeník',
        href: 'https://www.spreaker.com/episode/zatisi-3-1-2024-pavol-hejny-tomas-studenik--58197915', imageSrc: '/pavol/media/radio-1.svg',
        publishedAt: '2024-01-04T14:37:35Z', language: 'cs', durationInSeconds: 3166,
        audioUrl: 'https://api.spreaker.com/download/episode/58197915/z_ti_2024_01_03_a_voj_pavol_hejn_tom_studen_k.mp3',
        feedUrl: 'https://www.spreaker.com/show/4319614/episodes/feed', feedEpisodeId: 'https://api.spreaker.com/episode/58197915',
        description: {
            cs: 'Rozhovor o praktickém používání umělé inteligence, jejím dalším vývoji a situacích, kdy je dobré být opatrný.',
            en: 'A conversation about practical uses of artificial intelligence, its future, and situations that call for caution.',
        },
    },
    {
        id: 'pavol-podcast:sitport-8469691', source: 'Pitchuj · SIT Port', title: 'Collboard a Pavol Hejný',
        href: 'https://www.buzzsprout.com/1466371/episodes/8469691-pitchuj-startup-collboard-a-pavol-hejny', imageSrc: '/pavol/media/sit-port-podcast.jpg',
        publishedAt: '2021-05-06T20:00:00+02:00', language: 'cs', durationInSeconds: 2433,
        audioUrl: 'https://www.buzzsprout.com/1466371/episodes/8469691-pitchuj-startup-collboard-a-pavol-hejny.mp3',
        feedUrl: 'https://rss.buzzsprout.com/1466371.rss', feedEpisodeId: 'Buzzsprout-8469691',
        description: {
            cs: 'O vzniku Collboardu, online výuce a budování vzdělávacího produktu, který pomáhá učitelům i studentům.',
            en: 'On creating Collboard, online teaching, and building an education product that helps teachers and students.',
        },
    },
    {
        id: 'pavol-podcast:youngschoolers-7619749', source: 'Youngschooler’s', title: 'Zjistil jsem, že studenti architektury nechtějí budovat PC hry',
        href: 'https://audioboom.com/posts/7619749', publishedAt: '2020-07-02T01:00:00Z', language: 'cs', durationInSeconds: 1147,
        audioUrl: 'https://audioboom.com/posts/7619749.mp3?modified=1593522838&sid=5027144&source=rss',
        feedUrl: 'https://audioboom.com/channels/5027144.rss', feedEpisodeId: 'tag:audioboom.com,2020-06-30:/posts/7619749',
        description: {
            cs: 'Starší rozhovor o začátcích programování, hrách, podnikání a vzdělávacích projektech.',
            en: 'An earlier interview about getting into programming, games, entrepreneurship, and education projects.',
        },
    },
];

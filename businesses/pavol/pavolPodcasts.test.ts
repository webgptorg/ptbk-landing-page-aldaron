import { describe, expect, it } from 'vitest';
import { parsePodcastRssFeed } from '@/lib/podcast/parsePodcastRssFeed';
import { resolveAiTaKrajtaEpisodePersonIds } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodePeople';
import { getPavolAiTaKrajtaPodcasts, createPavolPodcastTrack, mergePavolPodcasts, resolvePavolPodcastAppearance } from './pavolPodcasts';
import { PAVOL_PODCAST_APPEARANCES } from './pavolPodcastAppearances';

describe('personal podcast sources', () => {
    it('interleaves every show by publication date without grouping or changing source arrays', () => {
        const appearances = PAVOL_PODCAST_APPEARANCES.slice(0, 2).map((appearance) =>
            resolvePavolPodcastAppearance(appearance, [], 'en'),
        );
        const show = [
            { ...appearances[1], id: 'krajta:older', source: 'AI ta Krajta', publishedAt: '2026-06-01T10:00:00Z' },
            { ...appearances[1], id: 'krajta:newest', source: 'AI ta Krajta', publishedAt: '2026-10-28T10:00:00Z' },
        ];
        const combined = mergePavolPodcasts(appearances, show);
        expect(combined.map((episode) => episode.id)).toEqual([
            'krajta:newest', appearances[0].id, 'krajta:older', appearances[1].id,
        ]);
        expect(show[0].id).toBe('krajta:older');
        expect(combined[3]).toBe(appearances[1]);
        expect(mergePavolPodcasts([], show)).toHaveLength(2);
        expect(mergePavolPodcasts()).toEqual([]);
    });

    it('adds a new credited RSS episode without a second list, excludes another cast, and preserves canonical links', () => {
        const feed = parsePodcastRssFeed(`<rss><channel><title>AI ta Krajta</title>
            <item><guid>future</guid><title>AI ta Krajta #999 | Nový díl</title><pubDate>Wed, 28 Oct 2026 10:00:00 GMT</pubDate><description>Hosté: Pavol Hejný</description><enclosure url="https://example.com/999.mp3" type="audio/mpeg" /></item>
            <item><guid>other</guid><title>AI ta Krajta #998 | Jiný díl</title><pubDate>Tue, 27 Oct 2026 10:00:00 GMT</pubDate><description>Hosté: Petr Glaser</description><enclosure url="https://example.com/998.mp3" type="audio/mpeg" /></item>
            </channel></rss>`, { showTitle: 'AI ta Krajta', summaryStopPhrases: [] });
        const episodes = feed.episodes.map(({ descriptionText, ...episode }) => ({ ...episode, personIds: resolveAiTaKrajtaEpisodePersonIds({ ...episode, descriptionText }) }));
        const selected = getPavolAiTaKrajtaPodcasts(episodes);
        expect(selected).toHaveLength(1);
        expect(selected[0]).toMatchObject({ id: 'ai-ta-krajta:999', audioUrl: 'https://example.com/999.mp3', language: 'cs' });
        const canonical = new URL(selected[0].href);
        expect(canonical.origin).toBe('https://ai-ta-krajta.cz');
        expect(canonical.pathname).toBe('/');
        expect(canonical.searchParams.get('episode')).toBe('999');
        expect(createPavolPodcastTrack(selected[0], 'en')).toMatchObject({ id: 'ai-ta-krajta:999', appearance: 'personal', language: 'en', href: selected[0].href });
    });
    it('retains a reviewed playable interview during a publisher outage', () => {
        const appearance = PAVOL_PODCAST_APPEARANCES[1];
        const resolved = resolvePavolPodcastAppearance(appearance, [], 'en');
        expect(resolved.audioUrl).toBe(appearance.audioUrl);
        expect(resolved.description).toBe(appearance.description.en);
        expect(resolved.href).toBe('https://www.datatalk.cz/podcast/epizoda-157');
    });
    it('updates the selected GUID without importing an unrelated guest', () => {
        const feed = parsePodcastRssFeed(`<rss><channel><title>Data Talk</title>
            <item><guid>other</guid><title>Jiný host</title><enclosure url="https://example.com/other.mp3" /></item>
            <item><guid>Buzzsprout-18008082</guid><title>Podcastový průřez</title><enclosure url="https://example.com/refreshed.mp3" /></item>
            </channel></rss>`, { showTitle: 'Data Talk', summaryStopPhrases: [] });
        expect(resolvePavolPodcastAppearance(PAVOL_PODCAST_APPEARANCES[1], feed.episodes, 'cs').audioUrl).toBe('https://example.com/refreshed.mp3');
    });
    it('keeps a source link when no public audio enclosure exists', () => {
        const resolved = resolvePavolPodcastAppearance(PAVOL_PODCAST_APPEARANCES[0], [], 'cs');
        expect(createPavolPodcastTrack(resolved, 'cs')).toBeNull();
        expect(resolved.href).toContain('vlny.cz/podcast/natriai/epizoda/');
    });
});

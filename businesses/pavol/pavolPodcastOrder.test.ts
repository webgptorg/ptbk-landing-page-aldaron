import { describe, expect, it } from 'vitest';
import { sortPavolPodcasts } from './pavolPodcastOrder';

const episodes = [
    { id: 'a1', source: 'AI ta Krajta', publishedAt: '2026-10-26T10:00:00Z' },
    { id: 'a2', source: 'AI ta Krajta', publishedAt: '2026-10-25T10:00:00Z' },
    { id: 'a3', source: 'AI ta Krajta', publishedAt: '2026-10-24T10:00:00Z' },
    { id: 'b1', source: 'NatřiAI', publishedAt: '2026-07-15T10:00:00Z' },
    { id: 'b2', source: 'NatřiAI', publishedAt: '2026-07-14T10:00:00Z' },
    { id: 'c1', source: 'Data Talk', publishedAt: '2025-10-16T10:00:00Z' },
    { id: 'a4', source: 'AI ta Krajta', publishedAt: '2025-01-01T10:00:00Z' },
];

describe('personal podcast ordering', () => {
    it('defaults to the newest episode followed by the newest available different show', () => {
        const input = Object.freeze([...episodes].reverse());
        const ordered = sortPavolPodcasts(input);
        expect(ordered.map((episode) => episode.id)).toEqual(['a1', 'b1', 'a2', 'b2', 'a3', 'c1', 'a4']);
        expect(input.map((episode) => episode.id)).toEqual([...episodes].reverse().map((episode) => episode.id));
        expect(ordered[0]).toBe(episodes[0]);
        expect(new Set(ordered).size).toBe(input.length);
    });

    it('anchors the newest episode even when it belongs to another show', () => {
        const newest = { id: 'c0', source: 'Data Talk', publishedAt: '2026-10-29T10:00:00Z' };
        expect(sortPavolPodcasts([...episodes, newest]).slice(0, 4).map((episode) => episode.id))
            .toEqual(['c0', 'a1', 'b1', 'a2']);
    });

    it('continues chronologically once other shows run out and handles a single show or no episodes', () => {
        const input = episodes.filter((episode) => episode.source === 'AI ta Krajta');
        expect(sortPavolPodcasts(input).map((episode) => episode.id)).toEqual(['a1', 'a2', 'a3', 'a4']);
        expect(sortPavolPodcasts([input[0], input[1], episodes[3], input[2], input[3]]).map((episode) => episode.id))
            .toEqual(['a1', 'b1', 'a2', 'a3', 'a4']);
        expect(sortPavolPodcasts([])).toEqual([]);
        expect(sortPavolPodcasts([episodes[0]])).toEqual([episodes[0]]);
    });

    it('offers strict chronological ordering in both directions', () => {
        expect(sortPavolPodcasts([...episodes].reverse(), 'newest')).toEqual(episodes);
        expect(sortPavolPodcasts(episodes, 'oldest')).toEqual([...episodes].reverse());
    });

    it('uses actual instants across time zones and keeps equal-date ordering deterministic', () => {
        const input = [
            { id: 'earlier', source: 'A', publishedAt: '2026-10-29T10:00:00+02:00' },
            { id: 'later', source: 'A', publishedAt: '2026-10-29T09:00:00Z' },
            { id: 'tie', source: 'A', publishedAt: '2026-10-29T09:00:00Z' },
        ];
        expect(sortPavolPodcasts(input).map((episode) => episode.id)).toEqual(['later', 'tie', 'earlier']);
        expect(sortPavolPodcasts(input, 'oldest').map((episode) => episode.id)).toEqual(['earlier', 'later', 'tie']);
    });
});

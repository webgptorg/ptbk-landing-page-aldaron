import { describe, expect, it } from 'vitest';
import type { ArticleListing } from '@/lib/articles/types';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { pavolMediaAppearances, type PavolMediaAppearance } from './config-media';
import { getPavolHomepageInterestKey, PAVOL_HOMEPAGE_INTEREST, selectPavolHomepageItems } from './pavolHomepageSelection';
import type { PavolPodcast } from './pavolPodcasts';

function article(id: string, overrides: Partial<ArticleListing> = {}): ArticleListing {
    return {
        id, authorId: 'pavol-hejny', language: 'cs', slug: id, title: id, perex: 'Article introduction.',
        publishedAt: '2026-10-20T12:00:00Z', canonicalUrl: `https://pavolhejny.cz/articles/${id}`,
        author: { id: 'pavol-hejny', name: 'Pavol Hejný', photoUrl: '/portrait.png', bio: { cs: '', en: '' }, domains: {}, socialLinks: [] },
        ...overrides,
    };
}
function ownArticle(language: SupportedHomepageLanguage): ArticleListing {
    const slug = language === 'cs' ? 'co-prichazi-po-generovani-kodu' : 'what-comes-after-code-generation';
    return article(`spec-driven-anchoring-${language}`, { language, slug,
        canonicalUrl: `https://pavolhejny.${language === 'cs' ? 'cz' : 'com'}/articles/${slug}` });
}
function podcast(id: string, source: string, publishedAt = '2026-10-01T12:00:00Z', overrides: Partial<PavolPodcast> = {}): PavolPodcast {
    return { id, source, title: id, description: 'Conversation.', href: `https://example.com/podcast/${id}`, publishedAt,
        language: 'cs', audioUrl: `https://example.com/${id}.mp3`, durationInSeconds: 60, ...overrides };
}
function media(href: string, overrides: Partial<PavolMediaAppearance> = {}): PavolMediaAppearance {
    return { href, source: 'Publication', kind: 'Article', title: 'Press article', description: 'Press description.', importance: 'rest', ...overrides };
}
function personalSources(language: SupportedHomepageLanguage = 'cs') {
    return {
        language,
        articles: [ownArticle(language), ...Array.from({ length: 10 }, (_, index) => article(`syndicated-${index}`, {
            language, syndicated: true, publishedAt: `2026-11-${String(index + 1).padStart(2, '0')}T12:00:00Z`,
            canonicalUrl: `https://ptbk.io/${language}/komunity/promptbook/clanky/${index}`,
        }))],
        podcasts: [
            podcast('ai-ta-krajta:71', 'AI ta Krajta', '2026-10-26T12:00:00Z'),
            podcast('ai-ta-krajta:72', 'AI ta Krajta', '2026-11-11T12:00:00Z'),
            podcast('pavol-podcast:datatalk-18008082', 'Data Talk', '2025-10-16T12:00:00Z'),
            podcast('natriai', 'NatřiAI · Vlny', '2026-07-15T12:00:00Z'),
            podcast('zatisi', 'Zátiší · Rádio 1', '2024-01-04T12:00:00Z'),
        ],
        appearances: pavolMediaAppearances[language],
    };
}

describe('curated personal homepage selection', () => {
    it.each(['cs', 'en'] as const)('keeps Krajta, Data Talk, the native article and Euro ahead of new syndicated articles in %s', language => {
        const selected = selectPavolHomepageItems(personalSources(language));
        expect(selected.map(item => item.key)).toEqual([
            'podcast:ai-ta-krajta:72',
            'podcast:pavol-podcast:datatalk-18008082',
            `article:spec-driven-anchoring-${language}`,
            'media:https://euro.cz/clanky/digitalni-skamny-pandemie-rozpohybovala-zkostnatele-ceske-skolstvi',
            'podcast:natriai',
        ]);
        expect(selected.filter(item => item.kind === 'podcast').every(item => item.item.language === 'cs')).toBe(true);
    });

    it('uses publication date within one interest level and explicit interest ahead of recency', () => {
        const input = { language: 'cs' as const, articles: [], appearances: [], podcasts: [
            podcast('older', 'First show', '2025-01-01T12:00:00Z'),
            podcast('newer', 'Second show', '2026-11-01T12:00:00Z'),
        ] };
        expect(selectPavolHomepageItems(input).map(item => item.key)).toEqual(['podcast:newer', 'podcast:older']);
        expect(selectPavolHomepageItems({ ...input, interestOverrides: { 'podcast:older': 101 } }).map(item => item.key))
            .toEqual(['podcast:older', 'podcast:newer']);
    });

    it('allows an exact syndicated article to be deliberately featured without changing its publication data', () => {
        const input = personalSources();
        const before = JSON.stringify(input);
        const selected = selectPavolHomepageItems({ ...input, interestOverrides: { 'article:syndicated-0': 95 } });
        expect(selected[1].key).toBe('article:syndicated-0');
        expect(selected[1].interest).toBe(95);
        expect(JSON.stringify(input)).toBe(before);
        expect(PAVOL_HOMEPAGE_INTEREST.defaults.syndicatedArticle).toBe(0);
    });

    it('deduplicates IDs, canonical URLs and podcast shows, and never selects more than five items', () => {
        const input = personalSources();
        const duplicate = podcast('ai-ta-krajta:72', 'AI ta Krajta', '2026-11-11T12:00:00Z');
        const radioDuplicate = podcast('zatisi-alias', '  ZÁTIŠÍ · RÁDIO 1  ', '2024-01-05T12:00:00Z');
        const selected = selectPavolHomepageItems({ ...input,
            podcasts: [...input.podcasts, duplicate, radioDuplicate],
            appearances: [...input.appearances, media('http://euro.cz/clanky/digitalni-skamny-pandemie-rozpohybovala-zkostnatele-ceske-skolstvi/?utm_source=duplicate#section')],
            limit: 99,
        });
        expect(selected).toHaveLength(5);
        expect(selected.filter(item => item.kind === 'podcast' && item.item.source === 'AI ta Krajta')).toHaveLength(1);
        expect(selected.filter(item => item.kind === 'media')).toHaveLength(1);
        const onlyDuplicates = selectPavolHomepageItems({ language: 'cs', articles: [], appearances: [],
            podcasts: [podcast('same-id', 'One'), podcast('same-id', 'One'), podcast('alias', 'One', '2026-11-01T00:00:00Z'),
                podcast('different-id', 'Other', '2026-10-01T00:00:00Z', { href: 'https://www.example.com/podcast/alias/?playing=1&utm_campaign=a' })] });
        expect(onlyDuplicates).toHaveLength(1);
    });

    it('honors original prominence zero even when its homepage interest is raised', () => {
        const item = ownArticle('cs');
        const selected = selectPavolHomepageItems({ language: 'cs', articles: [{ ...item, prominence: 0 }],
            podcasts: [podcast('hidden', 'AI ta Krajta', undefined, { prominence: 0 })],
            appearances: [media('https://example.com/hidden', { prominence: 0 })],
            interestOverrides: { [`article:${item.id}`]: 200, 'podcast:hidden': 200, 'media:https://example.com/hidden': 200 },
        });
        expect(selected).toEqual([]);
    });

    it('keeps omissions, language matching and an empty source set deterministic', () => {
        const sources = personalSources('cs');
        const selected = selectPavolHomepageItems({ ...sources, articles: [ownArticle('cs'), ownArticle('en')],
            interestOverrides: { 'podcast:ai-ta-krajta:71': 0, 'podcast:ai-ta-krajta:72': 0 } });
        expect(selected.some(item => item.kind === 'article' && item.item.language === 'en')).toBe(false);
        expect(selected.some(item => item.kind === 'podcast' && item.item.source === 'AI ta Krajta')).toBe(false);
        expect(selectPavolHomepageItems({ language: 'en', articles: [], podcasts: [], appearances: [] })).toEqual([]);
        expect(selectPavolHomepageItems({ ...sources, limit: 0 })).toEqual([]);
        expect(selectPavolHomepageItems(sources).map(item => item.key))
            .toEqual(selectPavolHomepageItems({ ...sources, articles: [...sources.articles].reverse(), podcasts: [...sources.podcasts].reverse() }).map(item => item.key));
    });

    it('produces editable canonical press keys and preserves meaningful episode query parameters', () => {
        expect(getPavolHomepageInterestKey({ kind: 'media', item: media('http://www.euro.cz/story/?utm_source=test#headline') }))
            .toBe('media:https://euro.cz/story');
        const selected = selectPavolHomepageItems({ language: 'cs', articles: [], appearances: [], podcasts: [
            podcast('one', 'One', undefined, { href: 'https://ai-ta-krajta.cz/?episode=one&playing=1' }),
            podcast('two', 'Two', undefined, { href: 'https://ai-ta-krajta.cz/?episode=two&playing=1' }),
        ] });
        expect(selected).toHaveLength(2);
    });
});

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('react', async (load) => ({
    ...await load<typeof import('react')>(),
    cache: (fn: unknown) => fn,
}));
vi.mock('@/lib/community-membership/communityMembershipArticleAccess', () => ({
    canReadCommunityMemberArticle: vi.fn(),
}));
vi.mock('@/lib/supabase', () => ({ createSupabaseServiceRoleClient: () => null }));
vi.mock('./legacyArticlePlacements', async (load) => ({
    ...await load<typeof import('./legacyArticlePlacements')>(),
    getLegacyArticlePlacements: vi.fn(),
}));
vi.mock('./managedArticles', async (load) => ({
    ...await load<typeof import('./managedArticles')>(),
    readPublishedManagedArticle: vi.fn(),
    readPublishedManagedArticles: vi.fn(),
}));

import { canReadCommunityMemberArticle } from '@/lib/community-membership/communityMembershipArticleAccess';
import { getArticle } from './load';
import { getLegacyArticlePlacements } from './legacyArticlePlacements';
import { readPublishedManagedArticle, readPublishedManagedArticles, type ManagedArticleRow } from './managedArticles';
import {
    getLegacyArticleSitemapEntries, getManagedPublicCanonicalArticles, getPublishedArticle,
    getCommunityArticleCards, getCommunityArticleDetail, getPublishedCommunityArticle,
} from './publishedArticles';

afterEach(() => vi.resetAllMocks());

describe('article destination resolution', () => {
    it('adds a Git article to both communities with its existing source and recording', async () => {
        const slug = 'co-prichazi-po-generovani-kodu';
        const legacy = getArticle(slug, 'cs')!;
        vi.mocked(getLegacyArticlePlacements).mockResolvedValue({
            [legacy.id]: { communities: ['vyvojari', 'promptbook'], canonicalDestination: 'promptbook' },
        });
        vi.mocked(readPublishedManagedArticles).mockResolvedValue([]);
        const canonicalUrl = `https://ptbk.io/cs/komunity/promptbook/clanky/cs/${slug}`;

        expect(await getPublishedArticle('cs', slug, 'personal')).toMatchObject({
            id: legacy.id, audio: legacy.audio, pdfUrl: legacy.pdfUrl, canonicalUrl,
        });
        expect(await getPublishedCommunityArticle('vyvojari', 'cs', slug)).toMatchObject({
            visibility: 'public', article: { id: legacy.id, markdown: legacy.markdown, canonicalUrl },
        });
        expect(await getCommunityArticleCards('promptbook', true)).toEqual([expect.objectContaining({ id: legacy.id, authorName: legacy.author.name })]);
        expect(await getManagedPublicCanonicalArticles(['promptbook'])).toEqual([expect.objectContaining({ id: legacy.id, canonicalUrl })]);
        expect((await getLegacyArticleSitemapEntries('personal', 'cs')).some((article) => article.id === legacy.id)).toBe(false);
        expect(canReadCommunityMemberArticle).not.toHaveBeenCalled();
    });

    it('authorizes a gated detail and listing only for the destination’s entitlement', async () => {
        const row: ManagedArticleRow = {
            id: '3082c899-26ad-418e-b638-e15f3c47d9cc', revision: '00000000-0000-4000-8000-000000000000',
            language: 'cs', slug: 'skryty-clanek', title: 'Členský článek', perex: 'Perex.', markdown: 'Celý text.',
            author_id: 'pavol-hejny', placements: [{ destination: 'vyvojari', visibility: 'members' }],
            canonical_destination: 'vyvojari', published_at: '2026-11-09T19:00:00Z',
            created_at: '2026-11-09T19:00:00Z', updated_at: '2026-11-09T19:00:00Z',
            audio_asset: null, pdf_asset: null, words_asset: null, subtitles_asset: null,
        };
        vi.mocked(getLegacyArticlePlacements).mockResolvedValue({});
        vi.mocked(readPublishedManagedArticle).mockResolvedValue(row);
        vi.mocked(readPublishedManagedArticles).mockResolvedValue([row]);
        vi.mocked(canReadCommunityMemberArticle).mockResolvedValue(false);
        expect(await getPublishedCommunityArticle('vyvojari', 'cs', row.slug)).toBeNull();
        expect(await getCommunityArticleCards('vyvojari')).toEqual([]);
        vi.mocked(canReadCommunityMemberArticle).mockResolvedValue(true);
        expect(await getPublishedCommunityArticle('promptbook', 'cs', row.slug)).toBeNull();
        expect(await getCommunityArticleCards('vyvojari', true)).toEqual([]);
        expect(await getPublishedCommunityArticle('vyvojari', 'cs', row.slug)).toMatchObject({
            article: { title: 'Členský článek' }, visibility: 'members',
        });
        expect(canReadCommunityMemberArticle).toHaveBeenLastCalledWith('vyvojari', 'members');
        expect(await getManagedPublicCanonicalArticles(['vyvojari'])).toEqual([]);
    });

    it('exposes only a free Promptbook article opening until the same community session is authorized', async () => {
        const row: ManagedArticleRow = {
            id: '3082c899-26ad-418e-b638-e15f3c47d9cc', revision: '00000000-0000-4000-8000-000000000000',
            language: 'cs', slug: 'clanek-s-uvodem', title: 'Článek s úvodem', perex: 'Perex.',
            markdown: '# Článek s úvodem\n\nPerex.\n\nOtevírací **odstavec**.\n\n## Neveřejná kapitola\n\nSoukromý zbytek.',
            author_id: 'pavol-hejny', placements: [{ destination: 'promptbook', visibility: 'members' }],
            canonical_destination: 'promptbook', published_at: '2026-11-09T19:00:00Z',
            created_at: '2026-11-09T19:00:00Z', updated_at: '2026-11-09T19:00:00Z',
            audio_asset: null, pdf_asset: null, words_asset: null, subtitles_asset: null,
        };
        vi.mocked(getLegacyArticlePlacements).mockResolvedValue({});
        vi.mocked(readPublishedManagedArticle).mockResolvedValue(row);
        vi.mocked(readPublishedManagedArticles).mockResolvedValue([row]);
        vi.mocked(canReadCommunityMemberArticle).mockResolvedValue(false);

        expect(await getCommunityArticleDetail('promptbook', 'cs', row.slug)).toEqual({
            kind: 'teaser', title: row.title, perex: row.perex, openingMarkdown: 'Otevírací **odstavec**.',
        });
        const cards = await getCommunityArticleCards('promptbook', true);
        expect(cards).toHaveLength(1);
        expect(cards[0]).not.toHaveProperty('markdown');
        expect(await getCommunityArticleDetail('vyvojari', 'cs', row.slug)).toBeNull();

        vi.mocked(canReadCommunityMemberArticle).mockResolvedValue(true);
        expect(await getCommunityArticleDetail('promptbook', 'cs', row.slug)).toMatchObject({
            kind: 'article', visibility: 'members', article: { markdown: row.markdown },
        });
        expect(canReadCommunityMemberArticle).toHaveBeenLastCalledWith('promptbook', 'members');

        const paid = { ...row, placements: [{ destination: 'promptbook', visibility: 'paid' }] } satisfies ManagedArticleRow;
        vi.mocked(readPublishedManagedArticle).mockResolvedValue(paid);
        vi.mocked(readPublishedManagedArticles).mockResolvedValue([paid]);
        vi.mocked(canReadCommunityMemberArticle).mockResolvedValue(false);
        expect(await getCommunityArticleDetail('promptbook', 'cs', row.slug)).toBeNull();
        expect(await getCommunityArticleCards('promptbook', true)).toEqual([]);
    });
});

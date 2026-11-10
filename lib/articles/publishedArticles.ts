import 'server-only';

import { cache } from 'react';
import { getArticleOpeningParagraph } from '@/businesses/articles/articleDocument';
import { canReadCommunityMemberArticle } from '@/lib/community-membership/communityMembershipArticleAccess';
import { getArticleAuthor } from './authors';
import { getAllArticles } from './load';
import { applyLegacyArticlePlacements, getLegacyArticlePlacements } from './legacyArticlePlacements';
import { isArticleCommunity, type ManagedArticleDestination, type ManagedArticlePlacement } from './managedArticleInput';
import { getManagedArticleAssetPath, getManagedArticleUrl } from './managedArticleUrls';
import { getCurrentManagedArticleAsset, readPublishedManagedArticle, readPublishedManagedArticles, type ManagedArticleRow } from './managedArticles';
import type { Article, ArticleLanguage, ArticleListing, ArticlePublication } from './types';
import { ARTICLE_ASSET_ORIGIN } from './urls';

const BLOG_DESTINATIONS = { promptbook: 'promptbook-blog', personal: 'personal-blog' } as const;
const PAVOL_AUTHOR_ID = 'pavol-hejny';

export function getArticlePlacement(row: ManagedArticleRow, destination: ManagedArticleDestination): ManagedArticlePlacement | undefined {
    return row.placements.find((placement) => placement.destination === destination);
}

export async function canReadManagedArticlePlacement(placement: ManagedArticlePlacement): Promise<boolean> {
    return placement.visibility === 'public'
        || (isArticleCommunity(placement.destination) && await canReadCommunityMemberArticle(placement.destination, placement.visibility));
}

function toPublishedArticle(row: ManagedArticleRow, placement: ManagedArticlePlacement): Article | null {
    const author = getArticleAuthor(row.author_id);
    if (!author || !row.canonical_destination || !row.published_at) return null;
    const community = placement.visibility !== 'public' && isArticleCommunity(placement.destination) ? placement.destination : undefined;
    const assetPath = (kind: Parameters<typeof getManagedArticleAssetPath>[1]) => getManagedArticleAssetPath(row.id, kind, community);
    const assetUrl = (kind: Parameters<typeof getManagedArticleAssetPath>[1]) => community ? assetPath(kind) : `${ARTICLE_ASSET_ORIGIN}${assetPath(kind)}`;
    const audio = getCurrentManagedArticleAsset(row, 'audio');
    return {
        id: row.id, translationGroupId: row.id, managed: true, authorId: author.id, author, language: row.language,
        slug: row.slug, title: row.title, perex: row.perex, markdown: row.markdown,
        publishedAt: row.published_at, updatedAt: row.updated_at, tags: [], translations: [],
        canonicalUrl: getManagedArticleUrl(row, row.canonical_destination),
        pdfUrl: getCurrentManagedArticleAsset(row, 'pdf') ? assetPath('pdf') : undefined,
        audio: audio?.duration ? {
            url: assetUrl('audio'), duration: audio.duration, byteLength: audio.byteLength, mimeType: 'audio/mpeg',
            wordsUrl: getCurrentManagedArticleAsset(row, 'words') ? assetPath('words') : undefined,
            subtitlesUrl: getCurrentManagedArticleAsset(row, 'subtitles') ? assetUrl('subtitles') : undefined,
        } : undefined,
    };
}

export const getPublishedArticle = cache(async (
    language: ArticleLanguage,
    slug: string,
    publication: ArticlePublication,
): Promise<Article | undefined> => {
    const legacyArticles = getAllArticles();
    const legacy = legacyArticles.find((article) => article.slug === slug && article.language === language
        && (publication === 'promptbook' || article.authorId === PAVOL_AUTHOR_ID));
    if (legacy) return applyLegacyArticlePlacements(legacy, await getLegacyArticlePlacements(), legacyArticles);
    const destination = BLOG_DESTINATIONS[publication];
    const row = await readPublishedManagedArticle(language, slug, destination);
    const placement = row ? getArticlePlacement(row, destination) : undefined;
    return row && placement?.visibility === 'public' ? toPublishedArticle(row, placement) ?? undefined : undefined;
});

export async function getPublishedArticles(language: ArticleLanguage, publication: ArticlePublication): Promise<Article[]> {
    const destination = BLOG_DESTINATIONS[publication];
    const [managed, legacyPlacements] = await Promise.all([
        readPublishedManagedArticles(language, destination, true), getLegacyArticlePlacements(),
    ]);
    const legacyArticles = getAllArticles();
    const legacy = legacyArticles.filter((article) => article.language === language && (publication === 'promptbook' || article.authorId === PAVOL_AUTHOR_ID))
        .map((article) => applyLegacyArticlePlacements(article, legacyPlacements, legacyArticles));
    const reservedSlugs = new Set(legacy.map(({ slug }) => slug));
    return [...legacy, ...managed.flatMap((row) => {
        const placement = getArticlePlacement(row, destination);
        const article = placement?.visibility === 'public' && !reservedSlugs.has(row.slug) ? toPublishedArticle(row, placement) : null;
        return article ? [article] : [];
    })].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id));
}

function offersFreeArticleTeaser(community: 'vyvojari' | 'promptbook', placement: ManagedArticlePlacement): boolean {
    return community === 'promptbook' && placement.visibility === 'members';
}

/** The personal site and its RSS use the same editorial placements and article IDs. */
export async function getPersonalArticleListings(language: ArticleLanguage): Promise<ArticleListing[]> {
    const [personal, community] = await Promise.all([
        getPublishedArticles(language, 'personal'),
        readPublishedManagedArticles(language, 'promptbook', false, PAVOL_AUTHOR_ID),
    ]);
    const listings = new Map<string, ArticleListing>(personal.map((article) => [article.id, article]));
    for (const row of community) {
        if (!row.published_at || !row.canonical_destination || row.author_id !== PAVOL_AUTHOR_ID
            || row.language !== language || listings.has(row.id)) continue;
        const source = getArticlePlacement(row, 'promptbook');
        if (!source || (source.visibility !== 'public' && !offersFreeArticleTeaser('promptbook', source))) continue;

        const canonical = getArticlePlacement(row, row.canonical_destination);
        if (canonical?.visibility === 'public') {
            const article = toPublishedArticle(row, canonical);
            if (article) listings.set(row.id, { ...article, syndicated: true });
        } else if (canonical?.destination === 'promptbook' && offersFreeArticleTeaser('promptbook', canonical)) {
            const author = getArticleAuthor(row.author_id);
            if (!author) continue;
            listings.set(row.id, {
                id: row.id, managed: true, authorId: author.id, author, language: row.language, slug: row.slug,
                title: row.title, perex: row.perex, publishedAt: row.published_at, syndicated: true,
                canonicalUrl: getManagedArticleUrl(row, canonical.destination),
            });
        }
    }
    return Array.from(listings.values()).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id));
}

type CommunityArticleDetail =
    | { readonly kind: 'article'; readonly article: Article; readonly visibility: ManagedArticlePlacement['visibility'] }
    | { readonly kind: 'teaser'; readonly title: string; readonly perex: string; readonly openingMarkdown: string; readonly canonicalUrl: string };

export const getCommunityArticleDetail = cache(async (
    community: 'vyvojari' | 'promptbook',
    language: ArticleLanguage,
    slug: string,
): Promise<CommunityArticleDetail | null> => {
    const legacyArticles = getAllArticles();
    const legacy = legacyArticles.find((article) => article.slug === slug && article.language === language);
    if (legacy) {
        const placements = await getLegacyArticlePlacements();
        return placements[legacy.id]?.communities.includes(community)
            ? { kind: 'article', article: applyLegacyArticlePlacements(legacy, placements, legacyArticles), visibility: 'public' }
            : null;
    }
    const row = await readPublishedManagedArticle(language, slug, community);
    if (!row?.canonical_destination || !row.published_at) return null;
    const placement = getArticlePlacement(row, community);
    if (!placement) return null;
    if (!await canReadManagedArticlePlacement(placement)) {
        return offersFreeArticleTeaser(community, placement) ? {
            kind: 'teaser',
            title: row.title,
            perex: row.perex,
            openingMarkdown: getArticleOpeningParagraph(row.markdown, row.title, row.perex),
            canonicalUrl: getManagedArticleUrl(row, row.canonical_destination),
        } : null;
    }
    const article = toPublishedArticle(row, placement);
    return article ? { kind: 'article', article, visibility: placement.visibility } : null;
});

export async function getPublishedCommunityArticle(community: 'vyvojari' | 'promptbook', language: ArticleLanguage, slug: string) {
    const detail = await getCommunityArticleDetail(community, language, slug);
    return detail?.kind === 'article' ? { article: detail.article, visibility: detail.visibility } : null;
}

type CommunityArticleCard = Pick<Article, 'id' | 'title' | 'perex' | 'language' | 'slug' | 'publishedAt'> & {
    readonly authorName: string;
    readonly hasAudio: boolean;
};

export async function getCommunityArticleCards(
    community: 'vyvojari' | 'promptbook',
    waitingRoom = false,
): Promise<readonly CommunityArticleCard[]> {
    const [rows, legacyPlacements] = await Promise.all([
        readPublishedManagedArticles(undefined, community, waitingRoom && community !== 'promptbook'),
        getLegacyArticlePlacements(),
    ]);
    const legacyArticles = getAllArticles();
    const legacy = legacyArticles.filter((article) => legacyPlacements[article.id]?.communities.includes(community))
        .map(({ id, title, perex, language, slug, publishedAt, author, audio }) => ({
            id, title, perex, language, slug, publishedAt, authorName: author.name, hasAudio: Boolean(audio),
        }));
    const reservedSlugs = new Set(legacyArticles.map((article) => `${article.language}/${article.slug}`));
    const accessByVisibility = new Map<ManagedArticlePlacement['visibility'], Promise<boolean>>();
    const articles = await Promise.all(rows.map(async (row): Promise<CommunityArticleCard | null> => {
        const placement = getArticlePlacement(row, community);
        const author = getArticleAuthor(row.author_id);
        if (!placement || !author || !row.published_at || reservedSlugs.has(`${row.language}/${row.slug}`)) return null;

        if (placement.visibility !== 'public' && !offersFreeArticleTeaser(community, placement)) {
            if (waitingRoom) return null;
            let access = accessByVisibility.get(placement.visibility);
            if (!access) {
                access = canReadManagedArticlePlacement(placement);
                accessByVisibility.set(placement.visibility, access);
            }
            if (!await access) return null;
        }

        return {
            id: row.id, title: row.title, perex: row.perex, language: row.language, slug: row.slug,
            publishedAt: row.published_at, authorName: author.name, hasAudio: Boolean(getCurrentManagedArticleAsset(row, 'audio')),
        };
    }));
    return [...legacy, ...articles.filter((article): article is CommunityArticleCard => article !== null)]
        .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id));
}

/** Index only the explicitly chosen public URL, regardless of the content's other placements. */
export async function getManagedPublicCanonicalArticles(destinations: readonly ManagedArticleDestination[]): Promise<Article[]> {
    const published = await Promise.all(destinations.map(async (destination) => (
        await readPublishedManagedArticles(undefined, destination, true)
    ).flatMap((row) => {
        const placement = getArticlePlacement(row, destination);
        const article = row.canonical_destination === destination && placement?.visibility === 'public'
            ? toPublishedArticle(row, placement)
            : null;
        return article ? [article] : [];
    })));
    const legacyArticles = getAllArticles();
    const legacyPlacements = await getLegacyArticlePlacements();
    const legacy = legacyArticles.filter((article) => {
        const destination = legacyPlacements[article.id]?.canonicalDestination;
        return destination !== undefined && isArticleCommunity(destination) && destinations.includes(destination);
    }).map((article) => applyLegacyArticlePlacements(article, legacyPlacements, legacyArticles));
    return [...published.flat(), ...legacy];
}


/** Git articles without an editorial overlay retain their historical sitemap discovery. */
export async function getLegacyArticleSitemapEntries(publication: ArticlePublication, language?: ArticleLanguage): Promise<Article[]> {
    const legacyArticles = getAllArticles();
    const placements = await getLegacyArticlePlacements();
    return legacyArticles.filter((article) => {
        const overlay = placements[article.id];
        return (!language || article.language === language) && (publication === 'promptbook' || article.authorId === PAVOL_AUTHOR_ID)
            && (!overlay || overlay.canonicalDestination === BLOG_DESTINATIONS[publication]);
    }).map((article) => applyLegacyArticlePlacements(article, placements, legacyArticles));
}

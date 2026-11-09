import 'server-only';

import { cache } from 'react';
import { canReadCommunityMemberArticle } from '@/lib/community-membership/communityMembershipArticleAccess';
import { getArticleAuthor } from './authors';
import { getAllArticles } from './load';
import { applyLegacyArticlePlacements, getLegacyArticlePlacements } from './legacyArticlePlacements';
import { isArticleCommunity, type ManagedArticleDestination, type ManagedArticlePlacement } from './managedArticleInput';
import { getManagedArticleAssetPath, getManagedArticleUrl } from './managedArticleUrls';
import { getCurrentManagedArticleAsset, readPublishedManagedArticle, readPublishedManagedArticles, type ManagedArticleRow } from './managedArticles';
import type { Article, ArticleLanguage, ArticlePublication } from './types';
import { ARTICLE_ASSET_ORIGIN } from './urls';

const BLOG_DESTINATIONS = { promptbook: 'promptbook-blog', personal: 'personal-blog' } as const;

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
        && (publication === 'promptbook' || article.authorId === 'pavol-hejny'));
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
    const legacy = legacyArticles.filter((article) => article.language === language && (publication === 'promptbook' || article.authorId === 'pavol-hejny'))
        .map((article) => applyLegacyArticlePlacements(article, legacyPlacements, legacyArticles));
    const reservedSlugs = new Set(legacy.map(({ slug }) => slug));
    return [...legacy, ...managed.flatMap((row) => {
        const placement = getArticlePlacement(row, destination);
        const article = placement?.visibility === 'public' && !reservedSlugs.has(row.slug) ? toPublishedArticle(row, placement) : null;
        return article ? [article] : [];
    })].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id));
}

export const getPublishedCommunityArticle = cache(async (community: 'vyvojari' | 'promptbook', language: ArticleLanguage, slug: string) => {
    const legacyArticles = getAllArticles();
    const legacy = legacyArticles.find((article) => article.slug === slug && article.language === language);
    if (legacy) {
        const placements = await getLegacyArticlePlacements();
        return placements[legacy.id]?.communities.includes(community)
            ? { article: applyLegacyArticlePlacements(legacy, placements, legacyArticles), visibility: 'public' as const }
            : null;
    }
    const row = await readPublishedManagedArticle(language, slug, community);
    if (!row) return null;
    const placement = getArticlePlacement(row, community);
    if (!placement || !await canReadManagedArticlePlacement(placement)) return null;
    const article = toPublishedArticle(row, placement);
    return article ? { article, visibility: placement.visibility } : null;
});

export async function getPublishedCommunityArticles(community: 'vyvojari' | 'promptbook', publicOnly = false): Promise<readonly Article[]> {
    const [rows, legacyPlacements] = await Promise.all([
        readPublishedManagedArticles(undefined, community, publicOnly), getLegacyArticlePlacements(),
    ]);
    const legacyArticles = getAllArticles();
    const legacy = legacyArticles.filter((article) => legacyPlacements[article.id]?.communities.includes(community))
        .map((article) => applyLegacyArticlePlacements(article, legacyPlacements, legacyArticles));
    const accessByVisibility = new Map<ManagedArticlePlacement['visibility'], Promise<boolean>>();
    const articles = await Promise.all(rows.map(async (row) => {
        const placement = getArticlePlacement(row, community);
        if (!placement || (publicOnly && placement.visibility !== 'public')) return null;
        let access = accessByVisibility.get(placement.visibility);
        if (!access) {
            access = canReadManagedArticlePlacement(placement);
            accessByVisibility.set(placement.visibility, access);
        }
        return await access ? toPublishedArticle(row, placement) : null;
    }));
    const reservedSlugs = new Set(legacyArticles.map((article) => `${article.language}/${article.slug}`));
    return [...legacy, ...articles.filter((article): article is Article => article !== null && !reservedSlugs.has(`${article.language}/${article.slug}`))]
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
        return (!language || article.language === language) && (publication === 'promptbook' || article.authorId === 'pavol-hejny')
            && (!overlay || overlay.canonicalDestination === BLOG_DESTINATIONS[publication]);
    }).map((article) => applyLegacyArticlePlacements(article, placements, legacyArticles));
}

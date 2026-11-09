import type { Article } from './types';
import { isArticleCommunity, type ManagedArticleAssetKind, type ManagedArticleDestination } from './managedArticleInput';
import { ARTICLE_ASSET_ORIGIN, getArticleUrl } from './urls';

export function getManagedArticleUrl(
    article: Pick<Article, 'language' | 'slug'>,
    destination: ManagedArticleDestination,
): string {
    if (isArticleCommunity(destination)) {
        return `${ARTICLE_ASSET_ORIGIN}/cs/komunity/${destination}/clanky/${article.language}/${article.slug}`;
    }
    return getArticleUrl(article, destination === 'personal-blog' ? 'personal' : 'promptbook');
}

export function getManagedArticleAssetPath(
    articleId: string,
    kind: ManagedArticleAssetKind,
    community?: 'vyvojari' | 'promptbook',
): string {
    const base = community ? `/cs/komunity/${community}/clanky/media` : '/api/articles/media';
    return `${base}/${articleId}/${kind}`;
}

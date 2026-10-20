import type { Article, ArticleLanguage, ArticlePublication } from './types';

/** All publications consume the same immutable asset URL, including both podcast enclosures. */
export const ARTICLE_ASSET_ORIGIN = 'https://ptbk.io';

export function getArticleIndexUrl(language: ArticleLanguage, publication: ArticlePublication): string {
    return publication === 'personal'
        ? `https://pavolhejny.${language === 'cs' ? 'cz' : 'com'}/articles`
        : `https://ptbk.io/${language}/articles`;
}

export function getArticleUrl(article: Pick<Article, 'language' | 'slug'>, publication: ArticlePublication): string {
    return `${getArticleIndexUrl(article.language, publication)}/${article.slug}`;
}

export function getArticlePodcastUrl(language: ArticleLanguage, publication: ArticlePublication): string {
    return `${getArticleIndexUrl(language, publication)}/podcast.xml`;
}

export function getArticleAssetUrl(id: string, file: string): string {
    return `${ARTICLE_ASSET_ORIGIN}/article-assets/${encodeURIComponent(id)}/${file.split('/').map(encodeURIComponent).join('/')}`;
}

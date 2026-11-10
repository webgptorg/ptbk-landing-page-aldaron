import type { ManagedArticle } from './managedArticles';
import type { LegacyArticlePlacements } from './legacyArticlePlacements';
import type { ManagedArticleDestination } from './managedArticleInput';
import type { ArticleLanguage } from './types';

export const ARTICLES_ADMIN_API = '/api/admin/articles';

export const ARTICLE_DESTINATION_LABELS: Record<ManagedArticleDestination, string> = {
    'promptbook-blog': 'Blog Promptbooku',
    'personal-blog': 'Osobní blog',
    vyvojari: 'Komunita Vývojáři',
    promptbook: 'Komunita Promptbook',
};

export type ManagedArticleSummary = Pick<ManagedArticle,
    'id' | 'language' | 'slug' | 'title' | 'authorId' | 'placements' | 'canonicalDestination' | 'publishedAt'>;

export type GitArticleSummary = {
    readonly id: string;
    readonly title: string;
    readonly slug: string;
    readonly language: ArticleLanguage;
    readonly authorId: string;
    readonly canonicalUrl: string;
    readonly fixedDestinations: readonly ManagedArticleDestination[];
    readonly publication: GitArticlePublication;
};

export type GitArticlePublication = Readonly<LegacyArticlePlacements>;

export type ArticleAdminList = {
    readonly articles: ManagedArticleSummary[];
    readonly gitArticles: GitArticleSummary[];
    readonly mediaConfigured: boolean;
    readonly narrationConfigured: boolean;
};

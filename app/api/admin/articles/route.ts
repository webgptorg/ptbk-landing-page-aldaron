import type { NextRequest } from 'next/server';
import type { ArticleAdminList, GitArticleSummary } from '@/lib/articles/articleAdminTypes';
import { getLegacyArticlePlacements } from '@/lib/articles/legacyArticlePlacements';
import { getAllArticles } from '@/lib/articles/load';
import { articleAdminJson, readArticleAdminBody, withArticleAdmin } from '@/lib/articles/managedArticleAdminApi';
import { managedArticleInputSchema } from '@/lib/articles/managedArticleInput';
import { getManagedArticleUrl } from '@/lib/articles/managedArticleUrls';
import { createManagedArticle, listManagedArticles } from '@/lib/articles/managedArticles';
import { revalidateArticlePublications } from '@/lib/articles/revalidateArticlePublications';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
    return withArticleAdmin(request, async () => {
        const [managedArticles, legacyPlacements] = await Promise.all([listManagedArticles(), getLegacyArticlePlacements()]);
        const articles = managedArticles.map(({ id, language, slug, title, authorId, placements, canonicalDestination, publishedAt }) => ({
            id, language, slug, title, authorId, placements, canonicalDestination, publishedAt,
        }));
        const gitArticles = getAllArticles().map(({ id, language, slug, title, authorId, canonicalUrl }): GitArticleSummary => {
            const hasPersonalBlog = authorId === 'pavol-hejny';
            const publication = legacyPlacements[id] ?? { communities: [], canonicalDestination: hasPersonalBlog ? 'personal-blog' : 'promptbook-blog' };
            return { id, language, slug, title, authorId, publication,
                fixedDestinations: hasPersonalBlog ? ['promptbook-blog', 'personal-blog'] : ['promptbook-blog'],
                canonicalUrl: legacyPlacements[id] ? getManagedArticleUrl({ language, slug }, publication.canonicalDestination) : canonicalUrl,
            };
        });
        return articleAdminJson({ articles, gitArticles, mediaConfigured: Boolean(process.env.OBJECT_STORAGE_BUCKET?.trim()) } satisfies ArticleAdminList);
    });
}

export function POST(request: NextRequest) {
    return withArticleAdmin(request, async () => {
        const input = await readArticleAdminBody(request, managedArticleInputSchema);
        const article = await createManagedArticle(input);
        revalidateArticlePublications(article);
        return articleAdminJson({ article }, 201);
    });
}

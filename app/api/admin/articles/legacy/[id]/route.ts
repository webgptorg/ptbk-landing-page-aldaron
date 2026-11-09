import type { NextRequest } from 'next/server';
import { getAllArticles } from '@/lib/articles/load';
import { legacyArticlePlacementsInputSchema, updateLegacyArticlePlacements } from '@/lib/articles/legacyArticlePlacements';
import { articleAdminJson, readArticleAdminBody, withArticleAdmin } from '@/lib/articles/managedArticleAdminApi';
import { revalidateArticlePublications } from '@/lib/articles/revalidateArticlePublications';

type Context = { readonly params: Promise<{ readonly id: string }> };

export function PATCH(request: NextRequest, { params }: Context) {
    return withArticleAdmin(request, async () => {
        const { id } = await params;
        const article = getAllArticles().find((candidate) => candidate.id === id);
        if (!article) return articleAdminJson({ error: 'Článek nebyl nalezen.' }, 404);
        const input = await readArticleAdminBody(request, legacyArticlePlacementsInputSchema);
        const publication = await updateLegacyArticlePlacements(id, input);
        revalidateArticlePublications({ language: article.language, placements: [
            { destination: 'promptbook-blog', visibility: 'public' },
            ...(article.authorId === 'pavol-hejny' ? [{ destination: 'personal-blog', visibility: 'public' } as const] : []),
        ] });
        return articleAdminJson({ publication });
    });
}

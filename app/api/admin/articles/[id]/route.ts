import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { articleAdminJson, readArticleAdminBody, requireManagedArticleId, withArticleAdmin } from '@/lib/articles/managedArticleAdminApi';
import { managedArticleInputSchema } from '@/lib/articles/managedArticleInput';
import { deleteManagedArticle, getManagedArticle, updateManagedArticle } from '@/lib/articles/managedArticles';
import { revalidateArticlePublications } from '@/lib/articles/revalidateArticlePublications';

type Context = { readonly params: Promise<{ readonly id: string }> };
const articleUpdateInput = z.object({ article: managedArticleInputSchema, expectedRevision: z.string().uuid() }).strict();

export function GET(request: NextRequest, { params }: Context) {
    return withArticleAdmin(request, async () => {
        const article = await getManagedArticle(requireManagedArticleId((await params).id));
        return article ? articleAdminJson({ article }) : articleAdminJson({ error: 'Článek nebyl nalezen.' }, 404);
    });
}

export function PATCH(request: NextRequest, { params }: Context) {
    return withArticleAdmin(request, async () => {
        const id = requireManagedArticleId((await params).id);
        const { article, expectedRevision } = await readArticleAdminBody(request, articleUpdateInput);
        const previous = await getManagedArticle(id);
        const updated = await updateManagedArticle(id, article, expectedRevision);
        revalidateArticlePublications(previous, updated);
        return articleAdminJson({ article: updated });
    });
}

export function DELETE(request: NextRequest, { params }: Context) {
    return withArticleAdmin(request, async () => {
        const id = requireManagedArticleId((await params).id);
        const previous = await getManagedArticle(id);
        await deleteManagedArticle(id);
        revalidateArticlePublications(previous);
        return articleAdminJson({ deleted: true });
    });
}

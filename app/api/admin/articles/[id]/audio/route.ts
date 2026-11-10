import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { articleAdminJson, readArticleAdminBody, requireManagedArticleId, withArticleAdmin } from '@/lib/articles/managedArticleAdminApi';
import { generateManagedArticleNarration } from '@/lib/articles/managedArticleNarration';
import { revalidateArticlePublications } from '@/lib/articles/revalidateArticlePublications';

export const maxDuration = 120;
type Context = { readonly params: Promise<{ readonly id: string }> };
const input = z.object({ expectedRevision: z.string().uuid() }).strict();

export function POST(request: NextRequest, { params }: Context) {
    return withArticleAdmin(request, async () => {
        const id = requireManagedArticleId((await params).id);
        const { expectedRevision } = await readArticleAdminBody(request, input);
        const article = await generateManagedArticleNarration(id, expectedRevision, request.signal);
        revalidateArticlePublications(article);
        return articleAdminJson({ article });
    });
}

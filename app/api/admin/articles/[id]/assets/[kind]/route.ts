import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { articleAdminJson, readArticleAdminBody, requireManagedArticleId, withArticleAdmin } from '@/lib/articles/managedArticleAdminApi';
import { deleteManagedArticleAsset, finalizeManagedArticleAsset, prepareManagedArticleAsset } from '@/lib/articles/managedArticleAssets';
import { isManagedArticleAssetKind } from '@/lib/articles/managedArticleInput';
import { revalidateArticlePublications } from '@/lib/articles/revalidateArticlePublications';

type Context = { readonly params: Promise<{ readonly id: string; readonly kind: string }> };
const revisionInput = z.object({ expectedRevision: z.string().uuid() });
const prepareInput = revisionInput.extend({ byteLength: z.number().int().positive() }).strict();
const completeInput = revisionInput.extend({ key: z.string().min(1).max(512), duration: z.number().finite().positive().optional(), voiceName: z.string().trim().max(100).optional() }).strict();

async function requireAsset(params: Context['params']) {
    const { id, kind } = await params;
    if (!isManagedArticleAssetKind(kind)) throw Object.assign(new Error('Neznámý typ souboru.'), { status: 404 });
    return { id: requireManagedArticleId(id), kind };
}

export function POST(request: NextRequest, { params }: Context) {
    return withArticleAdmin(request, async () => {
        const { id, kind } = await requireAsset(params);
        return articleAdminJson(await prepareManagedArticleAsset(id, kind, await readArticleAdminBody(request, prepareInput)));
    });
}

export function PATCH(request: NextRequest, { params }: Context) {
    return withArticleAdmin(request, async () => {
        const { id, kind } = await requireAsset(params);
        const article = await finalizeManagedArticleAsset(id, kind, await readArticleAdminBody(request, completeInput));
        revalidateArticlePublications(article);
        return articleAdminJson({ article });
    });
}

export function DELETE(request: NextRequest, { params }: Context) {
    return withArticleAdmin(request, async () => {
        const { id, kind } = await requireAsset(params);
        const { expectedRevision } = await readArticleAdminBody(request, revisionInput.strict());
        const article = await deleteManagedArticleAsset(id, kind, expectedRevision);
        revalidateArticlePublications(article);
        return articleAdminJson({ article });
    });
}

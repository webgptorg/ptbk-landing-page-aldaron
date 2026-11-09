import 'server-only';

import { signStoredObject } from '@/lib/storage/objectStorage';
import { isManagedArticleAssetKind, MANAGED_ARTICLE_ASSET_KINDS, type ArticleCommunity } from './managedArticleInput';
import { getCurrentManagedArticleAsset, getManagedArticleRow } from './managedArticles';
import { canReadManagedArticlePlacement, getArticlePlacement } from './publishedArticles';

const PRIVATE_RESPONSE_HEADERS = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };

export async function serveManagedArticleAsset(
    request: Request,
    { id, kind }: { id: string; kind: string },
    community?: ArticleCommunity,
): Promise<Response> {
    const notFound = () => new Response(null, { status: 404, headers: PRIVATE_RESPONSE_HEADERS });
    if (!isManagedArticleAssetKind(kind)) return notFound();

    try {
        const article = await getManagedArticleRow(id);
        if (!article) return notFound();
        const placement = community ? getArticlePlacement(article, community) : article.placements.find((entry) => entry.visibility === 'public');
        if (!placement || !await canReadManagedArticlePlacement(placement)) return notFound();
        const asset = getCurrentManagedArticleAsset(article, kind);
        if (!asset) return notFound();

        const range = request.headers.get('range');
        const source = await fetch(await signStoredObject(asset.key), {
            method: request.method === 'HEAD' ? 'HEAD' : 'GET',
            headers: range && /^bytes=\d*-\d*$/.test(range) ? { Range: range } : undefined,
            cache: 'no-store',
            signal: request.signal,
        });
        if (!source.ok && source.status !== 416) return notFound();

        const config = MANAGED_ARTICLE_ASSET_KINDS[kind];
        const headers = new Headers(PRIVATE_RESPONSE_HEADERS);
        headers.set('Content-Type', config.mimeType);
        if (placement.visibility === 'public') headers.set('Access-Control-Allow-Origin', '*');
        if (kind === 'pdf') headers.set('Content-Disposition', `attachment; filename="${article.slug}.${config.extension}"`);
        for (const header of ['Accept-Ranges', 'Content-Length', 'Content-Range']) {
            const value = source.headers.get(header);
            if (value) headers.set(header, value);
        }
        return new Response(request.method === 'HEAD' ? null : source.body, { status: source.status, headers });
    } catch {
        return notFound();
    }
}

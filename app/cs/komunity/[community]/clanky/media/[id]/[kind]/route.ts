import { isArticleCommunity } from '@/lib/articles/managedArticleInput';
import { serveManagedArticleAsset } from '@/lib/articles/serveManagedArticleAsset';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ community: string; id: string; kind: string }> }) {
    const { community, ...asset } = await params;
    if (!isArticleCommunity(community)) return new Response(null, { status: 404 });
    return serveManagedArticleAsset(request, asset, community);
}

export const HEAD = GET;

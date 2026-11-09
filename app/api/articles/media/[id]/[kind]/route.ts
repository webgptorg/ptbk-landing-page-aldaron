import { serveManagedArticleAsset } from '@/lib/articles/serveManagedArticleAsset';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string; kind: string }> }) {
    return serveManagedArticleAsset(request, await params);
}

export const HEAD = GET;

import { readFileSync } from 'node:fs';
import { getArticleAssetParams, getPublicArticleAsset } from '@/lib/articles/load';

export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
    return getArticleAssetParams();
}

/** These are pre-existing committed files, emitted unchanged as static assets during the build. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string; file: string[] }> }) {
    const { id, file } = await params;
    const asset = getPublicArticleAsset(id, file.join('/'));
    if (!asset) return new Response('Not found', { status: 404 });
    const bytes = readFileSync(asset.path);
    return new Response(new Uint8Array(bytes), {
        headers: {
            'Content-Type': asset.mimeType,
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
            'Content-Length': String(bytes.byteLength),
            'X-Content-Type-Options': 'nosniff',
            ...(asset.mimeType === 'application/pdf' ? { 'Content-Disposition': `attachment; filename="${id}.pdf"` } : {}),
        },
    });
}

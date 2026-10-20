import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const dynamic = 'force-static';
export const dynamicParams = false;

const BRANDS = ['promptbook.png', 'pavol-hejny.png'] as const;

export function generateStaticParams() {
    return BRANDS.map((brand) => ({ brand }));
}

/** Serve the committed 1600-square artwork unchanged; no artwork generation runs in a build or request. */
export async function GET(_request: Request, { params }: { params: Promise<{ brand: string }> }): Promise<Response> {
    const { brand } = await params;
    if (!BRANDS.includes(brand as (typeof BRANDS)[number])) return new Response('Not found', { status: 404 });
    const bytes = readFileSync(join(process.cwd(), 'articles/_podcasts', brand));
    return new Response(new Uint8Array(bytes), {
        headers: { 'Content-Type': 'image/png', 'Content-Length': String(bytes.byteLength), 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
    });
}

import sharp from 'sharp';
import { PAVOL_KRAJTA_SHOW_ARTWORK_URL } from '@/businesses/pavol/pavolPodcastArtwork';
import { getPublicDomainRouteByHostname, getPublicRequestHostname } from '@/lib/domains/publicDomainRouting';

export const runtime = 'nodejs';

const ARTWORK_SIZE = 1400;
const MAX_THUMBNAIL_BYTES = 2_000_000;
const YOUTUBE_THUMBNAIL_VARIANTS = ['maxresdefault', 'hq720', 'mqdefault'] as const;

async function renderYoutubeArtwork(videoId: string): Promise<Buffer | null> {
    for (const variant of YOUTUBE_THUMBNAIL_VARIANTS) {
        try {
            const response = await fetch(`https://i.ytimg.com/vi/${videoId}/${variant}.jpg`, {
                redirect: 'error',
                signal: AbortSignal.timeout(3500),
                cache: 'no-store',
            });
            const mimeType = response.headers.get('Content-Type') ?? '';
            const byteLength = Number(response.headers.get('Content-Length'));
            if (!response.ok || !/^image\/jpeg(?:;|$)/i.test(mimeType) || byteLength > MAX_THUMBNAIL_BYTES) {
                await response.body?.cancel();
                continue;
            }
            const bytes = Buffer.from(await response.arrayBuffer());
            if (bytes.length > MAX_THUMBNAIL_BYTES) continue;

            const thumbnail = sharp(bytes, { limitInputPixels: 8_000_000 });
            const { format, width = 0, height = 0 } = await thumbnail.metadata();
            // Some unavailable YouTube variants respond with a small generic placeholder image.
            if (format !== 'jpeg' || width < 320 || height < 180) continue;

            // Keep the entire thumbnail, including lettering and faces near the edges, on a darkened extension.
            const [foreground, background] = await Promise.all([
                thumbnail.clone().resize(ARTWORK_SIZE, ARTWORK_SIZE, { fit: 'inside' }).toBuffer(),
                thumbnail.resize(ARTWORK_SIZE, ARTWORK_SIZE, { fit: 'cover' }).blur(48)
                    .modulate({ brightness: 0.46, saturation: 0.75 }).toBuffer(),
            ]);
            return await sharp(background)
                .composite([{ input: foreground, gravity: 'centre' }])
                .jpeg({ quality: 88 })
                .toBuffer();
        } catch {
            // Try the next rendition when YouTube has no usable image at this size.
        }
    }
    return null;
}

export async function GET(request: Request, { params }: { params: Promise<{ file: string }> }): Promise<Response> {
    const domain = getPublicDomainRouteByHostname(getPublicRequestHostname(request.headers));
    const { file } = await params;
    const match = /^([A-Za-z0-9_-]{11})\.jpg$/.exec(file);
    if (domain?.notFound.appearance !== 'personal' || !match) {
        return new Response(null, { status: 404 });
    }

    const artwork = await renderYoutubeArtwork(match[1]);
    if (artwork === null) {
        return new Response(null, {
            status: 302,
            headers: { Location: PAVOL_KRAJTA_SHOW_ARTWORK_URL, 'Cache-Control': 'public, max-age=60, s-maxage=300' },
        });
    }
    return new Response(new Uint8Array(artwork), {
        headers: {
            'Content-Type': 'image/jpeg',
            'Content-Length': String(artwork.byteLength),
            'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
        },
    });
}

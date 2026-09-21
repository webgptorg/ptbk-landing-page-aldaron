import { fetchPublicWebPageResource } from '@/lib/network/publicWebPagePreview';
import sharp from 'sharp';

const MAXIMAL_PREVIEW_IMAGE_BYTES = 5_000_000;
const MAXIMAL_PREVIEW_IMAGE_PIXELS = 20_000_000;
const PREVIEW_IMAGE_WIDTH = 1200;
const PREVIEW_IMAGE_HEIGHT = 630;
const SUPPORTED_PREVIEW_IMAGE_FORMATS = new Set(['png', 'jpeg', 'webp', 'heif']);

/** Embeds a bounded public image, including WebP/AVIF, without browser CORS or PDF-reader network requests. */
export async function loadPublicWebPagePreviewImage(
    imageUrl: string | null,
    revalidateSeconds: number,
): Promise<string | null> {
    if (imageUrl === null) return null;
    try {
        const { bytes } = await fetchPublicWebPageResource(imageUrl, {
            accept: 'image/png,image/jpeg,image/webp,image/avif',
            contentTypePattern: /^image\/(png|jpeg|webp|avif)(?:;|$)/i,
            maximalBytes: MAXIMAL_PREVIEW_IMAGE_BYTES,
            revalidateSeconds,
        });
        const decoder = sharp(bytes, { limitInputPixels: MAXIMAL_PREVIEW_IMAGE_PIXELS });
        const metadata = await decoder.metadata();
        if (!SUPPORTED_PREVIEW_IMAGE_FORMATS.has(metadata.format ?? '')) return null;
        const image = await decoder
            .rotate()
            .resize(PREVIEW_IMAGE_WIDTH, PREVIEW_IMAGE_HEIGHT, { fit: 'contain', background: '#f4f8fa' })
            .flatten({ background: '#f4f8fa' })
            .jpeg({ quality: 85 })
            .toBuffer();
        return `data:image/jpeg;base64,${image.toString('base64')}`;
    } catch {
        // A missing or invalid image never prevents the text, project links and recap from being exported.
        return null;
    }
}

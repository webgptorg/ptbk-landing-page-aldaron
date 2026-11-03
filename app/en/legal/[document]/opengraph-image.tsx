import { notFound } from 'next/navigation';
import { getLegalKindBySlug } from '@/lib/legal/legalPagePaths';
import { LEGAL_PAGE_DEFINITIONS } from '@/lib/legal/legalPageMetadata';
import { createPageSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };
export default async function Image({ params }: { params: Promise<{ document: string }> }) {
    const kind = getLegalKindBySlug((await params).document, 'en');
    if (!kind) notFound();
    return createPageSocialPreviewImageRoute(LEGAL_PAGE_DEFINITIONS[kind].en).renderSocialPreviewImage();
}

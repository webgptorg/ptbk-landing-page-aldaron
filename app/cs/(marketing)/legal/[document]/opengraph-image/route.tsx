import { notFound } from 'next/navigation';
import { getLegalKindBySlug } from '@/lib/legal/legalPagePaths';
import { LEGAL_PAGE_DEFINITIONS } from '@/lib/legal/legalPageMetadata';
import { createPageSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

/** Serve the same URL declared in page metadata without a route-group metadata suffix. */
export async function GET(_request: Request, { params }: { params: Promise<{ document: string }> }) {
    const kind = getLegalKindBySlug((await params).document, 'cs');
    if (!kind) notFound();
    return createPageSocialPreviewImageRoute(LEGAL_PAGE_DEFINITIONS[kind].cs).renderSocialPreviewImage();
}

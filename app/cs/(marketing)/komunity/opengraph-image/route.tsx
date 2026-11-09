import { COMMUNITIES_PAGE_DEFINITION } from '@/businesses/community/communityMetadata';
import { createPageSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

/** Serve the metadata's stable URL inside the marketing route group. */
export function GET() {
    return createPageSocialPreviewImageRoute(
        COMMUNITIES_PAGE_DEFINITION,
        { artwork: 'community' },
    ).renderSocialPreviewImage();
}

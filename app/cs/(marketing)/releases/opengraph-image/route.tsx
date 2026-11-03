import { RELEASE_PAGE_DEFINITIONS } from '@/lib/releases/metadata';
import { createPageSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

/** An explicit route keeps the public image URL stable inside the marketing route group. */
export function GET() {
    return createPageSocialPreviewImageRoute(RELEASE_PAGE_DEFINITIONS.cs).renderSocialPreviewImage();
}

import { LEGAL_HUB_DEFINITIONS } from '@/lib/legal/legalRoute';
import { createPageSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

/** An explicit route keeps the public image URL stable inside the marketing route group. */
export function GET() {
    return createPageSocialPreviewImageRoute(LEGAL_HUB_DEFINITIONS.cs).renderSocialPreviewImage();
}

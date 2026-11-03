import { LEGAL_HUB_DEFINITIONS } from '@/lib/legal/legalRoute';
import { createPageSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';
export const { alt, size, contentType, renderSocialPreviewImage } = createPageSocialPreviewImageRoute(LEGAL_HUB_DEFINITIONS.en);
export default renderSocialPreviewImage;

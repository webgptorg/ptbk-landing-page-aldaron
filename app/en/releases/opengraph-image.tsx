import { RELEASE_PAGE_DEFINITIONS } from '@/lib/releases/metadata';
import { createPageSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';
export const { alt, size, contentType, renderSocialPreviewImage } = createPageSocialPreviewImageRoute(RELEASE_PAGE_DEFINITIONS.en);
export default renderSocialPreviewImage;

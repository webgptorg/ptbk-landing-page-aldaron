import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';
import { NEW_EN_PREVIEW } from '@/businesses/new/newMetadata';
const { alt, contentType, renderSocialPreviewImage, size } = createSocialPreviewImageRoute(NEW_EN_PREVIEW);
export { alt, contentType, size };
export default renderSocialPreviewImage;

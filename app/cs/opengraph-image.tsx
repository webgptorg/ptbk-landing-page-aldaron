import { NEW_PREVIEW } from '@/businesses/new/newMetadata';
import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';
const { alt, contentType, renderSocialPreviewImage, size } = createSocialPreviewImageRoute(NEW_PREVIEW);
export { alt, contentType, size };
export default renderSocialPreviewImage;

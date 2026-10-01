import { PRO_FIRMY_SOCIAL_PREVIEW_OPTIONS } from '@/businesses/pro-firmy/proFirmyMetadata';
import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createSocialPreviewImageRoute(
    PRO_FIRMY_SOCIAL_PREVIEW_OPTIONS,
);

export { alt, contentType, size };
export default renderSocialPreviewImage;

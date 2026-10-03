import { WHITEPAPER_SOCIAL_PREVIEW_OPTIONS } from '@/businesses/whitepaper/whitepaperMetadata';
import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createSocialPreviewImageRoute(
    WHITEPAPER_SOCIAL_PREVIEW_OPTIONS.en,
);

export { alt, contentType, size };
export default renderSocialPreviewImage;

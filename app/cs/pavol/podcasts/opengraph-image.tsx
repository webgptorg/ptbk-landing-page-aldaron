import { PAVOL_PODCAST_SOCIAL_PREVIEW_OPTIONS } from '@/businesses/pavol/pavolPodcastMetadata';
import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createSocialPreviewImageRoute(
    PAVOL_PODCAST_SOCIAL_PREVIEW_OPTIONS.cs,
);

export { alt, contentType, size };
export default renderSocialPreviewImage;

import { COMMUNITIES_PAGE_DEFINITION } from '@/businesses/community/communityMetadata';
import { createPageSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createPageSocialPreviewImageRoute(
    COMMUNITIES_PAGE_DEFINITION,
    { artwork: 'community' },
);

export { alt, contentType, size };
export default renderSocialPreviewImage;

import {
    COMMUNITY_PROJECTS_PAGE_DEFINITION,
    createCommunityProjectSocialPreviewOptions,
} from '@/businesses/community/projects/communityProjectMetadata';
import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createSocialPreviewImageRoute(
    createCommunityProjectSocialPreviewOptions(COMMUNITY_PROJECTS_PAGE_DEFINITION),
);

export { alt, contentType, size };
export default renderSocialPreviewImage;

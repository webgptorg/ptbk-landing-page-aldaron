import { COMMUNITY_MEMBERSHIP_SOCIAL_PREVIEW_OPTIONS } from '@/businesses/community/membership/communityMembershipMetadata';
import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createSocialPreviewImageRoute(
    COMMUNITY_MEMBERSHIP_SOCIAL_PREVIEW_OPTIONS,
);

export { alt, contentType, size };
export default renderSocialPreviewImage;

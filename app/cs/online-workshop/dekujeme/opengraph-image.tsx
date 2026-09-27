import {
    ONLINE_WORKSHOP_THANK_YOU_PAGE_DEFINITION,
    ONLINE_WORKSHOP_SOCIAL_PREVIEW_OPTIONS,
} from '@/businesses/online-workshop/onlineWorkshopMetadata';
import { createPageSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createPageSocialPreviewImageRoute(
    ONLINE_WORKSHOP_THANK_YOU_PAGE_DEFINITION,
    { eyebrow: 'Online workshop', artwork: 'workshop', paletteSeed: ONLINE_WORKSHOP_SOCIAL_PREVIEW_OPTIONS.palette },
);

export { alt, contentType, size };
export default renderSocialPreviewImage;

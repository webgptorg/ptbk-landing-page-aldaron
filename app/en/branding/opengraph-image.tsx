import { NEW_BLUE_PALETTE } from '@/businesses/new/newMetadata';
import { BRANDING_PAGE_DEFINITION } from '@/lib/metadata/site-page-definitions';
import { createPageSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createPageSocialPreviewImageRoute(
    BRANDING_PAGE_DEFINITION,
    { eyebrow: 'Logos · Colors · Typography', artwork: 'launch', paletteSeed: NEW_BLUE_PALETTE },
);

export { alt, contentType, size };
export default renderSocialPreviewImage;

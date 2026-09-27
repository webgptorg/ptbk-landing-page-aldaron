import { THANK_YOU_PAGE_DEFINITION } from '@/lib/metadata/site-page-definitions';
import { createPageSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createPageSocialPreviewImageRoute(
    THANK_YOU_PAGE_DEFINITION,
    { eyebrow: 'Rezervace hovoru', artwork: 'community' },
);

export { alt, contentType, size };
export default renderSocialPreviewImage;

import { CONTACT_PAGE_DEFINITION } from '@/lib/metadata/site-page-definitions';
import { createPageSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createPageSocialPreviewImageRoute(
    CONTACT_PAGE_DEFINITION,
    { eyebrow: 'Let’s build something useful', artwork: 'community' },
);

export { alt, contentType, size };
export default renderSocialPreviewImage;

import { LEGAL_PAGE_DEFINITIONS } from '@/lib/legal/legalPageMetadata';
import { createPageSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createPageSocialPreviewImageRoute(
    LEGAL_PAGE_DEFINITIONS.privacyPolicy.en,
    { eyebrow: 'Your privacy' },
);

export { alt, contentType, size };
export default renderSocialPreviewImage;

import { LEGAL_PAGE_DEFINITIONS } from '@/lib/legal/legalPageMetadata';
import { createPageSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createPageSocialPreviewImageRoute(
    LEGAL_PAGE_DEFINITIONS.termsAndConditions.cs,
    { eyebrow: 'Pravidla našich služeb' },
);

export { alt, contentType, size };
export default renderSocialPreviewImage;

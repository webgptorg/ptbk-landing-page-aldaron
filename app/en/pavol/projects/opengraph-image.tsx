import { PAVOL_SOCIAL_PREVIEW_OPTIONS } from '@/businesses/pavol/pavolMetadata';
import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';
const { alt, contentType, renderSocialPreviewImage, size } = createSocialPreviewImageRoute({
    ...PAVOL_SOCIAL_PREVIEW_OPTIONS.en, title: 'Projects | Pavol Hejný', alt: 'Projects | Pavol Hejný',
    description: 'Products, technology, and people.',
});
export { alt, contentType, size };
export default renderSocialPreviewImage;

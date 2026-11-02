import { PAVOL_SOCIAL_PREVIEW_OPTIONS } from '@/businesses/pavol/pavolMetadata';
import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';
const { alt, contentType, renderSocialPreviewImage, size } = createSocialPreviewImageRoute({
    ...PAVOL_SOCIAL_PREVIEW_OPTIONS.cs, title: 'Projekty | Pavol Hejný', alt: 'Projekty | Pavol Hejný',
    description: 'Produkty, technologie a lidé.',
});
export { alt, contentType, size };
export default renderSocialPreviewImage;

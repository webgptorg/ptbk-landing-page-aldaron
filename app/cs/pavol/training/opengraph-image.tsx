import { PAVOL_SOCIAL_PREVIEW_OPTIONS } from '@/businesses/pavol/pavolMetadata';
import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';
const { alt, contentType, renderSocialPreviewImage, size } = createSocialPreviewImageRoute({
    ...PAVOL_SOCIAL_PREVIEW_OPTIONS.cs, title: 'Přednášky a školení | Pavol Hejný', alt: 'Přednášky a školení | Pavol Hejný',
    description: 'Praktické přednášky a workshopy o AI pro firmy a vývojáře.',
});
export { alt, contentType, size };
export default renderSocialPreviewImage;

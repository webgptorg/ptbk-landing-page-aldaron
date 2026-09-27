import {
    AI_TA_KRAJTA_BRANDING_PAGE_DEFINITION,
    AI_TA_KRAJTA_SOCIAL_PREVIEW_OPTIONS,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMetadata';
import { createPageSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createPageSocialPreviewImageRoute(
    AI_TA_KRAJTA_BRANDING_PAGE_DEFINITION,
    {
        brandKind: AI_TA_KRAJTA_SOCIAL_PREVIEW_OPTIONS.brandKind,
        artwork: AI_TA_KRAJTA_SOCIAL_PREVIEW_OPTIONS.artwork,
        eyebrow: 'Logo · Barvy · Název',
        paletteSeed: AI_TA_KRAJTA_SOCIAL_PREVIEW_OPTIONS.palette,
    },
);

export { alt, contentType, size };
export default renderSocialPreviewImage;

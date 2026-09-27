import {
    AI_SUPERVIZE_MINI_PARTICIPANT_PAGE_DEFINITION,
    AI_SUPERVIZE_MINI_SOCIAL_PREVIEW_OPTIONS,
} from '@/businesses/ai-supervize-mini/aiSupervizeMiniMetadata';
import { createPageSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createPageSocialPreviewImageRoute(
    AI_SUPERVIZE_MINI_PARTICIPANT_PAGE_DEFINITION,
    {
        eyebrow: 'Informace pro účastníky',
        artwork: 'workshop',
        paletteSeed: AI_SUPERVIZE_MINI_SOCIAL_PREVIEW_OPTIONS.palette,
    },
);

export { alt, contentType, size };
export default renderSocialPreviewImage;

import { createPageSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';
import { HOPKO_PAGE_DEFINITION } from './hopkoMetadata';

const { alt, contentType, renderSocialPreviewImage, size } = createPageSocialPreviewImageRoute(
    HOPKO_PAGE_DEFINITION,
    { eyebrow: 'A Promptbook experiment', artwork: 'launch' },
);

export { alt, contentType, size };
export default renderSocialPreviewImage;

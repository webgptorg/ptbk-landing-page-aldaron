import { DATA_DELETION_PAGE_DEFINITION } from '@/lib/metadata/site-page-definitions';
import { createPageSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createPageSocialPreviewImageRoute(
    DATA_DELETION_PAGE_DEFINITION,
    { eyebrow: 'Data deletion' },
);

export { alt, contentType, size };
export default renderSocialPreviewImage;

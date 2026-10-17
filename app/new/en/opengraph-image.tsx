import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import { NEW_PAGE_DEFINITION, NEW_BLUE_PALETTE } from '@/businesses/new/newMetadata';
const options = createSocialPreviewOptions({ ...NEW_PAGE_DEFINITION, path: '/new/en', language: 'en', title: 'Promptbook — Now AI works for you.', socialTitle: 'You used to give AI tasks. Now it works for you.', description: 'Ongoing AI workflows. Your data. Your rules.', socialPreviewImageAlt: 'Promptbook — business workflows under your control' }, { eyebrow: 'Promptbook', artwork: 'knowledge', paletteSeed: NEW_BLUE_PALETTE });
const { alt, contentType, renderSocialPreviewImage, size } = createSocialPreviewImageRoute(options);
export { alt, contentType, size };
export default renderSocialPreviewImage;

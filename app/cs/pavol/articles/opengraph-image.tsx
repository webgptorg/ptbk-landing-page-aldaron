import { createArticleIndexPageDefinition, createArticleSocialPreviewOptions } from '@/lib/articles/metadata';
import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createSocialPreviewImageRoute(
    createArticleSocialPreviewOptions(createArticleIndexPageDefinition('cs', 'personal'), 'personal'),
);
export { alt, contentType, size };
export default renderSocialPreviewImage;

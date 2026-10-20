import { createArticleIndexPageDefinition, createArticleSocialPreviewOptions } from '@/lib/articles/metadata';
import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createSocialPreviewImageRoute(
    createArticleSocialPreviewOptions(createArticleIndexPageDefinition('en', 'promptbook'), 'promptbook'),
);
export { alt, contentType, size };
export default renderSocialPreviewImage;

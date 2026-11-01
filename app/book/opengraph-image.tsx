import { COMMON_KNOWLEDGE_INDEX_DEFINITION, getCommonKnowledgePreviewOptions } from '@/lib/common-knowledge/metadata';
import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

/** Branded share card for the collection. */
const { alt, contentType, renderSocialPreviewImage, size } = createSocialPreviewImageRoute(
    getCommonKnowledgePreviewOptions(COMMON_KNOWLEDGE_INDEX_DEFINITION),
);
export { alt, contentType, size };
export default renderSocialPreviewImage;

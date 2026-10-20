import { getArticle } from '@/lib/articles/load';
import { createArticlePageDefinition, createArticleSocialPreviewOptions } from '@/lib/articles/metadata';
import { createSocialPreviewImage, SOCIAL_PREVIEW_IMAGE_CONTENT_TYPE, SOCIAL_PREVIEW_IMAGE_SIZE } from '@/lib/metadata/social-preview-image';

export const alt = 'Článek · Promptbook';
export const contentType = SOCIAL_PREVIEW_IMAGE_CONTENT_TYPE;
export const size = SOCIAL_PREVIEW_IMAGE_SIZE;

export default async function ArticleSharingImage({ params }: { params: Promise<{ slug: string }> }) {
    const article = getArticle((await params).slug, 'cs', 'promptbook');
    if (!article) return new Response('Not found', { status: 404 });
    return createSocialPreviewImage(createArticleSocialPreviewOptions(createArticlePageDefinition(article, 'promptbook'), 'promptbook'));
}

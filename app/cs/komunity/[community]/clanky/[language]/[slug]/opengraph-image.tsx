import { isArticleCommunity } from '@/lib/articles/managedArticleInput';
import { getManagedArticleUrl } from '@/lib/articles/managedArticleUrls';
import { createArticlePageDefinition, createArticleSocialPreviewOptions } from '@/lib/articles/metadata';
import { getPublishedCommunityArticle } from '@/lib/articles/publishedArticles';
import { createSocialPreviewImage, SOCIAL_PREVIEW_IMAGE_CONTENT_TYPE, SOCIAL_PREVIEW_IMAGE_SIZE } from '@/lib/metadata/social-preview-image';

export const dynamic = 'force-dynamic';
export const alt = 'Článek · Komunity Promptbook';
export const contentType = SOCIAL_PREVIEW_IMAGE_CONTENT_TYPE;
export const size = SOCIAL_PREVIEW_IMAGE_SIZE;

export default async function CommunityArticleSharingImage({ params }: {
    params: Promise<{ community: string; language: string; slug: string }>;
}) {
    const { community, language, slug } = await params;
    if (!isArticleCommunity(community) || (language !== 'cs' && language !== 'en')) {
        return new Response('Not found', { status: 404 });
    }
    const result = await getPublishedCommunityArticle(community, language, slug);
    if (result?.visibility !== 'public') return new Response('Not found', { status: 404 });
    const pathname = new URL(getManagedArticleUrl(result.article, community)).pathname;
    return createSocialPreviewImage(createArticleSocialPreviewOptions(createArticlePageDefinition(result.article, 'promptbook', pathname), 'promptbook'));
}

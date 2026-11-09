import { createCommunitySocialPreviewOptions } from '@/businesses/community/communityMetadata';
import { getCommunityById } from '@/businesses/community/config';
import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';
import { SOCIAL_PREVIEW_IMAGE_CONTENT_TYPE, SOCIAL_PREVIEW_IMAGE_SIZE } from '@/lib/metadata/social-preview-image-config';
import { notFound } from 'next/navigation';

export const contentType = SOCIAL_PREVIEW_IMAGE_CONTENT_TYPE;
export const size = SOCIAL_PREVIEW_IMAGE_SIZE;
export const alt = 'Komunita Promptbooku';

export default async function CommunitySocialImage({ params }: { params: Promise<{ community: string }> }) {
    const definition = getCommunityById((await params).community);
    if (definition === undefined) {
        notFound();
    }

    return createSocialPreviewImageRoute(createCommunitySocialPreviewOptions(definition)).renderSocialPreviewImage();
}

import { notFound } from 'next/navigation';
import { getCommonKnowledgeBook } from '@/lib/common-knowledge/catalog';
import { getCommonKnowledgeDefinition, getCommonKnowledgePreviewOptions } from '@/lib/common-knowledge/metadata';
import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';
import {
    SOCIAL_PREVIEW_IMAGE_CONTENT_TYPE,
    SOCIAL_PREVIEW_IMAGE_SIZE,
} from '@/lib/metadata/social-preview-image-config';

/** Consistent dimensions and format for the existing shared social renderer. */
export const size = SOCIAL_PREVIEW_IMAGE_SIZE;
/** Media type of the generated card. */
export const contentType = SOCIAL_PREVIEW_IMAGE_CONTENT_TYPE;
/** Accessible fallback for a topic's share image. */
export const alt = 'Promptbook common knowledge';

/** A topic-specific card without registering unknown knowledge slugs. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const book = getCommonKnowledgeBook((await params).slug);
    if (!book) notFound();
    return createSocialPreviewImageRoute(
        getCommonKnowledgePreviewOptions(getCommonKnowledgeDefinition(book)),
    ).renderSocialPreviewImage();
}

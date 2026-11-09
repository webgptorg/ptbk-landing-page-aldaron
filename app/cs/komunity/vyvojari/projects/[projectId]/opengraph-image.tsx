import {
    createCommunityProjectPageDefinition,
    createCommunityProjectSocialPreviewOptions,
} from '@/businesses/community/projects/communityProjectMetadata';
import { loadPublicCommunityProject } from '@/lib/community-projects/publicCommunityProject';
import {
    createSocialPreviewImage,
    SOCIAL_PREVIEW_IMAGE_CONTENT_TYPE,
    SOCIAL_PREVIEW_IMAGE_SIZE,
} from '@/lib/metadata/social-preview-image';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const alt = 'Projekt komunity Promptbooku';
export const contentType = SOCIAL_PREVIEW_IMAGE_CONTENT_TYPE;
export const size = SOCIAL_PREVIEW_IMAGE_SIZE;

export default async function CommunityProjectImage({
    params,
}: {
    readonly params: Promise<{ readonly projectId: string }>;
}) {
    const { projectId } = await params;
    const project = await loadPublicCommunityProject(projectId);
    if (project === null) {
        notFound();
    }

    return createSocialPreviewImage(
        createCommunityProjectSocialPreviewOptions(createCommunityProjectPageDefinition(project)),
        { 'Cache-Control': 'no-store' },
    );
}

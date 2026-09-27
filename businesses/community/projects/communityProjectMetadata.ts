import { COMMUNITY_SOCIAL_PREVIEW_OPTIONS } from '@/businesses/community/communityMetadata';
import type { CommunityProject } from '@/lib/community-projects/communityProjectTypes';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';

export const COMMUNITY_PROJECTS_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/cs/komunita/projects',
    language: 'cs',
    title: 'Projekty komunity Promptbooku',
    socialTitle: 'Co tvoří naše komunita',
    description: 'Projekty a tvorba členů komunity Promptbooku.',
    socialDescription: 'Objevujte a podpořte projekty členů komunity Promptbooku.',
    socialPreviewImageAlt: 'Projekty komunity Promptbooku',
    isSocialPreviewImageGenerated: true,
    isIndexed: false,
};

export const COMMUNITY_PROJECTS_METADATA = createPageMetadata(COMMUNITY_PROJECTS_PAGE_DEFINITION);

/** Only the public title and description of an approved project belong in a cached card. */
export function createCommunityProjectPageDefinition(
    project: Pick<CommunityProject, 'id' | 'title' | 'description'>,
): PageMetadataDefinition {
    return {
        ...COMMUNITY_PROJECTS_PAGE_DEFINITION,
        path: `${COMMUNITY_PROJECTS_PAGE_DEFINITION.path}/${project.id}`,
        title: `${project.title} | Komunita Promptbooku`,
        socialTitle: project.title,
        description: project.description,
        socialDescription: project.description,
        socialPreviewImageAlt: project.title,
    };
}

export function createCommunityProjectSocialPreviewOptions(definition: PageMetadataDefinition) {
    return createSocialPreviewOptions(definition, {
        eyebrow: 'Projekty komunity',
        artwork: 'launch',
        paletteSeed: COMMUNITY_SOCIAL_PREVIEW_OPTIONS.palette,
    });
}

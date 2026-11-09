import { COMMUNITY_SOCIAL_PREVIEW_OPTIONS } from '@/businesses/community/communityMetadata';
import { COMMUNITY_PROJECTS_PATH, createCommunityProjectPath } from '@/businesses/community/config';
import type { CommunityProject } from '@/lib/community-projects/communityProjectTypes';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';

export const COMMUNITY_PROJECTS_PAGE_DEFINITION: PageMetadataDefinition = {
    path: COMMUNITY_PROJECTS_PATH,
    language: 'cs',
    title: 'Projekty komunity Vývojáři',
    socialTitle: 'Co tvoří naše komunita',
    description: 'Projekty a tvorba členů komunity Vývojáři.',
    socialDescription: 'Objevujte a podpořte projekty členů komunity Vývojáři.',
    socialPreviewImageAlt: 'Projekty komunity Vývojáři',
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
        path: createCommunityProjectPath(project.id),
        title: `${project.title} | Vývojáři`,
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

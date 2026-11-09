import { COMMUNITIES, COMMUNITIES_PATH, DEFAULT_COMMUNITY_ID, LEGACY_COMMUNITY_TITLE, type CommunityDefinition } from '@/businesses/community/config';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';

export const COMMUNITIES_PAGE_DEFINITION: PageMetadataDefinition = {
    path: COMMUNITIES_PATH,
    language: 'cs',
    title: 'Komunity | Promptbook',
    socialTitle: 'Komunity Promptbooku',
    description: 'Vyberte si komunitu Vývojáři nebo Promptbook. Workshopy, články a diskuze.',
    isSocialPreviewImageGenerated: true,
};

function createCommunityPageDefinition(community: CommunityDefinition): PageMetadataDefinition {
    const isLegacyRoom = community.id === DEFAULT_COMMUNITY_ID;
    return {
        path: community.path,
        language: 'cs',
        title: isLegacyRoom ? `${LEGACY_COMMUNITY_TITLE} | Workshopy, materiály a diskuze` : `${community.name} | Komunita`,
        socialTitle: isLegacyRoom ? LEGACY_COMMUNITY_TITLE : community.name,
        description: community.description,
        isSocialPreviewImageGenerated: true,
        isIndexed: false,
    };
}

export function createCommunityMetadata(community: CommunityDefinition): Metadata {
    return {
        ...createPageMetadata(createCommunityPageDefinition(community)),
        // Participant links can contain prefilled name and e-mail.
        referrer: 'origin',
    };
}

export function createCommunitySocialPreviewOptions(community: CommunityDefinition) {
    return createSocialPreviewOptions(createCommunityPageDefinition(community), {
        eyebrow: 'Komunity Promptbooku',
        artwork: 'community',
        paletteSeed: {
            backgroundStart: '#071a2a',
            backgroundEnd: '#0b4053',
            accent: '#69e6ff',
            accentSoft: '#a98bff',
        },
    });
}

export const COMMUNITY_SOCIAL_PREVIEW_OPTIONS = createCommunitySocialPreviewOptions(COMMUNITIES[DEFAULT_COMMUNITY_ID]);

import { ONLINE_WORKSHOP_PARTICIPANT_PATH } from '@/businesses/online-workshop/config';
import { SITE_URL } from '@/lib/metadata/site-config';
import { createWorkshopSelectionPath } from '@/lib/workshops/workshopParticipantLink';
import { getWorkshopPhase, isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
import type { WorkshopRepositoryProgress } from '@/lib/workshops/workshopRepositoryProgress';
import type { WorkshopContentBlock, WorkshopDetails, WorkshopProjectPreview, WorkshopPublicState } from '@/lib/workshops/workshopTypes';

/** Only recap fields cross the export boundary, never chat, feedback, recordings or participant identity. */
export type WorkshopWrapUpSource = {
    readonly workshop: Pick<WorkshopDetails,
        'kind' | 'slug' | 'title' | 'description' | 'startsAt' | 'endsAt' | 'isPublished' | 'presentationUrl' | 'repository'>;
    readonly contentBlocks: readonly Pick<WorkshopContentBlock, 'title' | 'bodyMarkdown' | 'isFollowUp'>[];
    readonly serverTime: string;
};

export type WorkshopWrapUpExport = {
    readonly source: WorkshopWrapUpSource;
    readonly roomUrl: string;
    readonly shortUrl: string;
    readonly repositoryProgress: WorkshopRepositoryProgress | null;
    readonly projectPreview: WorkshopProjectPreview | null;
    readonly projectPreviewImage: string | null;
};

export function isWorkshopWrapUpAvailable(source: WorkshopWrapUpSource): boolean {
    return source.workshop.kind === 'workshop' && source.workshop.isPublished
        && isWorkshopPhasePast(getWorkshopPhase(source.workshop, Date.parse(source.serverTime)));
}

export function createWorkshopWrapUpRoomUrl(workshopSlug: string, siteOrigin = SITE_URL): string {
    return new URL(createWorkshopSelectionPath(ONLINE_WORKSHOP_PARTICIPANT_PATH, workshopSlug), siteOrigin).href;
}

/** Takes only material bodies already granted by the existing authenticated membership/unlock projection. */
export function selectWorkshopWrapUpSource(state: WorkshopPublicState): WorkshopWrapUpSource {
    const { kind, slug, title, description, startsAt, endsAt, isPublished, presentationUrl, repository } = state.workshop;
    return {
        workshop: { kind, slug, title, description, startsAt, endsAt, isPublished, presentationUrl, repository },
        contentBlocks: state.contentBlocks.map(({ title, bodyMarkdown, isFollowUp }) => ({ title, bodyMarkdown, isFollowUp })),
        serverTime: state.serverTime,
    };
}

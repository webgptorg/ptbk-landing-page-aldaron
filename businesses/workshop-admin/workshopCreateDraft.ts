import {
    createWorkshopEventWriteValues,
    type WorkshopCreateValues,
    type WorkshopRepositoryWriteValues,
} from '@/businesses/workshop-admin/workshopAdminApiClient';
import {
    createWorkshopRepositoryDraft,
    createWorkshopRepositoryWriteValues,
} from '@/businesses/workshop-admin/workshopRepositoryDraft';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@/lib/dateTimeLocal';
import { DEFAULT_EVENT_DETAILS, type EventDetails } from '@/lib/events/event';
import { DEFAULT_WORKSHOP_REACTIONS, MAXIMAL_WORKSHOP_SLUG_LENGTH } from '@/lib/workshops/workshopConstants';
import type { WorkshopPanelKey } from '@/lib/workshops/workshopPanels';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';

const DEFAULT_WORKSHOP_START_DELAY_MILLISECONDS = 24 * 60 * 60 * 1000;
const DEFAULT_WORKSHOP_DURATION_MILLISECONDS = 90 * 60 * 1000;
const DUPLICATE_WORKSHOP_SLUG_SUFFIX = '-copy';

/**
 * The values held by the small form which creates one workshop occurrence.
 *
 * Note: Dates stay in the format native datetime controls read until this form is submitted. That lets a duplicate
 *       be reviewed and moved before it becomes a new database occurrence.
 */
export type WorkshopCreateDraft = {
    readonly slug: string;
    readonly title: string;
    readonly description: string;
    readonly startsAt: string;
    readonly endsAt: string;
    readonly event: EventDetails;
    readonly youtubeVideoId: string | null;
    readonly previewYoutubeVideoId: string | null;
    readonly duplicateAttachedPollsFromWorkshopId?: string;

    /**
     * The project the new term is about, which a copy inherits from the term it was copied from
     */
    readonly repository: WorkshopRepositoryWriteValues | null;
    readonly isPublished: boolean;
    readonly allowedReactions: readonly string[];
    readonly disabledPanels: readonly WorkshopPanelKey[];
    readonly artificialWatchingParticipantCount?: number;
};

function copyEventDetails(event: EventDetails): EventDetails {
    return { ...event };
}

function createDuplicateWorkshopSlug(slug: string, duplicateNumber: number): string {
    const duplicateSuffix =
        duplicateNumber === 1 ? DUPLICATE_WORKSHOP_SLUG_SUFFIX : `${DUPLICATE_WORKSHOP_SLUG_SUFFIX}-${duplicateNumber}`;
    const maximalSourceSlugLength = MAXIMAL_WORKSHOP_SLUG_LENGTH - duplicateSuffix.length;
    const sourceSlugPrefix = slug.slice(0, maximalSourceSlugLength).replace(/-+$/, '');

    return `${sourceSlugPrefix}${duplicateSuffix}`;
}

function createAvailableDuplicateWorkshopSlug(slug: string, existingWorkshopSlugs: readonly string[]): string {
    const existingWorkshopSlugSet = new Set(existingWorkshopSlugs);
    let duplicateNumber = 1;
    let duplicateSlug = createDuplicateWorkshopSlug(slug, duplicateNumber);

    while (existingWorkshopSlugSet.has(duplicateSlug)) {
        duplicateNumber += 1;
        duplicateSlug = createDuplicateWorkshopSlug(slug, duplicateNumber);
    }

    return duplicateSlug;
}

/**
 * Starts a blank, published event occurrence one day from now.
 */
export function createNewWorkshopDraft(currentTimestamp = Date.now()): WorkshopCreateDraft {
    const startsAt = currentTimestamp + DEFAULT_WORKSHOP_START_DELAY_MILLISECONDS;

    return {
        slug: '',
        title: '',
        description: '',
        startsAt: toDateTimeLocalValue(new Date(startsAt).toISOString()),
        endsAt: toDateTimeLocalValue(new Date(startsAt + DEFAULT_WORKSHOP_DURATION_MILLISECONDS).toISOString()),
        event: copyEventDetails(DEFAULT_EVENT_DETAILS),
        youtubeVideoId: null,
        previewYoutubeVideoId: null,
        repository: null,
        isPublished: true,
        allowedReactions: [...DEFAULT_WORKSHOP_REACTIONS],
        disabledPanels: [],
        artificialWatchingParticipantCount: 0,
    };
}

/**
 * Copies settings that describe an event occurrence, but deliberately leaves all occurrence history behind.
 *
 * Participants, comments, reactions, feedback, and content blocks belong to the original occurrence. Attached polls
 * are copied by the server from the source workshop when the resulting create values are submitted.
 */
export function createWorkshopDuplicateDraft(
    workshop: WorkshopDetails,
    existingWorkshopSlugs: readonly string[] = [],
): WorkshopCreateDraft | null {
    if (workshop.kind !== 'workshop' || workshop.event === null) {
        return null;
    }

    return {
        slug: createAvailableDuplicateWorkshopSlug(workshop.slug, existingWorkshopSlugs),
        title: workshop.title,
        description: workshop.description,
        startsAt: toDateTimeLocalValue(workshop.startsAt),
        endsAt: toDateTimeLocalValue(workshop.endsAt),
        event: copyEventDetails(workshop.event),
        youtubeVideoId: workshop.youtubeVideoId,
        previewYoutubeVideoId: workshop.previewYoutubeVideoId,
        repository: createWorkshopRepositoryWriteValues(createWorkshopRepositoryDraft(workshop.repository)),
        isPublished: workshop.isPublished,
        duplicateAttachedPollsFromWorkshopId: workshop.id,
        allowedReactions: [...workshop.allowedReactions],
        disabledPanels: [...workshop.disabledPanels],
        ...(workshop.artificialWatchingParticipantCount === undefined
            ? {}
            : { artificialWatchingParticipantCount: workshop.artificialWatchingParticipantCount }),
    };
}

/**
 * Converts one form draft into the one write shape accepted by the existing create-workshop endpoint.
 */
export function createWorkshopCreateValues(draft: WorkshopCreateDraft): WorkshopCreateValues | null {
    const startsAt = fromDateTimeLocalValue(draft.startsAt);
    if (!startsAt || !draft.title.trim() || !draft.slug.trim()) {
        return null;
    }

    return {
        slug: draft.slug,
        title: draft.title,
        description: draft.description,
        startsAt,
        endsAt: fromDateTimeLocalValue(draft.endsAt),
        ...createWorkshopEventWriteValues(draft.event),
        youtubeVideoId: draft.youtubeVideoId,
        previewYoutubeVideoId: draft.previewYoutubeVideoId,
        repository: draft.repository,
        isPublished: draft.isPublished,
        ...(draft.duplicateAttachedPollsFromWorkshopId === undefined
            ? {}
            : { duplicateAttachedPollsFromWorkshopId: draft.duplicateAttachedPollsFromWorkshopId }),
        allowedReactions: draft.allowedReactions,
        disabledPanels: draft.disabledPanels,
        ...(draft.artificialWatchingParticipantCount === undefined
            ? {}
            : { artificialWatchingParticipantCount: draft.artificialWatchingParticipantCount }),
    };
}

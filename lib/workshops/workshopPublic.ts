import { selectEventOccurrences, type EventOccurrence } from '@/lib/events/eventOccurrence';
import type { EventType } from '@/lib/events/eventTypes';
import { createWorkshopEventCardDetails } from '@/lib/workshops/workshopEventCardDetails';
import { getWorkshopPhase, isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
import {
    findPublishedCommunity,
    findPublishedWorkshopEventCardRows,
    findPublishedWorkshops,
    findMostRecentPublishedWorkshop,
    findUpcomingPublishedWorkshops,
    findWorkshopBySlug,
    getWorkshopDatabaseOrNull,
    mapWorkshopRow,
    mapWorkshopRepository,
    mapWorkshopSummaryRow,
} from '@/lib/workshops/workshopDatabase';
import type { WorkshopDetails, WorkshopEventCardSummary, WorkshopSummary } from '@/lib/workshops/workshopTypes';

/**
 * Loads every term of one kind of event which visitors can still register for. A missing workshop database
 * deliberately looks like no listed terms instead of exposing internal configuration details on the public landing
 * page.
 */
export async function loadUpcomingPublishedEventSummaries(eventType: EventType): Promise<readonly EventOccurrence[]> {
    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return [];
    }

    const workshopRows = await findUpcomingPublishedWorkshops(supabase, eventType);
    return selectEventOccurrences(workshopRows.map(mapWorkshopSummaryRow));
}

/**
 * Loads every published term of one kind of event, including the ones which are running right now and the ones which
 * are already over. A missing workshop database deliberately looks like no listed terms, exactly as it does on the
 * public landing page of that event.
 *
 * Note: This is what a room offers a participant to choose from, so it deliberately says more than the landing page
 *       of the same event does. A term is worth entering while it runs and long after it ended, while only a term
 *       which has not started yet is worth registering for.
 */
export async function loadPublishedEventSummaries(eventType: EventType): Promise<readonly EventOccurrence[]> {
    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return [];
    }

    const workshopRows = await findPublishedWorkshops(supabase, eventType);
    return selectEventOccurrences(workshopRows.map(mapWorkshopSummaryRow));
}

/**
 * Resolves a published occurrence of one kind of event selected by the URL. Legacy links without a selection
 * deliberately enter the most recent published occurrence of that event, while an explicitly unknown slug never
 * silently opens a different workshop.
 */
export async function loadSelectedPublishedWorkshop(
    requestedWorkshopSlug: string | null,
    eventType: EventType,
): Promise<WorkshopDetails | null> {
    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return null;
    }

    const workshopRow =
        requestedWorkshopSlug === null
            ? await findMostRecentPublishedWorkshop(supabase, eventType)
            : await findWorkshopBySlug(supabase, requestedWorkshopSlug, true);

    if (workshopRow === null || workshopRow.room_kind !== 'workshop' || workshopRow.event_type !== eventType) {
        return null;
    }

    return mapWorkshopRow(workshopRow);
}

/**
 * Loads the one published community room. Its data model is shared with workshops so participants get the same
 * secure live-room capabilities without a second copy of the session and moderation model.
 */
export async function loadPublishedCommunity(): Promise<WorkshopDetails | null> {
    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return null;
    }

    const communityRow = await findPublishedCommunity(supabase);
    return communityRow === null ? null : mapWorkshopRow(communityRow);
}

/**
 * Lists every published term of every kind of event for the community, including past terms but never the community
 * room itself or unpublished drafts.
 */
export async function loadPublishedWorkshopSummaries(): Promise<readonly WorkshopSummary[]> {
    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return [];
    }

    const workshopRows = await findPublishedWorkshops(supabase);
    return workshopRows.map(mapWorkshopSummaryRow);
}

/**
 * Lists the published terms of the community with the additional, browser-safe data its mini cards can show.
 *
 * Note: The normal summary loader stays lightweight for the ICS feed and other consumers. This one keeps card-only
 *       reads in one server-side place and never sends a gated recording identifier or feedback to the community
 *       browser.
 */
export async function loadPublishedWorkshopEventCardSummaries(): Promise<readonly WorkshopEventCardSummary[]> {
    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return [];
    }

    const workshopRows = await findPublishedWorkshopEventCardRows(supabase);
    const currentTimeMilliseconds = Date.now();

    return Promise.all(
        workshopRows.map(async (workshopRow) => {
            const eventCardDetails = await createWorkshopEventCardDetails({
                youtubeVideoId: workshopRow.youtube_video_id,
                recordingStartOffsetSeconds: workshopRow.recording_start_offset_seconds,
                repository: mapWorkshopRepository(workshopRow),
                isRecordingAvailable: isWorkshopPhasePast(
                    getWorkshopPhase(
                        { startsAt: workshopRow.starts_at, endsAt: workshopRow.ends_at },
                        currentTimeMilliseconds,
                    ),
                ),
            });

            return { ...mapWorkshopSummaryRow(workshopRow), eventCardDetails };
        }),
    );
}

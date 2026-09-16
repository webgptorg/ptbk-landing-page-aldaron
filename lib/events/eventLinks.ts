import { getEventTypeDefinition, isExternalEventType } from '@/lib/events/eventTypes';
import { createWorkshopRoomLink, type WorkshopParticipantIdentity } from '@/lib/workshops/workshopParticipantLink';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';

/**
 * Nobody in particular, which is who a publicly published link is built for
 */
const ANONYMOUS_WORKSHOP_PARTICIPANT_IDENTITY: WorkshopParticipantIdentity = { email: '', fullname: '' };

/**
 * Where one term of an event leads a member who is already connected somewhere else
 *
 * Note: A kind of event with a live room leads into that room and carries the already verified identity there, so the
 *       room never asks for it again. A kind of event without a room leads to its landing page, where a visitor picks
 *       a term and registers for it, because there is nothing else to open.
 * Note: A term of an event held by somebody else leads to the address it is held at, because that is the only place
 *       there is to read about it and to sign up for it. A term which was never given one leads nowhere rather than to
 *       a page which knows nothing about it.
 * Note: A room which is not a term of any event the application knows leads nowhere rather than into the room of a
 *       different kind of event.
 */
export function createEventLinkOrNull(
    workshop: WorkshopSummary,
    participantIdentity: WorkshopParticipantIdentity,
): string | null {
    if (workshop.event === null) {
        return null;
    }

    const { participantPath, landingPagePath } = getEventTypeDefinition(workshop.event.type);

    if (landingPagePath === null) {
        return workshop.event.externalUrl;
    }

    return participantPath === null
        ? landingPagePath
        : createWorkshopRoomLink(participantPath, participantIdentity, workshop.slug);
}

/**
 * Where one term leads everybody, which is the same destination without the identity of any member
 *
 * Note: This is what a published calendar carries, because such a calendar is read by whoever subscribed to it and by
 *       every calendar application on the way. It never names the member it was downloaded by.
 */
export function createPublicEventLinkOrNull(workshop: WorkshopSummary): string | null {
    return createEventLinkOrNull(workshop, ANONYMOUS_WORKSHOP_PARTICIPANT_IDENTITY);
}

/**
 * Where one term leads inside this application, or `null` for a term which leads out of it
 *
 * Note: Whatever has to keep a member inside this application asks for this rather than for the destination of the
 *       term. A payment gate returning a member to the room they paid from is one such thing, because the address of
 *       a term held by somebody else belongs to that somebody else and is no room of ours to come back to.
 */
export function createLocalEventLinkOrNull(workshop: WorkshopSummary): string | null {
    return workshop.event !== null && isExternalEventType(workshop.event.type)
        ? null
        : createPublicEventLinkOrNull(workshop);
}

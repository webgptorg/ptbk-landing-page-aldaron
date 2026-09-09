import {
    createParticipantIdentityPath,
    type WorkshopParticipantIdentity,
} from '@/lib/workshops/workshopParticipantLink';

/**
 * Czech community entry point. Future localized routes can reuse the room component while supplying their own path
 * and copy, without changing the stable community room in the database.
 */
export const COMMUNITY_PATH = '/cs/komunita';

/**
 * The public index of creations shared by community members.
 */
export const COMMUNITY_PROJECTS_PATH = `${COMMUNITY_PATH}/projects`;

/**
 * The published calendar of every term the community lists, which a calendar application subscribes to.
 */
export const COMMUNITY_CALENDAR_PATH = `${COMMUNITY_PATH}/calendar.ics`;

/**
 * How a calendar application names this subscription among the calendars of its owner.
 */
export const COMMUNITY_CALENDAR_NAME = 'Termíny akcí Promptbooku';

/**
 * Name of the calendar file itself, which is what a browser downloading it saves.
 */
export const COMMUNITY_CALENDAR_FILE_NAME = 'promptbook-terminy-akci.ics';

/**
 * The persistent room which the community migration creates and protects from being renamed.
 */
export const COMMUNITY_WORKSHOP_SLUG = 'komunita';

/**
 * Community project routes stay below the community workshop API path, which is also where the narrowly scoped
 * community session cookie is sent.
 */
export const COMMUNITY_PROJECTS_API_PATH = `/api/workshops/${COMMUNITY_WORKSHOP_SLUG}/projects`;

/**
 * How the payment gate returns a member to the room, which the room reads to celebrate or to say nothing happened.
 *
 * Note: A returning browser carries the id of the finished checkout, which is what lets the room confirm a payment
 *       against the gate itself rather than believing an address which anybody could type.
 */
export const COMMUNITY_MEMBERSHIP_RESULT_PARAMETER_NAME = 'membership';
export const COMMUNITY_MEMBERSHIP_CHECKOUT_SESSION_PARAMETER_NAME = 'checkoutSession';
export const COMMUNITY_MEMBERSHIP_PAID_RESULT = 'paid';
export const COMMUNITY_MEMBERSHIP_CANCELLED_RESULT = 'cancelled';

/**
 * Internal dashboard for the one community room.
 */
export const COMMUNITY_ADMIN_PATH = '/admin/community';

export function createCommunityProjectPath(projectId: string): string {
    return `${COMMUNITY_PROJECTS_PATH}/${encodeURIComponent(projectId)}`;
}

/**
 * Where the permanent community is entered from another room, carrying the identity that room already verified.
 *
 * Note: This is the other direction of the very same hand-off which leads a member of the community into the room of a
 *       term it lists, see `createWorkshopRoomLink`. Both carry the connected member on, so neither room asks somebody
 *       who is already connected for their name and address a second time.
 */
export function createCommunityRoomLink(participantIdentity: WorkshopParticipantIdentity): string {
    return createParticipantIdentityPath(COMMUNITY_PATH, participantIdentity);
}

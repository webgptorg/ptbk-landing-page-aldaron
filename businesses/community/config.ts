import {
    createParticipantIdentityPath,
    type WorkshopParticipantIdentity,
} from '@/lib/workshops/workshopParticipantLink';

export const COMMUNITIES_PATH = '/cs/komunity';
export const LEGACY_COMMUNITY_PATH = '/cs/komunita';
export const COMMUNITY_IDS = ['vyvojari', 'promptbook'] as const;
export type CommunityId = (typeof COMMUNITY_IDS)[number];
export const DEFAULT_COMMUNITY_ID = 'vyvojari';

export type CommunityDefinition = {
    readonly id: CommunityId;
    readonly roomSlug: string;
    readonly path: string;
    readonly calendarPath: string;
    readonly calendarName: string;
    readonly calendarFileName: string;
    readonly name: string;
    readonly description: string;
    readonly hasPaidMembership: boolean;
    readonly hasProjects: boolean;
};

export const COMMUNITIES: Readonly<Record<CommunityId, CommunityDefinition>> = {
    vyvojari: {
        id: 'vyvojari',
        roomSlug: 'komunita',
        path: `${COMMUNITIES_PATH}/vyvojari`,
        calendarPath: `${COMMUNITIES_PATH}/vyvojari/calendar.ics`,
        calendarName: 'Termíny akcí Promptbooku',
        calendarFileName: 'promptbook-terminy-akci.ics',
        name: 'Vývojáři',
        description: 'Programování s AI, vývojářské workshopy a projekty členů komunity.',
        hasPaidMembership: true,
        hasProjects: true,
    },
    promptbook: {
        id: 'promptbook',
        roomSlug: 'komunita-promptbook',
        path: `${COMMUNITIES_PATH}/promptbook`,
        calendarPath: `${COMMUNITIES_PATH}/promptbook/calendar.ics`,
        calendarName: 'Komunita Promptbook – kalendář akcí',
        calendarFileName: 'promptbook-komunita.ics',
        name: 'Promptbook',
        description: 'Práce s agenty Promptbooku, automatizace a praktické workshopy.',
        hasPaidMembership: false,
        hasProjects: false,
    },
};

export function getCommunityById(communityId: string): CommunityDefinition | undefined {
    const id = COMMUNITY_IDS.find((id) => id === communityId);
    return id === undefined ? undefined : COMMUNITIES[id];
}

export function getCommunityByRoomSlug(roomSlug: string): CommunityDefinition | undefined {
    return COMMUNITY_IDS.map((id) => COMMUNITIES[id]).find((community) => community.roomSlug === roomSlug);
}

/** The existing community keeps its room, subscriptions, projects and historical calendar feed. */
export const COMMUNITY_PATH = COMMUNITIES[DEFAULT_COMMUNITY_ID].path;

/**
 * The public index of creations shared by community members.
 */
export const COMMUNITY_PROJECTS_PATH = `${COMMUNITY_PATH}/projects`;

/**
 * The published calendar of every term the community lists, which a calendar application subscribes to.
 */
export const COMMUNITY_CALENDAR_PATH = COMMUNITIES[DEFAULT_COMMUNITY_ID].calendarPath;

/**
 * How a calendar application names this subscription among the calendars of its owner.
 */
export const COMMUNITY_CALENDAR_NAME = COMMUNITIES[DEFAULT_COMMUNITY_ID].calendarName;

/**
 * Name of the calendar file itself, which is what a browser downloading it saves.
 */
export const COMMUNITY_CALENDAR_FILE_NAME = COMMUNITIES[DEFAULT_COMMUNITY_ID].calendarFileName;

/**
 * The persistent room which the community migration creates and protects from being renamed.
 */
export const COMMUNITY_WORKSHOP_SLUG = COMMUNITIES[DEFAULT_COMMUNITY_ID].roomSlug;

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
 * Internal dashboard for community rooms.
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
export function createCommunityRoomLink(
    participantIdentity: WorkshopParticipantIdentity,
    communityId: CommunityId = DEFAULT_COMMUNITY_ID,
): string {
    return createParticipantIdentityPath(COMMUNITIES[communityId].path, participantIdentity);
}

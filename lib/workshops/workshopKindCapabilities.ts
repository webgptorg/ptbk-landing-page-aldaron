import type { WorkshopKind } from '@/lib/workshops/workshopTypes';

/**
 * What a room of one kind is, so that a screen asks for the capability it needs instead of naming the kind itself
 */
export type WorkshopKindCapabilities = {
    /**
     * Whether exactly one room of this kind exists, so nothing offers a choice between rooms or the creation of another
     */
    readonly isSingleton: boolean;

    /**
     * Whether the URL of a room is decided once and for all, so its administration neither offers it nor lets an edit
     * disconnect the links leading to it
     */
    readonly isSlugFixed: boolean;

    /**
     * Whether a room happens at a time, so it has a start, an end, and a countdown towards it
     */
    readonly isScheduled: boolean;

    /**
     * Whether a room is one term of a public event, so it says which kind of event it is, where it is held, what it
     * costs, and how many people fit into it
     */
    readonly isEvent: boolean;

    /**
     * Whether a room gathers its participants around a shared stage with a video stream
     */
    readonly isStageOffered: boolean;

    /**
     * Whether a room can be about a project, so its administration connects a repository to it and the room shows what
     * is being built in that repository while the room runs
     */
    readonly isRepositoryOffered: boolean;

    /**
     * Whether the room offers member polls, which are currently the permanent community's way to make a decision
     * together without turning an individual live workshop into a survey.
     */
    readonly isPollsOffered: boolean;

    /**
     * Whether this room can show a community poll which is attached to it. A workshop occurrence is the subject of
     * such a poll rather than its owner, so it shows and changes the one common e-mail-owned vote there.
     */
    readonly isAttachedCommunityPollsShown: boolean;

    /**
     * Whether a room says which membership of the community the connected member has, and lets them buy and manage it
     * without leaving the room
     *
     * Note: The membership belongs to the address a member connects with rather than to one room, so every room which
     *       offers it reads and changes the very same membership.
     */
    readonly isMembershipOffered: boolean;

    /**
     * Whether a room leads its participants on into the permanent community, which is where everything outlasting one
     * term is kept
     *
     * Note: The community never invites anybody into itself, and a project discussion is opened from the community
     *       which already showed that project, so only a room a member can reach without the community offers the way
     *       there.
     */
    readonly isCommunityInvitationOffered: boolean;

    /**
     * Whether a participant can end their own session in this room and be offered its connection form again, which
     * they read as signing out of it
     *
     * Note: Only a room a participant connected to themselves is left this way. The session of a project discussion is
     *       made out of the community session which opened it, so signing out there would be undone by the very next
     *       visit; a member of a project discussion signs out of the community instead.
     */
    readonly isDisconnectionOffered: boolean;

    /**
     * Whether a room updates itself while it is open, which its broadcast, its reactions, and its watching count need
     */
    readonly isRealtime: boolean;
};

/**
 * Every room kind together with what it is
 *
 * Note: A workshop occurrence is the live event this infrastructure was built for. The community reuses the very same
 *       secured room, but is one permanent, calm space rather than an occurrence which starts, streams, and ends.
 * Note: This is the one place a room kind is described. Every screen reads it, so a kind added later needs no change
 *       of the room, of its administration, or of the routes behind them.
 */
const WORKSHOP_KIND_CAPABILITY_DEFINITIONS: Readonly<Record<WorkshopKind, WorkshopKindCapabilities>> = {
    workshop: {
        isSingleton: false,
        isSlugFixed: false,
        isScheduled: true,
        isEvent: true,
        isStageOffered: true,
        isRepositoryOffered: true,
        isPollsOffered: false,
        isAttachedCommunityPollsShown: true,
        isMembershipOffered: true,
        isCommunityInvitationOffered: true,
        isDisconnectionOffered: true,
        isRealtime: true,
    },
    community: {
        isSingleton: true,
        isSlugFixed: true,
        isScheduled: false,
        isEvent: false,
        isStageOffered: false,
        isRepositoryOffered: false,
        isPollsOffered: true,
        isAttachedCommunityPollsShown: false,
        isMembershipOffered: true,
        isCommunityInvitationOffered: false,
        isDisconnectionOffered: true,
        isRealtime: false,
    },
    project: {
        isSingleton: false,
        isSlugFixed: true,
        isScheduled: false,
        isEvent: false,
        isStageOffered: false,
        isRepositoryOffered: false,
        isPollsOffered: false,
        isAttachedCommunityPollsShown: false,
        isMembershipOffered: false,
        isCommunityInvitationOffered: false,
        isDisconnectionOffered: false,
        isRealtime: false,
    },
};

export function getWorkshopKindCapabilities(workshopKind: WorkshopKind): WorkshopKindCapabilities {
    return WORKSHOP_KIND_CAPABILITY_DEFINITIONS[workshopKind];
}

/**
 * Whether a member room can show and vote on visible community polls. Community owns and administers them, while a
 * workshop occurrence can use the same vote only for polls the community attached to it.
 */
export function isWorkshopPollVisibleInRoom(workshopKind: WorkshopKind): boolean {
    const { isPollsOffered, isAttachedCommunityPollsShown } = getWorkshopKindCapabilities(workshopKind);
    return isPollsOffered || isAttachedCommunityPollsShown;
}

/**
 * The settings of a room which its kind does not have at all
 */
const WORKSHOP_SCHEDULE_FIELD_NAMES = ['startsAt', 'endsAt'] as const;
const WORKSHOP_STAGE_FIELD_NAMES = ['youtubeVideoId', 'previewYoutubeVideoId'] as const;
const WORKSHOP_REPOSITORY_FIELD_NAMES = ['repository'] as const;
const WORKSHOP_SLUG_FIELD_NAMES = ['slug'] as const;
const WORKSHOP_EVENT_FIELD_NAMES = [
    'eventType',
    'locationKind',
    'locationLabel',
    'priceCzk',
    'maximumParticipantCount',
] as const;

/**
 * The written settings which the kind of a room does not have
 *
 * Note: The administration already leaves these settings out of its form, so this only refuses a stale or a forged
 *       request which would give a calm room a schedule, a stage, or a project that nothing in it could ever show, or
 *       move the only room of its kind to an address every link to it would miss.
 */
export function getUnsupportedWorkshopKindFieldNames(
    workshopKind: WorkshopKind,
    values: Readonly<Record<string, unknown>>,
): readonly string[] {
    const capabilities = getWorkshopKindCapabilities(workshopKind);
    const unsupportedFieldNames = [
        ...(capabilities.isScheduled ? [] : WORKSHOP_SCHEDULE_FIELD_NAMES),
        ...(capabilities.isEvent ? [] : WORKSHOP_EVENT_FIELD_NAMES),
        ...(capabilities.isStageOffered ? [] : WORKSHOP_STAGE_FIELD_NAMES),
        ...(capabilities.isRepositoryOffered ? [] : WORKSHOP_REPOSITORY_FIELD_NAMES),
        ...(capabilities.isSlugFixed ? WORKSHOP_SLUG_FIELD_NAMES : []),
    ];

    return unsupportedFieldNames.filter((fieldName) => values[fieldName] !== undefined);
}

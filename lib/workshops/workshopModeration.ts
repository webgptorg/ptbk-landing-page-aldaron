import type { WorkshopParticipant } from '@/lib/workshops/workshopTypes';

/**
 * Who moderates a room: the administration behind `/admin/workshops`, or a moderator inside the room itself
 */
export const WORKSHOP_MODERATION_ROLE_VALUES = ['admin', 'moderator'] as const;

export type WorkshopModerationRole = (typeof WORKSHOP_MODERATION_ROLE_VALUES)[number];

/**
 * What one moderating role may do with the messages and the people of a room
 */
export type WorkshopModerationCapabilities = {
    /**
     * Whether this role decides that a message is shown to the whole room or taken out of it again
     */
    readonly isCommentModerationOffered: boolean;

    /**
     * Whether this role corrects the text of a message which is already in the chat
     */
    readonly isCommentEditingOffered: boolean;

    /**
     * Whether this role holds one message on top of the chat
     */
    readonly isCommentPinningOffered: boolean;

    /**
     * Whether this role can preserve a chat message as an ordinary material
     */
    readonly isCommentMaterialConversionOffered: boolean;

    /**
     * Whether this role decides that a member-written poll answer is shown to the whole room or taken out of it again
     */
    readonly isPollOptionModerationOffered: boolean;

    /**
     * Whether this role corrects the wording of a member-written poll answer or removes it altogether
     *
     * Note: Only the administration does. A poll belongs to the community which administers it, so the wording of its
     *       answers is changed where the poll itself is changed rather than from whichever room happens to show it.
     */
    readonly isPollOptionEditingOffered: boolean;

    /**
     * Whether this role approves a participant's pending submissions and has future submissions approved as written
     */
    readonly isTrustingOffered: boolean;

    /**
     * Whether this role takes the interactions of a participant away
     */
    readonly isInteractionBanningOffered: boolean;

    /**
     * Whether this role appoints another moderator of the room
     *
     * Note: Only the administration does, so a moderator can never hand their own powers on and a room never grows
     *       moderators of its own.
     */
    readonly isModeratorAppointmentOffered: boolean;
};

/**
 * Every moderating role together with what it may do
 *
 * Note: This is the one place a moderation power is described. The routes of the administration, the routes of the
 *       room, and the room itself all read it, so a power added later needs no second list to agree with.
 */
const WORKSHOP_MODERATION_CAPABILITY_DEFINITIONS: Readonly<
    Record<WorkshopModerationRole, WorkshopModerationCapabilities>
> = {
    admin: {
        isCommentModerationOffered: true,
        isCommentEditingOffered: true,
        isCommentPinningOffered: true,
        isCommentMaterialConversionOffered: true,
        isPollOptionModerationOffered: true,
        isPollOptionEditingOffered: true,
        isTrustingOffered: true,
        isInteractionBanningOffered: true,
        isModeratorAppointmentOffered: true,
    },
    moderator: {
        isCommentModerationOffered: true,
        isCommentEditingOffered: true,
        isCommentPinningOffered: true,
        isCommentMaterialConversionOffered: true,
        isPollOptionModerationOffered: true,
        isPollOptionEditingOffered: false,
        isTrustingOffered: true,
        isInteractionBanningOffered: true,
        isModeratorAppointmentOffered: false,
    },
};

export function getWorkshopModerationCapabilities(
    moderationRole: WorkshopModerationRole,
): WorkshopModerationCapabilities {
    return WORKSHOP_MODERATION_CAPABILITY_DEFINITIONS[moderationRole];
}

/**
 * Whether a participant moderates the room they are connected to
 *
 * Note: The room, its state, and the routes behind them ask this very question, so a moderator is offered exactly what
 *       the server would also let them do.
 * Note: A moderator whose interactions were taken away moderates nothing anymore, so a ban stops a moderator the same
 *       way it stops everybody else.
 */
export function isWorkshopParticipantModerating(
    participant: Pick<WorkshopParticipant, 'isModerator' | 'isInteractionBanned'>,
): boolean {
    return participant.isModerator && !participant.isInteractionBanned;
}

/**
 * Whether this moderating role may change the moderation state of one participant at all
 *
 * Note: A moderator is only ever appointed and dismissed by the administration, so a moderator of the room may not
 *       reach a fellow moderator either. Taking the interactions of one away would otherwise dismiss them, which is
 *       exactly the power a moderator does not have.
 */
export function isWorkshopParticipantModeratedBy(
    moderationRole: WorkshopModerationRole,
    participant: { readonly isModerator: boolean },
): boolean {
    return !participant.isModerator || getWorkshopModerationCapabilities(moderationRole).isModeratorAppointmentOffered;
}

/**
 * The unoffered fields which were really written, so only what somebody actually asked for is ever refused
 */
function getWrittenFieldNames(
    unofferedFieldNames: readonly string[],
    values: Readonly<Record<string, unknown>>,
): readonly string[] {
    return unofferedFieldNames.filter((fieldName) => values[fieldName] !== undefined);
}

/**
 * The written comment fields which this moderating role may not change
 */
export function getUnofferedWorkshopCommentModerationFieldNames(
    moderationRole: WorkshopModerationRole,
    values: Readonly<Record<string, unknown>>,
): readonly string[] {
    const capabilities = getWorkshopModerationCapabilities(moderationRole);

    return getWrittenFieldNames(
        [
            ...(capabilities.isCommentModerationOffered ? [] : ['status']),
            ...(capabilities.isCommentEditingOffered ? [] : ['body']),
            ...(capabilities.isCommentPinningOffered ? [] : ['isPinned']),
        ],
        values,
    );
}

/**
 * The written fields of a member-written poll answer which this moderating role may not change
 */
export function getUnofferedWorkshopPollOptionModerationFieldNames(
    moderationRole: WorkshopModerationRole,
    values: Readonly<Record<string, unknown>>,
): readonly string[] {
    const capabilities = getWorkshopModerationCapabilities(moderationRole);

    return getWrittenFieldNames(
        [
            ...(capabilities.isPollOptionModerationOffered ? [] : ['status']),
            ...(capabilities.isPollOptionEditingOffered ? [] : ['label']),
        ],
        values,
    );
}

/**
 * The written participant fields which this moderating role may not change
 */
export function getUnofferedWorkshopParticipantModerationFieldNames(
    moderationRole: WorkshopModerationRole,
    values: Readonly<Record<string, unknown>>,
): readonly string[] {
    const capabilities = getWorkshopModerationCapabilities(moderationRole);

    return getWrittenFieldNames(
        [
            ...(capabilities.isTrustingOffered ? [] : ['isTrusted']),
            ...(capabilities.isInteractionBanningOffered ? [] : ['isInteractionBanned']),
            ...(capabilities.isModeratorAppointmentOffered ? [] : ['isModerator']),
        ],
        values,
    );
}

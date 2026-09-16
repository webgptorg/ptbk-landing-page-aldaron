import type { WorkshopDetails, WorkshopPaidMembersVideo } from '@/lib/workshops/workshopTypes';

/**
 * The video configuration of one occurrence as an administrator wrote it.
 */
export type WorkshopVideo = Pick<
    WorkshopDetails,
    'youtubeVideoId' | 'previewYoutubeVideoId' | 'recordingStartOffsetSeconds'
>;

/**
 * What decides whether the recording of a workshop reaches the member reading the room
 */
export type WorkshopMemberVideoAccess = {
    /**
     * Whether the workshop is already over, which is the moment its stream becomes a recording the membership unlocks
     *
     * Note: While a workshop runs, everybody watches it. The membership pays for watching it again afterwards rather
     *       than for being at it.
     */
    readonly isWorkshopPast: boolean;

    /**
     * Whether the member reading the room pays for the community membership
     */
    readonly isPaidMember: boolean;

    /**
     * Whether this kind of room offers the membership at all, see `workshopKindCapabilities`
     */
    readonly isMembershipOffered: boolean;
};

/**
 * The video of a room as one member is given it: what they may play, and what is only being offered to them
 */
export type WorkshopMemberVideoSelection = {
    /**
     * The videos of the room as this member receives them, written over the administered ones
     *
     * Note: The teaser is deliberately never part of them. It is not a video of the room but what stands in for the
     *       one being withheld, so it travels with that withheld recording alone and a member who may watch the
     *       recording is never shown a snippet of it beside it.
     */
    readonly readableVideo: WorkshopVideo;
    readonly paidMembersOnlyVideo: WorkshopPaidMembersVideo | null;
};

const EMPTY_WORKSHOP_VIDEO: WorkshopVideo = {
    youtubeVideoId: null,
    previewYoutubeVideoId: null,
    recordingStartOffsetSeconds: 0,
};

/**
 * Decides which video of an occurrence one member receives and which of it is offered to them instead.
 *
 * Note: One rule decides both, so a room can never play a recording it also sells, nor sell one it hands over anyway.
 * Note: An occurrence which carries no stream has nothing a purchase could unlock, so its ended room offers nothing
 *       rather than a membership for a recording which does not exist. A room which offers no membership has no gate
 *       to put in front of its video either.
 */
export function selectWorkshopVideoForMember(
    { youtubeVideoId, previewYoutubeVideoId, recordingStartOffsetSeconds }: WorkshopVideo,
    { isWorkshopPast, isPaidMember, isMembershipOffered }: WorkshopMemberVideoAccess,
): WorkshopMemberVideoSelection {
    const isVideoWithheld = isMembershipOffered && isWorkshopPast && !isPaidMember && youtubeVideoId !== null;

    return isVideoWithheld
        ? { readableVideo: EMPTY_WORKSHOP_VIDEO, paidMembersOnlyVideo: { previewYoutubeVideoId } }
        : {
              readableVideo: { youtubeVideoId, previewYoutubeVideoId: null, recordingStartOffsetSeconds },
              paidMembersOnlyVideo: null,
          };
}

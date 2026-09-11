import type { AdminContactJoin } from '@/lib/admin/adminContactJoin';
import type { CommunityMembershipStatus } from '@/lib/community-membership/communityMembershipTypes';
import type { EventDetails } from '@/lib/events/event';
import type { WorkshopPanelKey } from '@/lib/workshops/workshopPanels';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';

/**
 * A live room is normally one workshop occurrence. The community uses the same resilient room infrastructure, but
 * remains a single, separately administered room across all occurrences.
 */
export const WORKSHOP_KIND_VALUES = ['workshop', 'community', 'project'] as const;

export type WorkshopKind = (typeof WORKSHOP_KIND_VALUES)[number];

export function isWorkshopKind(value: string): value is WorkshopKind {
    return WORKSHOP_KIND_VALUES.includes(value as WorkshopKind);
}

/**
 * The lifecycle of something a participant submits for moderation. Chat messages and community projects deliberately
 * use these same states, so trust and moderator privileges never approve one kind of submission differently from the
 * other.
 */
export const WORKSHOP_SUBMISSION_STATUS_VALUES = ['pending', 'approved', 'rejected'] as const;

export type WorkshopSubmissionStatus = (typeof WORKSHOP_SUBMISSION_STATUS_VALUES)[number];

/**
 * A chat message keeps this alias because it is the public type used by the existing room API.
 */
export type WorkshopCommentStatus = WorkshopSubmissionStatus;
export type WorkshopCommentSort = 'recent' | 'upvotes';

export type WorkshopSummary = {
    readonly id: string;
    readonly kind: WorkshopKind;
    readonly slug: string;
    readonly title: string;

    /**
     * What this very term is about, in the words an administrator wrote about it
     *
     * Note: Terms of one event each have a subject of their own, so a list of them says what every single one is
     *       about rather than describing them all by the event they belong to. The room and the list read the very
     *       same words, so a term is never described in two different ways.
     */
    readonly description: string;
    readonly startsAt: string;
    readonly endsAt: string | null;
    readonly isPublished: boolean;

    /**
     * The event this room is a term of, or `null` for a permanent room which is no event at all
     *
     * Note: Every kind of event is administered in the very same place and stored in the very same table, so a page
     *       listing terms only ever asks which kind of event it wants to list.
     */
    readonly event: EventDetails | null;
};

/**
 * One occurrence as the administration lists it, together with the audience it gathered
 *
 * Note: The participant count deliberately stays out of `WorkshopSummary`, so no public list of terms exposes how
 *       many people registered for them.
 */
export type WorkshopAdminSummary = WorkshopSummary & {
    readonly participantCount: number;

    /**
     * How many people registered for this term on the landing page of its event, or `null` for a room which is no term
     * of an event and therefore has no registration form at all
     *
     * Note: This is a different audience from `participantCount`, which counts the people who really entered the room.
     *       Somebody can register and never come, and somebody can be handed a link into a room they never registered
     *       for, so neither number can be derived from the other.
     */
    readonly registeredParticipantCount: number | null;
};

export type WorkshopDetails = WorkshopSummary & {
    /** Number of artificial viewers added to the live watching badge by an administrator. */
    readonly artificialWatchingParticipantCount?: number;
    readonly youtubeVideoId: string | null;

    /**
     * The teaser of that stream which stands in for it once the workshop is over, or `null` while none was published
     *
     * Note: The recording of an ended workshop is unlocked by the paid membership, and this is the snippet of it which
     *       an administrator lets everybody else watch instead. It is deliberately a second video rather than a part
     *       of the first one, so nothing of the recording itself has to reach a member who has not unlocked it.
     */
    readonly previewYoutubeVideoId: string | null;

    /**
     * The project this workshop is about, or `null` while no project is connected to it
     *
     * Note: This is the whole connection — the repository, the branch which is followed, and the address the project
     *       runs at — so the administration sets, changes, and unsets it as one thing. What has been committed in it
     *       is deliberately not part of it: that is read from GitHub, see `fetchWorkshopRepositoryProgress`.
     */
    readonly repository: WorkshopRepository | null;
    readonly allowedReactions: readonly string[];

    /**
     * The panels of the room an admin switched off for this workshop
     *
     * Note: Everything not listed here is offered, so a panel added later starts switched on for every workshop.
     */
    readonly disabledPanels: readonly WorkshopPanelKey[];
    readonly createdAt: string;
    readonly updatedAt: string;
};

export type WorkshopParticipant = {
    readonly id: string;
    readonly fullname: string;

    /**
     * Contact address this participant connected with
     *
     * Note: A room only ever describes the very participant reading it, so this address never reaches anybody else. It
     *       is what lets a room hand a verified identity on, for example into the link leading to another room.
     */
    readonly email: string;
    readonly connectedAt: string;
    readonly isInteractionBanned: boolean;

    /**
     * Whether the messages of this participant are approved as they are written
     *
     * Note: Trust stays invisible in the room. Nothing but the approval of their own messages tells a participant or
     *       anybody else that they were trusted.
     */
    readonly isTrusted: boolean;

    /**
     * Whether this participant moderates the room, which the room says with a badge
     */
    readonly isModerator: boolean;
};

export type WorkshopAdminParticipant = WorkshopParticipant &
    AdminContactJoin & {
    readonly lastSeenAt: string;
    readonly activeDurationSeconds: number;
    readonly commentCount: number;
    readonly reactionCount: number;
    readonly upvoteCount: number;

    /**
     * Present when the participant is listed inside the community administration. A community membership belongs to
     * their e-mail address rather than to this particular room session, so ordinary workshop participant data does
     * not fetch or expose it.
     */
    readonly communityMembershipStatus?: CommunityMembershipStatus;
};

/**
 * One server-paged slice of participants, keeping large workshops responsive in the administration.
 */
export type WorkshopAdminParticipantPage = {
    readonly participants: readonly WorkshopAdminParticipant[];
    readonly totalCount: number;
};

/**
 * One timestamped activity attributable to a participant.
 *
 * Note: These are assembled from the existing audited source records. They deliberately do not introduce a second
 * event store which could disagree with comments, reactions, or votes.
 */
export type WorkshopParticipantTimelineEvent =
    | {
          readonly kind: 'joined' | 'last-seen';
          readonly id: string;
          readonly occurredAt: string;
      }
    | {
          readonly kind: 'comment';
          readonly id: string;
          readonly occurredAt: string;
          readonly body: string;
          readonly status: WorkshopCommentStatus;
      }
    | {
          readonly kind: 'reaction';
          readonly id: string;
          readonly occurredAt: string;
          readonly emoji: string;
      }
    | {
          readonly kind: 'upvote';
          readonly id: string;
          readonly occurredAt: string;
          readonly commentId: string;
          readonly commentAuthorName: string | null;
          readonly commentBody: string | null;
      };

export type WorkshopAdminParticipantTimeline = {
    readonly participant: WorkshopAdminParticipant;
    readonly events: readonly WorkshopParticipantTimelineEvent[];
};

/**
 * Activity totals inside one compact bucket of the workshop-wide timeline.
 */
export type WorkshopAdminTimelinePoint = {
    readonly startsAt: string;

    /**
     * How many people had the room open during this bucket, which is the audience rather than an action
     *
     * Note: This is counted from the presence the room reports while it is open, so a workshop which was held before
     *       the room started reporting it has an audience of nobody however many people really watched it.
     */
    readonly watchingParticipantCount: number;

    /**
     * How many of the watching people were really at their computer during this bucket, and how many only had the room
     * open, which together are the whole audience of it
     *
     * Note: How that is told apart is decided by `workshopAttendance`, and a bucket which was measured before the
     *       attendance of a room was measured at all is passive throughout.
     */
    readonly activelyWatchingParticipantCount: number;
    readonly passivelyWatchingParticipantCount: number;

    /**
     * How many people registered into the room during this bucket
     */
    readonly participantCount: number;
    readonly commentCount: number;
    readonly reactionCount: number;
    readonly upvoteCount: number;
    readonly linkClickCount: number;

    /**
     * How many times each reaction was sent during this bucket, so a graph can draw one of them alone
     */
    readonly reactionCountsByEmoji: Readonly<Record<string, number>>;
};

/**
 * One message with the moment it was written, which is everything a metric counting words in the chat needs
 *
 * Note: The administration counts the matches of a regular expression in the browser, so that an expression which is
 *       still being typed answers immediately and never reaches the database.
 */
export type WorkshopAdminCommentSample = {
    readonly occurredAt: string;
    readonly body: string;
};

export type WorkshopAdminAnalytics = {
    readonly timelineStartsAt: string;
    readonly timelineEndsAt: string;
    readonly bucketDurationSeconds: number;
    readonly timeline: readonly WorkshopAdminTimelinePoint[];
    readonly reactionCounts: readonly WorkshopReactionCount[];
    readonly commentSamples: readonly WorkshopAdminCommentSample[];

    /**
     * Whether every message of the room could be sampled, or the oldest ones had to be left out of a very busy room
     */
    readonly isCommentSampleComplete: boolean;
};

export type WorkshopContentBlock = {
    readonly id: string;
    readonly title: string;
    readonly bodyMarkdown: string;
    readonly unlockAt: string;
    readonly sortOrder: number;
    readonly isPublished: boolean;

    /**
     * The one ordinary material selected to lead the post-workshop follow-up.
     */
    readonly isFollowUp: boolean;

    /**
     * Whether this material is reserved for the members who pay for the community membership
     *
     * Note: A room which offers the membership keeps it out of the state of everybody else and only says that it is
     *       there, so the material itself never reaches a member who has not unlocked it.
     */
    readonly isPaidMembersOnly: boolean;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly linkClickCount: number;
};

/**
 * As much of a withheld material as the member who may not read it is told
 *
 * Note: Nothing but the title of such a material ever leaves the server, so the room names what is waiting behind the
 *       membership without handing over any of it.
 */
export type WorkshopContentPreview = {
    readonly id: string;
    readonly title: string;
};

/**
 * As much of a withheld recording as the member who may not play it is given
 *
 * Note: The recording itself never leaves the server for such a member. Only the teaser an administrator published for
 *       it does, which is what the room shows on the closing stage instead, and which is `null` while none was
 *       published at all.
 */
export type WorkshopPaidMembersVideo = {
    readonly previewYoutubeVideoId: string | null;
};

/**
 * A participant's progressively saved reflection after one workshop.
 *
 * The score creates the record; every written answer is optional and can then arrive independently, so somebody who
 * only answers the first question is still represented faithfully.
 */
export type WorkshopFeedback = {
    readonly rating: number;
    readonly whatWasGood: string | null;
    readonly whatWasBad: string | null;
    readonly note: string | null;
    readonly createdAt: string;
    readonly updatedAt: string;
};

/**
 * The admin-only form of feedback, attributable to its participant and joinable to the private contact projection.
 */
export type WorkshopAdminFeedback = WorkshopFeedback &
    AdminContactJoin & {
        readonly id: string;
        readonly participantId: string;
        readonly fullname: string;
        readonly email: string;
    };

/**
 * Who wrote a message, as far as somebody moderating the room may know them
 *
 * Note: Only a moderator receives this, so an ordinary participant never learns which invisible moderation state the
 *       author of a message carries, nor the identity behind their name.
 */
export type WorkshopCommentAuthor = {
    readonly participantId: string;
    readonly isTrusted: boolean;
    readonly isInteractionBanned: boolean;
    readonly isModerator: boolean;
};

export type WorkshopComment = {
    readonly id: string;
    readonly authorName: string;
    readonly body: string;
    readonly status: WorkshopCommentStatus;
    readonly upvoteCount: number;
    readonly isUpvotedByParticipant: boolean;
    readonly createdAt: string;

    /**
     * Whether a moderator of the room wrote this message, which the whole room sees on it
     */
    readonly isAuthorModerator: boolean;

    /**
     * Whether the administration created this message without a participant
     */
    readonly isArtificial: boolean;

    /**
     * The author as a moderator of the room may act on them, or `null` for everybody else
     */
    readonly moderatedAuthor: WorkshopCommentAuthor | null;

    /**
     * The comment this one answers, or `null` when it opens its own thread
     */
    readonly parentCommentId: string | null;

    /**
     * Whether an admin pinned this message to the top of the chat
     *
     * Note: A room has at most one pinned message, because the pin is remembered by the workshop itself.
     */
    readonly isPinned: boolean;
};

/**
 * A comment together with the answers it received
 *
 * Note: The chat is exactly one level deep, so a reply never carries replies of its own.
 */
export type WorkshopCommentThread = {
    readonly comment: WorkshopComment;
    readonly replies: readonly WorkshopComment[];
};

export type WorkshopReaction = {
    readonly id: string;
    readonly emoji: string;
    readonly createdAt: string;
};

/**
 * The number of times one exact reaction has been sent in a workshop
 *
 * Note: This counts reaction actions, rather than distinct people. A participant who reacts twice therefore adds two
 *       to the total, exactly as the room celebrated two reactions.
 */
export type WorkshopReactionCount = {
    readonly emoji: string;
    readonly count: number;
};

/**
 * One answer a member can choose in a poll. The room only receives aggregate counts and whether its own participant
 * chose this option, never the identities behind any other vote.
 */
export type WorkshopPollOption = {
    readonly id: string;
    readonly label: string;
    readonly sortOrder: number;
    readonly voteCount: number;
    readonly isVotedByParticipant: boolean;
};

/**
 * The administrative view additionally separates the member votes from the explicitly seeded aggregate. The member
 * room deliberately keeps receiving only `WorkshopPollOption`, so an artificial starting count does not expose its
 * origin to the people taking part in the poll.
 */
export type WorkshopAdminPollOption = WorkshopPollOption & {
    readonly realVoteCount: number;
    readonly artificialVoteCount: number;
};

/**
 * A community question prepared by an administrator. Poll infrastructure is shared with the room model, while the
 * room-kind capability decides which kinds offer it.
 */
export type WorkshopPoll = {
    readonly id: string;
    readonly question: string;
    readonly isClosed: boolean;
    readonly isVisible: boolean;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly options: readonly WorkshopPollOption[];

    /**
     * The workshop occurrences this poll is about
     *
     * Note: A poll keeps belonging to the community which administers it. An attached occurrence is the subject of the
     *       question, which is what lets its room receive the poll and what lets the administration of that occurrence
     *       see the question asked about it. Members are only ever told about published occurrences.
     */
    readonly attachedWorkshops: readonly WorkshopSummary[];
};

export type WorkshopAdminPoll = Omit<WorkshopPoll, 'options'> & {
    readonly options: readonly WorkshopAdminPollOption[];
};

export type WorkshopPublicState = {
    readonly serverTime: string;
    readonly workshop: WorkshopDetails;
    readonly participant: WorkshopParticipant;

    /**
     * How many participants had the room open recently, including the one this state was loaded for
     */
    readonly watchingParticipantCount: number;
    readonly contentBlocks: readonly WorkshopContentBlock[];
    readonly nextContentUnlockAt: string | null;

    /**
     * The materials which only paid members may see, named for a member who is not one of them
     *
     * Note: The materials themselves stay out of `contentBlocks`, so this list is what lets the room say where the
     *       paid materials are, what they are called and how to unlock them. It is empty for a member who already paid
     *       and in a room which offers no membership at all.
     */
    readonly paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[];

    /**
     * The recording which the paid membership would unlock for this member, or `null` while nothing of the video is
     * being withheld from them
     *
     * Note: The stream of the occurrence stays out of `workshop` while this is set, so the room cannot play a recording
     *       it also offers to sell. It is `null` for everybody who may watch it — during the workshop itself, for a
     *       member who paid, and in a room which offers no membership — and for an occurrence which carries no video
     *       at all, because there would be nothing for a purchase to unlock.
     */
    readonly paidMembersOnlyVideo: WorkshopPaidMembersVideo | null;
    readonly feedback: WorkshopFeedback | null;
    readonly comments: readonly WorkshopComment[];

    /**
     * The one question the host selected for the shared stage, or `null` while no question is being answered
     *
     * Note: This is a reference to the ordinary comment which supplied the question. Keeping that comment as the
     *       source of truth lets an attendee and the host read the same words without copying a second message body
     *       into a stage-only record.
     */
    readonly stageComment: WorkshopCommentReference | null;
    readonly recentReactions: readonly WorkshopReaction[];
    readonly reactionCounts: readonly WorkshopReactionCount[];
    readonly polls: readonly WorkshopPoll[];
};

/**
 * As much of an answered comment as the moderation of a reply needs to judge it
 */
export type WorkshopCommentReference = {
    readonly id: string;
    readonly authorName: string;
    readonly body: string;
};

export type WorkshopAdminComment = Omit<WorkshopComment, 'isUpvotedByParticipant'> & {
    readonly participantId: string | null;
    readonly realUpvoteCount: number;
    readonly artificialUpvoteCount: number;
    readonly parentComment: WorkshopCommentReference | null;
};

export type WorkshopAdminSnapshot = {
    readonly workshop: WorkshopDetails;
    readonly contentBlocks: readonly WorkshopContentBlock[];
    readonly polls: readonly WorkshopAdminPoll[];

    /**
     * The community polls asked about this room, which a room administering polls of its own never has
     *
     * Note: These are read-only here. They are administered where they belong, in the administration of the community
     *       which owns them, rather than being editable from two places at once.
     */
    readonly attachedPolls: readonly WorkshopAdminPoll[];
    readonly comments: readonly WorkshopAdminComment[];

    /**
     * The message pinned on top of the chat, whatever moderation state the administration is listing
     */
    readonly pinnedComment: WorkshopCommentReference | null;

    /**
     * The question currently shown over the shared stage, if the room has one
     */
    readonly stageComment: WorkshopCommentReference | null;
    readonly participants: readonly WorkshopAdminParticipant[];
    readonly participantCount: number;
    readonly commentCount: number;
    readonly reactionCount: number;
    readonly artificialReactionCount: number;
};

export type WorkshopRealtimeEvent =
    | { readonly kind: 'state-changed' }
    | { readonly kind: 'reaction'; readonly reaction: WorkshopReaction; readonly reactionCount: number }
    | { readonly kind: 'upvote'; readonly commentId: string; readonly upvoteCount: number }
    | { readonly kind: 'stage-comment'; readonly stageComment: WorkshopCommentReference | null };

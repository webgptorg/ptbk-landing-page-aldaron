import {
    DEFAULT_WORKSHOP_REACTIONS,
    MAXIMAL_ARTIFICIAL_POLL_VOTE_ADJUSTMENT,
    MAXIMAL_ARTIFICIAL_UPVOTE_ADJUSTMENT,
    MAXIMAL_WORKSHOP_ALLOWED_REACTION_COUNT,
    MAXIMAL_WORKSHOP_COMMENT_LENGTH,
    MAXIMAL_WORKSHOP_FEEDBACK_TEXT_LENGTH,
    MAXIMAL_WORKSHOP_POLL_OPTION_LENGTH,
    MAXIMAL_WORKSHOP_POLL_OPTION_COUNT,
    MAXIMAL_WORKSHOP_POLL_QUESTION_LENGTH,
    MAXIMAL_WORKSHOP_POLL_WORKSHOP_COUNT,
    MAXIMAL_WORKSHOP_PARTICIPANT_EMAIL_LENGTH,
    MAXIMAL_WORKSHOP_PRESENCE_REPORT_SECONDS,
    MAXIMAL_WORKSHOP_REACTION_LENGTH,
    MAXIMAL_WORKSHOP_RECORDING_START_OFFSET_SECONDS,
    MAXIMAL_WORKSHOP_REPOSITORY_BRANCH_COUNT,
    MAXIMAL_WORKSHOP_REPOSITORY_BRANCH_LENGTH,
    MAXIMAL_WORKSHOP_REPOSITORY_DEPLOYMENT_COUNT,
    MAXIMAL_WORKSHOP_SLUG_LENGTH,
    MINIMAL_WORKSHOP_POLL_OPTION_COUNT,
} from '@/lib/workshops/workshopConstants';
import {
    MAXIMAL_EVENT_LOCATION_LABEL_LENGTH,
    MAXIMAL_EVENT_PARTICIPANT_COUNT,
    MAXIMAL_EVENT_PRICE_CZK,
} from '@/lib/events/eventConstants';
import { extractGithubBranchSelection, extractGithubRepository } from '@/lib/github/githubRepository';
import { normalizePublicWebPageUrl } from '@/lib/network/publicWebPageUrl';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import { isEventLocationKind, type EventLocationKind } from '@/lib/events/eventLocation';
import { isEventType, isExternalEventType, type EventType } from '@/lib/events/eventTypes';
import {
    isWorkshopParticipantFullnameValid,
    normalizeWorkshopParticipantFullname,
} from '@/lib/workshops/workshopParticipantFullname';
import { normalizeWorkshopParticipantEmail } from '@/lib/workshops/workshopParticipantEmail';
import { isWorkshopPanelKey, WORKSHOP_PANEL_DEFINITIONS, type WorkshopPanelKey } from '@/lib/workshops/workshopPanels';
import { extractYoutubeVideoId } from '@/lib/youtube/youtubeEmbed';
import { z } from 'zod';

const WORKSHOP_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAXIMAL_WORKSHOP_PUBLIC_URL_LENGTH = 2_000;

const nullableTimestampSchema = z.string().datetime({ offset: true }).nullable();
const WORKSHOP_SLUG_SCHEMA = z.string().trim().min(1).max(MAXIMAL_WORKSHOP_SLUG_LENGTH).regex(WORKSHOP_SLUG_PATTERN);
const workshopParticipantFullnameSchema = z
    .string()
    .transform(normalizeWorkshopParticipantFullname)
    .refine(isWorkshopParticipantFullnameValid, 'A participant name is required');
const workshopReactionEmojiSchema = z.string().trim().min(1).max(MAXIMAL_WORKSHOP_REACTION_LENGTH);
const workshopCommentBodySchema = z.string().trim().min(1).max(MAXIMAL_WORKSHOP_COMMENT_LENGTH);
const workshopPollQuestionSchema = z.string().trim().min(1).max(MAXIMAL_WORKSHOP_POLL_QUESTION_LENGTH);
const workshopPollOptionSchema = z.string().trim().min(1).max(MAXIMAL_WORKSHOP_POLL_OPTION_LENGTH);
const workshopPollOptionWriteSchema = z.object({
    id: z.string().uuid().optional(),
    label: workshopPollOptionSchema,
});
const workshopFeedbackTextSchema = z
    .string()
    .trim()
    .max(MAXIMAL_WORKSHOP_FEEDBACK_TEXT_LENGTH)
    .transform((value) => (value === '' ? null : value));
const workshopAllowedReactionsSchema = z
    .array(workshopReactionEmojiSchema)
    .min(1)
    .max(MAXIMAL_WORKSHOP_ALLOWED_REACTION_COUNT)
    .refine((reactions) => new Set(reactions).size === reactions.length, 'Workshop reactions must be unique');

/**
 * The panels an admin switched off, validated against the very registry the room reads
 *
 * Note: A key nothing knows is refused instead of stored, so a typo cannot silently hide a panel of the room.
 */
const workshopDisabledPanelsSchema = z
    .array(z.custom<WorkshopPanelKey>(isWorkshopPanelKey, 'Unknown workshop panel'))
    .max(WORKSHOP_PANEL_DEFINITIONS.length)
    .refine((panelKeys) => new Set(panelKeys).size === panelKeys.length, 'Workshop panels must be unique');

const WORKSHOP_PUBLIC_URL_TEXT_SCHEMA = z.string().trim().max(MAXIMAL_WORKSHOP_PUBLIC_URL_LENGTH);

/**
 * Reads one written address the way every public workshop address is read, naming the field which needs correcting
 *
 * Note: Presentations, project deployments and the address of an external event share these safety and
 *       canonicalization rules, so an address is judged exactly once however many of them a request carries.
 */
function readWorkshopPublicUrl(value: string, context: z.RefinementCtx, invalidUrlMessage: string) {
    const normalizedUrl = normalizePublicWebPageUrl(value);
    if (normalizedUrl === null) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: invalidUrlMessage });
        return z.NEVER;
    }

    return normalizedUrl;
}

/**
 * One publicly opened workshop address which has to be there, such as every single deployment of a project
 */
function createWorkshopPublicUrlSchema(invalidUrlMessage: string) {
    return WORKSHOP_PUBLIC_URL_TEXT_SCHEMA.transform((value, context) =>
        readWorkshopPublicUrl(value, context, invalidUrlMessage),
    );
}

/**
 * One publicly opened workshop address which may be left out, where an empty value clears the address
 */
function createNullableWorkshopPublicUrlSchema(invalidUrlMessage: string) {
    return z
        .union([WORKSHOP_PUBLIC_URL_TEXT_SCHEMA, z.null()])
        .transform((value, context) =>
            value === null || value === '' ? null : readWorkshopPublicUrl(value, context, invalidUrlMessage),
        );
}

const nullableWorkshopPresentationUrlSchema = createNullableWorkshopPublicUrlSchema(
    'A valid presentation URL is required',
);
const nullableEventExternalUrlSchema = createNullableWorkshopPublicUrlSchema('A valid event URL is required');

/**
 * The project one term is about, written as one whole connection
 *
 * Note: The branch selection and every deployment belong to the repository, so they are written together with it and
 *       cannot be left behind by unsetting it. A repository, a branch, or an address which cannot be read is refused
 *       instead of being stored as a connection leading nowhere.
 */
const workshopRepositoryBranchPatternSchema = z.string().trim().max(MAXIMAL_WORKSHOP_REPOSITORY_BRANCH_LENGTH);
const workshopRepositoryBranchesSchema = z
    .array(workshopRepositoryBranchPatternSchema)
    .max(MAXIMAL_WORKSHOP_REPOSITORY_BRANCH_COUNT)
    .refine((branches) => new Set(branches).size === branches.length, 'Workshop branches must be unique');
const workshopRepositoryDeploymentUrlsSchema = z
    .array(createWorkshopPublicUrlSchema('A valid deployment URL is required'))
    .max(MAXIMAL_WORKSHOP_REPOSITORY_DEPLOYMENT_COUNT)
    .refine(
        (deploymentUrls) => new Set(deploymentUrls).size === deploymentUrls.length,
        'Workshop deployments must be unique',
    );
const workshopRepositoryWriteSchema = z
    .object({
        url: z.string().trim().max(MAXIMAL_WORKSHOP_PUBLIC_URL_LENGTH),
        branch: z
            .union([workshopRepositoryBranchPatternSchema, workshopRepositoryBranchesSchema, z.null()])
            .default(null),
        deploymentUrls: workshopRepositoryDeploymentUrlsSchema.default([]),
    })
    .transform((values, context) => {
        const repository = extractGithubRepository(values.url);
        if (repository === null) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['url'],
                message: 'A valid GitHub repository URL or owner/name is required',
            });
            return z.NEVER;
        }

        // Note: An empty text value follows the default branch. Every other value is one or several branch patterns,
        //       including `*` for all branches.
        const writtenBranch = values.branch === '' ? null : values.branch;
        const branch = extractGithubBranchSelection(writtenBranch);
        if (branch === null && writtenBranch !== null) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['branch'],
                message: 'A valid Git branch pattern is required',
            });
            return z.NEVER;
        }

        return { ...repository, branch, deploymentUrls: values.deploymentUrls } satisfies WorkshopRepository;
    });

const nullableWorkshopRepositorySchema = z.union([workshopRepositoryWriteSchema, z.null()]);

const nullableYoutubeVideoIdSchema = z.union([z.string().trim().max(2_000), z.null()]).transform((value, context) => {
    if (!value) {
        return null;
    }

    const youtubeVideoId = extractYoutubeVideoId(value);
    if (youtubeVideoId === null) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: 'A valid YouTube video URL or ID is required' });
        return z.NEVER;
    }
    return youtubeVideoId;
});

export const workshopConnectionSchema = z.object({
    fullname: workshopParticipantFullnameSchema,
    email: z
        .string()
        .trim()
        .email()
        .max(MAXIMAL_WORKSHOP_PARTICIPANT_EMAIL_LENGTH)
        .transform(normalizeWorkshopParticipantEmail),
});

export const workshopCommentSchema = z.object({
    body: workshopCommentBodySchema,

    /**
     * The comment this one answers, left out or `null` when it opens its own thread
     */
    parentCommentId: z.string().uuid().nullable().default(null),
});

export const workshopReactionSchema = z.object({
    emoji: workshopReactionEmojiSchema,
});

function areWorkshopPollOptionLabelsUnique(
    options: readonly string[] | readonly { readonly label: string }[],
): boolean {
    return (
        new Set(options.map((option) => (typeof option === 'string' ? option : option.label).toLowerCase())).size ===
        options.length
    );
}

/**
 * The workshop occurrences one poll is about, listed once each
 *
 * Note: Whether an ID names an existing occurrence, and whether that room is an occurrence at all rather than the
 *       community itself, stays a database rule, so a forged request cannot attach a poll to anything else.
 */
const workshopPollWorkshopIdsSchema = z
    .array(z.string().uuid())
    .max(MAXIMAL_WORKSHOP_POLL_WORKSHOP_COUNT)
    .refine((workshopIds) => new Set(workshopIds).size === workshopIds.length, 'Poll workshops must be unique')
    .default([]);

/**
 * A poll is intentionally a small, clear choice. The duplicate check is case-insensitive after trimming, so two
 * buttons cannot look different only because an administrator typed a different casing.
 */
export const workshopPollCreateSchema = z.object({
    question: workshopPollQuestionSchema,
    options: z
        .array(workshopPollOptionSchema)
        .min(MINIMAL_WORKSHOP_POLL_OPTION_COUNT)
        .max(MAXIMAL_WORKSHOP_POLL_OPTION_COUNT)
        .refine(areWorkshopPollOptionLabelsUnique, 'Poll options must be unique'),
    isClosed: z.boolean().default(false),
    isVisible: z.boolean().default(true),
    isOtherOptionEnabled: z.boolean().default(false),
    attachedWorkshopIds: workshopPollWorkshopIdsSchema,
});

/**
 * Keeps the IDs of choices which survive an edit. The database can therefore retain their real and artificial votes,
 * while choices absent from this list are intentionally removed together with their votes.
 */
export const workshopPollUpdateSchema = z.object({
    question: workshopPollQuestionSchema,
    options: z
        .array(workshopPollOptionWriteSchema)
        .min(MINIMAL_WORKSHOP_POLL_OPTION_COUNT)
        .max(MAXIMAL_WORKSHOP_POLL_OPTION_COUNT)
        .refine(areWorkshopPollOptionLabelsUnique, 'Poll options must be unique')
        .refine((options) => {
                const optionIds = options.flatMap((option) => (option.id === undefined ? [] : [option.id]));
                return new Set(optionIds).size === optionIds.length;
        }, 'Poll options must not repeat'),
    isClosed: z.boolean(),
    isVisible: z.boolean(),
    isOtherOptionEnabled: z.boolean(),
    attachedWorkshopIds: workshopPollWorkshopIdsSchema,
});

/**
 * A participant either selects an answer already shown by the poll or supplies one new answer. Strict branches make
 * the two actions exclusive, so a forged request cannot claim both choices at once.
 */
export const workshopPollVoteSchema = z.union([
    z.object({ optionId: z.string().uuid() }).strict(),
    z.object({ otherOptionLabel: workshopPollOptionSchema }).strict(),
]);

export const workshopPollOptionArtificialVoteSchema = z.object({
    artificialVoteAdjustment: z
        .number()
        .int()
        .min(-MAXIMAL_ARTIFICIAL_POLL_VOTE_ADJUSTMENT)
        .max(MAXIMAL_ARTIFICIAL_POLL_VOTE_ADJUSTMENT)
        .refine((value) => value !== 0, 'Artificial poll vote adjustment cannot be zero'),
});

/**
 * Every change an admin can make to a comment which is already in the chat
 *
 * Note: Moderating a comment, correcting its text, and pinning it share this one request, so that all of them reach
 *       the room the same way.
 */
export const workshopCommentUpdateSchema = z
    .object({
        status: z.enum(['approved', 'rejected']).optional(),
        body: workshopCommentBodySchema.optional(),

        /**
         * Whether this message holds the top of the chat, which releases the previously pinned one
         */
        isPinned: z.boolean().optional(),
    })
    .refine(
        (value) => value.status !== undefined || value.body !== undefined || value.isPinned !== undefined,
        'At least one comment field is required',
    )
    .refine(
        (value) => !(value.isPinned === true && value.status === 'rejected'),
        'A rejected comment cannot be pinned on top of the chat',
    );

export const workshopArtificialCommentSchema = z.object({
    authorName: workshopParticipantFullnameSchema,
    body: workshopCommentBodySchema,
});

/**
 * Selects the one existing comment which the host is answering on stage, or clears the stage again.
 */
export const workshopStageCommentSchema = z.object({
    commentId: z.string().uuid().nullable(),
});

export const workshopArtificialReactionSchema = workshopReactionSchema;

export const workshopCommentArtificialUpvoteSchema = z.object({
    artificialUpvoteAdjustment: z
        .number()
        .int()
        .min(-MAXIMAL_ARTIFICIAL_UPVOTE_ADJUSTMENT)
        .max(MAXIMAL_ARTIFICIAL_UPVOTE_ADJUSTMENT)
        .refine((value) => value !== 0, 'Artificial upvote adjustment cannot be zero'),
});

export const workshopParticipantRenameSchema = z.object({
    fullname: workshopParticipantFullnameSchema,
});

/**
 * Every change a moderating role can make to one participant of a room
 *
 * Note: Who may make which of them is decided by `workshopModeration`, so a moderator of the room and the
 *       administration send the very same request and only differ in what it is allowed to carry.
 */
export const workshopParticipantUpdateSchema = z
    .object({
        isInteractionBanned: z.boolean().optional(),
        isTrusted: z.boolean().optional(),
        isModerator: z.boolean().optional(),
    })
    .refine((value) => Object.values(value).some((fieldValue) => fieldValue !== undefined), {
        message: 'At least one participant field is required',
    });

/**
 * One heartbeat of an open room: for how long it was open and whether anybody was in front of it
 *
 * Note: A room which does not say how it was attended is taken to have been attended passively, so a page which was
 *       opened before the attendance was measured at all is never counted as an active audience it was never asked
 *       about.
 */
export const workshopPresenceSchema = z.object({
    activeDurationSeconds: z.number().int().min(1).max(MAXIMAL_WORKSHOP_PRESENCE_REPORT_SECONDS),
    isActivelyAttending: z.boolean().default(false),
});

/**
 * Whether a term held somewhere really says where it is held
 *
 * Note: An edit which leaves the place alone is judged by the database against the place already written there, so
 *       only a written empty place is refused here.
 */
function isEventLocationWritten(values: {
    readonly locationKind?: EventLocationKind;
    readonly locationLabel?: string;
}): boolean {
    return values.locationKind !== 'onsite' || values.locationLabel === undefined || values.locationLabel !== '';
}

/**
 * Whether a term of an event held by somebody else really says which address it is held at
 *
 * Note: Such a term leads nowhere at all without it, so it is refused instead of being published as a term nobody can
 *       reach. An edit which leaves the address alone keeps the address already written on the term, exactly as an
 *       edit which leaves the place alone keeps its place.
 */
function isExternalEventUrlWritten(values: {
    readonly eventType?: EventType;
    readonly externalUrl?: string | null;
}): boolean {
    return values.eventType === undefined || !isExternalEventType(values.eventType) || values.externalUrl !== null;
}

/**
 * What one term says about the event it is a term of
 *
 * Note: The kind of event and the place are validated against the very registries every page reads, so a kind of
 *       event nothing knows is refused instead of stored and later listed nowhere.
 */
const eventTypeSchema = z.custom<EventType>(
    (value) => typeof value === 'string' && isEventType(value),
    'Unknown event type',
);
const eventLocationKindSchema = z.custom<EventLocationKind>(
    (value) => typeof value === 'string' && isEventLocationKind(value),
    'Unknown event location',
);
const eventLocationLabelSchema = z.string().trim().max(MAXIMAL_EVENT_LOCATION_LABEL_LENGTH);
const eventPriceCzkSchema = z.number().int().min(0).max(MAXIMAL_EVENT_PRICE_CZK);
const eventMaximumParticipantCountSchema = z.number().int().min(1).max(MAXIMAL_EVENT_PARTICIPANT_COUNT).nullable();
const artificialWatchingParticipantCountSchema = z.number().int().min(0).max(1_000_000);
const WORKSHOP_RECORDING_START_OFFSET_SECONDS_SCHEMA = z
    .number()
    .int()
    .min(0)
    .max(MAXIMAL_WORKSHOP_RECORDING_START_OFFSET_SECONDS);
const ATTACHED_POLLS_SOURCE_WORKSHOP_ID_SCHEMA = z.string().uuid().optional();

function areAttachedPollSourceWorkshopIdsConsistent(values: {
    readonly attachedPollsSourceWorkshopId?: string;
    readonly duplicateAttachedPollsFromWorkshopId?: string;
}): boolean {
    return (
        values.attachedPollsSourceWorkshopId === undefined ||
        values.duplicateAttachedPollsFromWorkshopId === undefined ||
        values.attachedPollsSourceWorkshopId === values.duplicateAttachedPollsFromWorkshopId
    );
}

export const workshopCreateSchema = z
    .object({
        slug: WORKSHOP_SLUG_SCHEMA,
        title: z.string().trim().min(1).max(200),
        description: z.string().trim().max(2000).default(''),
        startsAt: z.string().datetime({ offset: true }),
        endsAt: nullableTimestampSchema.default(null),
        eventType: eventTypeSchema,
        locationKind: eventLocationKindSchema,
        locationLabel: eventLocationLabelSchema.default(''),
        priceCzk: eventPriceCzkSchema.default(0),
        maximumParticipantCount: eventMaximumParticipantCountSchema.default(null),
        externalUrl: nullableEventExternalUrlSchema.default(null),
        artificialWatchingParticipantCount: artificialWatchingParticipantCountSchema.default(0),
        youtubeVideoId: nullableYoutubeVideoIdSchema.default(null),
        recordingStartOffsetSeconds: WORKSHOP_RECORDING_START_OFFSET_SECONDS_SCHEMA.default(0),
        previewYoutubeVideoId: nullableYoutubeVideoIdSchema.default(null),
        presentationUrl: nullableWorkshopPresentationUrlSchema.default(null),
        repository: nullableWorkshopRepositorySchema.default(null),
        isPublished: z.boolean().default(true),
        attachedPollsSourceWorkshopId: ATTACHED_POLLS_SOURCE_WORKSHOP_ID_SCHEMA,
        /** The former internal field, accepted so an already loaded administration page can finish its request. */
        duplicateAttachedPollsFromWorkshopId: ATTACHED_POLLS_SOURCE_WORKSHOP_ID_SCHEMA,
        allowedReactions: workshopAllowedReactionsSchema.default([...DEFAULT_WORKSHOP_REACTIONS]),
        disabledPanels: workshopDisabledPanelsSchema.default([]),
    })
    .refine(areAttachedPollSourceWorkshopIdsConsistent, {
        message: 'Attached poll sources must match',
        path: ['attachedPollsSourceWorkshopId'],
    })
    .refine(({ startsAt, endsAt }) => endsAt === null || Date.parse(endsAt) > Date.parse(startsAt), {
        message: 'Workshop end must be after its start',
        path: ['endsAt'],
    })
    .refine(isEventLocationWritten, {
        message: 'An on-site event needs the place it is held at',
        path: ['locationLabel'],
    })
    .refine(isExternalEventUrlWritten, {
        message: 'An external event needs the address it is held at',
        path: ['externalUrl'],
    });

export const workshopUpdateSchema = z
    .object({
        slug: WORKSHOP_SLUG_SCHEMA.optional(),
        title: z.string().trim().min(1).max(200).optional(),
        description: z.string().trim().max(2000).optional(),
        startsAt: z.string().datetime({ offset: true }).optional(),
        endsAt: nullableTimestampSchema.optional(),
        eventType: eventTypeSchema.optional(),
        locationKind: eventLocationKindSchema.optional(),
        locationLabel: eventLocationLabelSchema.optional(),
        priceCzk: eventPriceCzkSchema.optional(),
        maximumParticipantCount: eventMaximumParticipantCountSchema.optional(),
        externalUrl: nullableEventExternalUrlSchema.optional(),
        artificialWatchingParticipantCount: artificialWatchingParticipantCountSchema.optional(),
        youtubeVideoId: nullableYoutubeVideoIdSchema.optional(),
        recordingStartOffsetSeconds: WORKSHOP_RECORDING_START_OFFSET_SECONDS_SCHEMA.optional(),
        previewYoutubeVideoId: nullableYoutubeVideoIdSchema.optional(),
        presentationUrl: nullableWorkshopPresentationUrlSchema.optional(),
        repository: nullableWorkshopRepositorySchema.optional(),
        isPublished: z.boolean().optional(),
        allowedReactions: workshopAllowedReactionsSchema.optional(),
        disabledPanels: workshopDisabledPanelsSchema.optional(),
    })
    .refine((value) => Object.keys(value).length > 0, 'At least one workshop field is required')
    .refine(isEventLocationWritten, {
        message: 'An on-site event needs the place it is held at',
        path: ['locationLabel'],
    })
    .refine(isExternalEventUrlWritten, {
        message: 'An external event needs the address it is held at',
        path: ['externalUrl'],
    });

const workshopContentFieldsSchema = z.object({
    title: z.string().trim().max(200),
    bodyMarkdown: z.string().trim().min(1).max(100000),
    unlockAt: z.string().datetime({ offset: true }),
    sortOrder: z.number().int().min(-100000).max(100000),
    isPublished: z.boolean(),
    isFollowUp: z.boolean(),
    isPaidMembersOnly: z.boolean(),
});

export const workshopContentCreateSchema = workshopContentFieldsSchema;
export const workshopContentUpdateSchema = workshopContentFieldsSchema
    .partial()
    .refine((value) => Object.keys(value).length > 0, 'At least one content field is required');

/**
 * A participant can first submit a rating and then update each optional answer on its own request.
 */
export const workshopFeedbackUpdateSchema = z
    .object({
        rating: z.number().int().min(1).max(5).optional(),
        whatWasGood: workshopFeedbackTextSchema.optional(),
        whatWasBad: workshopFeedbackTextSchema.optional(),
        note: workshopFeedbackTextSchema.optional(),
    })
    .refine((value) => Object.values(value).some((fieldValue) => fieldValue !== undefined), {
        message: 'At least one feedback field is required',
    });

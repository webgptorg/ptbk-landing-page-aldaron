import { formatGithubRepositoryName, serializeGithubBranchSelection } from '@/lib/github/githubRepository';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import type { z } from 'zod';
import type {
    workshopArtificialCommentSchema,
    workshopCommentUpdateSchema,
    workshopContentCreateSchema,
    workshopContentUpdateSchema,
    workshopCreateSchema,
    workshopFeedbackUpdateSchema,
    workshopParticipantUpdateSchema,
    workshopUpdateSchema,
} from '@/lib/workshops/workshopSchemas';

type WorkshopCreateValues = z.infer<typeof workshopCreateSchema>;
type WorkshopUpdateValues = z.infer<typeof workshopUpdateSchema>;
type WorkshopContentCreateValues = z.infer<typeof workshopContentCreateSchema>;
type WorkshopContentUpdateValues = z.infer<typeof workshopContentUpdateSchema>;
type WorkshopCommentUpdateValues = z.infer<typeof workshopCommentUpdateSchema>;
type WorkshopParticipantUpdateValues = z.infer<typeof workshopParticipantUpdateSchema>;
type WorkshopArtificialCommentValues = z.infer<typeof workshopArtificialCommentSchema>;
type WorkshopFeedbackUpdateValues = z.infer<typeof workshopFeedbackUpdateSchema>;

/**
 * The database names of a whole connection to a project, whether it is being set, changed, or unset
 *
 * Note: All three of them are written together, so unsetting the connection can never leave branch selection or a
 *       deployment of a repository which is no longer connected behind.
 */
function createWorkshopRepositoryDatabaseValues(repository: WorkshopRepository | null) {
    return {
        github_repository: repository === null ? null : formatGithubRepositoryName(repository),
        github_repository_branches: repository === null ? null : serializeGithubBranchSelection(repository.branch),
        deployment_url: repository?.deploymentUrl ?? null,
    };
}

export function createWorkshopDatabaseValues(values: WorkshopCreateValues) {
    return {
        slug: values.slug,
        title: values.title,
        description: values.description,
        starts_at: values.startsAt,
        ends_at: values.endsAt,
        event_type: values.eventType,
        location_kind: values.locationKind,
        location_label: values.locationLabel,
        price_czk: values.priceCzk,
        maximum_participant_count: values.maximumParticipantCount,
        artificial_watching_participant_count: values.artificialWatchingParticipantCount,
        youtube_video_id: values.youtubeVideoId,
        preview_youtube_video_id: values.previewYoutubeVideoId,
        ...createWorkshopRepositoryDatabaseValues(values.repository),
        is_published: values.isPublished,
        allowed_reactions: values.allowedReactions,
        disabled_panels: values.disabledPanels,
    };
}

export function createWorkshopUpdateDatabaseValues(values: WorkshopUpdateValues) {
    return {
        ...(values.slug === undefined ? {} : { slug: values.slug }),
        ...(values.title === undefined ? {} : { title: values.title }),
        ...(values.description === undefined ? {} : { description: values.description }),
        ...(values.startsAt === undefined ? {} : { starts_at: values.startsAt }),
        ...(values.endsAt === undefined ? {} : { ends_at: values.endsAt }),
        ...(values.eventType === undefined ? {} : { event_type: values.eventType }),
        ...(values.locationKind === undefined ? {} : { location_kind: values.locationKind }),
        ...(values.locationLabel === undefined ? {} : { location_label: values.locationLabel }),
        ...(values.priceCzk === undefined ? {} : { price_czk: values.priceCzk }),
        ...(values.maximumParticipantCount === undefined
            ? {}
            : { maximum_participant_count: values.maximumParticipantCount }),
        ...(values.artificialWatchingParticipantCount === undefined
            ? {}
            : { artificial_watching_participant_count: values.artificialWatchingParticipantCount }),
        ...(values.youtubeVideoId === undefined ? {} : { youtube_video_id: values.youtubeVideoId }),
        ...(values.previewYoutubeVideoId === undefined
            ? {}
            : { preview_youtube_video_id: values.previewYoutubeVideoId }),
        ...(values.repository === undefined ? {} : createWorkshopRepositoryDatabaseValues(values.repository)),
        ...(values.isPublished === undefined ? {} : { is_published: values.isPublished }),
        ...(values.allowedReactions === undefined ? {} : { allowed_reactions: values.allowedReactions }),
        ...(values.disabledPanels === undefined ? {} : { disabled_panels: values.disabledPanels }),
    };
}

export function createWorkshopContentDatabaseValues(values: WorkshopContentCreateValues) {
    return {
        title: values.title,
        body_markdown: values.bodyMarkdown,
        unlock_at: values.unlockAt,
        sort_order: values.sortOrder,
        is_published: values.isPublished,
        is_follow_up: values.isFollowUp,
        is_paid_members_only: values.isPaidMembersOnly,
    };
}

export function createWorkshopContentUpdateDatabaseValues(values: WorkshopContentUpdateValues) {
    return {
        ...(values.title === undefined ? {} : { title: values.title }),
        ...(values.bodyMarkdown === undefined ? {} : { body_markdown: values.bodyMarkdown }),
        ...(values.unlockAt === undefined ? {} : { unlock_at: values.unlockAt }),
        ...(values.sortOrder === undefined ? {} : { sort_order: values.sortOrder }),
        ...(values.isPublished === undefined ? {} : { is_published: values.isPublished }),
        ...(values.isFollowUp === undefined ? {} : { is_follow_up: values.isFollowUp }),
        ...(values.isPaidMembersOnly === undefined ? {} : { is_paid_members_only: values.isPaidMembersOnly }),
    };
}

/**
 * Database names for the feedback fields which may be independently saved by the participant.
 */
export function createWorkshopFeedbackUpdateDatabaseValues(values: WorkshopFeedbackUpdateValues) {
    return {
        ...(values.rating === undefined ? {} : { rating: values.rating }),
        ...(values.whatWasGood === undefined ? {} : { what_was_good: values.whatWasGood }),
        ...(values.whatWasBad === undefined ? {} : { what_was_bad: values.whatWasBad }),
        ...(values.note === undefined ? {} : { note: values.note }),
    };
}

/**
 * Note: Only a decision about the comment is a moderation, a corrected text leaves the moderation timestamp alone.
 * Note: A pinned message is there for the whole room to read, so pinning approves the message together with pinning it.
 */
export function createWorkshopCommentUpdateDatabaseValues(values: WorkshopCommentUpdateValues) {
    const status = values.status ?? (values.isPinned === true ? 'approved' : undefined);

    return {
        ...(status === undefined ? {} : { status, moderated_at: new Date().toISOString() }),
        ...(values.body === undefined ? {} : { body: values.body }),
    };
}

/**
 * Whether an admin change pins the comment on top of the chat, releases the top again, or leaves the pin alone
 *
 * Note: A rejected message leaves the top of the chat, because the room does not see it anymore.
 */
export function getWorkshopCommentPinChange(values: WorkshopCommentUpdateValues): boolean | null {
    if (values.status === 'rejected') {
        return false;
    }

    return values.isPinned ?? null;
}

/**
 * The written moderation state of one participant, whether the administration or a moderator of the room wrote it
 */
export function createWorkshopParticipantUpdateDatabaseValues(values: WorkshopParticipantUpdateValues) {
    return {
        ...(values.isInteractionBanned === undefined
            ? {}
            : { is_interaction_banned: values.isInteractionBanned }),
        ...(values.isTrusted === undefined ? {} : { is_trusted: values.isTrusted }),
        ...(values.isModerator === undefined ? {} : { is_moderator: values.isModerator }),
    };
}

export function createWorkshopArtificialCommentDatabaseValues(values: WorkshopArtificialCommentValues) {
    return {
        participant_id: null,
        author_name: values.authorName,
        body: values.body,
        status: 'approved',
        is_artificial: true,
        moderated_at: new Date().toISOString(),
    };
}

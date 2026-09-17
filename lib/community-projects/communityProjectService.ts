import {
    COMMUNITY_PROJECT_DISCUSSION_PARTICIPANT_TABLE_NAME,
    COMMUNITY_PROJECT_TABLE_NAME,
    COMMUNITY_PROJECT_VOTE_TABLE_NAME,
} from '@/lib/community-projects/communityProjectConstants';
import {
    getCommunityProjectDatabaseVote,
    getCommunityProjectVoteFromDatabaseValue,
    type CommunityProjectVote,
} from '@/lib/community-projects/communityProjectTypes';
import { runDatabaseTransaction, type DatabaseTransaction } from '@/lib/database/runDatabaseTransaction';
import { WORKSHOP_PARTICIPANT_TABLE_NAME, WORKSHOP_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { getWorkshopParticipantSubmissionStatus } from '@/lib/workshops/workshopSubmissionStatus';
import { createWorkshopSessionToken, hashWorkshopSessionToken } from '@/lib/workshops/workshopSession';
import type { WorkshopSubmissionStatus } from '@/lib/workshops/workshopTypes';
import { randomUUID } from 'node:crypto';

const COMMUNITY_PROJECT_OPERATION_NAME = 'change community projects';
const COMMUNITY_ROOM_KIND = 'community';
const PROJECT_ROOM_KIND = 'project';
const PROJECT_DISCUSSION_SLUG_PREFIX = 'community-project-';
const COMMUNITY_PROJECT_TABLE_REFERENCE = `public.${COMMUNITY_PROJECT_TABLE_NAME}`;
const COMMUNITY_PROJECT_VOTE_TABLE_REFERENCE = `public.${COMMUNITY_PROJECT_VOTE_TABLE_NAME}`;
const COMMUNITY_PROJECT_DISCUSSION_PARTICIPANT_TABLE_REFERENCE = `public.${COMMUNITY_PROJECT_DISCUSSION_PARTICIPANT_TABLE_NAME}`;
const WORKSHOP_TABLE_REFERENCE = `public.${WORKSHOP_TABLE_NAME}`;
const WORKSHOP_PARTICIPANT_TABLE_REFERENCE = `public.${WORKSHOP_PARTICIPANT_TABLE_NAME}`;

type CommunityParticipantRow = {
    readonly id: string;
    readonly fullname: string;
    readonly email: string;
    readonly is_interaction_banned: boolean;
    readonly is_trusted: boolean;
    readonly is_moderator: boolean;
};

type CommunityProjectDiscussionRow = {
    readonly discussion_workshop_id: string;
    readonly discussion_workshop_slug: string;
    readonly author_community_participant_id: string;
};

type CommunityProjectVoteCountsRow = {
    readonly status: WorkshopSubmissionStatus;
    readonly upvote_count: number;
    readonly downvote_count: number;
};

type CommunityProjectVoteRow = {
    readonly vote: number;
};

type CommunityProjectVoteForCommunityParticipantDeletionRow = {
    readonly project_id: string;
    readonly vote: number;
    readonly upvote_count: number;
    readonly downvote_count: number;
};

type CommunityProjectDiscussionParticipantMappingRow = {
    readonly discussion_participant_id: string;
};

type DiscussionParticipantRow = {
    readonly id: string;
    readonly is_moderator: boolean;
};

type CommunityProjectMutationErrorKind =
    'not-found' | 'member-invalid' | 'community-participant-missing' | 'discussion-participant-invalid';

type CommunityParticipantLockKind = 'key-share' | 'update';

const COMMUNITY_PARTICIPANT_LOCK_SQL_BY_KIND: Readonly<Record<CommunityParticipantLockKind, string>> = {
    'key-share': 'FOR KEY SHARE OF community_participant',
    update: 'FOR UPDATE OF community_participant',
};

class CommunityProjectMutationError extends Error {
    public constructor(
        public readonly kind: CommunityProjectMutationErrorKind,
        message: string,
    ) {
        super(message);
        this.name = 'CommunityProjectMutationError';
    }
}

export type CommunityProjectCreationValues = {
    readonly communityParticipantId: string;
    readonly url: string;
    readonly title: string;
    readonly description: string;
    readonly previewImageUrl: string | null;
};

export type CommunityProjectDiscussionConnection = {
    readonly discussionWorkshopId: string;
    readonly discussionWorkshopSlug: string;
    readonly discussionParticipantId: string;
};

export type CommunityProjectVoteSaveResult = {
    readonly vote: CommunityProjectVote | null;
    readonly upvoteCount: number;
    readonly downvoteCount: number;
};

type CommunityProjectMutationFailure = {
    readonly errorMessage: string;
    readonly isProjectMissing: boolean;
};

function getMutationErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

function createCommunityProjectMutationFailure(error: unknown): CommunityProjectMutationFailure {
    const isProjectMissing = error instanceof CommunityProjectMutationError && error.kind === 'not-found';

    return {
        errorMessage: getMutationErrorMessage(error),
        isProjectMissing,
    };
}

function createCommunityProjectDiscussionSlug(discussionWorkshopId: string): string {
    return `${PROJECT_DISCUSSION_SLUG_PREFIX}${discussionWorkshopId.replace(/-/g, '')}`;
}

function createInitialDiscussionSessionTokenHash(): string {
    return hashWorkshopSessionToken(createWorkshopSessionToken());
}

function createCurrentTimestamp(): string {
    return new Date().toISOString();
}

function getVoteCountChanges(
    previousVote: CommunityProjectVote | null,
    nextVote: CommunityProjectVote | null,
): { readonly upvoteCountChange: number; readonly downvoteCountChange: number } {
    const upvoteCountChange = Number(nextVote === 'up') - Number(previousVote === 'up');
    const downvoteCountChange = Number(nextVote === 'down') - Number(previousVote === 'down');

    return { upvoteCountChange, downvoteCountChange };
}

async function loadCommunityParticipant(
    transaction: DatabaseTransaction,
    communityParticipantId: string,
    lockKind: CommunityParticipantLockKind = 'key-share',
): Promise<CommunityParticipantRow | null> {
    const { rows } = await transaction.query<CommunityParticipantRow>(
        `
            SELECT
                community_participant.id,
                community_participant.fullname,
                community_participant.email,
                community_participant.is_interaction_banned,
                community_participant.is_trusted,
                community_participant.is_moderator
            FROM ${WORKSHOP_PARTICIPANT_TABLE_REFERENCE} AS community_participant
            INNER JOIN ${WORKSHOP_TABLE_REFERENCE} AS community_room
                ON community_room.id = community_participant.workshop_id
            WHERE community_participant.id = $1
              AND community_room.room_kind = $2
            LIMIT 1
            ${COMMUNITY_PARTICIPANT_LOCK_SQL_BY_KIND[lockKind]};
        `,
        [communityParticipantId, COMMUNITY_ROOM_KIND],
    );

    return rows[0] ?? null;
}

async function requireCommunityParticipant(
    transaction: DatabaseTransaction,
    communityParticipantId: string,
): Promise<CommunityParticipantRow> {
    const communityParticipant = await loadCommunityParticipant(transaction, communityParticipantId);
    if (communityParticipant === null) {
        throw new CommunityProjectMutationError('member-invalid', 'COMMUNITY_PROJECT_MEMBER_INVALID');
    }

    return communityParticipant;
}

async function loadProjectDiscussionForUpdate(
    transaction: DatabaseTransaction,
    projectId: string,
): Promise<CommunityProjectDiscussionRow | null> {
    const { rows } = await transaction.query<CommunityProjectDiscussionRow>(
        `
            SELECT
                community_project.discussion_workshop_id,
                discussion_workshop.slug AS discussion_workshop_slug,
                community_project.author_community_participant_id
            FROM ${COMMUNITY_PROJECT_TABLE_REFERENCE} AS community_project
            INNER JOIN ${WORKSHOP_TABLE_REFERENCE} AS discussion_workshop
                ON discussion_workshop.id = community_project.discussion_workshop_id
            WHERE community_project.id = $1
              AND discussion_workshop.room_kind = $2
              AND discussion_workshop.is_published
              AND community_project.status = $3
            FOR UPDATE OF community_project;
        `,
        [projectId, PROJECT_ROOM_KIND, 'approved'],
    );

    return rows[0] ?? null;
}

async function requireProjectDiscussionForUpdate(
    transaction: DatabaseTransaction,
    projectId: string,
): Promise<CommunityProjectDiscussionRow> {
    const projectDiscussion = await loadProjectDiscussionForUpdate(transaction, projectId);
    if (projectDiscussion === null) {
        throw new CommunityProjectMutationError('not-found', 'COMMUNITY_PROJECT_NOT_FOUND');
    }

    return projectDiscussion;
}

async function loadProjectVoteCountsForUpdate(
    transaction: DatabaseTransaction,
    projectId: string,
): Promise<CommunityProjectVoteCountsRow | null> {
    const { rows } = await transaction.query<CommunityProjectVoteCountsRow>(
        `
            SELECT status, upvote_count, downvote_count
            FROM ${COMMUNITY_PROJECT_TABLE_REFERENCE}
            WHERE id = $1
            FOR UPDATE;
        `,
        [projectId],
    );

    return rows[0] ?? null;
}

async function requireProjectVoteCountsForUpdate(
    transaction: DatabaseTransaction,
    projectId: string,
): Promise<CommunityProjectVoteCountsRow> {
    const projectVoteCounts = await loadProjectVoteCountsForUpdate(transaction, projectId);
    if (projectVoteCounts === null || projectVoteCounts.status !== 'approved') {
        throw new CommunityProjectMutationError('not-found', 'COMMUNITY_PROJECT_NOT_FOUND');
    }

    return projectVoteCounts;
}

async function loadCommunityProjectVote(
    transaction: DatabaseTransaction,
    projectId: string,
    communityParticipantId: string,
): Promise<CommunityProjectVote | null> {
    const { rows } = await transaction.query<CommunityProjectVoteRow>(
        `
            SELECT vote
            FROM ${COMMUNITY_PROJECT_VOTE_TABLE_REFERENCE}
            WHERE project_id = $1
              AND community_participant_id = $2
            LIMIT 1;
        `,
        [projectId, communityParticipantId],
    );

    return getCommunityProjectVoteFromDatabaseValue(rows[0]?.vote ?? null);
}

async function loadCommunityProjectVotesForCommunityParticipantDeletion(
    transaction: DatabaseTransaction,
    communityParticipantId: string,
): Promise<readonly CommunityProjectVoteForCommunityParticipantDeletionRow[]> {
    const { rows } = await transaction.query<CommunityProjectVoteForCommunityParticipantDeletionRow>(
        `
            SELECT
                community_project_vote.project_id,
                community_project_vote.vote,
                community_project.upvote_count,
                community_project.downvote_count
            FROM ${COMMUNITY_PROJECT_VOTE_TABLE_REFERENCE} AS community_project_vote
            INNER JOIN ${COMMUNITY_PROJECT_TABLE_REFERENCE} AS community_project
                ON community_project.id = community_project_vote.project_id
            WHERE community_project_vote.community_participant_id = $1
            ORDER BY community_project_vote.project_id
            FOR UPDATE OF community_project;
        `,
        [communityParticipantId],
    );

    return rows;
}

async function loadDiscussionParticipantMapping(
    transaction: DatabaseTransaction,
    projectId: string,
    communityParticipantId: string,
): Promise<CommunityProjectDiscussionParticipantMappingRow | null> {
    const { rows } = await transaction.query<CommunityProjectDiscussionParticipantMappingRow>(
        `
            SELECT discussion_participant_id
            FROM ${COMMUNITY_PROJECT_DISCUSSION_PARTICIPANT_TABLE_REFERENCE}
            WHERE project_id = $1
              AND community_participant_id = $2
            LIMIT 1;
        `,
        [projectId, communityParticipantId],
    );

    return rows[0] ?? null;
}

async function loadDiscussionParticipant(
    transaction: DatabaseTransaction,
    discussionParticipantId: string,
    discussionWorkshopId: string,
): Promise<DiscussionParticipantRow | null> {
    const { rows } = await transaction.query<DiscussionParticipantRow>(
        `
            SELECT id, is_moderator
            FROM ${WORKSHOP_PARTICIPANT_TABLE_REFERENCE}
            WHERE id = $1
              AND workshop_id = $2
            LIMIT 1
            FOR UPDATE;
        `,
        [discussionParticipantId, discussionWorkshopId],
    );

    return rows[0] ?? null;
}

async function insertDiscussionParticipant(
    transaction: DatabaseTransaction,
    values: {
        readonly discussionParticipantId: string;
        readonly discussionWorkshopId: string;
        readonly fullname: string;
        readonly email: string;
        readonly isModerator: boolean;
        readonly timestamp: string;
    },
): Promise<void> {
    await transaction.query(
        `
            INSERT INTO ${WORKSHOP_PARTICIPANT_TABLE_REFERENCE} (
                id,
                workshop_id,
                fullname,
                email,
                session_token_hash,
                is_moderator,
                connected_at,
                last_seen_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $7);
        `,
        [
            values.discussionParticipantId,
            values.discussionWorkshopId,
            values.fullname,
            values.email,
            createInitialDiscussionSessionTokenHash(),
            values.isModerator,
            values.timestamp,
        ],
    );
}

async function insertDiscussionParticipantMapping(
    transaction: DatabaseTransaction,
    projectId: string,
    communityParticipantId: string,
    discussionParticipantId: string,
    timestamp: string,
): Promise<void> {
    await transaction.query(
        `
            INSERT INTO ${COMMUNITY_PROJECT_DISCUSSION_PARTICIPANT_TABLE_REFERENCE} (
                project_id,
                community_participant_id,
                discussion_participant_id,
                created_at
            )
            VALUES ($1, $2, $3, $4);
        `,
        [projectId, communityParticipantId, discussionParticipantId, timestamp],
    );
}

async function saveCommunityProjectVoteCounts(
    transaction: DatabaseTransaction,
    values: {
        readonly projectId: string;
        readonly upvoteCount: number;
        readonly downvoteCount: number;
        readonly timestamp: string;
    },
): Promise<void> {
    await transaction.query(
        `
            UPDATE ${COMMUNITY_PROJECT_TABLE_REFERENCE}
            SET upvote_count = $2,
                downvote_count = $3,
                updated_at = $4
            WHERE id = $1;
        `,
        [values.projectId, values.upvoteCount, values.downvoteCount, values.timestamp],
    );
}

/**
 * Creates a card, its private project room, and the author's moderator identity as one backend transaction.
 */
export async function createCommunityProjectInTransaction(
    transaction: DatabaseTransaction,
    values: CommunityProjectCreationValues,
): Promise<string> {
    const communityParticipant = await requireCommunityParticipant(transaction, values.communityParticipantId);
    const projectId = randomUUID();
    const discussionWorkshopId = randomUUID();
    const discussionWorkshopSlug = createCommunityProjectDiscussionSlug(discussionWorkshopId);
    const discussionParticipantId = randomUUID();
    const status = getWorkshopParticipantSubmissionStatus({
        isInteractionBanned: communityParticipant.is_interaction_banned,
        isTrusted: communityParticipant.is_trusted,
        isModerator: communityParticipant.is_moderator,
    });
    const timestamp = createCurrentTimestamp();

    await transaction.query(
        `
            INSERT INTO ${WORKSHOP_TABLE_REFERENCE} (
                id,
                slug,
                room_kind,
                title,
                description,
                starts_at,
                ends_at,
                is_published,
                created_at,
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, NULL, true, $6, $6);
        `,
        [discussionWorkshopId, discussionWorkshopSlug, PROJECT_ROOM_KIND, values.title, values.description, timestamp],
    );

    await transaction.query(
        `
            INSERT INTO ${COMMUNITY_PROJECT_TABLE_REFERENCE} (
                id,
                author_community_participant_id,
                discussion_workshop_id,
                url,
                title,
                description,
                preview_image_url,
                status,
                upvote_count,
                downvote_count,
                created_at,
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 0, $9, $9);
        `,
        [
            projectId,
            values.communityParticipantId,
            discussionWorkshopId,
            values.url,
            values.title,
            values.description,
            values.previewImageUrl,
            status,
            timestamp,
        ],
    );

    await insertDiscussionParticipant(transaction, {
        discussionParticipantId,
        discussionWorkshopId,
        fullname: communityParticipant.fullname,
        email: communityParticipant.email,
        isModerator: true,
        timestamp,
    });
    await insertDiscussionParticipantMapping(
        transaction,
        projectId,
        values.communityParticipantId,
        discussionParticipantId,
        timestamp,
    );

    return projectId;
}

export async function createCommunityProject(
    values: CommunityProjectCreationValues,
): Promise<{ readonly projectId: string | null; readonly errorMessage: string | null }> {
    try {
        const projectId = await runDatabaseTransaction(COMMUNITY_PROJECT_OPERATION_NAME, (transaction) =>
            createCommunityProjectInTransaction(transaction, values),
        );

        return { projectId, errorMessage: null };
    } catch (error) {
        return { projectId: null, errorMessage: getMutationErrorMessage(error) };
    }
}

/**
 * Reuses the member's community identity in one project room. Locking the project row serializes mapping creation, so
 * two browser tabs cannot create two discussion participants for the same member.
 */
export async function connectCommunityProjectDiscussionInTransaction(
    transaction: DatabaseTransaction,
    projectId: string,
    communityParticipantId: string,
): Promise<CommunityProjectDiscussionConnection> {
    const communityParticipant = await requireCommunityParticipant(transaction, communityParticipantId);
    const projectDiscussion = await requireProjectDiscussionForUpdate(transaction, projectId);
    const isProjectAuthor = projectDiscussion.author_community_participant_id === communityParticipantId;
    const existingMapping = await loadDiscussionParticipantMapping(transaction, projectId, communityParticipantId);

    if (existingMapping !== null) {
        const existingDiscussionParticipant = await loadDiscussionParticipant(
            transaction,
            existingMapping.discussion_participant_id,
            projectDiscussion.discussion_workshop_id,
        );
        if (existingDiscussionParticipant === null) {
            throw new CommunityProjectMutationError(
                'discussion-participant-invalid',
                'COMMUNITY_PROJECT_DISCUSSION_PARTICIPANT_INVALID',
            );
        }

        const isModerator = existingDiscussionParticipant.is_moderator || isProjectAuthor;
        await transaction.query(
            `
                UPDATE ${WORKSHOP_PARTICIPANT_TABLE_REFERENCE}
                SET fullname = $2,
                    email = $3,
                    is_moderator = $4
                WHERE id = $1
                  AND workshop_id = $5;
            `,
            [
                existingDiscussionParticipant.id,
                communityParticipant.fullname,
                communityParticipant.email,
                isModerator,
                projectDiscussion.discussion_workshop_id,
            ],
        );

        return {
            discussionWorkshopId: projectDiscussion.discussion_workshop_id,
            discussionWorkshopSlug: projectDiscussion.discussion_workshop_slug,
            discussionParticipantId: existingDiscussionParticipant.id,
        };
    }

    const discussionParticipantId = randomUUID();
    const timestamp = createCurrentTimestamp();
    await insertDiscussionParticipant(transaction, {
        discussionParticipantId,
        discussionWorkshopId: projectDiscussion.discussion_workshop_id,
        fullname: communityParticipant.fullname,
        email: communityParticipant.email,
        isModerator: isProjectAuthor,
        timestamp,
    });
    await insertDiscussionParticipantMapping(
        transaction,
        projectId,
        communityParticipantId,
        discussionParticipantId,
        timestamp,
    );

    return {
        discussionWorkshopId: projectDiscussion.discussion_workshop_id,
        discussionWorkshopSlug: projectDiscussion.discussion_workshop_slug,
        discussionParticipantId,
    };
}

export async function connectCommunityProjectDiscussion(
    projectId: string,
    communityParticipantId: string,
): Promise<{
    readonly connection: CommunityProjectDiscussionConnection | null;
    readonly errorMessage: string | null;
    readonly isProjectMissing: boolean;
}> {
    try {
        const connection = await runDatabaseTransaction(COMMUNITY_PROJECT_OPERATION_NAME, (transaction) =>
            connectCommunityProjectDiscussionInTransaction(transaction, projectId, communityParticipantId),
        );

        return { connection, errorMessage: null, isProjectMissing: false };
    } catch (error) {
        return { connection: null, ...createCommunityProjectMutationFailure(error) };
    }
}

/**
 * Removes a community member's votes before deleting their identity. The member row is locked first, which makes
 * ongoing and future vote transactions finish or stop before their cached totals can be changed.
 */
export async function deleteCommunityParticipantWithProjectVotesInTransaction(
    transaction: DatabaseTransaction,
    communityParticipantId: string,
): Promise<string> {
    const communityParticipant = await loadCommunityParticipant(transaction, communityParticipantId, 'update');
    if (communityParticipant === null) {
        throw new CommunityProjectMutationError('community-participant-missing', 'COMMUNITY_PROJECT_MEMBER_NOT_FOUND');
    }

    const projectVotes = await loadCommunityProjectVotesForCommunityParticipantDeletion(
        transaction,
        communityParticipantId,
    );
    await transaction.query(
        `
            DELETE FROM ${COMMUNITY_PROJECT_VOTE_TABLE_REFERENCE}
            WHERE community_participant_id = $1;
        `,
        [communityParticipantId],
    );

    const timestamp = createCurrentTimestamp();
    for (const projectVote of projectVotes) {
        const previousVote = getCommunityProjectVoteFromDatabaseValue(projectVote.vote);
        const { upvoteCountChange, downvoteCountChange } = getVoteCountChanges(previousVote, null);
        await saveCommunityProjectVoteCounts(transaction, {
            projectId: projectVote.project_id,
            upvoteCount: Math.max(0, projectVote.upvote_count + upvoteCountChange),
            downvoteCount: Math.max(0, projectVote.downvote_count + downvoteCountChange),
            timestamp,
        });
    }

    const { rows } = await transaction.query<{ readonly id: string }>(
        `
            DELETE FROM ${WORKSHOP_PARTICIPANT_TABLE_REFERENCE}
            WHERE id = $1
            RETURNING id;
        `,
        [communityParticipantId],
    );
    const deletedParticipant = rows[0];
    if (deletedParticipant === undefined) {
        throw new CommunityProjectMutationError('community-participant-missing', 'COMMUNITY_PROJECT_MEMBER_NOT_FOUND');
    }

    return deletedParticipant.id;
}

export async function deleteCommunityParticipantWithProjectVotes(communityParticipantId: string): Promise<{
    readonly participantId: string | null;
    readonly errorMessage: string | null;
    readonly isParticipantMissing: boolean;
}> {
    try {
        const participantId = await runDatabaseTransaction(COMMUNITY_PROJECT_OPERATION_NAME, (transaction) =>
            deleteCommunityParticipantWithProjectVotesInTransaction(transaction, communityParticipantId),
        );

        return { participantId, errorMessage: null, isParticipantMissing: false };
    } catch (error) {
        const isParticipantMissing =
            error instanceof CommunityProjectMutationError && error.kind === 'community-participant-missing';
        return { participantId: null, errorMessage: getMutationErrorMessage(error), isParticipantMissing };
    }
}

/**
 * Applies one Reddit-style vote transition and its cached card totals under the same row lock. The counts remain fast
 * to sort by without needing a trigger to interpret inserts, updates, and deletes.
 */
export async function setCommunityProjectVoteInTransaction(
    transaction: DatabaseTransaction,
    projectId: string,
    communityParticipantId: string,
    vote: CommunityProjectVote,
): Promise<CommunityProjectVoteSaveResult> {
    await requireCommunityParticipant(transaction, communityParticipantId);
    const currentVoteCounts = await requireProjectVoteCountsForUpdate(transaction, projectId);
    const previousVote = await loadCommunityProjectVote(transaction, projectId, communityParticipantId);
    const timestamp = createCurrentTimestamp();
    const selectedVote = previousVote === vote ? null : vote;

    if (previousVote === null) {
        await transaction.query(
            `
                INSERT INTO ${COMMUNITY_PROJECT_VOTE_TABLE_REFERENCE} (
                    project_id,
                    community_participant_id,
                    vote,
                    created_at,
                    updated_at
                )
                VALUES ($1, $2, $3, $4, $4);
            `,
            [projectId, communityParticipantId, getCommunityProjectDatabaseVote(vote), timestamp],
        );
    } else if (selectedVote === null) {
        await transaction.query(
            `
                DELETE FROM ${COMMUNITY_PROJECT_VOTE_TABLE_REFERENCE}
                WHERE project_id = $1
                  AND community_participant_id = $2;
            `,
            [projectId, communityParticipantId],
        );
    } else {
        await transaction.query(
            `
                UPDATE ${COMMUNITY_PROJECT_VOTE_TABLE_REFERENCE}
                SET vote = $3,
                    updated_at = $4
                WHERE project_id = $1
                  AND community_participant_id = $2;
            `,
            [projectId, communityParticipantId, getCommunityProjectDatabaseVote(selectedVote), timestamp],
        );
    }

    const { upvoteCountChange, downvoteCountChange } = getVoteCountChanges(previousVote, selectedVote);
    const upvoteCount = Math.max(0, currentVoteCounts.upvote_count + upvoteCountChange);
    const downvoteCount = Math.max(0, currentVoteCounts.downvote_count + downvoteCountChange);
    await saveCommunityProjectVoteCounts(transaction, { projectId, upvoteCount, downvoteCount, timestamp });

    return { vote: selectedVote, upvoteCount, downvoteCount };
}

export async function setCommunityProjectVote(
    projectId: string,
    communityParticipantId: string,
    vote: CommunityProjectVote,
): Promise<{
    readonly result: CommunityProjectVoteSaveResult | null;
    readonly errorMessage: string | null;
    readonly isProjectMissing: boolean;
}> {
    try {
        const result = await runDatabaseTransaction(COMMUNITY_PROJECT_OPERATION_NAME, (transaction) =>
            setCommunityProjectVoteInTransaction(transaction, projectId, communityParticipantId, vote),
        );

        return { result, errorMessage: null, isProjectMissing: false };
    } catch (error) {
        return { result: null, ...createCommunityProjectMutationFailure(error) };
    }
}

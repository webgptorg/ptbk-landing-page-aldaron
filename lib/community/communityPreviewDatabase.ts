import { COMMUNITY_PROJECT_TABLE_NAME } from '@/lib/community-projects/communityProjectConstants';
import type { EventType } from '@/lib/events/eventTypes';
import {
    WORKSHOP_COMMENT_TABLE_NAME,
    WORKSHOP_PARTICIPANT_TABLE_NAME,
    WORKSHOP_REACTION_TABLE_NAME,
    WORKSHOP_IS_DELETED_COLUMN_NAME,
    WORKSHOP_TABLE_NAME,
} from '@/lib/workshops/workshopConstants';
import { loadWorkshopQueryWithActiveStatus } from '@/lib/workshops/workshopActiveStatusQuery';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * As much of an approved message as a public preview of the community shows
 */
export type CommunityPreviewDiscussionRow = {
    readonly id: string;
    readonly participant_id: string | null;
    readonly author_name: string;
    readonly body: string;
    readonly created_at: string;
};

type CommunityPreviewReactionRow = {
    readonly emoji: string;
};

type CommunityPreviewModeratorRow = {
    readonly id: string;
};

type CountedQueryResult = {
    readonly count: number | null;
    readonly error: { readonly message: string } | null;
};

/**
 * Reads how many rows a query matches without transferring a single one of them
 *
 * Note: A total which cannot be read must never take the landing page down with it, so a failure is reported as
 *       nothing counted and the page simply says one number less.
 */
async function countCommunityRows(query: PromiseLike<CountedQueryResult>, description: string): Promise<number> {
    const { count, error } = await query;
    if (error !== null) {
        console.error(`Failed to count ${description} for the community preview:`, error.message);
        return 0;
    }

    return count ?? 0;
}

export function countCommunityMembers(supabase: SupabaseClient, communityWorkshopId: string): Promise<number> {
    return countCommunityRows(
        supabase
            .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
            .select('id', { count: 'exact', head: true })
            .eq('workshop_id', communityWorkshopId),
        'the members of the community',
    );
}

/**
 * Counts every message a member wrote which the moderation approved, in the community and in the rooms of its events
 *
 * Note: A message the administration created without a participant is deliberately left out, so this total says what
 *       the people of the community really wrote rather than what was written for them.
 */
export function countApprovedMemberMessages(supabase: SupabaseClient): Promise<number> {
    return countCommunityRows(
        supabase
            .from(WORKSHOP_COMMENT_TABLE_NAME)
            .select('id', { count: 'exact', head: true })
            .eq('status', 'approved')
            .eq('is_artificial', false),
        'the approved messages of the members',
    );
}

/**
 * Counts every reaction a member really sent, so a total seeded by the administration never inflates it
 */
export function countMemberReactions(supabase: SupabaseClient): Promise<number> {
    return countCommunityRows(
        supabase
            .from(WORKSHOP_REACTION_TABLE_NAME)
            .select('id', { count: 'exact', head: true })
            .eq('is_artificial', false),
        'the reactions of the members',
    );
}

export function countCommunityProjects(supabase: SupabaseClient): Promise<number> {
    return countCommunityRows(
        supabase
            .from(COMMUNITY_PROJECT_TABLE_NAME)
            .select('id', { count: 'exact', head: true })
            .eq('status', 'approved'),
        'the projects of the community',
    );
}

/**
 * Counts the published terms of one kind of event which have already begun, which is how many of them were broadcast
 *
 * Note: A term which is running right now is counted among them, because it is being broadcast while it runs. A draft
 *       is never counted, exactly as no public page ever lists one.
 */
export function countHeldWebinars(
    supabase: SupabaseClient,
    eventType: EventType,
    currentTime = new Date().toISOString(),
): Promise<number> {
    return countCommunityRows(
        loadWorkshopQueryWithActiveStatus(supabase, (isActiveStatusFilterEnabled) => {
            let workshopQuery = supabase
                .from(WORKSHOP_TABLE_NAME)
                .select('id', { count: 'exact', head: true })
                .eq('room_kind', 'workshop')
                .eq('event_type', eventType)
                .eq('is_published', true)
                .lte('starts_at', currentTime);

            if (isActiveStatusFilterEnabled) {
                workshopQuery = workshopQuery.eq(WORKSHOP_IS_DELETED_COLUMN_NAME, false);
            }

            return workshopQuery;
        }),
        'the webinars which have already been held',
    );
}

/**
 * Reads the newest approved messages of the community chat
 *
 * Note: Only what the moderation of the community already approved is read, and an artificial message of the
 *       administration is left out, so a public preview never shows a message which the community itself has not seen
 *       or which nobody wrote.
 */
export async function loadRecentCommunityDiscussionRows(
    supabase: SupabaseClient,
    communityWorkshopId: string,
    limit: number,
): Promise<readonly CommunityPreviewDiscussionRow[]> {
    const { data, error } = await supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .select('id, participant_id, author_name, body, created_at')
        .eq('workshop_id', communityWorkshopId)
        .eq('status', 'approved')
        .eq('is_artificial', false)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Failed to load the recent discussion of the community preview:', error.message);
        return [];
    }

    return (data ?? []) as readonly CommunityPreviewDiscussionRow[];
}

/**
 * Tells which of the given members moderate the community, which is the one thing a message says about its author
 *
 * Note: Nothing else of a member is read here. Whether somebody is trusted or silenced stays invisible in the room
 *       itself, so it must never leave it towards a public page either.
 */
export async function loadCommunityModeratorParticipantIds(
    supabase: SupabaseClient,
    communityWorkshopId: string,
    participantIds: readonly string[],
): Promise<ReadonlySet<string>> {
    if (participantIds.length === 0) {
        return new Set();
    }

    const { data, error } = await supabase
        .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
        .select('id')
        .eq('workshop_id', communityWorkshopId)
        .eq('is_moderator', true)
        .in('id', participantIds);

    if (error) {
        console.error('Failed to load the moderators of the community preview:', error.message);
        return new Set();
    }

    return new Set(((data ?? []) as readonly CommunityPreviewModeratorRow[]).map((moderator) => moderator.id));
}

/**
 * Reads the reactions the rooms celebrated most recently, ordered from the most sent one
 *
 * Note: A sample of the newest reactions is counted rather than the whole history, so the preview stays cheap and
 *       still flies what the community reaches for now.
 */
export async function loadRecentlyPopularReactions(
    supabase: SupabaseClient,
    sampleSize: number,
    limit: number,
): Promise<readonly string[]> {
    const { data, error } = await supabase
        .from(WORKSHOP_REACTION_TABLE_NAME)
        .select('emoji')
        .eq('is_artificial', false)
        .order('created_at', { ascending: false })
        .limit(sampleSize);

    if (error) {
        console.error('Failed to load the popular reactions of the community preview:', error.message);
        return [];
    }

    const countByEmoji = new Map<string, number>();
    for (const reaction of (data ?? []) as readonly CommunityPreviewReactionRow[]) {
        countByEmoji.set(reaction.emoji, (countByEmoji.get(reaction.emoji) ?? 0) + 1);
    }

    return Array.from(countByEmoji.entries())
        .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)
        .slice(0, limit)
        .map(([emoji]) => emoji);
}

import { createInMemorySupabaseClient } from '@/lib/e2e/inMemorySupabase';
import {
    copyWorkshopPollAttachments,
    loadWorkshopAdminPolls,
    loadWorkshopAttachedAdminPolls,
    loadWorkshopPolls,
    saveWorkshopPollVote,
    type WorkshopRow,
} from '@/lib/workshops/workshopDatabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

const WORKSHOP_ROW: WorkshopRow = {
    id: 'workshop-id',
    room_kind: 'workshop',
    slug: 'online-workshop-git-ai-2026-09-07',
    title: 'Git a AI',
    description: 'Online workshop o Gitu s AI.',
    starts_at: '2026-09-07T13:00:00.000Z',
    ends_at: '2026-09-07T14:00:00.000Z',
    youtube_video_id: null,
    preview_youtube_video_id: null,
    is_published: true,
    is_deleted: false,
    allowed_reactions: [],
    event_type: 'online-workshop',
    location_kind: 'online',
    location_label: '',
    price_czk: 0,
    maximum_participant_count: null,
    disabled_panels: [],
    pinned_comment_id: null,
    stage_comment_id: null,
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z',
};

const COMMUNITY_ROW: WorkshopRow = {
    ...WORKSHOP_ROW,
    id: 'community-id',
    room_kind: 'community',
    slug: 'komunita',
    title: 'Komunita Promptbooku',
};

const POLL_ID = 'poll-id';
const SELECTED_OPTION_ID = 'selected-option-id';
const OTHER_OPTION_ID = 'other-option-id';
const MEMBER_EMAIL = 'jana@example.com';

type InMemoryQueryClient = {
    readonly from: (tableName: string) => {
        readonly insert: (values: Record<string, unknown>) => {
            readonly select: () => { readonly single: () => Promise<unknown> };
        };
    };
};

async function insertInMemoryRow(
    supabase: SupabaseClient,
    tableName: string,
    values: Record<string, unknown>,
): Promise<void> {
    const inMemorySupabase = supabase as unknown as InMemoryQueryClient;
    await inMemorySupabase.from(tableName).insert(values).select().single();
}

async function createAttachedPollSupabase(workshopRow: WorkshopRow = WORKSHOP_ROW): Promise<SupabaseClient> {
    const supabase = createInMemorySupabaseClient();
    await insertInMemoryRow(supabase, 'workshops', COMMUNITY_ROW);
    await insertInMemoryRow(supabase, 'workshops', workshopRow);
    await insertInMemoryRow(supabase, 'workshop_poll_workshops', {
        poll_id: POLL_ID,
        workshop_id: workshopRow.id,
    });
    await insertInMemoryRow(supabase, 'workshop_polls', {
        id: POLL_ID,
        workshop_id: COMMUNITY_ROW.id,
        question: 'Které téma chcete probrat?',
        is_closed: false,
        is_visible: true,
        created_at: '2026-09-01T10:00:00.000Z',
        updated_at: '2026-09-01T10:00:00.000Z',
    });
    await insertInMemoryRow(supabase, 'workshop_poll_options', {
        id: SELECTED_OPTION_ID,
        poll_id: POLL_ID,
        label: 'Git workflow',
        sort_order: 0,
        artificial_vote_count: 0,
    });
    await insertInMemoryRow(supabase, 'workshop_poll_options', {
        id: OTHER_OPTION_ID,
        poll_id: POLL_ID,
        label: 'Automatizace',
        sort_order: 1,
        artificial_vote_count: 0,
    });
    await insertInMemoryRow(supabase, 'workshop_poll_votes', {
        id: 'vote-id',
        poll_id: POLL_ID,
        option_id: SELECTED_OPTION_ID,
        voter_email: MEMBER_EMAIL,
    });

    const mutableSupabase = supabase as unknown as {
        rpc: (functionName: string) => Promise<{ readonly data: readonly unknown[]; readonly error: null }>;
    };
    mutableSupabase.rpc = async (functionName) => {
        if (functionName === 'get_workshop_poll_option_vote_counts') {
            return { data: [{ option_id: SELECTED_OPTION_ID, vote_count: 1 }], error: null };
        }

        return { data: [], error: null };
    };

    return supabase;
}

describe('shared community poll votes', () => {
    it('asks the database to copy only existing poll attachments for a duplicated workshop', async () => {
        const rpc = vi.fn().mockResolvedValue({ error: null });
        const targetWorkshopId = 'duplicate-workshop-id';

        const errorMessage = await copyWorkshopPollAttachments(
            { rpc } as unknown as SupabaseClient,
            WORKSHOP_ROW.id,
            targetWorkshopId,
        );

        expect(errorMessage).toBeNull();
        expect(rpc).toHaveBeenCalledWith('copy_workshop_poll_attachments', {
            source_workshop_id: WORKSHOP_ROW.id,
            target_workshop_id: targetWorkshopId,
        });
    });

    it('loads the same visible poll selection and aggregate in the community and its attached workshop', async () => {
        const supabase = await createAttachedPollSupabase();

        const [communityPollResult, workshopPollResult] = await Promise.all([
            loadWorkshopPolls(supabase, COMMUNITY_ROW, MEMBER_EMAIL.toUpperCase()),
            loadWorkshopPolls(supabase, WORKSHOP_ROW, MEMBER_EMAIL),
        ]);

        expect(communityPollResult.errorMessage).toBeNull();
        expect(workshopPollResult).toEqual(communityPollResult);
        expect(workshopPollResult.polls).toEqual([
            expect.objectContaining({
                id: POLL_ID,
                question: 'Které téma chcete probrat?',
                attachedWorkshops: [expect.objectContaining({ id: WORKSHOP_ROW.id, slug: WORKSHOP_ROW.slug })],
                options: [
                    expect.objectContaining({
                        id: SELECTED_OPTION_ID,
                        voteCount: 1,
                        isVotedByParticipant: true,
                    }),
                    expect.objectContaining({
                        id: OTHER_OPTION_ID,
                        voteCount: 0,
                        isVotedByParticipant: false,
                    }),
                ],
            }),
        ]);
    });

    it('passes the verified e-mail and current participant to the one shared vote procedure', async () => {
        const rpc = vi.fn().mockResolvedValue({ error: null });
        const supabase = { rpc } as unknown as SupabaseClient;

        const result = await saveWorkshopPollVote(
            supabase,
            WORKSHOP_ROW,
            { id: 'workshop-participant-id', email: MEMBER_EMAIL },
            POLL_ID,
            SELECTED_OPTION_ID,
        );

        expect(result).toEqual({ isSuccessful: true });
        expect(rpc).toHaveBeenCalledWith('set_community_workshop_poll_vote', {
            target_room_id: WORKSHOP_ROW.id,
            target_poll_id: POLL_ID,
            target_option_id: SELECTED_OPTION_ID,
            target_participant_id: 'workshop-participant-id',
            target_voter_email: MEMBER_EMAIL,
        });
    });

    it('shows the same shared aggregate to the community and attached-workshop administrations', async () => {
        const supabase = await createAttachedPollSupabase();

        const [communityAdminPollResult, workshopAdminPollResult] = await Promise.all([
            loadWorkshopAdminPolls(supabase, COMMUNITY_ROW),
            loadWorkshopAttachedAdminPolls(supabase, WORKSHOP_ROW),
        ]);

        expect(communityAdminPollResult.errorMessage).toBeNull();
        expect(workshopAdminPollResult).toEqual(communityAdminPollResult);
        expect(workshopAdminPollResult.polls[0]?.options[0]).toEqual(
            expect.objectContaining({
                id: SELECTED_OPTION_ID,
                voteCount: 1,
                artificialVoteCount: 0,
            }),
        );
    });

    it('keeps a shared poll when one attached workshop is soft-deleted, without showing the removed occurrence', async () => {
        const supabase = await createAttachedPollSupabase({ ...WORKSHOP_ROW, is_deleted: true });

        const result = await loadWorkshopAdminPolls(supabase, COMMUNITY_ROW);

        expect(result.errorMessage).toBeNull();
        expect(result.polls).toEqual([
            expect.objectContaining({
                id: POLL_ID,
                attachedWorkshops: [],
            }),
        ]);
    });
});

import { createInMemorySupabaseClient } from '@/lib/e2e/inMemorySupabase';
import { WORKSHOP_COMMENT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import type { WorkshopRow } from '@/lib/workshops/workshopDatabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadWorkshopAgentContext } from './workshopAgentContext';
import {
    WORKSHOP_AGENT_AUDIO_SESSION_TABLE_NAME,
    WORKSHOP_AGENT_TRANSCRIPT_TABLE_NAME,
    type WorkshopAgentJob,
} from './workshopAgentTypes';

const CURRENT_TIME = '2026-09-17T12:00:00.000Z';
const ROOM: WorkshopRow = {
    id: 'room', room_kind: 'workshop', slug: 'workshop', title: 'Writing tests', description: 'Practical examples',
    starts_at: '2026-09-17T11:00:00.000Z', ends_at: null, is_published: true, is_deleted: false,
    disabled_panels: [], allowed_reactions: [], youtube_video_id: null, recording_start_offset_seconds: 0,
    preview_youtube_video_id: null, pinned_comment_id: null, stage_comment_id: null,
    event_type: null, location_kind: null, location_label: '', price_czk: null, maximum_participant_count: null,
    created_at: CURRENT_TIME, updated_at: CURRENT_TIME,
};
const COMMENT_JOB: WorkshopAgentJob = {
    id: 'job', workshop_id: ROOM.id, agent_id: 'agent', agent_name: 'Jana', book_source: 'Private source Book',
    source_body: 'How should I test this?', trigger_comment_id: 'root', transcript_id: null, lease_token: 'private-lease',
};
const LIVE_JOB: WorkshopAgentJob = {
    ...COMMENT_JOB, trigger_comment_id: null, transcript_id: 'speech', source_body: 'We are testing a database.',
};

describe('room context supplied to Book agents', () => {
    let supabase: SupabaseClient;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(CURRENT_TIME));
        supabase = createInMemorySupabaseClient();
    });
    afterEach(() => vi.useRealTimers());

    async function addSession(expiresAt = '2026-09-17T12:01:00.000Z', sessionId = 'active-session') {
        await supabase.from(WORKSHOP_AGENT_AUDIO_SESSION_TABLE_NAME).insert({
            workshop_id: ROOM.id, session_id: sessionId, expires_at: expiresAt,
        });
    }

    async function addTranscript(id: string, sessionId = 'active-session', createdAt = CURRENT_TIME, workshopId = ROOM.id) {
        await supabase.from(WORKSHOP_AGENT_TRANSCRIPT_TABLE_NAME).insert({
            id, workshop_id: workshopId, session_id: sessionId, body: `Speech ${id}`, created_at: createdAt,
        });
    }

    it('includes only approved discussion in this room, with approved roots and no private identity fields', async () => {
        await supabase.from(WORKSHOP_COMMENT_TABLE_NAME).insert([
            { id: 'root', status: 'approved', parent_comment_id: null },
            { id: 'reply', status: 'approved', parent_comment_id: 'root' },
            { id: 'pending', status: 'pending', parent_comment_id: null },
            { id: 'rejected', status: 'rejected', parent_comment_id: null },
            { id: 'hidden-reply', status: 'approved', parent_comment_id: 'rejected' },
            { id: 'elsewhere', status: 'approved', parent_comment_id: null, workshop_id: 'another-room' },
        ].map((comment, index) => ({
            workshop_id: ROOM.id, body: `Message ${comment.id}`, author_name: 'Member', email: 'private@example.com',
            created_at: new Date(Date.parse(CURRENT_TIME) + index * 1000).toISOString(), ...comment,
        })));

        const context = (await loadWorkshopAgentContext(supabase, ROOM, COMMENT_JOB))!;
        expect(JSON.parse(context)).toMatchObject({ recentComments: [
            { id: 'root', author: 'Member', text: 'Message root', threadId: 'root' },
            { id: 'reply', author: 'Member', text: 'Message reply', threadId: 'root' },
        ] });
        expect(context).not.toContain('private@example.com');
        expect(context).not.toContain(COMMENT_JOB.book_source);
        expect(context).not.toContain(COMMENT_JOB.lease_token);
    });

    it('uses recent speech only from this room and its current capture session, in spoken order', async () => {
        await addSession();
        await addTranscript('speech');
        await addTranscript('earlier-speech', 'active-session', '2026-09-17T11:59:00.000Z');
        await addTranscript('stopped-speech', 'previous-session');
        await addTranscript('old-speech', 'active-session', '2026-09-17T11:54:00.000Z');
        await addTranscript('elsewhere-speech', 'active-session', CURRENT_TIME, 'another-room');

        const context = (await loadWorkshopAgentContext(supabase, ROOM, LIVE_JOB))!;
        expect(JSON.parse(context)).toMatchObject({ liveTranscript: [
            { body: 'Speech earlier-speech', created_at: '2026-09-17T11:59:00.000Z' },
            { body: 'Speech speech', created_at: CURRENT_TIME },
        ] });
        expect(context).not.toContain('active-session');
    });

    it.each([null, '2026-09-17T11:59:59.000Z'])('omits speech and skips live questions when capture is absent or expired (%s)', async (expiresAt) => {
        if (expiresAt !== null) await addSession(expiresAt);
        await addTranscript('speech');
        const context = (await loadWorkshopAgentContext(supabase, ROOM, COMMENT_JOB))!;
        expect(JSON.parse(context)).toMatchObject({ liveTranscript: [] });
        expect(await loadWorkshopAgentContext(supabase, ROOM, LIVE_JOB)).toBeNull();
    });

    it('skips a pending question from a replaced session before calling the model', async () => {
        await addSession();
        await addTranscript('speech', 'previous-session');
        await addTranscript('new-speech');
        expect(await loadWorkshopAgentContext(supabase, ROOM, LIVE_JOB)).toBeNull();
    });

    it.each([
        { room_kind: 'community' as const },
        { starts_at: '2026-09-17T13:00:00.000Z' },
        { ends_at: '2026-09-17T11:59:00.000Z' },
    ])('never supplies live speech outside an ongoing workshop (%j)', async (roomValues) => {
        await addSession();
        await addTranscript('speech');
        const context = (await loadWorkshopAgentContext(supabase, { ...ROOM, ...roomValues }, COMMENT_JOB))!;
        expect(JSON.parse(context)).toMatchObject({ liveTranscript: [] });
    });
});

import type { SupabaseClient } from '@supabase/supabase-js';
import { WORKSHOP_COMMENT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import type { WorkshopRow } from '@/lib/workshops/workshopDatabase';
import {
    WORKSHOP_AGENT_AUDIO_SESSION_TABLE_NAME,
    WORKSHOP_AGENT_TRANSCRIPT_TABLE_NAME,
    type WorkshopAgentJob,
} from './workshopAgentTypes';
import { isWorkshopAgentLiveAudioAllowed } from './workshopAgentPolicy';

const MAXIMAL_CONTEXT_COMMENTS = 24;
const MAXIMAL_CONTEXT_TRANSCRIPTS = 12;
const TRANSCRIPT_CONTEXT_WINDOW_MILLISECONDS = 5 * 60_000;

type ContextComment = {
    readonly id: string;
    readonly author_name: string;
    readonly body: string;
    readonly parent_comment_id: string | null;
};

type ContextTranscript = {
    readonly id: string;
    readonly body: string;
    readonly created_at: string;
};

/** A resumed capture must never inherit speech from a stopped or expired session. */
async function loadActiveWorkshopAgentTranscripts(supabase: SupabaseClient, room: WorkshopRow): Promise<ContextTranscript[]> {
    if (!isWorkshopAgentLiveAudioAllowed(room)) return [];

    const currentTimeMilliseconds = Date.now();
    const sessionResult = await supabase.from(WORKSHOP_AGENT_AUDIO_SESSION_TABLE_NAME)
        .select('session_id').eq('workshop_id', room.id)
        .gt('expires_at', new Date(currentTimeMilliseconds).toISOString()).maybeSingle();
    if (sessionResult.error) throw new Error('context_unavailable');
    if (sessionResult.data === null) return [];

    const transcriptsResult = await supabase.from(WORKSHOP_AGENT_TRANSCRIPT_TABLE_NAME)
        .select('id, body, created_at').eq('workshop_id', room.id).eq('session_id', sessionResult.data.session_id)
        .gte('created_at', new Date(currentTimeMilliseconds - TRANSCRIPT_CONTEXT_WINDOW_MILLISECONDS).toISOString())
        .order('created_at', { ascending: false }).limit(MAXIMAL_CONTEXT_TRANSCRIPTS);
    if (transcriptsResult.error) throw new Error('context_unavailable');
    return (transcriptsResult.data ?? []) as ContextTranscript[];
}

/** Names and approved text only: no participant emails, sessions, pending text or paid materials. */
export async function loadWorkshopAgentContext(supabase: SupabaseClient, room: WorkshopRow, job: WorkshopAgentJob): Promise<string | null> {
    const commentsResult = await supabase.from(WORKSHOP_COMMENT_TABLE_NAME)
        .select('id, author_name, body, parent_comment_id').eq('workshop_id', room.id).eq('status', 'approved')
        .order('created_at', { ascending: false }).order('id', { ascending: false }).limit(MAXIMAL_CONTEXT_COMMENTS);
    if (commentsResult.error) throw new Error('context_unavailable');

    const comments = (commentsResult.data ?? []) as ContextComment[];
    // An approved reply whose root was rejected is not public chat context.
    const parentIds = Array.from(new Set(comments.flatMap((comment) => comment.parent_comment_id ? [comment.parent_comment_id] : [])));
    const parentsResult = parentIds.length === 0 ? { data: [], error: null } : await supabase.from(WORKSHOP_COMMENT_TABLE_NAME)
        .select('id').eq('workshop_id', room.id).eq('status', 'approved').in('id', parentIds);
    if (parentsResult.error) throw new Error('context_unavailable');
    const approvedParentIds = new Set((parentsResult.data ?? []).map((parent) => parent.id as string));
    const visibleComments = comments.filter((comment) => comment.parent_comment_id === null || approvedParentIds.has(comment.parent_comment_id));

    const transcripts = await loadActiveWorkshopAgentTranscripts(supabase, room);
    if (job.transcript_id !== null && !transcripts.some((transcript) => transcript.id === job.transcript_id)) {
        return null;
    }
    return JSON.stringify({
        room: { title: room.title, description: room.description },
        yourDisplayName: job.agent_name,
        trigger: { commentId: job.trigger_comment_id, text: job.source_body, isLiveSpeech: job.transcript_id !== null },
        recentComments: visibleComments.reverse().map((comment) => ({
            id: comment.id, author: comment.author_name, text: comment.body, threadId: comment.parent_comment_id ?? comment.id,
        })),
        liveTranscript: transcripts.reverse().map(({ body, created_at }) => ({ body, created_at })),
    });
}

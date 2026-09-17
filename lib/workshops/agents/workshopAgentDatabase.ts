import {
    WORKSHOP_AGENT_ASSIGNMENT_TABLE_NAME, WORKSHOP_AGENT_JOB_TABLE_NAME, WORKSHOP_AGENT_TABLE_NAME,
    type WorkshopAgentAdminState, type WorkshopAgentDefinition, type WorkshopAgentJobStatus,
    type WorkshopAgentWriteValues,
} from './workshopAgentTypes';
import { isWorkshopAgentConfigured } from './workshopAgentPolicy';
import type { SupabaseClient } from '@supabase/supabase-js';

type WorkshopAgentRow = {
    readonly id: string;
    readonly name: string;
    readonly book_source: string;
    readonly is_enabled: boolean;
};
type WorkshopAgentAssignmentRow = {
    readonly agent_id: string;
    readonly is_reply_enabled: boolean;
    readonly is_listening: boolean;
    readonly reply_cooldown_seconds: number;
    readonly question_interval_seconds: number;
};
type WorkshopAgentRunRow = {
    readonly id: string;
    readonly agent_id: string;
    readonly agent_name: string | null;
    readonly status: WorkshopAgentJobStatus;
    readonly trigger_comment_id: string | null;
    readonly transcript_id: string | null;
    readonly error_code: string | null;
    readonly created_at: string;
};

export async function loadWorkshopAgentAdminState(supabase: SupabaseClient, workshopId: string): Promise<WorkshopAgentAdminState> {
    const [agentsResult, assignmentsResult, runsResult] = await Promise.all([
        supabase.from(WORKSHOP_AGENT_TABLE_NAME).select('id, name, book_source, is_enabled').order('created_at'),
        supabase.from(WORKSHOP_AGENT_ASSIGNMENT_TABLE_NAME).select('*').eq('workshop_id', workshopId),
        supabase.from(WORKSHOP_AGENT_JOB_TABLE_NAME)
            .select('id, agent_id, agent_name, status, trigger_comment_id, transcript_id, error_code, created_at')
            .eq('workshop_id', workshopId).order('created_at', { ascending: false }).limit(20),
    ]);
    if (agentsResult.error || assignmentsResult.error || runsResult.error) {
        throw new Error('Agenty se nepodařilo načíst.');
    }
    const assignments = new Map((assignmentsResult.data as WorkshopAgentAssignmentRow[]).map((assignment) => [assignment.agent_id, assignment]));
    const agents = (agentsResult.data as WorkshopAgentRow[]).map((agent): WorkshopAgentDefinition => {
        const assignment = assignments.get(agent.id);
        return {
            id: agent.id, name: agent.name, bookSource: agent.book_source, isEnabled: agent.is_enabled,
            isReplyEnabled: assignment?.is_reply_enabled ?? false, isListening: assignment?.is_listening ?? false,
            replyCooldownSeconds: assignment?.reply_cooldown_seconds ?? 60,
            questionIntervalSeconds: assignment?.question_interval_seconds ?? 180,
        };
    });
    const names = new Map(agents.map((agent) => [agent.id, agent.name]));
    return {
        agents,
        isConfigured: isWorkshopAgentConfigured(),
        runs: (runsResult.data as WorkshopAgentRunRow[]).map((run) => ({
            id: run.id, agentId: run.agent_id, agentName: run.agent_name ?? names.get(run.agent_id) ?? 'Agent',
            status: run.status, triggerCommentId: run.trigger_comment_id, isLiveQuestion: run.transcript_id !== null,
            errorCode: run.error_code, createdAt: run.created_at,
        })),
    };
}

export async function saveWorkshopAgent(
    supabase: SupabaseClient, workshopId: string, agentId: string | null, values: WorkshopAgentWriteValues,
): Promise<string> {
    const { data, error } = await supabase.rpc('save_workshop_agent', {
        target_workshop_id: workshopId, target_agent_id: agentId, target_name: values.name,
        target_book_source: values.bookSource, target_is_enabled: values.isEnabled,
        target_is_reply_enabled: values.isReplyEnabled, target_is_listening: values.isListening,
        target_reply_cooldown_seconds: values.replyCooldownSeconds, target_question_interval_seconds: values.questionIntervalSeconds,
    });
    if (error || typeof data !== 'string') throw new Error('Agenta se nepodařilo uložit.');
    return data;
}

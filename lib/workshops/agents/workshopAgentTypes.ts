import { z } from 'zod';

export const WORKSHOP_AGENT_TABLE_NAME = 'workshop_agents';
export const WORKSHOP_AGENT_ASSIGNMENT_TABLE_NAME = 'workshop_agent_assignments';
export const WORKSHOP_AGENT_JOB_TABLE_NAME = 'workshop_agent_jobs';
export const WORKSHOP_AGENT_TRANSCRIPT_TABLE_NAME = 'workshop_agent_transcripts';
export const WORKSHOP_AGENT_AUDIO_SESSION_TABLE_NAME = 'workshop_agent_audio_sessions';
export const WORKSHOP_AGENT_AUDIO_CHUNK_MILLISECONDS = 15_000;
export const MAXIMAL_WORKSHOP_AGENT_AUDIO_BYTES = 2 * 1024 * 1024;
export const WORKSHOP_AGENT_AUDIO_MIME_TYPES = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav'] as const;

export const WORKSHOP_AGENT_WRITE_SCHEMA = z.object({
    name: z.string().trim().min(1).max(200),
    bookSource: z.string().trim().min(3).max(50_000),
    isEnabled: z.boolean(),
    isReplyEnabled: z.boolean(),
    isListening: z.boolean(),
    replyCooldownSeconds: z.number().int().min(15).max(3600),
    questionIntervalSeconds: z.number().int().min(60).max(3600),
}).strict();

export type WorkshopAgentWriteValues = z.infer<typeof WORKSHOP_AGENT_WRITE_SCHEMA>;
export type WorkshopAgentDefinition = WorkshopAgentWriteValues & { readonly id: string };
export type WorkshopAgentJobStatus = 'pending' | 'running' | 'replied' | 'skipped' | 'failed';
export type WorkshopAgentRun = {
    readonly id: string;
    readonly agentId: string;
    readonly agentName: string;
    readonly status: WorkshopAgentJobStatus;
    readonly triggerCommentId: string | null;
    readonly isLiveQuestion: boolean;
    readonly errorCode: string | null;
    readonly createdAt: string;
};
export type WorkshopAgentAdminState = {
    readonly agents: readonly WorkshopAgentDefinition[];
    readonly runs: readonly WorkshopAgentRun[];
    readonly isConfigured: boolean;
};

/** The private immutable input of a claimed job, never part of participant state. */
export type WorkshopAgentJob = {
    readonly id: string;
    readonly workshop_id: string;
    readonly agent_id: string;
    readonly agent_name: string;
    readonly book_source: string;
    readonly source_body: string | null;
    readonly trigger_comment_id: string | null;
    readonly transcript_id: string | null;
    readonly lease_token: string;
};

export const DEFAULT_WORKSHOP_AGENT_VALUES: WorkshopAgentWriteValues = {
    name: 'Zvídavá Jana',
    bookSource: `Zvídavá Jana
PERSONA Jsi zvídavá účastnice workshopů o programování s AI. Zajímá tě praktické využití a srozumitelná vysvětlení.
GOAL Pomáhej rozvíjet diskusi. Reaguj na ostatní a ptej se na konkrétní nejasnosti.
RULE Piš česky, přátelsky a stručně. Máš vlastní názor, ale respektuj ostatní.
RULE Nevymýšlej si, co zaznělo na workshopu. Vycházej jen z poskytnutého přepisu a diskuse.
RULE Pokud nemáš co dodat, odpověz pouze [SKIP].
MODEL gpt-4.1-mini`,
    isEnabled: true,
    isReplyEnabled: true,
    isListening: false,
    replyCooldownSeconds: 60,
    questionIntervalSeconds: 180,
};

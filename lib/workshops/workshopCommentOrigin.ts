export type WorkshopCommentOrigin = 'user' | 'artificial' | 'agent';

export const WORKSHOP_COMMENT_ORIGIN_LABELS: Readonly<Record<WorkshopCommentOrigin, string>> = {
    user: 'Účastník',
    artificial: 'Umělý komentář',
    agent: 'AI agent',
};

/** Only administrative projections receive agent identity and execution provenance. */
export function getWorkshopCommentProvenance(row: {
    readonly is_artificial: boolean;
    readonly origin?: WorkshopCommentOrigin;
    readonly agent_id?: string | null;
    readonly agent_job_id?: string | null;
}) {
    return {
        origin: row.origin ?? (row.is_artificial ? 'artificial' : 'user'),
        agentId: row.agent_id ?? null,
        agentJobId: row.agent_job_id ?? null,
    };
}

import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { WorkshopAgentJob } from './workshopAgentTypes';

const ROOM_ID = '11111111-1111-4111-8111-111111111111';
const PARTICIPANT_ID = '22222222-2222-4222-8222-222222222222';
const SESSION_ID = '33333333-3333-4333-8333-333333333333';
const MIGRATION_SQL = readFileSync('migrations/2026-09-2200-workshop-book-agents.sql', 'utf8');
const LIVE_SESSION_PUBLICATION_MIGRATION_SQL = readFileSync('migrations/2026-09-2300-workshop-agent-live-session-publication.sql', 'utf8');

// Exercise the actual PostgreSQL functions/triggers without using a configured production database.
const BASE_SCHEMA = `
CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
CREATE TABLE workshops (id uuid PRIMARY KEY, room_kind text NOT NULL DEFAULT 'workshop', is_published boolean NOT NULL DEFAULT true,
    is_deleted boolean NOT NULL DEFAULT false, external_url text, disabled_panels text[] NOT NULL DEFAULT '{}',
    starts_at timestamptz NOT NULL DEFAULT now() - interval '1 hour', ends_at timestamptz);
CREATE TABLE workshop_participants (id uuid PRIMARY KEY, workshop_id uuid REFERENCES workshops(id), is_interaction_banned boolean NOT NULL DEFAULT false);
CREATE TABLE workshop_comments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), workshop_id uuid NOT NULL REFERENCES workshops(id),
    participant_id uuid REFERENCES workshop_participants(id), parent_comment_id uuid REFERENCES workshop_comments(id),
    author_name text NOT NULL, body text NOT NULL, status text NOT NULL DEFAULT 'pending', is_artificial boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(), moderated_at timestamptz, UNIQUE (id, workshop_id),
    CHECK ((is_artificial AND participant_id IS NULL) OR (NOT is_artificial AND participant_id IS NOT NULL)));
INSERT INTO workshops (id) VALUES ('${ROOM_ID}');
INSERT INTO workshop_comments (workshop_id, author_name, body, is_artificial) VALUES ('${ROOM_ID}', 'Legacy', 'Prepared comment', true);
`;

describe('durable Book agent queue in PostgreSQL', () => {
    let database: PGlite;
    beforeAll(async () => {
        database = new PGlite();
        await database.exec(BASE_SCHEMA);
        await database.exec(MIGRATION_SQL);
        await database.exec(LIVE_SESSION_PUBLICATION_MIGRATION_SQL);
        expect((await database.query<{ origin: string }>('SELECT origin FROM workshop_comments')).rows[0]?.origin).toBe('artificial');
    }, 30_000);
    afterAll(async () => { await database?.close(); });
    beforeEach(async () => {
        await database.exec('TRUNCATE workshops, workshop_participants, workshop_comments, workshop_agents CASCADE');
        await database.query('INSERT INTO workshops (id) VALUES ($1)', [ROOM_ID]);
        await database.query('INSERT INTO workshop_participants (id, workshop_id) VALUES ($1, $2)', [PARTICIPANT_ID, ROOM_ID]);
    });

    async function createAgent(name = 'Jana', isListening = false): Promise<string> {
        const result = await database.query<{ id: string }>(
            'SELECT save_workshop_agent($1, NULL, $2, $3, true, true, $4, 15, 60) AS id',
            [ROOM_ID, name, `${name}\nPERSONA Curious developer`, isListening],
        );
        return result.rows[0]!.id;
    }

    async function createComment(status = 'approved'): Promise<string> {
        const result = await database.query<{ id: string }>(
            'INSERT INTO workshop_comments (workshop_id, participant_id, author_name, body, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [ROOM_ID, PARTICIPANT_ID, 'Member', 'How do I test this?', status],
        );
        return result.rows[0]!.id;
    }

    async function claimJob(): Promise<WorkshopAgentJob | null> {
        return (await database.query<{ job: WorkshopAgentJob | null }>('SELECT claim_workshop_agent_job($1) AS job', [ROOM_ID])).rows[0]!.job;
    }

    async function finishJob(job: WorkshopAgentJob, body: string | null = 'Start with a failing test.'): Promise<string | null> {
        return (await database.query<{ id: string | null }>('SELECT finish_workshop_agent_job($1, $2, $3) AS id', [job.id, job.lease_token, body])).rows[0]!.id;
    }

    async function createLiveJob(): Promise<WorkshopAgentJob> {
        await createAgent('Listener', true);
        await database.query('SELECT start_workshop_agent_audio($1, $2)', [ROOM_ID, SESSION_ID]);
        await database.query('INSERT INTO workshop_agent_transcripts (workshop_id, session_id, sequence, body) VALUES ($1, $2, 0, $3)', [ROOM_ID, SESSION_ID, 'We are now writing a unit test.']);
        return (await claimJob())!;
    }

    it('queues only approval, in both room kinds, without backfilling history', async () => {
        await createComment();
        await database.query("UPDATE workshops SET room_kind = 'community'");
        await createAgent();
        expect(await claimJob()).toBeNull();
        const commentId = await createComment('pending');
        expect(await claimJob()).toBeNull();
        await database.query("UPDATE workshop_comments SET status = 'approved' WHERE id = $1", [commentId]);
        const job = (await claimJob())!;
        expect(job.trigger_comment_id).toBe(commentId);
        const replyId = await finishJob(job);
        expect(replyId).not.toBeNull();
        expect((await database.query('SELECT origin, participant_id, agent_id, agent_job_id, parent_comment_id FROM workshop_comments WHERE id = $1', [replyId])).rows[0]).toEqual({
            origin: 'agent', participant_id: null, agent_id: job.agent_id, agent_job_id: job.id, parent_comment_id: commentId,
        });
        await database.query("UPDATE workshop_comments SET status = 'pending' WHERE id = $1", [commentId]);
        await database.query("UPDATE workshop_comments SET status = 'approved' WHERE id = $1", [commentId]);
        expect((await database.query('SELECT id FROM workshop_agent_jobs')).rows).toHaveLength(1);
    });

    it('answers artificial comments and excludes self replies', async () => {
        await createAgent();
        await database.query("INSERT INTO workshop_comments (workshop_id, author_name, body, status, is_artificial, origin) VALUES ($1, 'Host', 'Welcome', 'approved', true, 'artificial')", [ROOM_ID]);
        await finishJob((await claimJob())!);
        expect((await database.query('SELECT id FROM workshop_agent_jobs')).rows).toHaveLength(1);
    });

    it('allows discussion between agents but caps its depth and preserves a single visual thread', async () => {
        await createAgent('Jana');
        await createAgent('Pavel');
        const commentId = await createComment();
        for (let turn = 0; turn < 4; turn += 1) {
            await database.exec('UPDATE workshop_agent_assignments SET next_reply_at = now()');
            const job = (await claimJob())!;
            expect(job).not.toBeNull();
            expect(await claimJob()).toBeNull();
            expect(await finishJob(job)).not.toBeNull();
            expect(await finishJob(job)).toBeNull();
        }
        expect(await claimJob()).toBeNull();
        const replies = (await database.query<{ parent_comment_id: string; agent_turn_depth: number }>("SELECT parent_comment_id, agent_turn_depth FROM workshop_comments WHERE origin = 'agent'")).rows;
        expect(replies).toHaveLength(4);
        expect(replies.every((reply) => reply.parent_comment_id === commentId && reply.agent_turn_depth <= 2)).toBe(true);
    });

    it.each([
        "UPDATE workshop_agents SET is_enabled = false",
        "UPDATE workshop_agents SET book_source = 'Changed personality'",
        "UPDATE workshop_agent_assignments SET is_reply_enabled = false",
        "UPDATE workshop_comments SET status = 'rejected'",
        "UPDATE workshop_comments SET body = 'Edited while generating'",
        "UPDATE workshop_participants SET is_interaction_banned = true",
        "UPDATE workshops SET is_published = false",
        "UPDATE workshops SET is_deleted = true",
        "UPDATE workshops SET disabled_panels = ARRAY['chat']",
    ])('does not publish stale work after %s', async (mutation) => {
        await createAgent();
        await createComment();
        const job = (await claimJob())!;
        await database.exec(mutation);
        expect(await finishJob(job)).toBeNull();
        expect((await database.query("SELECT id FROM workshop_comments WHERE origin = 'agent'")).rows).toHaveLength(0);
    });

    it('does not send banned or rejected source text to a model', async () => {
        await createAgent();
        await createComment();
        await database.exec('UPDATE workshop_participants SET is_interaction_banned = true');
        expect(await claimJob()).toBeNull();
    });

    it('rejects expired leases and recovers jobs after a crashed worker', async () => {
        await createAgent();
        await createComment();
        const oldJob = (await claimJob())!;
        await database.exec("UPDATE workshop_agent_jobs SET lease_until = now() - interval '1 second'; UPDATE workshop_agent_assignments SET next_reply_at = now()");
        expect(await finishJob(oldJob)).toBeNull();
        const newJob = (await claimJob())!;
        expect(newJob.lease_token).not.toBe(oldJob.lease_token);
        expect(await finishJob(oldJob)).toBeNull();
        expect(await finishJob(newJob)).not.toBeNull();
    });

    it('bounds retries and honors cooldowns even after provider failures', async () => {
        await createAgent();
        await createComment();
        for (let attempt = 0; attempt < 3; attempt += 1) {
            const job = (await claimJob())!;
            await database.query("SELECT finish_workshop_agent_job($1, $2, NULL, 'generation_failed')", [job.id, job.lease_token]);
            expect(await claimJob()).toBeNull();
            await database.exec('UPDATE workshop_agent_assignments SET next_reply_at = now(); UPDATE workshop_agent_jobs SET available_at = now()');
        }
        expect(await claimJob()).toBeNull();
        expect((await database.query<{ status: string }>('SELECT status FROM workshop_agent_jobs')).rows[0]!.status).toBe('failed');
    });

    it('publishes a live question only during its active capture session', async () => {
        const job = await createLiveJob();
        const commentId = await finishJob(job, 'How do you choose the first assertion?');
        expect(commentId).not.toBeNull();
        expect((await database.query<{ parent_comment_id: string | null }>('SELECT parent_comment_id FROM workshop_comments WHERE id = $1', [commentId])).rows[0]!.parent_comment_id).toBeNull();
    });

    it.each([
        'DELETE FROM workshop_agent_audio_sessions',
        "UPDATE workshop_agent_audio_sessions SET session_id = gen_random_uuid()",
        "UPDATE workshop_agent_audio_sessions SET expires_at = now() - interval '1 second'",
        'UPDATE workshop_agent_assignments SET is_listening = false',
        "UPDATE workshops SET ends_at = now() - interval '1 second'",
        "UPDATE workshop_agent_jobs SET created_at = now() - interval '3 minutes'",
    ])('discards in-flight live questions after %s', async (mutation) => {
        const job = await createLiveJob();
        await database.exec(mutation);
        expect(await finishJob(job)).toBeNull();
    });

    it('reserves audio once and prevents simultaneous capture sessions', async () => {
        expect((await database.query<{ is_started: boolean }>('SELECT start_workshop_agent_audio($1, $2) AS is_started', [ROOM_ID, SESSION_ID])).rows[0]!.is_started).toBe(true);
        expect((await database.query<{ is_started: boolean }>('SELECT start_workshop_agent_audio($1, gen_random_uuid()) AS is_started', [ROOM_ID])).rows[0]!.is_started).toBe(false);
        expect((await database.query<{ is_reserved: boolean }>('SELECT reserve_workshop_agent_audio_chunk($1, $2, 0) AS is_reserved', [ROOM_ID, SESSION_ID])).rows[0]!.is_reserved).toBe(true);
        expect((await database.query<{ is_reserved: boolean }>('SELECT reserve_workshop_agent_audio_chunk($1, $2, 0) AS is_reserved', [ROOM_ID, SESSION_ID])).rows[0]!.is_reserved).toBe(false);
    });

    it('does not enqueue a transcript which finished after capture stopped', async () => {
        await createAgent('Listener', true);
        await database.query('INSERT INTO workshop_agent_transcripts (workshop_id, session_id, sequence, body) VALUES ($1, $2, 0, $3)', [ROOM_ID, SESSION_ID, 'Late transcript']);
        expect((await database.query('SELECT id FROM workshop_agent_jobs')).rows).toHaveLength(0);
        expect(await claimJob()).toBeNull();
    });

    it('keeps agent books, audio and execution private from public database roles', async () => {
        await database.exec('SET ROLE anon');
        await expect(database.query('SELECT * FROM workshop_agents')).rejects.toThrow(/permission denied/);
        await expect(database.query('SELECT claim_workshop_agent_job(NULL)')).rejects.toThrow(/permission denied/);
        await expect(database.query('SELECT finish_workshop_agent_job(NULL, NULL)')).rejects.toThrow(/permission denied/);
        await database.exec('RESET ROLE');
    });
});

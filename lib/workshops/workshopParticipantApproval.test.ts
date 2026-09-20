import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const APPROVAL_MIGRATION_SQL = readFileSync('migrations/2026-09-2400-workshop-participant-pending-approval.sql', 'utf8');
const AGENT_MIGRATION_SQL = readFileSync('migrations/2026-09-2200-workshop-book-agents.sql', 'utf8');
const COMMUNITY_ID = '11111111-1111-4111-8111-111111111111';
const WORKSHOP_ID = '22222222-2222-4222-8222-222222222222';
const COMMUNITY_PARTICIPANT_ID = '33333333-3333-4333-8333-333333333333';
const WORKSHOP_PARTICIPANT_ID = '44444444-4444-4444-8444-444444444444';
const OTHER_PARTICIPANT_ID = '55555555-5555-4555-8555-555555555555';
const POLL_ID = '66666666-6666-4666-8666-666666666666';

// Run the real migration and the existing approval-to-agent trigger in isolated PostgreSQL.
const BASE_SCHEMA_SQL = `
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE TABLE workshops (id uuid PRIMARY KEY, room_kind text NOT NULL, is_published boolean NOT NULL DEFAULT true,
        is_deleted boolean NOT NULL DEFAULT false, external_url text, disabled_panels text[] NOT NULL DEFAULT '{}',
        starts_at timestamptz NOT NULL DEFAULT now() - interval '1 hour', ends_at timestamptz);
    CREATE TABLE workshop_participants (id uuid PRIMARY KEY, workshop_id uuid NOT NULL REFERENCES workshops(id), email text,
        is_trusted boolean NOT NULL DEFAULT false, is_moderator boolean NOT NULL DEFAULT false,
        is_interaction_banned boolean NOT NULL DEFAULT false);
    CREATE TABLE workshop_comments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), workshop_id uuid NOT NULL REFERENCES workshops(id),
        participant_id uuid REFERENCES workshop_participants(id), parent_comment_id uuid REFERENCES workshop_comments(id),
        author_name text NOT NULL DEFAULT 'Member', body text NOT NULL DEFAULT 'Question', status text NOT NULL DEFAULT 'pending',
        is_artificial boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(), moderated_at timestamptz,
        UNIQUE (id, workshop_id), CHECK ((is_artificial AND participant_id IS NULL) OR (NOT is_artificial AND participant_id IS NOT NULL)));
    CREATE TABLE workshop_polls (id uuid PRIMARY KEY, workshop_id uuid NOT NULL REFERENCES workshops(id));
    CREATE TABLE workshop_poll_options (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), poll_id uuid REFERENCES workshop_polls(id),
        author_participant_id uuid REFERENCES workshop_participants(id), is_created_by_participant boolean NOT NULL DEFAULT true,
        status text NOT NULL DEFAULT 'pending');
    CREATE TABLE workshop_poll_votes (option_id uuid REFERENCES workshop_poll_options(id), voter_email text NOT NULL);
    CREATE TABLE community_projects (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        author_community_participant_id uuid NOT NULL REFERENCES workshop_participants(id), status text NOT NULL DEFAULT 'pending');
`;

describe('approval when granting participant trust or moderation', () => {
    let database: PGlite;

    beforeAll(async () => {
        database = new PGlite();
        await database.exec(BASE_SCHEMA_SQL);
        await database.exec(AGENT_MIGRATION_SQL);
        await database.exec(APPROVAL_MIGRATION_SQL);
    }, 30_000);
    afterAll(async () => { await database?.close(); });

    beforeEach(async () => {
        await database.exec('TRUNCATE workshops, workshop_participants, workshop_comments, workshop_agents CASCADE');
        await database.query("INSERT INTO workshops (id, room_kind) VALUES ($1, 'community'), ($2, 'workshop')", [COMMUNITY_ID, WORKSHOP_ID]);
        // The same email in another room is deliberately a different participant and receives no promotion.
        await database.query(`INSERT INTO workshop_participants (id, workshop_id, email)
            VALUES ($1, $2, 'member@example.com'), ($3, $4, 'member@example.com'), ($5, $2, 'other@example.com')`,
            [COMMUNITY_PARTICIPANT_ID, COMMUNITY_ID, WORKSHOP_PARTICIPANT_ID, WORKSHOP_ID, OTHER_PARTICIPANT_ID]);
        await database.query('INSERT INTO workshop_polls VALUES ($1, $2)', [POLL_ID, COMMUNITY_ID]);
    });

    async function createSubmissions(participantId: string, status = 'pending'): Promise<void> {
        await database.query(`INSERT INTO workshop_comments (workshop_id, participant_id, status)
            SELECT workshop_id, id, $2 FROM workshop_participants WHERE id = $1`, [participantId, status]);
        const option = await database.query<{ id: string }>(`INSERT INTO workshop_poll_options (poll_id, author_participant_id, status)
            VALUES ($1, $2, $3) RETURNING id`, [POLL_ID, participantId, status]);
        await database.query('INSERT INTO workshop_poll_votes VALUES ($1, $2)', [option.rows[0]!.id, 'member@example.com']);
        if (participantId !== WORKSHOP_PARTICIPANT_ID) {
            await database.query('INSERT INTO community_projects (author_community_participant_id, status) VALUES ($1, $2)', [participantId, status]);
        }
    }

    async function countPending(roomId: string, participantId: string): Promise<number | null> {
        const result = await database.query<{ pending_submission_count: number }>(
            'SELECT * FROM get_workshop_pending_submission_counts($1, $2)', [roomId, [participantId]],
        );
        return result.rows[0]?.pending_submission_count ?? null;
    }

    async function readStatuses(participantId: string): Promise<readonly { kind: string; status: string }[]> {
        return (await database.query<{ kind: string; status: string }>(`
            SELECT 'comment' AS kind, status FROM workshop_comments WHERE participant_id = $1
            UNION ALL SELECT 'poll-option', status FROM workshop_poll_options WHERE author_participant_id = $1
            UNION ALL SELECT 'project', status FROM community_projects WHERE author_community_participant_id = $1
            ORDER BY kind, status`, [participantId])).rows;
    }

    it.each([
        { roomId: COMMUNITY_ID, participantId: COMMUNITY_PARTICIPANT_ID, role: 'is_trusted', total: 3 },
        { roomId: COMMUNITY_ID, participantId: COMMUNITY_PARTICIPANT_ID, role: 'is_moderator', total: 3 },
        { roomId: WORKSHOP_ID, participantId: WORKSHOP_PARTICIPANT_ID, role: 'is_trusted', total: 2 },
        { roomId: WORKSHOP_ID, participantId: WORKSHOP_PARTICIPANT_ID, role: 'is_moderator', total: 2 },
    ])('approves every pending kind for $role in $roomId, keeping other decisions and identities', async ({ roomId, participantId, role, total }) => {
        for (const status of ['pending', 'approved', 'rejected']) await createSubmissions(participantId, status);
        await createSubmissions(OTHER_PARTICIPANT_ID);
        const otherRoomParticipantId = participantId === COMMUNITY_PARTICIPANT_ID ? WORKSHOP_PARTICIPANT_ID : COMMUNITY_PARTICIPANT_ID;
        await createSubmissions(otherRoomParticipantId);
        const votesBefore = (await database.query('SELECT * FROM workshop_poll_votes')).rows;

        expect(await countPending(roomId, participantId)).toBe(total);
        await database.query(`UPDATE workshop_participants SET ${role} = true WHERE id = $1`, [participantId]);

        expect(await countPending(roomId, participantId)).toBe(0);
        const statuses = await readStatuses(participantId);
        expect(statuses.filter((submission) => submission.status === 'approved')).toHaveLength(total * 2);
        expect(statuses.filter((submission) => submission.status === 'rejected')).toHaveLength(total);
        expect((await readStatuses(OTHER_PARTICIPANT_ID)).every((submission) => submission.status === 'pending')).toBe(true);
        expect((await readStatuses(otherRoomParticipantId)).every((submission) => submission.status === 'pending')).toBe(true);
        expect((await database.query('SELECT * FROM workshop_poll_votes')).rows).toEqual(votesBefore);
    });

    it('counts the entire history, including replies, while refusing participant IDs from another room', async () => {
        await createSubmissions(COMMUNITY_PARTICIPANT_ID);
        await database.query(`INSERT INTO workshop_comments (workshop_id, participant_id, parent_comment_id)
            SELECT $1, $2, (SELECT id FROM workshop_comments LIMIT 1) FROM generate_series(1, 1200)`, [COMMUNITY_ID, COMMUNITY_PARTICIPANT_ID]);
        expect(await countPending(COMMUNITY_ID, COMMUNITY_PARTICIPANT_ID)).toBe(1203);
        expect(await countPending(WORKSHOP_ID, COMMUNITY_PARTICIPANT_ID)).toBeNull();
        expect(await countPending(COMMUNITY_ID, OTHER_PARTICIPANT_ID)).toBe(0);
        await database.query('UPDATE workshop_participants SET is_trusted = true WHERE id = $1', [COMMUNITY_PARTICIPANT_ID]);
        expect(await countPending(COMMUNITY_ID, COMMUNITY_PARTICIPANT_ID)).toBe(0);
    });

    it.each(['is_trusted', 'is_moderator'])('preserves a ban when granting %s and approves only after the ban is lifted', async (role) => {
        await createSubmissions(COMMUNITY_PARTICIPANT_ID);
        await database.query(`UPDATE workshop_participants SET is_interaction_banned = true, ${role} = true WHERE id = $1`, [COMMUNITY_PARTICIPANT_ID]);
        expect(await countPending(COMMUNITY_ID, COMMUNITY_PARTICIPANT_ID)).toBe(3);
        await database.query('UPDATE workshop_participants SET is_interaction_banned = false WHERE id = $1', [COMMUNITY_PARTICIPANT_ID]);
        expect(await countPending(COMMUNITY_ID, COMMUNITY_PARTICIPANT_ID)).toBe(0);
    });

    it('does not approve on an unrelated update, demotion, repeated write, or unban without a role', async () => {
        await database.query('UPDATE workshop_participants SET is_trusted = true WHERE id = $1', [COMMUNITY_PARTICIPANT_ID]);
        await createSubmissions(COMMUNITY_PARTICIPANT_ID);
        for (const changes of ["email = 'changed@example.com'", 'is_trusted = true', 'is_trusted = false', 'is_interaction_banned = true', 'is_interaction_banned = false']) {
            await database.query(`UPDATE workshop_participants SET ${changes} WHERE id = $1`, [COMMUNITY_PARTICIPANT_ID]);
            expect(await countPending(COMMUNITY_ID, COMMUNITY_PARTICIPANT_ID)).toBe(3);
        }
    });

    it('rolls back the role and every approval if any submission cannot be approved', async () => {
        await createSubmissions(COMMUNITY_PARTICIPANT_ID);
        await database.exec(`CREATE FUNCTION refuse_test_project_approval() RETURNS trigger LANGUAGE plpgsql AS $$
            BEGIN RAISE EXCEPTION 'Test approval failure'; END; $$;
            CREATE TRIGGER refuse_test_project_approval BEFORE UPDATE ON community_projects
            FOR EACH ROW EXECUTE FUNCTION refuse_test_project_approval();`);
        try {
            await expect(database.query('UPDATE workshop_participants SET is_trusted = true WHERE id = $1', [COMMUNITY_PARTICIPANT_ID])).rejects.toThrow('Test approval failure');
            expect(await countPending(COMMUNITY_ID, COMMUNITY_PARTICIPANT_ID)).toBe(3);
            expect((await database.query<{ is_trusted: boolean }>('SELECT is_trusted FROM workshop_participants WHERE id = $1', [COMMUNITY_PARTICIPANT_ID])).rows[0]!.is_trusted).toBe(false);
        } finally {
            await database.exec('DROP TRIGGER refuse_test_project_approval ON community_projects; DROP FUNCTION refuse_test_project_approval();');
        }
    });

    it('queues newly approved comments once through the existing agent trigger', async () => {
        await database.query("SELECT save_workshop_agent($1, NULL, 'Helper', 'Helper\nPERSONA Helpful', true, true, false, 15, 60)", [COMMUNITY_ID]);
        await createSubmissions(COMMUNITY_PARTICIPANT_ID);
        await database.query('UPDATE workshop_participants SET is_trusted = true WHERE id = $1', [COMMUNITY_PARTICIPANT_ID]);
        await database.query('UPDATE workshop_participants SET is_moderator = true WHERE id = $1', [COMMUNITY_PARTICIPANT_ID]);
        expect((await database.query('SELECT * FROM workshop_agent_jobs')).rows).toHaveLength(1);
    });

    it('keeps pending identities and counts inaccessible to public database roles', async () => {
        for (const role of ['anon', 'authenticated']) {
            expect((await database.query<{ is_allowed: boolean }>(
                "SELECT has_table_privilege($1, 'workshop_pending_participant_submissions', 'SELECT') AS is_allowed", [role],
            )).rows[0]!.is_allowed).toBe(false);
            expect((await database.query<{ is_allowed: boolean }>(
                "SELECT has_function_privilege($1, 'get_workshop_pending_submission_counts(uuid,uuid[])', 'EXECUTE') AS is_allowed", [role],
            )).rows[0]!.is_allowed).toBe(false);
        }
    });
});

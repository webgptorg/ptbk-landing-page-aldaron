import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const WORKSHOP_ID = '11111111-1111-4111-8111-111111111111';
const FIRST_REVISION_ID = '22222222-2222-4222-8222-222222222222';
const SECOND_REVISION_ID = '33333333-3333-4333-8333-333333333333';
const DRAFT_REVISION_ID = '44444444-4444-4444-8444-444444444444';
const READY_REVISION_ID = '55555555-5555-4555-8555-555555555555';
const OLD_UPLOAD_CUTOFF = '2026-10-01T00:00:00Z';
const OLD_REVISION_CUTOFF = '2026-10-01T00:00:00Z';

describe('hosted recording publication transaction', () => {
    it('atomically replaces the pointer, protects private rows, and claims only inactive revisions for cleanup', async () => {
        const database = new PGlite();
        try {
            await database.exec(`
                CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
                CREATE TABLE public.workshops (
                    id uuid PRIMARY KEY, is_deleted boolean NOT NULL DEFAULT false,
                    updated_at timestamptz NOT NULL DEFAULT now(),
                    youtube_video_id text, recording_start_offset_seconds integer NOT NULL DEFAULT 0
                );
                INSERT INTO public.workshops (id, youtube_video_id, recording_start_offset_seconds)
                VALUES ('${WORKSHOP_ID}', 'dQw4w9WgXcQ', 75);
            `);
            await database.exec(readFileSync('migrations/2026-09-2900-workshop-hosted-recordings.sql', 'utf8'));
            for (const revisionId of [FIRST_REVISION_ID, SECOND_REVISION_ID]) {
                await database.query(`INSERT INTO public.workshop_hosted_recording_revisions
                    (id, workshop_id, status, live_start_at, duration_seconds,
                     validation_report, player_metadata, created_at)
                    VALUES ($1, $2, 'ready', '2026-09-29T10:00:00Z', 60,
                    '{"isValid":true}'::jsonb, '{"schemaVersion":1}'::jsonb,
                    '2026-09-28T10:00:00Z')`, [revisionId, WORKSHOP_ID]);
            }
            await database.query('SELECT public.publish_workshop_hosted_recording($1)', [FIRST_REVISION_ID]);
            await database.query('SELECT public.publish_workshop_hosted_recording($1)', [SECOND_REVISION_ID]);
            const published = await database.query<{ hosted_recording_revision_id: string;
                video_source: string; youtube_video_id: string; recording_start_offset_seconds: number }>(
                'SELECT hosted_recording_revision_id, video_source, youtube_video_id, recording_start_offset_seconds FROM public.workshops WHERE id = $1',
                [WORKSHOP_ID]);
            expect(published.rows[0]).toEqual({ hosted_recording_revision_id: SECOND_REVISION_ID,
                video_source: 'hosted', youtube_video_id: 'dQw4w9WgXcQ', recording_start_offset_seconds: 75 });

            const claimedCurrent = await database.query<{ claim_workshop_hosted_recording_cleanup: boolean }>(
                'SELECT public.claim_workshop_hosted_recording_cleanup($1, $2, $3)',
                [SECOND_REVISION_ID, OLD_UPLOAD_CUTOFF, OLD_REVISION_CUTOFF]);
            expect(claimedCurrent.rows[0]!.claim_workshop_hosted_recording_cleanup).toBe(false);
            // Publication stamps superseded_at with the real database clock. Age this fixture explicitly before
            // testing old-revision cleanup, so crossing the fixed cutoff date cannot change the expected result.
            await database.query(
                "UPDATE public.workshop_hosted_recording_revisions SET superseded_at = $2::timestamptz - interval '1 day' WHERE id = $1",
                [FIRST_REVISION_ID, OLD_REVISION_CUTOFF],
            );
            const claimedPrevious = await database.query<{ claim_workshop_hosted_recording_cleanup: boolean }>(
                'SELECT public.claim_workshop_hosted_recording_cleanup($1, $2, $3)',
                [FIRST_REVISION_ID, OLD_UPLOAD_CUTOFF, OLD_REVISION_CUTOFF]);
            expect(claimedPrevious.rows[0]!.claim_workshop_hosted_recording_cleanup).toBe(true);
            await database.query(`INSERT INTO public.workshop_hosted_recording_revisions
                (id, workshop_id, status, live_start_at, updated_at)
                VALUES ($1, $2, 'ready', '2026-09-29T10:00:00Z', '2026-09-28T10:00:00Z')`,
            [READY_REVISION_ID, WORKSHOP_ID]);
            const claimedReady = await database.query<{ claim_workshop_hosted_recording_cleanup: boolean }>(
                'SELECT public.claim_workshop_hosted_recording_cleanup($1, $2, $3)',
                [READY_REVISION_ID, OLD_UPLOAD_CUTOFF, OLD_REVISION_CUTOFF]);
            expect(claimedReady.rows[0]!.claim_workshop_hosted_recording_cleanup).toBe(true);
            await expect(database.query('SELECT public.publish_workshop_hosted_recording($1)',
                [FIRST_REVISION_ID])).rejects.toThrow(/not ready/);

            await database.query(`INSERT INTO public.workshop_hosted_recording_revisions
                (id, workshop_id, live_start_at, created_at)
                VALUES ($1, $2, '2026-09-29T10:00:00Z', '2026-09-28T10:00:00Z')`,
            [DRAFT_REVISION_ID, WORKSHOP_ID]);
            await database.query(`INSERT INTO public.workshop_hosted_recording_assets
                (revision_id, role, filename, content_type, byte_length, object_key, upload_id)
                VALUES ($1, 'editor', 'editor.webm', 'video/webm', 100, 'private/editor', 'upload')`,
            [DRAFT_REVISION_ID]);
            for (const role of ['anon', 'authenticated']) {
                await database.exec(`SET ROLE ${role}`);
                await expect(database.query('SELECT * FROM public.workshop_hosted_recording_revisions')).rejects.toThrow(/permission denied/);
                await expect(database.query('SELECT * FROM public.workshop_hosted_recording_assets')).rejects.toThrow(/permission denied/);
                await database.exec('RESET ROLE');
            }
        } finally { await database.close(); }
    });
});

import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const FIRST_WORKSHOP_ID = '11111111-1111-4111-8111-111111111111';
const SECOND_WORKSHOP_ID = '22222222-2222-4222-8222-222222222222';
const FIRST_ID = '00000000-0000-4000-8000-000000000001';
const SECOND_ID = '00000000-0000-4000-8000-000000000002';
const THIRD_ID = '00000000-0000-4000-8000-000000000003';
const FOURTH_ID = '00000000-0000-4000-8000-000000000004';
const FOREIGN_ID = '00000000-0000-4000-8000-000000000005';

async function createDatabase(): Promise<PGlite> {
    const database = new PGlite();
    await database.exec(`
        CREATE ROLE anon;
        CREATE ROLE authenticated;
        CREATE ROLE service_role;
        CREATE TABLE public.workshops (id uuid PRIMARY KEY);
        CREATE TABLE public.workshop_content_blocks (
            id uuid PRIMARY KEY,
            workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
            title text NOT NULL,
            body_markdown text NOT NULL,
            unlock_at timestamptz NOT NULL,
            sort_order integer NOT NULL,
            is_published boolean NOT NULL,
            is_follow_up boolean NOT NULL,
            is_paid_members_only boolean NOT NULL
        );
        INSERT INTO public.workshops (id) VALUES ('${FIRST_WORKSHOP_ID}'), ('${SECOND_WORKSHOP_ID}');
    `);
    await database.exec(readFileSync('migrations/2026-09-2702-workshop-content-ordering.sql', 'utf8'));
    return database;
}

describe('workshop content order transaction', () => {
    it('reindexes tied legacy values deterministically and updates no content fields', async () => {
        const database = await createDatabase();
        try {
            await database.query(`
                INSERT INTO public.workshop_content_blocks
                    (id, workshop_id, title, body_markdown, unlock_at, sort_order, is_published, is_follow_up, is_paid_members_only)
                VALUES
                    ($1, $4, 'first', 'First body', '2026-09-26T10:00:00Z', 50, true, false, false),
                    ($2, $4, 'second', 'Second body', '2026-09-26T10:00:00Z', 50, false, true, false),
                    ($3, $4, 'third', 'Third body', '2026-09-26T10:00:00Z', 50, true, false, true)
            `, [FIRST_ID, SECOND_ID, THIRD_ID, FIRST_WORKSHOP_ID]);

            const result = await database.query<{
                outcome: string;
                material_ids: string[];
                is_changed: boolean;
                was_reconciled: boolean;
            }>('SELECT * FROM public.reorder_workshop_content_blocks($1, $2::uuid[])', [FIRST_WORKSHOP_ID, [THIRD_ID, FIRST_ID, SECOND_ID]]);

            expect(result.rows[0]).toEqual({
                outcome: 'ok',
                material_ids: [THIRD_ID, FIRST_ID, SECOND_ID],
                is_changed: true,
                was_reconciled: false,
            });
            expect((await database.query(
                'SELECT id, sort_order, title, body_markdown, is_published, is_follow_up, is_paid_members_only FROM public.workshop_content_blocks WHERE workshop_id = $1 ORDER BY sort_order',
                [FIRST_WORKSHOP_ID],
            )).rows).toEqual([
                { id: THIRD_ID, sort_order: 0, title: 'third', body_markdown: 'Third body', is_published: true, is_follow_up: false, is_paid_members_only: true },
                { id: FIRST_ID, sort_order: 1, title: 'first', body_markdown: 'First body', is_published: true, is_follow_up: false, is_paid_members_only: false },
                { id: SECOND_ID, sort_order: 2, title: 'second', body_markdown: 'Second body', is_published: false, is_follow_up: true, is_paid_members_only: false },
            ]);
        } finally {
            await database.close();
        }
    });

    it('keeps concurrent additions, skips deletions, and rejects a material owned by another workshop', async () => {
        const database = await createDatabase();
        try {
            await database.query(`
                INSERT INTO public.workshop_content_blocks
                    (id, workshop_id, title, body_markdown, unlock_at, sort_order, is_published, is_follow_up, is_paid_members_only)
                VALUES
                    ($1, $4, 'first', 'First body', '2026-09-26T10:00:00Z', 10, true, false, false),
                    ($2, $4, 'second', 'Second body', '2026-09-26T10:00:00Z', 20, true, false, false),
                    ($3, $4, 'third', 'Third body', '2026-09-26T10:00:00Z', 30, true, false, false),
                    ($5, $6, 'foreign', 'Foreign body', '2026-09-26T10:00:00Z', 5, true, false, false)
            `, [FIRST_ID, SECOND_ID, THIRD_ID, FIRST_WORKSHOP_ID, FOREIGN_ID, SECOND_WORKSHOP_ID]);
            await database.query(`
                INSERT INTO public.workshop_content_blocks
                    (id, workshop_id, title, body_markdown, unlock_at, sort_order, is_published, is_follow_up, is_paid_members_only)
                VALUES ($1, $2, 'fourth', 'Fourth body', '2026-09-26T10:00:00Z', 40, true, false, false)
            `, [FOURTH_ID, FIRST_WORKSHOP_ID]);
            await database.query('DELETE FROM public.workshop_content_blocks WHERE id = $1', [SECOND_ID]);

            const reconciled = await database.query<{
                material_ids: string[];
                was_reconciled: boolean;
            }>('SELECT material_ids, was_reconciled FROM public.reorder_workshop_content_blocks($1, $2::uuid[])', [FIRST_WORKSHOP_ID, [THIRD_ID, FIRST_ID, SECOND_ID]]);
            expect(reconciled.rows[0]).toEqual({ material_ids: [THIRD_ID, FIRST_ID, FOURTH_ID], was_reconciled: true });
            expect((await database.query('SELECT id FROM public.workshop_content_blocks WHERE workshop_id = $1 ORDER BY sort_order', [FIRST_WORKSHOP_ID])).rows)
                .toEqual([{ id: THIRD_ID }, { id: FIRST_ID }, { id: FOURTH_ID }]);

            const invalid = await database.query<{ outcome: string; is_changed: boolean }>(
                'SELECT outcome, is_changed FROM public.reorder_workshop_content_blocks($1, $2::uuid[])',
                [FIRST_WORKSHOP_ID, [FIRST_ID, FOREIGN_ID, THIRD_ID]],
            );
            expect(invalid.rows[0]).toEqual({ outcome: 'invalid_material', is_changed: false });
            expect((await database.query('SELECT workshop_id, sort_order FROM public.workshop_content_blocks WHERE id = $1', [FOREIGN_ID])).rows[0])
                .toEqual({ workshop_id: SECOND_WORKSHOP_ID, sort_order: 5 });
        } finally {
            await database.close();
        }
    });

    it('treats an empty list as a no-op and normalizes a sparse single-item order', async () => {
        const database = await createDatabase();
        try {
            const empty = await database.query<{ material_ids: string[]; is_changed: boolean }>(
                'SELECT material_ids, is_changed FROM public.reorder_workshop_content_blocks($1, ARRAY[]::uuid[])',
                [FIRST_WORKSHOP_ID],
            );
            expect(empty.rows[0]).toEqual({ material_ids: [], is_changed: false });

            await database.query(`
                INSERT INTO public.workshop_content_blocks
                    (id, workshop_id, title, body_markdown, unlock_at, sort_order, is_published, is_follow_up, is_paid_members_only)
                VALUES ($1, $2, 'only', 'Only body', '2026-09-26T10:00:00Z', 80, true, false, false)
            `, [FIRST_ID, FIRST_WORKSHOP_ID]);
            const single = await database.query<{ material_ids: string[]; is_changed: boolean }>(
                'SELECT material_ids, is_changed FROM public.reorder_workshop_content_blocks($1, $2::uuid[])',
                [FIRST_WORKSHOP_ID, [FIRST_ID]],
            );
            expect(single.rows[0]).toEqual({ material_ids: [FIRST_ID], is_changed: true });
            expect((await database.query('SELECT sort_order FROM public.workshop_content_blocks WHERE id = $1', [FIRST_ID])).rows[0])
                .toEqual({ sort_order: 0 });
        } finally {
            await database.close();
        }
    });
});

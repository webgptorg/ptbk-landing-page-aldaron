import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const WORKSHOP_ID = '11111111-1111-4111-8111-111111111111';

describe('private workshop subtitle storage', () => {
    it('preserves language tracks, enforces ownership and denies public database roles', async () => {
        const database = new PGlite();
        try {
            await database.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
                CREATE TABLE public.workshops (id uuid PRIMARY KEY);
                INSERT INTO workshops VALUES ('${WORKSHOP_ID}');`);
            await database.exec(readFileSync('migrations/2026-09-2600-workshop-subtitles.sql', 'utf8'));
            const cues = JSON.stringify([{ startSeconds: 4, endSeconds: 8, text: 'Příliš žluťoučký kůň & hello.' }]);
            for (const language of ['cs', 'en', 'mul']) {
                await database.query("INSERT INTO workshop_subtitles (workshop_id, language, cues, source) VALUES ($1, $2, $3, 'manual')", [WORKSHOP_ID, language, cues]);
            }
            expect((await database.query('SELECT language, cues FROM workshop_subtitles ORDER BY language')).rows).toHaveLength(3);
            await expect(database.query("INSERT INTO workshop_subtitles (workshop_id, language, cues, source) VALUES ($1, 'cs', '[]', 'manual')", [WORKSHOP_ID])).rejects.toThrow();
            for (const role of ['anon', 'authenticated']) {
                await database.exec(`SET ROLE ${role}`);
                await expect(database.query('SELECT * FROM workshop_subtitles')).rejects.toThrow(/permission denied/);
                await database.exec('RESET ROLE');
            }
            const { rows } = await database.query<{ relrowsecurity: boolean }>("SELECT relrowsecurity FROM pg_class WHERE relname = 'workshop_subtitles'");
            expect(rows[0]!.relrowsecurity).toBe(true);
            await database.query('DELETE FROM workshops WHERE id = $1', [WORKSHOP_ID]);
            expect((await database.query('SELECT * FROM workshop_subtitles')).rows).toHaveLength(0);
        } finally { await database.close(); }
    });
});

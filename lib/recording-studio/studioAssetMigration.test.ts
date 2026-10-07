import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const ASSET_ID = '11111111-1111-4111-8111-111111111111';
const PROJECT_ID = '22222222-2222-4222-8222-222222222222';
describe('private Studio asset reference/retention transactions', () => {
    it('protects referenced objects, enforces immutable identities and denies public signing metadata', async () => {
        const database = new PGlite();
        try {
            await database.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;');
            await database.exec(readFileSync('migrations/2026-10-0500-studio-media-assets.sql', 'utf8'));
            await database.query(
                `INSERT INTO studio_media_assets(id,client_asset_id,object_key,filename,content_type,byte_length,source_fingerprint,part_checksums,media_bounds,status,updated_at)
                VALUES($1::uuid,$1::uuid,'studio-assets/'||$1::text,'workshop.webm','video/webm',123,'fingerprint','["checksum"]','{}','verified','2020-01-01')`,
                [ASSET_ID],
            );
            await database.query('SELECT retain_studio_media_project_reference($1,$2)', [PROJECT_ID, ASSET_ID]);
            const cutoff = new Date().toISOString();
            expect(
                (
                    await database.query<{ claim_studio_media_cleanup: boolean }>(
                        'SELECT claim_studio_media_cleanup($1,$2,$2)',
                        [ASSET_ID, cutoff],
                    )
                ).rows[0].claim_studio_media_cleanup,
            ).toBe(false);
            await expect(
                database.query('UPDATE studio_media_assets SET byte_length=124 WHERE id=$1', [ASSET_ID]),
            ).rejects.toThrow(/immutable/);
            for (const role of ['anon', 'authenticated']) {
                await database.exec(`SET ROLE ${role}`);
                await expect(database.query('SELECT * FROM studio_media_assets')).rejects.toThrow(/permission denied/);
                await expect(
                    database.query('SELECT set_studio_media_project_references($1,ARRAY[]::uuid[])', [PROJECT_ID]),
                ).rejects.toThrow(/permission denied/);
                await database.exec('RESET ROLE');
            }
            await database.query('SELECT set_studio_media_project_references($1,ARRAY[]::uuid[])', [PROJECT_ID]);
            expect(
                (
                    await database.query<{ claim_studio_media_cleanup: boolean }>(
                        'SELECT claim_studio_media_cleanup($1,$2,$2)',
                        [ASSET_ID, cutoff],
                    )
                ).rows[0].claim_studio_media_cleanup,
            ).toBe(true);
            await expect(
                database.query('SELECT retain_studio_media_project_reference($1,$2)', [PROJECT_ID, ASSET_ID]),
            ).rejects.toThrow(/unavailable/);
            await expect(
                database.query("UPDATE studio_media_assets SET status='verified' WHERE id=$1", [ASSET_ID]),
            ).rejects.toThrow(/retired/);
        } finally {
            await database.close();
        }
    });
});

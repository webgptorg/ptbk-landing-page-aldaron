import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
describe('private independent original audio backup', () => {
    it('denies anonymous reads and retains original bytes independently of message lifetime', async () => {
        const db = new PGlite();
        try {
            await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; GRANT USAGE ON SCHEMA public TO anon,authenticated,service_role;');
            await db.exec(readFileSync('migrations/2026-11-0320-message-meeting-recordings.sql', 'utf8'));
            const id = randomUUID();
            await db.query("INSERT INTO message_recording_parts(id,recording_id,scope,title,started_at,mime_type,status) VALUES ($1,$2,'new','Meeting',now(),'audio/webm','interrupted')", [id,randomUUID()]);
            await db.query("INSERT INTO message_recording_chunks VALUES ($1,0,'private-original',12,$2)", [id,'a'.repeat(64)]);
            await expect(db.query("INSERT INTO message_recording_chunks VALUES ($1,0,'overwrite',12,$2)", [id,'b'.repeat(64)])).rejects.toThrow();
            for (const role of ['anon','authenticated']) {
                await db.exec(`SET ROLE ${role}`);
                await expect(db.query('SELECT * FROM message_recording_parts')).rejects.toThrow();
                await expect(db.query('SELECT * FROM message_recording_chunks')).rejects.toThrow();
                await db.exec('RESET ROLE');
            }
            await expect(db.query('DELETE FROM message_recording_parts WHERE id=$1', [id])).rejects.toThrow();
            expect((await db.query('SELECT object_key FROM message_recording_chunks')).rows).toEqual([{ object_key: 'private-original' }]);
        } finally { await db.close(); }
    }, 30000);
});

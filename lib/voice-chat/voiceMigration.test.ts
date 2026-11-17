import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { expect, it } from 'vitest';
it('adds private voice metadata without changing existing replies or access', async () => {
    const db = new PGlite();
    try {
        await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; GRANT USAGE ON SCHEMA public TO anon,authenticated,service_role; CREATE TABLE messages(id uuid PRIMARY KEY);');
        await db.exec(readFileSync('migrations/2026-11-0200-message-chat-history.sql', 'utf8'));
        const id = randomUUID();
        await db.query('INSERT INTO messages VALUES ($1)', [id]);
        await db.query("INSERT INTO message_chat_turns(message_id,conversation_id,request_id,request_hash,question,reply,status,completed_at) VALUES($1,$2,$3,$4,'Question','Existing answer','completed',now())",
            [id, randomUUID(), randomUUID(), 'a'.repeat(64)]);
        await db.exec(readFileSync('migrations/2026-11-1700-public-chat-voice.sql', 'utf8'));
        expect((await db.query('SELECT reply,voice_status,spoken_reply FROM message_chat_turns')).rows).toEqual([{ reply: 'Existing answer', voice_status: null, spoken_reply: null }]);
        await db.query("UPDATE message_chat_turns SET voice_status='interrupted',spoken_reply='Played prefix'");
        await expect(db.query("UPDATE message_chat_turns SET voice_status='invented'")).rejects.toThrow();
        await expect(db.query("UPDATE message_chat_turns SET spoken_reply=$1", ['x'.repeat(6001)])).rejects.toThrow();
        await db.exec('SET ROLE anon');
        await expect(db.query('SELECT spoken_reply FROM message_chat_turns')).rejects.toThrow();
    } finally { await db.close(); }
}, 30000);

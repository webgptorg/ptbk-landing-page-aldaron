import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { describe, expect, it } from 'vitest';

describe('long reply migration', () => {
    it('widens only the reply bound and preserves earlier turns and private access', async () => {
        const db = new PGlite();
        try {
            await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; GRANT USAGE ON SCHEMA public TO anon,authenticated,service_role; CREATE TABLE messages(id uuid PRIMARY KEY);');
            await db.exec(readFileSync('migrations/2026-11-0200-message-chat-history.sql', 'utf8'));
            const message = randomUUID(), conversation = randomUUID();
            await db.query('INSERT INTO messages VALUES ($1)', [message]);
            const insert = `INSERT INTO message_chat_turns(message_id,conversation_id,request_id,request_hash,question,reply,status,completed_at) VALUES ($1,$2,$3,$4,'Question',$5,'completed',now())`;
            await db.query(insert, [message, conversation, randomUUID(), 'a'.repeat(64), 'Earlier reply']);
            await expect(db.query(insert, [message, conversation, randomUUID(), 'b'.repeat(64), 'x'.repeat(15000)])).rejects.toThrow();
            await db.exec(readFileSync('migrations/2026-11-1601-long-public-chat-replies.sql', 'utf8'));
            await db.query(insert, [message, conversation, randomUUID(), 'c'.repeat(64), 'x'.repeat(48000)]);
            await expect(db.query(insert, [message, conversation, randomUUID(), 'd'.repeat(64), 'x'.repeat(48001)])).rejects.toThrow();
            expect((await db.query('SELECT reply FROM message_chat_turns ORDER BY created_at')).rows[0]).toEqual({ reply: 'Earlier reply' });
            await db.exec('SET ROLE anon');
            await expect(db.query('SELECT * FROM message_chat_turns')).rejects.toThrow();
        } finally { await db.close(); }
    }, 30000);
});

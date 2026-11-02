import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('migrations/2026-11-0200-message-chat-history.sql', 'utf8');

describe('private anonymous message conversations', () => {
    it('preserves full histories, separates messages and chats, deduplicates requests and denies public reads', async () => {
        const db = new PGlite();
        try {
            await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
                GRANT USAGE ON SCHEMA public TO anon,authenticated,service_role;
                CREATE TABLE messages(id uuid PRIMARY KEY);`);
            await db.exec(migration);
            const message = randomUUID(), otherMessage = randomUUID(), conversation = randomUUID(), otherConversation = randomUUID(), request = randomUUID();
            await db.query('INSERT INTO messages VALUES ($1),($2)', [message, otherMessage]);
            const insert = (m: string, c: string, r: string, q = 'First question') => db.query<{ id: string }>(
                'INSERT INTO message_chat_turns(message_id,conversation_id,request_id,request_hash,question) VALUES ($1,$2,$3,$4,$5) RETURNING id',
                [m,c,r,'a'.repeat(64),q]);
            const id = (await insert(message, conversation, request)).rows[0].id;
            await expect(insert(message, conversation, request)).rejects.toThrow();
            await expect(db.query("UPDATE message_chat_turns SET status='completed',completed_at=now() WHERE id=$1", [id])).rejects.toThrow();
            await db.query("UPDATE message_chat_turns SET status='completed',reply='Actual server answer',completed_at=now() WHERE id=$1", [id]);
            // Storage does not share the model's sixteen-turn context limit.
            for (let i = 1; i <= 18; i++) await insert(message, conversation, randomUUID(), `Later question ${i}`);
            const failed = (await insert(message, otherConversation, randomUUID(), 'Question before a provider failure')).rows[0].id;
            await db.query("UPDATE message_chat_turns SET status='failed',error_message='Generation failed',completed_at=now() WHERE id=$1", [failed]);
            await insert(otherMessage, conversation, request, 'Another message');
            expect((await db.query('SELECT turn_count FROM message_chat_conversation_summaries WHERE message_id=$1 AND conversation_id=$2', [message, conversation])).rows).toEqual([{ turn_count: 19 }]);
            expect((await db.query('SELECT failed_count FROM message_chat_conversation_summaries WHERE message_id=$1 AND conversation_id=$2', [message, otherConversation])).rows).toEqual([{ failed_count: 1 }]);
            expect((await db.query('SELECT reply FROM message_chat_turns WHERE id=$1', [id])).rows).toEqual([{ reply: 'Actual server answer' }]);
            for (const role of ['anon','authenticated']) {
                await db.exec(`SET ROLE ${role}`);
                await expect(db.query('SELECT * FROM message_chat_turns')).rejects.toThrow();
                await expect(db.query('SELECT * FROM message_chat_conversation_summaries')).rejects.toThrow();
                await expect(insert(message, conversation, randomUUID())).rejects.toThrow();
                await db.exec('RESET ROLE');
            }
            await db.exec('SET ROLE service_role');
            expect((await db.query('SELECT count(*)::int AS n FROM message_chat_conversation_summaries')).rows).toEqual([{ n: 3 }]);
            await db.exec('RESET ROLE');
            await db.query('DELETE FROM messages WHERE id=$1', [message]);
            expect((await db.query('SELECT question FROM message_chat_turns')).rows).toEqual([{ question: 'Another message' }]);
        } finally { await db.close(); }
    }, 30000);
});

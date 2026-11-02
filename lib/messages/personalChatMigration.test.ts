import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';

describe('personal conversations in the existing private history', () => {
    it('isolates languages and messages, deduplicates retries and denies anonymous history access', async () => {
        const db = new PGlite();
        try {
            await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE TABLE messages(id uuid PRIMARY KEY); GRANT USAGE ON SCHEMA public TO anon,authenticated,service_role;');
            await db.exec(readFileSync('migrations/2026-11-0200-message-chat-history.sql','utf8'));
            const message = randomUUID(), conversation = randomUUID(), request = randomUUID();
            await db.query('INSERT INTO messages VALUES ($1)',[message]);
            await db.query('INSERT INTO message_chat_turns(message_id,conversation_id,request_id,request_hash,question) VALUES ($1,$2,$3,$4,$5)',[message,conversation,request,'a'.repeat(64),'Existing message question']);
            await db.exec(readFileSync('migrations/2026-11-0201-personal-chat-sources.sql','utf8'));
            const insert = (source:string) => db.query('INSERT INTO message_chat_turns(source_key,conversation_id,request_id,request_hash,question) VALUES ($1,$2,$3,$4,$5)',[source,conversation,request,'b'.repeat(64),'Homepage question']);
            await insert('pavol-cs'); await insert('pavol-en');
            await expect(insert('pavol-cs')).rejects.toThrow();
            await expect(insert('message')).rejects.toThrow();
            await expect(insert('another-site')).rejects.toThrow();
            expect((await db.query('SELECT source_key FROM message_chat_conversation_summaries ORDER BY source_key')).rows).toEqual([{source_key:'message'},{source_key:'pavol-cs'},{source_key:'pavol-en'}]);
            await db.exec('SET ROLE anon');
            await expect(db.query('SELECT * FROM message_chat_turns')).rejects.toThrow();
            await expect(db.query('SELECT * FROM message_chat_conversation_summaries')).rejects.toThrow();
            await db.exec('RESET ROLE');
            await db.query('DELETE FROM messages WHERE id=$1',[message]);
            expect((await db.query('SELECT count(*)::int AS n FROM message_chat_turns')).rows).toEqual([{n:2}]);
        } finally { await db.close(); }
    }, 30000);
});

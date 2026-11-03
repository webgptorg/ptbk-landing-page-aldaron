import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';

describe('private file records attached to chat questions', () => {
    it('keeps old conversations, stores question attachments, enforces scope and denies anonymous enumeration', async () => {
        const db = new PGlite();
        try {
            await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; GRANT USAGE ON SCHEMA public TO anon,authenticated,service_role; CREATE TABLE messages(id uuid PRIMARY KEY);');
            for (const name of ['2026-11-0200-message-chat-history.sql', '2026-11-0201-personal-chat-sources.sql']) await db.exec(readFileSync(`migrations/${name}`, 'utf8'));
            const message = randomUUID(), conversation = randomUUID(), attachment = randomUUID();
            await db.query('INSERT INTO messages VALUES ($1)', [message]);
            await db.query("INSERT INTO message_chat_turns(message_id,conversation_id,request_id,request_hash,question) VALUES ($1,$2,$3,$4,'Original question')", [message,conversation,randomUUID(),'a'.repeat(64)]);
            await db.exec(readFileSync('migrations/2026-11-0302-message-chat-attachments.sql', 'utf8'));
            expect((await db.query('SELECT question,attachments FROM message_chat_turns')).rows).toEqual([{ question: 'Original question', attachments: [] }]);
            const insert = (m: string | null, source: string | null, size = 42) => db.query('INSERT INTO message_chat_attachments(id,message_id,source_key,conversation_id,object_key,file_name,content_type,byte_length) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [attachment,m,source,conversation,`message-chat-attachments/${attachment}`,'screen.png','image/png',size]);
            await expect(insert(message, 'pavol-cs')).rejects.toThrow();
            await expect(insert(null, null)).rejects.toThrow();
            await expect(insert(message, null, 4194305)).rejects.toThrow();
            await insert(message, null);
            const metadata = [{ id: attachment, name: 'screen.png', contentType: 'image/png', byteLength: 42 }];
            await db.query('UPDATE message_chat_turns SET attachments=$1::jsonb', [JSON.stringify(metadata)]);
            expect((await db.query('SELECT attachments FROM message_chat_turns')).rows).toEqual([{ attachments: metadata }]);
            for (const role of ['anon','authenticated']) {
                await db.exec(`SET ROLE ${role}`);
                await expect(db.query('SELECT * FROM message_chat_attachments')).rejects.toThrow();
                await expect(db.query('UPDATE message_chat_turns SET attachments=\'[]\'')).rejects.toThrow();
                await db.exec('RESET ROLE');
            }
            await db.query('DELETE FROM messages WHERE id=$1', [message]);
            expect((await db.query('SELECT * FROM message_chat_attachments')).rows).toEqual([]);
        } finally { await db.close(); }
    }, 30000);
});

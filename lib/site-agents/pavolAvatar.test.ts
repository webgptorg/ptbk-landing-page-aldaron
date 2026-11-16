import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { SITE_AGENT_EMBEDS } from './registry';
import { AGENT_VALUES_SCHEMA } from '@/lib/agents/agentModel';
import { PUBLIC_DOMAIN_ROUTES } from '@/lib/domains/publicDomainRouting';
import { createPavolAvatarMetadata } from '@/businesses/pavol/pavolAvatarMetadata';

describe('full personal avatar deployment', () => {
    it('has canonical noindex pages on both domains without adding indexed routes', () => {
        for (const language of ['cs', 'en'] as const) {
            const host = `pavolhejny.${language === 'cs' ? 'cz' : 'com'}`;
            const metadata = createPavolAvatarMetadata(language);
            expect(metadata.alternates?.canonical).toBe(`https://${host}/avatar`);
            expect(metadata.robots).toMatchObject({ index: false, follow: false });
            const suffixes = PUBLIC_DOMAIN_ROUTES.find(route => route.hostname === host)!.publicPathSuffixes;
            expect(suffixes.find(suffix => suffix.path === '/avatar')).toBeDefined();
            expect(suffixes.filter(suffix => suffix.isIndexed).map(suffix => suffix.path)).not.toContain('/avatar');
        }
    });
    it('seeds the detailed editable public Book without changing the lightweight agent or exposing history', async () => {
        const db = new PGlite();
        try {
            await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; GRANT USAGE ON SCHEMA public TO anon,authenticated,service_role; CREATE TABLE messages(id uuid PRIMARY KEY); CREATE TABLE workshop_agents(id uuid PRIMARY KEY,name text NOT NULL,book_source text NOT NULL,is_enabled boolean NOT NULL);');
            const lightId = randomUUID();
            await db.query('INSERT INTO workshop_agents VALUES ($1,$2,$3,true)', [lightId, 'Pavol Hejný', 'Original lightweight Book']);
            for (const name of ['2026-11-0200-message-chat-history.sql', '2026-11-0201-personal-chat-sources.sql', '2026-11-0302-message-chat-attachments.sql', '2026-11-1102-comparison-adviser.sql']) await db.exec(readFileSync(`migrations/${name}`, 'utf8'));
            const migration = readFileSync('migrations/2026-11-1600-pavol-full-avatar.sql', 'utf8');
            await db.exec(migration);
            const id = SITE_AGENT_EMBEDS['pavol-avatar'].agentId;
            const row = (await db.query<{ name: string; book_source: string; is_enabled: boolean }>('SELECT name,book_source,is_enabled FROM workshop_agents WHERE id=$1', [id])).rows[0];
            const book = row.book_source;
            expect(AGENT_VALUES_SCHEMA.safeParse({ name: row.name, bookSource: book, isEnabled: row.is_enabled }).success).toBe(true);
            expect(book.length).toBeGreaterThan(40000);
            for (const sensitive of ['libfile_', 'chatgpt.com/c/', 'slack.com/archives/', 'crm.ptbk.io', 'Samsung S23', 'Újezd', 'Neonmedia', 'manGoweb']) expect(book).not.toContain(sensitive);
            const { createAgentModelRequirements } = await import('@promptbook/core');
            const compiled = await createAgentModelRequirements(book as Parameters<typeof createAgentModelRequirements>[0]);
            const instructions = `${compiled.systemMessage}\n${compiled.promptSuffix}`;
            expect(instructions).toContain('Toto je veřejný rozhovor');
            expect(instructions).toContain('Základní hlas');
            // The legacy compiler leaves prose KNOWLEDGE out; the avatar endpoint passes the complete current Book as quoted context.
            expect(book).toContain('programování se přesouvá na vyšší úroveň abstrakce');
            expect(book).toContain('první prototyp');
            expect(compiled.isClosed).toBe(true);
            await db.query('UPDATE workshop_agents SET book_source=$1,is_enabled=false WHERE id=$2', ['Edited full Book', id]);
            await db.exec(migration);
            expect((await db.query('SELECT book_source,is_enabled FROM workshop_agents WHERE id=$1', [id])).rows).toEqual([{ book_source: 'Edited full Book', is_enabled: false }]);
            expect((await db.query('SELECT book_source FROM workshop_agents WHERE id=$1', [lightId])).rows).toEqual([{ book_source: 'Original lightweight Book' }]);
            const conversation = randomUUID(), request = randomUUID();
            for (const source of ['pavol-cs', 'pavol-en', 'site-comparison-cs', 'site-comparison-en', 'site-pavol-avatar-cs', 'site-pavol-avatar-en']) {
                await db.query("INSERT INTO message_chat_turns(source_key,conversation_id,request_id,request_hash,question) VALUES ($1,$2,$3,$4,'Question')", [source, conversation, request, 'a'.repeat(64)]);
            }
            expect((await db.query('SELECT source_key FROM message_chat_conversation_summaries')).rows).toHaveLength(6);
            for (const source of ['site-pavol-avatar-cs', 'site-pavol-avatar-en']) {
                await db.query("INSERT INTO message_chat_attachments(id,source_key,conversation_id,object_key,file_name,content_type,byte_length) VALUES ($1,$2,$3,$4,'notes.txt','text/plain',10)", [randomUUID(), source, conversation, randomUUID()]);
            }
            for (const role of ['anon', 'authenticated']) {
                await db.exec(`SET ROLE ${role}`);
                for (const table of ['message_chat_turns', 'message_chat_conversation_summaries', 'message_chat_attachments']) await expect(db.query(`SELECT * FROM ${table}`)).rejects.toThrow();
                await db.exec('RESET ROLE');
            }
        } finally { await db.close(); }
    }, 30000);
});

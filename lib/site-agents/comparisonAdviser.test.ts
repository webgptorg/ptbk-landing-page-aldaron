import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { randomUUID } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { getComparisonAgentData } from './comparisonContext';
import { SITE_AGENT_EMBEDS } from './registry';
import { COMPARISONS } from '@/businesses/new/comparisons';

describe('comparison adviser data and deployment', () => {
    it('uses the complete shared catalogue, dated evidence and distinct Promptbook licence terms', () => {
        const context = getComparisonAgentData('cs');
        expect(context.alternatives.map((item: { slug: string }) => item.slug)).toEqual(COMPARISONS.map(item => item.slug));
        expect(context.promptbook.app.terms.price.cs).toContain('399');
        expect(context.promptbook.openSource.terms.price.cs).toBe('0 Kč za povolené použití');
        expect(context.promptbook.openSource.summary.remote.status).toBe('conditional');
        expect(context.featureDefinitions.map((row: { id: string }) => row.id)).toEqual(expect.arrayContaining(['credentials', 'integrations', 'trust', 'remote', 'harnesses', 'workspace', 'model']));
        expect(context.alternatives.every((item) => item.sources.length && item.commercial.source)).toBe(true);
        expect(context.scope).toContain('No live web browsing');
    });
    it('seeds an editable ordinary Book, preserves edits and isolates private history from existing chats', async () => {
        const db = new PGlite();
        try {
            await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; GRANT USAGE ON SCHEMA public TO anon,authenticated,service_role; CREATE TABLE messages(id uuid PRIMARY KEY); CREATE TABLE workshop_agents(id uuid PRIMARY KEY,name text NOT NULL,book_source text NOT NULL,is_enabled boolean NOT NULL);');
            for (const name of ['2026-11-0200-message-chat-history.sql','2026-11-0201-personal-chat-sources.sql']) await db.exec(readFileSync(`migrations/${name}`, 'utf8'));
            const migration = readFileSync('migrations/2026-11-1102-comparison-adviser.sql', 'utf8');
            await db.exec(migration);
            const { rows } = await db.query<{ book_source: string }>('SELECT book_source FROM workshop_agents WHERE id=$1', [SITE_AGENT_EMBEDS.comparison.agentId]);
            const book = rows[0].book_source;
            const { createAgentModelRequirements } = await import('@promptbook/core');
            const compiled = await createAgentModelRequirements(book as Parameters<typeof createAgentModelRequirements>[0]);
            expect(compiled.systemMessage).toContain('Recommend competitors');
            expect(compiled.systemMessage).toContain('mild tie-breaker');
            await db.query('UPDATE workshop_agents SET book_source=$1 WHERE id=$2', ['Edited Book', SITE_AGENT_EMBEDS.comparison.agentId]);
            await db.exec(migration);
            expect((await db.query('SELECT book_source FROM workshop_agents')).rows).toEqual([{ book_source: 'Edited Book' }]);
            const conversation = randomUUID(), request = randomUUID();
            const insert = (source: string) => db.query("INSERT INTO message_chat_turns(source_key,conversation_id,request_id,request_hash,question) VALUES ($1,$2,$3,$4,'Question')",[source,conversation,request,'a'.repeat(64)]);
            for (const source of ['pavol-cs','pavol-en','site-comparison-cs','site-comparison-en']) await insert(source);
            await expect(insert('site-comparison-cs')).rejects.toThrow();
            await expect(insert('arbitrary-agent')).rejects.toThrow();
            expect((await db.query('SELECT source_key FROM message_chat_conversation_summaries')).rows).toHaveLength(4);
            for (const role of ['anon','authenticated']) {
                await db.exec(`SET ROLE ${role}`);
                await expect(db.query('SELECT * FROM message_chat_turns')).rejects.toThrow();
                await expect(db.query('SELECT * FROM message_chat_conversation_summaries')).rejects.toThrow();
                await db.exec('RESET ROLE');
            }
        } finally { await db.close(); }
    }, 30000);
});

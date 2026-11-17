import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const commerce = readFileSync(new URL('../../migrations/2026-11-1700-pavol-avatar-commerce.sql', import.meta.url), 'utf8');
const conversations = readFileSync(new URL('../../migrations/2026-11-1702-pavol-avatar-conversations.sql', import.meta.url), 'utf8');
const legacyAttachments = readFileSync(new URL('../../migrations/2026-11-0302-message-chat-attachments.sql', import.meta.url), 'utf8');
const A = 'a0000000-0000-4000-8000-000000000001';
const B = 'b0000000-0000-4000-8000-000000000002';
const C1 = 'c0000000-0000-4000-8000-000000000001';
const C2 = 'c0000000-0000-4000-8000-000000000002';
const C3 = 'c0000000-0000-4000-8000-000000000003';
const R1 = 'd0000000-0000-4000-8000-000000000001';
const R2 = 'd0000000-0000-4000-8000-000000000002';
const R3 = 'd0000000-0000-4000-8000-000000000003';
const PERIOD = '2026-11-01T00:00:00.000Z';
type Turn = {
    id: string; principal_id: string; conversation_id: string; question: string;
    status: 'pending' | 'completed' | 'failed'; reply: string | null;
};
let db: PGlite;
async function begin(
    principal = A, conversation = C1, request = R1, question = 'Review my agent specification.',
    limit = 2, channel = 'web', attachments: unknown[] = [],
) {
    const result = await db.query<{ value: { isNew: boolean; turn: Turn } }>(
        'SELECT public.avatar_begin_chat_turn($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb) AS value',
        [principal, conversation, request, question, channel, 'cs', PERIOD, limit, JSON.stringify(attachments)],
    );
    return result.rows[0].value;
}
async function finish(id: string, reply: string | null, error: string | null) {
    const result = await db.query<{ finished: boolean }>(
        'SELECT public.avatar_finish_chat_turn($1,$2,$3,$4,$5,$6) AS finished',
        [id, reply, error, 'test-model', 120, 40],
    );
    return result.rows[0].finished;
}
async function used(principal = A) {
    const result = await db.query<{ used: number }>(
        'SELECT used FROM public.avatar_usage WHERE principal_id=$1 AND period_start=$2', [principal, PERIOD],
    );
    return result.rows[0]?.used ?? 0;
}
beforeAll(async () => {
    db = new PGlite();
    // Supabase's service_role bypasses RLS; public application roles do not.
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
        CREATE TABLE public.messages(id uuid PRIMARY KEY);
        CREATE TABLE public.message_chat_turns(id uuid PRIMARY KEY);
        CREATE TABLE public.promptbook_orders(id text PRIMARY KEY);
        INSERT INTO public.promptbook_orders VALUES ('existing-promptbook-order');`);
    await db.exec(legacyAttachments);
    await db.exec(commerce);
    await db.query(`INSERT INTO public.message_chat_attachments
        (id,source_key,conversation_id,object_key,file_name,content_type,byte_length)
        VALUES($1,'pavol-cs',$2,'legacy-preserved.txt','legacy.txt','text/plain',4)`, [R3, C3]);
    await db.exec(conversations);
}, 20000);
afterAll(async () => { await db?.close(); });
beforeEach(async () => {
    await db.exec('TRUNCATE public.avatar_principals CASCADE');
    await db.query('INSERT INTO public.avatar_principals(id,email) VALUES ($1,$2),($3,$4)',
        [A, 'alice@example.test', B, 'bob@example.test']);
});

describe('avatar conversations: actual PostgreSQL functions and permissions', () => {
    it('shares a strict atomic allowance across web, MCP and Telegram without persisting a rejected turn', async () => {
        await begin(A, C1, R1, 'Web question', 2, 'web');
        await begin(A, C2, R2, 'MCP question', 2, 'mcp');
        await expect(begin(A, C3, R3, 'Telegram question', 2, 'telegram')).rejects.toThrow('avatar_quota_exceeded');
        expect(await used()).toBe(2);
        expect((await db.query('SELECT * FROM public.avatar_chat_turns')).rows).toHaveLength(2);
        expect((await db.query('SELECT * FROM public.avatar_chat_conversations')).rows).toHaveLength(2);
        expect((await db.query('SELECT * FROM public.avatar_chat_conversations WHERE id=$1', [C3])).rows).toHaveLength(0);
    });

    it('deduplicates a retry before quota charging and returns the same durable completed answer', async () => {
        const first = await begin(A, C1, R1, 'One question', 1);
        expect(first.isNew).toBe(true);
        expect(await finish(first.turn.id, 'Verified answer', null)).toBe(true);
        const retry = await begin(A, C1, R1, 'One question', 1);
        expect(retry.isNew).toBe(false);
        expect(retry.turn.id).toBe(first.turn.id);
        expect(retry.turn.reply).toBe('Verified answer');
        expect(retry.turn.status).toBe('completed');
        expect(await used()).toBe(1);
        expect((await db.query('SELECT * FROM public.avatar_chat_turns')).rows).toHaveLength(1);
    });

    it('rejects reuse of a request identifier for changed text, conversation or files without charging again', async () => {
        await begin();
        await expect(begin(A, C1, R1, 'Changed question')).rejects.toThrow('avatar_request_conflict');
        await expect(begin(A, C2, R1)).rejects.toThrow('avatar_request_conflict');
        await expect(begin(A, C1, R1, 'Review my agent specification.', 2, 'web', [{ id: R2 }]))
            .rejects.toThrow('avatar_request_conflict');
        expect(await used()).toBe(1);
        expect((await db.query('SELECT * FROM public.avatar_chat_conversations')).rows).toHaveLength(1);
    });

    it('rejects another account taking over a conversation and scopes retry identifiers to their owner', async () => {
        const alice = await begin();
        await expect(begin(B, C1, R2)).rejects.toThrow('avatar_conversation_forbidden');
        expect(await used(B)).toBe(0);
        const bob = await begin(B, C2, R1);
        expect(bob.isNew).toBe(true);
        expect(bob.turn.principal_id).toBe(B);
        expect(alice.turn.principal_id).toBe(A);
        expect(bob.turn.id).not.toBe(alice.turn.id);
        expect(await used(A)).toBe(1);
        expect(await used(B)).toBe(1);
    });

    it('refunds one failed generation exactly once and never lets a late error overwrite a completed answer', async () => {
        const failed = await begin();
        expect(await used()).toBe(1);
        expect(await finish(failed.turn.id, null, 'Provider failed')).toBe(true);
        expect(await used()).toBe(0);
        expect(await finish(failed.turn.id, null, 'Duplicate failure delivery')).toBe(false);
        expect(await finish(failed.turn.id, 'Late answer', null)).toBe(false);
        expect(await used()).toBe(0);
        const completed = await begin(A, C1, R2);
        expect(await finish(completed.turn.id, 'Good answer', null)).toBe(true);
        expect(await finish(completed.turn.id, null, 'Late failure')).toBe(false);
        expect(await used()).toBe(1);
        const result = await db.query<{ status: string; reply: string; input_tokens: number; output_tokens: number }>(
            'SELECT status,reply,input_tokens,output_tokens FROM public.avatar_chat_turns WHERE id=$1', [completed.turn.id],
        );
        expect(result.rows[0]).toMatchObject({ status: 'completed', reply: 'Good answer' });
        expect(Number(result.rows[0].input_tokens)).toBe(120);
        expect(Number(result.rows[0].output_tokens)).toBe(40);
    });

    it('rejects ambiguous final results and malformed turns with transactional quota rollback', async () => {
        const first = await begin();
        await expect(finish(first.turn.id, null, null)).rejects.toThrow('avatar_invalid_result');
        await expect(finish(first.turn.id, 'Reply', 'Error')).rejects.toThrow('avatar_invalid_result');
        await expect(begin(A, C2, R2, '', 2)).rejects.toThrow('avatar_invalid_input');
        await expect(begin(A, C2, R2, 'Question', 0)).rejects.toThrow('avatar_invalid_input');
        await expect(begin(C3, C2, R2)).rejects.toThrow('avatar_unknown_principal');
        expect(await used()).toBe(1);
        const state = await db.query<{ status: string }>('SELECT status FROM public.avatar_chat_turns WHERE id=$1', [first.turn.id]);
        expect(state.rows[0].status).toBe('pending');
    });

    it('enforces existing principal/conversation foreign keys and cascades account-owned history', async () => {
        await expect(db.query(`INSERT INTO public.avatar_chat_conversations(id,principal_id,channel)
            VALUES($1,$2,'web')`, [C1, C3])).rejects.toThrow('foreign key');
        await expect(db.query(`INSERT INTO public.avatar_chat_turns
            (principal_id,conversation_id,request_id,period_start,question) VALUES($1,$2,$3,$4,'Question')`,
            [A, C1, R1, PERIOD])).rejects.toThrow('foreign key');
        await begin();
        await db.query('DELETE FROM public.avatar_principals WHERE id=$1', [A]);
        expect((await db.query('SELECT * FROM public.avatar_chat_conversations')).rows).toHaveLength(0);
        expect((await db.query('SELECT * FROM public.avatar_chat_turns')).rows).toHaveLength(0);
        expect((await db.query('SELECT * FROM public.avatar_usage')).rows).toHaveLength(0);
        expect((await db.query('SELECT * FROM public.avatar_principals WHERE id=$1', [B])).rows).toHaveLength(1);
    });

    it('denies anonymous/authenticated table and function access, with RLS as a second barrier', async () => {
        await begin();
        const signatures = [
            'public.avatar_begin_chat_turn(uuid,uuid,uuid,text,text,text,timestamp with time zone,integer,jsonb)',
            'public.avatar_finish_chat_turn(uuid,text,text,text,bigint,bigint)',
        ];
        for (const role of ['anon', 'authenticated']) {
            for (const table of ['avatar_chat_conversations', 'avatar_chat_turns']) {
                const privilege = await db.query<{ allowed: boolean }>(
                    'SELECT has_table_privilege($1,$2,$3) AS allowed', [role, 'public.' + table, 'SELECT,INSERT,UPDATE,DELETE'],
                );
                expect(privilege.rows[0].allowed).toBe(false);
            }
            for (const signature of signatures) {
                const privilege = await db.query<{ allowed: boolean }>(
                    "SELECT has_function_privilege($1,$2,'EXECUTE') AS allowed", [role, signature],
                );
                expect(privilege.rows[0].allowed).toBe(false);
            }
        }
        const flags = await db.query<{ relrowsecurity: boolean }>(
            "SELECT relrowsecurity FROM pg_class WHERE relname IN ('avatar_chat_conversations','avatar_chat_turns')",
        );
        expect(flags.rows).toHaveLength(2);
        expect(flags.rows.every((row) => row.relrowsecurity)).toBe(true);
        await db.exec('GRANT SELECT ON public.avatar_chat_conversations,public.avatar_chat_turns TO anon; SET ROLE anon');
        try {
            expect((await db.query('SELECT * FROM public.avatar_chat_conversations')).rows).toHaveLength(0);
            expect((await db.query('SELECT * FROM public.avatar_chat_turns')).rows).toHaveLength(0);
        } finally {
            await db.exec('RESET ROLE; REVOKE SELECT ON public.avatar_chat_conversations,public.avatar_chat_turns FROM anon');
        }
    });

    it('replays the migration while preserving legacy uploads and unrelated product orders', async () => {
        await begin();
        await db.exec(conversations);
        expect(await used()).toBe(1);
        expect((await db.query('SELECT * FROM public.avatar_chat_turns')).rows).toHaveLength(1);
        expect((await db.query('SELECT object_key FROM public.message_chat_attachments WHERE id=$1', [R3])).rows)
            .toEqual([{ object_key: 'legacy-preserved.txt' }]);
        expect((await db.query('SELECT * FROM public.promptbook_orders')).rows)
            .toEqual([{ id: 'existing-promptbook-order' }]);
        for (const source of ['avatar-account-cs', 'avatar-account-en']) {
            const id = source.endsWith('-cs') ? R1 : R2;
            await db.query(`INSERT INTO public.message_chat_attachments
                (id,source_key,conversation_id,object_key,file_name,content_type,byte_length)
                VALUES($1,$2,$3,$4,'private.txt','text/plain',4)`, [id, source, C1, source + '.txt']);
        }
        await db.query("DELETE FROM public.message_chat_attachments WHERE source_key LIKE 'avatar-account-%'");
    });
});

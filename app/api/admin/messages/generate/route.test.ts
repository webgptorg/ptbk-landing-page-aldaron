import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ guard: vi.fn(), load: vi.fn(), run: vi.fn() }));
vi.mock('@/lib/admin/adminApiGuard', () => ({ getUnauthorizedResponseOrNull: mocks.guard }));
vi.mock('@/lib/agents/agentDatabase', () => ({ loadManagedAgent: mocks.load }));
vi.mock('@/lib/agents/agentRuntime', () => ({ runManagedAgent: mocks.run }));
import { POST } from './route';
import { TEST_MESSAGE } from '@/lib/messages/messageTestFixtures';
const context = `  Original decision and qualifications.\n${'Full reasoning. '.repeat(1000)}\nFinal practical request.  `;
const input = { context, agentId: TEST_MESSAGE.agentId };
const summary = { maxCharacters: 300, format: 'bullets' };
const request = (body: unknown) => new NextRequest('https://ptbk.io/api/admin/messages/generate', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});
beforeEach(() => {
    vi.resetAllMocks(); mocks.guard.mockResolvedValue(null); mocks.load.mockResolvedValue({ id: input.agentId });
});
describe('message generation and targeted summaries', () => {
    it.each([401, 403])('requires administration access before generating (%s)', async status => {
        mocks.guard.mockResolvedValueOnce(Response.json({ error: 'Denied' }, { status }));
        expect((await POST(request({ ...input, summary }))).status).toBe(status);
        expect(mocks.load).not.toHaveBeenCalled(); expect(mocks.run).not.toHaveBeenCalled();
    });
    it('derives only the summary from the exact complete context, with an enforced size and chosen format', async () => {
        mocks.run.mockResolvedValueOnce('```json\n{"markdown":"- Dokončíme první použití."}\n```');
        const response = await POST(request({ ...input, summary }));
        expect(response.status).toBe(200);
        expect(response.headers.get('cache-control')).toBe('no-store');
        expect(await response.json()).toEqual({ markdown: '- Dokončíme první použití.' });
        expect(mocks.run).toHaveBeenCalledOnce();
        expect(JSON.parse(mocks.run.mock.calls[0][2])).toEqual({ quotedContext: context });
        expect(mocks.run.mock.calls[0][1]).toContain('at most 300 characters');
        expect(mocks.run.mock.calls[0][1]).toContain('Markdown bullet list');
        expect(mocks.run.mock.calls[0][1]).toContain('ENTIRE quoted original context');
    });
    it.each([
        { ...summary, maxCharacters: 99 }, { ...summary, maxCharacters: 50_001 },
        { ...summary, maxCharacters: 300.5 }, { ...summary, format: 'unknown' },
    ])('rejects invalid targets before calling the model: %j', async invalid => {
        expect((await POST(request({ ...input, summary: invalid }))).status).toBe(400);
        expect(mocks.run).not.toHaveBeenCalled();
    });
    it('does not accept a previous summary as an extra source field', async () => {
        expect((await POST(request({ ...input, summary, markdown: 'Lossy prior summary.' }))).status).toBe(400);
        expect(mocks.run).not.toHaveBeenCalled();
    });
    it('rejects over-limit output without truncation or an automatic paid retry', async () => {
        mocks.run.mockResolvedValueOnce(JSON.stringify({ markdown: 'a'.repeat(301) }));
        const response = await POST(request({ ...input, summary }));
        expect(response.status).toBe(502);
        expect(await response.json()).toEqual({ error: expect.stringContaining('limit 300') });
        expect(mocks.run).toHaveBeenCalledOnce();
    });
    it('retains the existing three-field generation when no summary target is supplied', async () => {
        const texts = { title: TEST_MESSAGE.title, markdown: TEST_MESSAGE.markdown, introduction: TEST_MESSAGE.introduction };
        mocks.run.mockResolvedValueOnce(JSON.stringify(texts));
        const response = await POST(request(input));
        expect(response.status).toBe(200); expect(await response.json()).toEqual(texts);
    });
});

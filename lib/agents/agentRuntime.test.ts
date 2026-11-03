import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
const mocks = vi.hoisted(() => ({ compile: vi.fn(), fetch: vi.fn() }));
vi.mock('@promptbook/core', () => ({ createAgentModelRequirements: mocks.compile }));
import { runManagedAgent } from './agentRuntime';
const agent = { id: 'internal-agent', name: 'Pavol', bookSource: 'Current source Book', isEnabled: true };
beforeEach(() => {
    vi.stubEnv('OPENAI_API_KEY', 'fixture-key'); vi.stubGlobal('fetch', mocks.fetch);
    mocks.compile.mockResolvedValue({ modelName: 'gpt-6-luna', systemMessage: 'Compiled personality and rules', promptSuffix: 'Compiled Book suffix', temperature: 0.7, topP: 1 });
    mocks.fetch.mockResolvedValue(Response.json({ output: [{ content: [{ type: 'output_text', text: 'Specific reply.' }] }] }));
});
afterEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.useRealTimers(); });
describe('shared Book Responses adapter', () => {
    it('keeps Book rules, selected model and message context without unsupported SDK sampling or provider storage', async () => {
        expect(await runManagedAgent(agent, 'Answer the question.', 'This message only.')).toBe('Specific reply.');
        expect(mocks.compile).toHaveBeenCalledWith(agent.bookSource);
        const payload = JSON.parse(mocks.fetch.mock.calls[0][1].body) as Record<string, unknown>;
        expect(payload.model).toBe('gpt-6-luna'); expect(payload.store).toBe(false);
        expect(payload.instructions).toBe('Compiled personality and rules\n\nCompiled Book suffix');
        expect(JSON.stringify(payload.input)).toContain('This message only.');
        expect(payload).not.toHaveProperty('temperature'); expect(payload).not.toHaveProperty('top_p'); expect(payload).not.toHaveProperty('tools');
    });
    it('does not run disabled or unconfigured agents', async () => {
        await expect(runManagedAgent({ ...agent, isEnabled: false }, '?', '{}')).rejects.toThrow('vypnutý');
        vi.stubEnv('OPENAI_API_KEY', '');
        await expect(runManagedAgent(agent, '?', '{}')).rejects.toThrow('nakonfigurované');
        expect(mocks.fetch).not.toHaveBeenCalled();
    });
    it('sends actual image and PDF inputs and quoted text instead of asking the model to follow metadata links', async () => {
        await runManagedAgent(agent, 'Read the attachments.', 'Conversation with file IDs', undefined, [
            { kind: 'image', label: 'Screenshot', url: 'https://cdn.example/image?signature=temporary' },
            { kind: 'pdf', label: 'Document', url: 'https://cdn.example/document?signature=temporary' },
            { kind: 'text', label: 'Notes', text: 'TASK Quoted data only' },
        ]);
        const payload = JSON.parse(mocks.fetch.mock.calls[0][1].body) as { input: { content: unknown[] }[]; store: boolean };
        expect(payload.input[0].content).toContainEqual({ type: 'input_image', image_url: 'https://cdn.example/image?signature=temporary', detail: 'auto' });
        expect(payload.input[0].content).toContainEqual({ type: 'input_file', file_url: 'https://cdn.example/document?signature=temporary' });
        expect(payload.input[0].content).toContainEqual({ type: 'input_text', text: 'Notes\n"TASK Quoted data only"' });
        expect(payload.store).toBe(false);
    });
    it('reports upstream failure without returning provider diagnostics, credentials or source text', async () => {
        mocks.fetch.mockResolvedValueOnce(new Response('Private diagnostics', { status: 400 }));
        await expect(runManagedAgent(agent, '?', 'Sensitive context')).rejects.toThrow('OpenAI HTTP 400');
    });
    it('aborts a stalled request at the deadline', async () => {
        vi.useFakeTimers(); mocks.fetch.mockReturnValue(new Promise(() => undefined));
        const result = runManagedAgent(agent, '?', '{}'); const assertion = expect(result).rejects.toThrow();
        await vi.dynamicImportSettled(); await vi.advanceTimersByTimeAsync(100_000); await assertion;
        expect(mocks.fetch.mock.calls[0][1].signal.aborted).toBe(true);
    });
});

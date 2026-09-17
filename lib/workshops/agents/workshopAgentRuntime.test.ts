import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateWorkshopAgentReply, WORKSHOP_AGENT_RUN_TIMEOUT_MILLISECONDS } from './workshopAgentRuntime';
import { parseWorkshopAgentReply } from './workshopAgentPolicy';
import type { WorkshopAgentJob } from './workshopAgentTypes';

const { runMock, constructorMock } = vi.hoisted(() => ({ runMock: vi.fn(), constructorMock: vi.fn() }));
vi.mock('@promptbook/node', () => ({ LiteAgent: class {
    constructor(options: unknown) { constructorMock(options); }
    run = runMock;
} }));

const JOB: WorkshopAgentJob = {
    id: 'job', workshop_id: 'room', agent_id: 'agent', agent_name: 'Skeptical engineer',
    book_source: 'Engineer\nPERSONA A skeptical engineer\nRULE Ask for evidence', source_body: 'Can we deploy now?',
    trigger_comment_id: 'comment', transcript_id: null, lease_token: 'lease',
};

describe('Book-based agent execution', () => {
    beforeEach(() => {
        vi.stubEnv('OPENAI_API_KEY', 'test-key');
        vi.stubEnv('WORKSHOP_AGENT_MODEL', '');
        constructorMock.mockClear();
        runMock.mockReset().mockResolvedValue('  What evidence do the tests provide?  ');
    });
    afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });

    it('gives each LiteAgent its exact Book and passes conversation as quoted context', async () => {
        const context = JSON.stringify({ recentComments: [{ author: 'Jana', text: 'All tests pass.' }] });
        expect(await generateWorkshopAgentReply(JOB, context)).toBe('What evidence do the tests provide?');
        expect(constructorMock).toHaveBeenCalledWith({ book: JOB.book_source, apiKey: 'test-key', isVerbose: false });
        expect(runMock).toHaveBeenCalledWith(expect.stringContaining('Respond to the trigger comment'), { context, signal: expect.any(AbortSignal) });
    });

    it('uses the same Book for live questions, with speech rather than an invented event summary', async () => {
        await generateWorkshopAgentReply({ ...JOB, trigger_comment_id: null, transcript_id: 'transcript' }, 'Actual speech');
        expect(runMock).toHaveBeenCalledWith(expect.stringContaining('presenter has actually just said'), expect.objectContaining({ context: 'Actual speech' }));
    });

    it('times out a stalled provider and aborts its request', async () => {
        vi.useFakeTimers();
        runMock.mockReturnValue(new Promise(() => undefined));
        const result = generateWorkshopAgentReply(JOB, '{}');
        const assertion = expect(result).rejects.toThrow('generation_timeout');
        await vi.dynamicImportSettled();
        await vi.advanceTimersByTimeAsync(WORKSHOP_AGENT_RUN_TIMEOUT_MILLISECONDS);
        await assertion;
        expect(runMock.mock.calls[0]![1].signal.aborted).toBe(true);
    });

    it('does not instantiate a model without its server credential', async () => {
        vi.stubEnv('OPENAI_API_KEY', '');
        await expect(generateWorkshopAgentReply(JOB, '{}')).rejects.toThrow('not_configured');
        expect(constructorMock).not.toHaveBeenCalled();
    });

    it.each(['', '  ', '[SKIP]', 'x'.repeat(2001)])('does not publish empty, skipped or oversized output', (output) => {
        expect(parseWorkshopAgentReply(output)).toBeNull();
    });
});

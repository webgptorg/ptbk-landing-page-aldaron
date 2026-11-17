import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
const mocks = vi.hoisted(() => ({ run: vi.fn(), finish: vi.fn(), speech: vi.fn() }));
vi.mock('@/lib/agents/agentRuntime', () => ({ runManagedAgent: mocks.run }));
vi.mock('@/lib/messages/messageConversationDatabase', () => ({ finishMessageChatTurn: mocks.finish }));
vi.mock('@/lib/messages/messageDatabase', () => ({ MESSAGE_RESPONSE_HEADERS: { 'Cache-Control': 'private, no-store' } }));
vi.mock('./elevenLabsVoice', () => ({ streamPavolSpeech: mocks.speech }));
import { splitVoicePhrase, streamVoiceReply } from './streamVoiceReply';
import type { VoiceChatEvent } from './types';
const subject = { turnId: 'recorded-turn', agent: { id: 'agent', name: 'Pavol', bookSource: 'Existing Book', isEnabled: true },
    instruction: 'Use existing context.', context: 'Only this conversation', inputs: [], voiceId: 'real-pavol' };
beforeEach(() => { mocks.finish.mockResolvedValue(undefined); mocks.speech.mockImplementation(async (_id, _text, _previous, _signal, emit) => emit('AAAA', true)); });
afterEach(() => vi.resetAllMocks());
describe('existing agent to streamed Pavol speech', () => {
    it('streams text and speech while preserving the same agent, context and durable answer', async () => {
        mocks.run.mockImplementation(async (_agent, _instruction, _context, _signal, _inputs, _options, stream) => {
            stream.onText('Ahoj. Toto je první dostatečně dlouhá věta. '); await Promise.resolve();
            stream.onText('Druhá krátká odpověď.'); return 'Ahoj. Toto je první dostatečně dlouhá věta. Druhá krátká odpověď.';
        });
        const response = streamVoiceReply(new Request('https://pavolhejny.cz/api'), subject);
        const events = (await response.text()).trim().split('\n').map(line => JSON.parse(line) as VoiceChatEvent);
        expect(events[0]).toEqual({ type: 'start', turnId: 'recorded-turn' });
        expect(events.find(e => e.type === 'audio')).toMatchObject({ audio: 'AAAA', text: 'Ahoj. Toto je první dostatečně dlouhá věta.' });
        expect(mocks.run.mock.calls[0][0]).toBe(subject.agent); expect(mocks.run.mock.calls[0][2]).toBe(subject.context);
        expect(mocks.speech.mock.calls.every(call => call[0] === 'real-pavol')).toBe(true);
        expect(mocks.finish).toHaveBeenCalledWith('recorded-turn', { reply: expect.stringContaining('Druhá krátká odpověď.') });
        expect(events.at(-1)).toMatchObject({ type: 'complete' });
    });
    it('keeps text when speech fails and never retries paid synthesis', async () => {
        mocks.run.mockImplementation(async (...args) => { args[6].onText('Toto je moje odpověď pro tuto konverzaci.'); return 'Toto je moje odpověď pro tuto konverzaci.'; });
        mocks.speech.mockRejectedValue(new Error('Došly kredity ElevenLabs.'));
        const events = (await streamVoiceReply(new Request('https://pavolhejny.cz/api'), subject).text()).trim().split('\n').map(line => JSON.parse(line) as VoiceChatEvent);
        expect(mocks.speech).toHaveBeenCalledTimes(1);
        expect(events.find(e => e.type === 'complete')).toBeDefined();
        expect(events.at(-1)).toMatchObject({ type: 'error', error: 'Došly kredity ElevenLabs.' });
    });
    it('handles an early short sentence and bounds unpunctuated chunks', () => {
        expect(splitVoicePhrase('Ahoj. Následuje první dostatečně dlouhá věta. Další.')).toEqual({
            phrase: 'Ahoj. Následuje první dostatečně dlouhá věta. ', rest: 'Další.' });
        expect(splitVoicePhrase('Slovo '.repeat(50))!.phrase.length).toBeLessThanOrEqual(220);
    });
});

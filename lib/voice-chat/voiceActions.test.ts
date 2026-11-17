import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
vi.mock('server-only', () => ({}));
const mocks = vi.hoisted(() => ({ agent: vi.fn(), playback: vi.fn(), fetch: vi.fn() }));
vi.mock('@/lib/agents/agentDatabase', () => ({ loadManagedAgent: mocks.agent }));
vi.mock('@/lib/messages/messageConversationDatabase', () => ({ recordMessageVoicePlayback: mocks.playback }));
vi.mock('@/lib/messages/messageDatabase', () => ({ MESSAGE_RESPONSE_HEADERS: { 'Cache-Control': 'private, no-store' } }));
import { handleVoiceAction } from './voiceActions';
import { createVoiceSession } from './voiceSession';
const source = { sourceKey: 'site-pavol-avatar-cs' as const }, subject = { source, agentId: 'avatar' };
const request = () => new Request('https://pavolhejny.cz/api', { headers: { 'x-forwarded-for': randomUUID() } });
beforeEach(() => {
    vi.stubEnv('ELEVENLABS_API_KEY', randomUUID()); vi.stubEnv('OPENAI_API_KEY', 'model-fixture'); vi.stubEnv('ELEVENLABS_VOICE_ID', '');
    vi.stubGlobal('fetch', mocks.fetch); mocks.agent.mockResolvedValue({ isEnabled: true }); mocks.playback.mockResolvedValue(undefined);
});
afterEach(() => { vi.resetAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('voice setup and transcript acknowledgements', () => {
    it('requires exactly Pavol’s voice before issuing a single-use realtime token', async () => {
        mocks.fetch.mockResolvedValueOnce(Response.json({ voices: [{ voice_id: 'pavol-voice', name: 'Pavol Hejný 2026' }, { voice_id: 'stock', name: 'Generic' }] }))
            .mockResolvedValueOnce(Response.json({ token: 'one-use' }));
        const response = await handleVoiceAction(request(), subject, { action: 'voice-start', conversationId: randomUUID() });
        expect(response.status).toBe(200); expect(response.headers.get('Cache-Control')).toContain('no-store');
        const result = await response.json();
        expect(result).toMatchObject({ token: 'one-use', voiceName: 'Pavol Hejný 2026', maxSeconds: 600 });
        expect(JSON.stringify(result)).not.toContain(process.env.ELEVENLABS_API_KEY);
        expect(mocks.fetch.mock.calls[1][0]).toBe('https://api.elevenlabs.io/v1/single-use-token/realtime_scribe');
        expect(mocks.fetch.mock.calls.map(call => call[0]).join(' ')).not.toMatch(/subscription|payment|agents\/create/);
    });
    it('never substitutes a stock, ambiguous or wrongly configured voice', async () => {
        for (const voices of [[{ voice_id: 'generic', name: 'Generic' }], [{ voice_id: 'a', name: 'Pavol Hejný 2026' }, { voice_id: 'b', name: 'Pavol Hejný 2026' }]]) {
            mocks.fetch.mockResolvedValueOnce(Response.json({ voices }));
            expect((await handleVoiceAction(request(), subject, { action: 'voice-start', conversationId: randomUUID() })).status).toBe(502);
        }
        expect(mocks.fetch).toHaveBeenCalledTimes(2);
        vi.stubEnv('ELEVENLABS_VOICE_ID', 'configured-id');
        mocks.fetch.mockResolvedValueOnce(Response.json({ voice_id: 'configured-id', name: 'Generic' }));
        expect((await handleVoiceAction(request(), subject, { action: 'voice-start', conversationId: randomUUID() })).status).toBe(502);
    });
    it('does not issue paid capabilities for disabled or unconfigured agents', async () => {
        mocks.agent.mockResolvedValueOnce({ isEnabled: false });
        expect((await handleVoiceAction(request(), subject, { action: 'voice-start', conversationId: randomUUID() })).status).toBe(503);
        vi.stubEnv('ELEVENLABS_API_KEY', '');
        expect((await handleVoiceAction(request(), subject, { action: 'voice-start', conversationId: randomUUID() })).status).toBe(503);
        expect(mocks.fetch).not.toHaveBeenCalled();
    });
    it('accepts only bounded playback reports for the signed conversation, without generating speech', async () => {
        const req = request(), conversationId = randomUUID(), turnId = randomUUID();
        const body = { action: 'voice-playback', conversationId, turnId, voiceSession: createVoiceSession(source, conversationId, req, 'pavol'),
            status: 'interrupted', spokenText: 'A completed phrase.' };
        expect((await handleVoiceAction(req, subject, body)).status).toBe(200);
        expect(mocks.playback).toHaveBeenCalledWith(source, conversationId, turnId, expect.objectContaining({ status: 'interrupted', spokenText: 'A completed phrase.' }));
        expect((await handleVoiceAction(req, subject, { ...body, conversationId: randomUUID() })).status).toBe(403);
        expect((await handleVoiceAction(req, subject, { ...body, spokenText: 'x'.repeat(6001) })).status).toBe(403);
        expect(mocks.fetch).not.toHaveBeenCalled();
    });
});

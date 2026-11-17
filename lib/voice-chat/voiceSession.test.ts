import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
vi.mock('server-only', () => ({}));
import { createVoiceSession, verifyVoiceSession } from './voiceSession';
const source = { sourceKey: 'site-pavol-avatar-cs' as const }, conversation = randomUUID();
const request = (ip = '192.0.2.10') => new Request('https://pavolhejny.cz/api', { headers: { 'x-forwarded-for': ip } });
beforeEach(() => { vi.stubEnv('ELEVENLABS_API_KEY', 'signing-fixture'); vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-17T10:00:00Z')); });
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });
describe('voice session capabilities', () => {
    it('binds one source, conversation, address and short expiry', () => {
        const token = createVoiceSession(source, conversation, request(), 'pavol');
        expect(verifyVoiceSession(token, source, conversation, request())?.voiceId).toBe('pavol');
        expect(verifyVoiceSession(token, { sourceKey: 'site-pavol-avatar-en' }, conversation, request())).toBeNull();
        expect(verifyVoiceSession(token, source, randomUUID(), request())).toBeNull();
        expect(verifyVoiceSession(token, source, conversation, request('192.0.2.20'))).toBeNull();
        expect(verifyVoiceSession(token + 'x', source, conversation, request())).toBeNull();
        vi.advanceTimersByTime(600_000);
        expect(verifyVoiceSession(token, source, conversation, request())).toBeNull();
        expect(verifyVoiceSession(token, source, conversation, request(), true)).not.toBeNull();
        vi.advanceTimersByTime(180_000);
        expect(verifyVoiceSession(token, source, conversation, request(), true)).toBeNull();
    });
    it('rejects malformed tokens and key rotation', () => {
        const token = createVoiceSession(source, conversation, request(), 'pavol');
        expect(token).not.toContain('signing-fixture');
        for (const bad of [null, {}, '', '..', token + '.extra', 'x'.repeat(2001)]) expect(verifyVoiceSession(bad, source, conversation, request())).toBeNull();
        vi.stubEnv('ELEVENLABS_API_KEY', 'rotated');
        expect(verifyVoiceSession(token, source, conversation, request())).toBeNull();
    });
});

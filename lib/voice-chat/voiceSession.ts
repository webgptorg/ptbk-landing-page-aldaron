import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import type { ChatConversationSource } from '@/lib/messages/messageConversationDatabase';
import { VOICE_SESSION_SECONDS } from './types';

const schema = z.object({ source: z.string(), conversationId: z.string().uuid(), ip: z.string(), voiceId: z.string().min(1).max(100), expires: z.number().int() });
export type VoiceClaims = z.infer<typeof schema>;
const sourceId = (source: ChatConversationSource) => typeof source === 'string' ? 'message:' + source : 'site:' + source.sourceKey;
const sign = (value: string) => createHmac('sha256', process.env.ELEVENLABS_API_KEY!.trim()).update('public-voice-v1:' + value).digest();
const voiceIp = (request: Request) => createHmac('sha256', process.env.ELEVENLABS_API_KEY!.trim())
    .update(request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown').digest('hex');

export function createVoiceSession(source: ChatConversationSource, conversationId: string, request: Request, voiceId: string) {
    const claims: VoiceClaims = { source: sourceId(source), conversationId, ip: voiceIp(request), voiceId,
        expires: Math.floor(Date.now() / 1000) + VOICE_SESSION_SECONDS };
    const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
    return payload + '.' + sign(payload).toString('base64url');
}
export function verifyVoiceSession(token: unknown, source: ChatConversationSource, conversationId: string, request: Request, allowPlayback = false): VoiceClaims | null {
    if (!process.env.ELEVENLABS_API_KEY?.trim() || typeof token !== 'string' || token.length > 2000) return null;
    try {
        const [payload, signature, extra] = token.split('.');
        if (extra || !signature) return null;
        const expected = sign(payload), actual = Buffer.from(signature, 'base64url');
        if (actual.length !== expected.length || !timingSafeEqual(expected, actual)) return null;
        const claims = schema.parse(JSON.parse(Buffer.from(payload, 'base64url').toString()));
        const now = Math.floor(Date.now() / 1000);
        if (claims.source !== sourceId(source) || claims.conversationId !== conversationId || claims.ip !== voiceIp(request)
            || claims.expires + (allowPlayback ? 180 : 0) <= now || claims.expires > now + VOICE_SESSION_SECONDS) return null;
        return claims;
    } catch { return null; }
}

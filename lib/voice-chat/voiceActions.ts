import 'server-only';
import { z } from 'zod';
import { loadManagedAgent } from '@/lib/agents/agentDatabase';
import { MESSAGE_RESPONSE_HEADERS } from '@/lib/messages/messageDatabase';
import { recordMessageVoicePlayback, type ChatConversationSource } from '@/lib/messages/messageConversationDatabase';
import { allowPublicChatRequest } from '@/lib/messages/publicChatRateLimit';
import { createVoiceSession, verifyVoiceSession } from './voiceSession';
import { PAVOL_CHAT_VOICE_NAME, resolvePavolChatVoice } from './elevenLabsVoice';
import { VOICE_REPLY_MAX_CHARACTERS, VOICE_SESSION_SECONDS } from './types';

export async function handleVoiceAction(request: Request, subject: { source: ChatConversationSource; agentId: string }, body: Record<string, unknown>): Promise<Response> {
    const json = (value: unknown, status = 200) => Response.json(value, { status, headers: MESSAGE_RESPONSE_HEADERS });
    const parsed = z.object({ conversationId: z.string().uuid() }).safeParse(body);
    if (!parsed.success) return json({ error: 'Neplatný požadavek hlasového chatu.' }, 400);
    const { conversationId } = parsed.data;
    if (body.action === 'voice-playback') {
        const playback = z.object({ turnId: z.string().uuid(), status: z.enum(['completed', 'interrupted', 'failed']),
            spokenText: z.string().max(VOICE_REPLY_MAX_CHARACTERS) }).safeParse(body);
        if (!playback.success || !verifyVoiceSession(body.voiceSession, subject.source, conversationId, request, true)) return json({ error: 'Hlasová relace vypršela.' }, 403);
        try { await recordMessageVoicePlayback(subject.source, conversationId, playback.data.turnId, playback.data); }
        catch { return json({ error: 'Stav přehrávání se nepodařilo uložit.' }, 503); }
        return json({ ok: true });
    }
    if (body.action !== 'voice-start') return json({ error: 'Neplatná hlasová akce.' }, 400);
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (!allowPublicChatRequest('voice-start:' + ip, 5)) return json({ error: 'Hlasový chat byl spuštěn příliš často. Zkus to za chvíli.' }, 429);
    const key = process.env.ELEVENLABS_API_KEY?.trim();
    if (!key || !process.env.OPENAI_API_KEY?.trim()) return json({ error: 'Hlasový chat teď není dostupný. Můžeš pokračovat textem.' }, 503);
    try {
        const agent = await loadManagedAgent(subject.agentId);
        if (!agent?.isEnabled) return json({ error: 'Tento chat teď není dostupný.' }, 503);
        const signal = AbortSignal.any([request.signal, AbortSignal.timeout(20_000)]);
        const voiceId = await resolvePavolChatVoice(key, signal);
        const response = await fetch('https://api.elevenlabs.io/v1/single-use-token/realtime_scribe', {
            method: 'POST', headers: { 'xi-api-key': key }, signal, cache: 'no-store',
        });
        if (!response.ok) return json({ error: 'ElevenLabs nepovolilo živý přepis. Zkontrolujte oprávnění Speech to Text a kredity.' }, 502);
        const token = z.object({ token: z.string().min(1) }).safeParse(await response.json());
        if (!token.success) throw new Error('ElevenLabs nevrátilo oprávnění k přepisu.');
        return json({ token: token.data.token, voiceSession: createVoiceSession(subject.source, conversationId, request, voiceId),
            voiceName: PAVOL_CHAT_VOICE_NAME, maxSeconds: VOICE_SESSION_SECONDS, modelId: 'scribe_v2_realtime' });
    } catch {
        return json({ error: 'Hlasový chat se nepodařilo připojit. Ověřte dostupnost hlasu Pavol Hejný 2026, oprávnění a kredity.' }, 502);
    }
}

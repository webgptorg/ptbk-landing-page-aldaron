import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withMessagesAdmin } from '@/lib/messages/messageAdminApi';

export const maxDuration = 30;
const tokenSchema = z.object({ token: z.string().min(1) });

/** The existing messages permission and same-origin guard apply before issuing a billable transcription capability. */
export function POST(request: NextRequest) {
    return withMessagesAdmin(request, async () => {
        const key = process.env.ELEVENLABS_API_KEY?.trim();
        if (!key) return NextResponse.json({ error: 'Pro přepis audia chybí serverové nastavení ElevenLabs.' }, { status: 503 });
        let response: Response;
        try {
            response = await fetch('https://api.elevenlabs.io/v1/single-use-token/batch_scribe', {
                method: 'POST', headers: { 'xi-api-key': key }, cache: 'no-store',
                signal: AbortSignal.any([request.signal, AbortSignal.timeout(20_000)]),
            });
        } catch {
            throw Object.assign(new Error('Spojení s ElevenLabs se nepodařilo navázat. Zkuste přepis později.'), { status: 502 });
        }
        if (!response.ok) throw Object.assign(new Error(`ElevenLabs nepovolilo přepis (HTTP ${response.status}). Ověřte přístup ke Speech to Text a kredity.`), { status: 502 });
        const result = tokenSchema.safeParse(await response.json().catch(() => null));
        if (!result.success) throw Object.assign(new Error('ElevenLabs nevrátilo oprávnění k přepisu.'), { status: 502 });
        return NextResponse.json({ token: result.data.token, modelId: process.env.ELEVENLABS_TRANSCRIPTION_MODEL_ID?.trim() || 'scribe_v2' }, {
            headers: { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' },
        });
    });
}

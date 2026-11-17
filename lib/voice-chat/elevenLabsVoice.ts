import 'server-only';
import { readStreamLines } from '@/lib/agents/readStreamEvents';
import { readElevenLabsErrorCode } from '@/lib/audio-player/elevenLabsNarration';

export const PAVOL_CHAT_VOICE_NAME = 'Pavol Hejný 2026';
let cached: { id: string; key: string; configuredId: string; until: number } | undefined;
/** Fail closed: never select the first account voice or a stock voice. */
export async function resolvePavolChatVoice(key: string, signal: AbortSignal): Promise<string> {
    const configuredId = process.env.ELEVENLABS_VOICE_ID?.trim() ?? '';
    if (cached && cached.key === key && cached.configuredId === configuredId && cached.until > Date.now()) return cached.id;
    const response = await fetch(configuredId ? 'https://api.elevenlabs.io/v1/voices/' + encodeURIComponent(configuredId)
        : 'https://api.elevenlabs.io/v2/voices?search=' + encodeURIComponent(PAVOL_CHAT_VOICE_NAME) + '&page_size=100', {
        headers: { 'xi-api-key': key }, signal, cache: 'no-store',
    });
    if (!response.ok) throw new Error('Nepodařilo se ověřit Pavolův hlas v ElevenLabs.');
    const data = await response.json() as { voice_id?: string; name?: string; voices?: { voice_id: string; name: string }[] };
    const matches = configuredId ? data.name === PAVOL_CHAT_VOICE_NAME && data.voice_id === configuredId ? [data] : []
        : (data.voices ?? []).filter(voice => voice.name === PAVOL_CHAT_VOICE_NAME);
    if (matches.length !== 1 || !matches[0].voice_id) throw new Error('Hlas Pavol Hejný 2026 není jednoznačně dostupný. Zkontrolujte konfiguraci hlasu.');
    cached = { id: matches[0].voice_id, key, configuredId, until: Date.now() + 300_000 };
    return cached.id;
}
/** Mono PCM; one-chunk lookahead marks the final sample of each spoken phrase. */
export async function streamPavolSpeech(voiceId: string, text: string, previousText: string, signal: AbortSignal,
    onAudio: (audio: string, last: boolean) => void) {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + encodeURIComponent(voiceId) + '/stream/with-timestamps?output_format=pcm_24000', {
        method: 'POST', headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY!.trim(), 'Content-Type': 'application/json' },
        signal: AbortSignal.any([signal, AbortSignal.timeout(25_000)]), cache: 'no-store',
        body: JSON.stringify({ text, previous_text: previousText.slice(-1000),
            model_id: process.env.ELEVENLABS_CHAT_MODEL_ID?.trim() || 'eleven_flash_v2_5', apply_text_normalization: 'on' }),
    });
    if (!response.ok) {
        const code = await readElevenLabsErrorCode(response);
        throw new Error(code === 'quota_exceeded' ? 'Došly kredity ElevenLabs. Můžeš pokračovat textem.'
            : 'ElevenLabs nepovolilo hlasovou odpověď. Zkontrolujte hlas, oprávnění a kredity.');
    }
    if (!response.body) throw new Error('ElevenLabs nevrátilo zvuk.');
    let pending = '';
    for await (const line of readStreamLines(response.body, signal)) {
        if (!line.trim()) continue;
        const frame = JSON.parse(line) as { audio_base64?: unknown };
        if (typeof frame.audio_base64 === 'string' && frame.audio_base64) {
            if (pending) onAudio(pending, false);
            pending = frame.audio_base64;
        }
    }
    if (!pending) throw new Error('ElevenLabs nevrátilo zvuk.');
    onAudio(pending, true);
}

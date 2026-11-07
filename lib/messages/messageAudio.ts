import 'server-only';
import { randomUUID } from 'node:crypto';
import { ALL_FORMATS, BufferSource, Input } from 'mediabunny';
import { mapSpeechAlignment, resolveElevenLabsNarrator, synthesizeElevenLabsNarration, type CharacterAlignment } from '@/lib/audio-player/elevenLabsNarration';
import type { ArticleWordTimings } from '@/businesses/articles/articleTiming';
import { getAgentDatabase } from '@/lib/agents/agentDatabase';
import { putStoredObject, removeStoredObject } from '@/lib/storage/objectStorage';
import { loadManagedMessage, messageTextHash } from './messageDatabase';
import type { ManagedMessage, MessageAudio } from './messageModel';
import { claimMessageAudioLease } from './messageAudioLease';
import { prepareMessageSpeech } from './messageSpeech';

export type { CharacterAlignment } from '@/lib/audio-player/elevenLabsNarration';

/** Only provider-measured character intervals can attach to exact written words. */
export function mapMessageAudioAlignment(markdown: string, alignment: CharacterAlignment | undefined): ArticleWordTimings | undefined {
    return mapSpeechAlignment(prepareMessageSpeech(markdown), alignment);
}

export async function generateMessageAudio(id: string, requestSignal: AbortSignal): Promise<ManagedMessage> {
    const key = process.env.ELEVENLABS_API_KEY?.trim();
    if (!key || !process.env.OBJECT_STORAGE_BUCKET) throw Object.assign(new Error('Pro generování nastavte ELEVENLABS_API_KEY a souborové úložiště.'), { status: 503 });
    const existing = await loadManagedMessage(id);
    if (!existing) throw Object.assign(new Error('Zpráva nebyla nalezena.'), { status: 404 });
    const { script } = prepareMessageSpeech(existing.markdown);
    if (!script || script.length > 10_000) throw Object.assign(new Error('Pro namluvení musí mít zpráva nejvýše 10 000 znaků čitelného textu.'), { status: 400 });
    const client = getAgentDatabase();
    const token = randomUUID();
    await claimMessageAudioLease(client, id, token, new Date());
    let uploadedKey: string | null = null;
    let attached = false;
    try {
        const signal = AbortSignal.any([requestSignal, AbortSignal.timeout(110_000)]);
        const voice = await resolveElevenLabsNarrator(key, signal);
        // This endpoint is invoked only by the explicit admin button. Never retry a potentially billed call automatically.
        const { bytes, alignment } = await synthesizeElevenLabsNarration(key, voice.id, script, signal);
        if (!bytes.length || bytes.length > 32 * 1024 * 1024) throw new Error('Nahrávka překračuje podporovanou velikost.');
        const input = new Input({ formats: ALL_FORMATS, source: new BufferSource(bytes) });
        let duration: number;
        try { duration = await input.computeDuration(); } finally { input.dispose(); }
        if (!Number.isFinite(duration) || duration <= 0) throw new Error('Délku nahrávky se nepodařilo ověřit.');
        const timings = mapMessageAudioAlignment(existing.markdown, alignment);
        uploadedKey = `messages/${id}/${randomUUID()}.mp3`;
        await putStoredObject(uploadedKey, bytes, 'audio/mpeg');
        const audio: MessageAudio = { key: uploadedKey, duration, byteLength: bytes.length, voiceName: voice.name, textHash: messageTextHash(existing.markdown), ...(timings ? { timings } : {}) };
        const { data, error } = await client.from('messages').update({ audio, updated_at: new Date().toISOString(), audio_generation_token: null, audio_generation_until: null })
            .eq('id', id).eq('audio_generation_token', token).select('id').maybeSingle();
        if (error || !data) throw new Error('Vytvořenou nahrávku se nepodařilo připojit ke zprávě.');
        attached = true;
        if (existing.audio) await removeStoredObject(existing.audio.key).catch(() => console.warn('Previous message audio cleanup is pending.'));
        const message = await loadManagedMessage(id);
        if (!message) throw new Error('Zpráva byla odstraněna.');
        return message;
    } finally {
        if (uploadedKey && !attached) await removeStoredObject(uploadedKey).catch(() => undefined);
        await client.from('messages').update({ audio_generation_token: null, audio_generation_until: null }).eq('id', id).eq('audio_generation_token', token);
    }
}

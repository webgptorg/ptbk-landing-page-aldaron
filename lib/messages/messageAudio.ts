import 'server-only';
import { randomUUID } from 'node:crypto';
import { ALL_FORMATS, BufferSource, Input } from 'mediabunny';
import { renderArticleDocument } from '@/businesses/articles/articleDocument';
import type { ArticleWordTimings } from '@/businesses/articles/articleTiming';
import { getAgentDatabase } from '@/lib/agents/agentDatabase';
import { putStoredObject, removeStoredObject } from '@/lib/storage/objectStorage';
import { loadManagedMessage, messageTextHash } from './messageDatabase';
import type { ManagedMessage, MessageAudio } from './messageModel';

export type CharacterAlignment = { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] };
/** Only provider-measured character intervals can attach to exact written words; missing alignment stays absent. */
export function mapMessageAudioAlignment(markdown: string, alignment: CharacterAlignment | undefined): ArticleWordTimings | undefined {
    const document = renderArticleDocument(markdown, '', '');
    const script = document.words.map((word) => word.text).join(' ');
    if (!alignment || alignment.characters.join('') !== script || alignment.characters.length !== alignment.character_start_times_seconds.length
        || alignment.characters.length !== alignment.character_end_times_seconds.length) return undefined;
    const offsets: number[] = [];
    alignment.characters.forEach((char, i) => { for (let j = 0; j < char.length; j++) offsets.push(i); });
    let offset = 0;
    let previousStart = -1;
    const sentences = Array.from(new Intl.Segmenter('cs', { granularity: 'sentence' }).segment(script));
    let sentenceIndex = 0;
    const words = [];
    for (const word of document.words) {
        const start = alignment.character_start_times_seconds[offsets[offset]];
        const end = alignment.character_end_times_seconds[offsets[offset + word.text.length - 1]];
        if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start < previousStart || end <= start) return undefined;
        while (sentenceIndex + 1 < sentences.length && sentences[sentenceIndex + 1].index <= offset) sentenceIndex++;
        words.push({ text: word.text, wordId: word.id, sentenceId: `s${sentenceIndex}`, start, end });
        previousStart = start; offset += word.text.length + 1;
    }
    return words.length ? { version: 1, words } : undefined;
}

async function getVoice(key: string, signal: AbortSignal): Promise<{ id: string; name: string }> {
    const name = process.env.ELEVENLABS_VOICE_NAME?.trim() || 'Pavol Hejný 2026';
    const id = process.env.ELEVENLABS_VOICE_ID?.trim();
    if (id) return { id, name };
    const response = await fetch(`https://api.elevenlabs.io/v2/voices?search=${encodeURIComponent(name)}&page_size=100`, { headers: { 'xi-api-key': key }, signal });
    if (!response.ok) throw new Error('Hlas se nepodařilo ověřit v ElevenLabs.');
    const data = await response.json() as { voices?: { voice_id: string; name: string }[] };
    const matches = data.voices?.filter((voice) => voice.name === name) ?? [];
    if (matches.length !== 1) throw new Error('Nastavte ELEVENLABS_VOICE_ID pro hlas Pavol Hejný 2026.');
    return { id: matches[0].voice_id, name: matches[0].name };
}

export async function generateMessageAudio(id: string, requestSignal: AbortSignal): Promise<ManagedMessage> {
    const key = process.env.ELEVENLABS_API_KEY?.trim();
    if (!key || !process.env.OBJECT_STORAGE_BUCKET) throw Object.assign(new Error('Pro generování nastavte ELEVENLABS_API_KEY a souborové úložiště.'), { status: 503 });
    const existing = await loadManagedMessage(id);
    if (!existing) throw Object.assign(new Error('Zpráva nebyla nalezena.'), { status: 404 });
    const script = renderArticleDocument(existing.markdown, '', '').words.map((word) => word.text).join(' ');
    if (!script || script.length > 10_000) throw Object.assign(new Error('Pro namluvení musí mít zpráva nejvýše 10 000 znaků čitelného textu.'), { status: 400 });
    const client = getAgentDatabase();
    const token = randomUUID();
    const now = new Date();
    const { data: claim, error: claimError } = await client.from('messages')
        .update({ audio_generation_token: token, audio_generation_until: new Date(now.getTime() + 10 * 60_000).toISOString() })
        .eq('id', id).or(`audio_generation_until.is.null,audio_generation_until.lt.${now.toISOString()}`).select('id').maybeSingle();
    if (claimError) throw new Error('Generování se nepodařilo zahájit.');
    if (!claim) throw Object.assign(new Error('Nahrávka této zprávy se již generuje.'), { status: 409 });
    let uploadedKey: string | null = null;
    let attached = false;
    try {
        const signal = AbortSignal.any([requestSignal, AbortSignal.timeout(110_000)]);
        const voice = await getVoice(key, signal);
        // This endpoint is invoked only by the explicit admin button. Never retry a potentially billed call automatically.
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice.id)}/with-timestamps?output_format=mp3_44100_128`, {
            method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' }, signal,
            body: JSON.stringify({ text: script, model_id: process.env.ELEVENLABS_MODEL_ID?.trim() || 'eleven_multilingual_v2' }),
        });
        if (!response.ok) throw new Error(`ElevenLabs odmítlo generování (HTTP ${response.status}). Ověřte přístup k hlasu a kredity.`);
        const result = await response.json() as { audio_base64?: string; alignment?: CharacterAlignment };
        if (!result.audio_base64) throw new Error('ElevenLabs nevrátilo nahrávku. Před dalším pokusem zkontrolujte historii generování.');
        const bytes = Buffer.from(result.audio_base64, 'base64');
        if (!bytes.length || bytes.length > 32 * 1024 * 1024) throw new Error('Nahrávka překračuje podporovanou velikost.');
        const input = new Input({ formats: ALL_FORMATS, source: new BufferSource(bytes) });
        let duration: number;
        try { duration = await input.computeDuration(); } finally { input.dispose(); }
        if (!Number.isFinite(duration) || duration <= 0) throw new Error('Délku nahrávky se nepodařilo ověřit.');
        const timings = mapMessageAudioAlignment(existing.markdown, result.alignment);
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

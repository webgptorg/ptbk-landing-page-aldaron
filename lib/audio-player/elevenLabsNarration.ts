import 'server-only';
import type { ArticleWordTimings } from '@/businesses/articles/articleTiming';

export type CharacterAlignment = { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] };
/** Attach measured intervals only when ElevenLabs returned the exact text submitted. */
export function mapSpeechAlignment(
    document: { readonly script: string; readonly words: readonly { readonly id: string; readonly text: string; readonly spokenText: string }[] },
    alignment: CharacterAlignment | undefined,
): ArticleWordTimings | undefined {
    const { script } = document;
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
        const end = alignment.character_end_times_seconds[offsets[offset + word.spokenText.length - 1]];
        if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start < previousStart || end <= start) return undefined;
        while (sentenceIndex + 1 < sentences.length && sentences[sentenceIndex + 1].index <= offset) sentenceIndex++;
        words.push({ text: word.text, wordId: word.id, sentenceId: `s${sentenceIndex}`, start, end });
        previousStart = start; offset += word.spokenText.length + 1;
    }
    return words.length ? { version: 1, words } : undefined;
}

export async function resolveElevenLabsNarrator(key: string, signal: AbortSignal): Promise<{ id: string; name: string }> {
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

export function getElevenLabsNarrationModel() {
    return process.env.ELEVENLABS_MODEL_ID?.trim() || 'eleven_multilingual_v2';
}

export async function synthesizeElevenLabsNarration(
    key: string,
    voiceId: string,
    script: string,
    signal: AbortSignal,
    previousText?: string,
) {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps?output_format=mp3_44100_128`, {
        method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' }, signal,
        body: JSON.stringify({
            text: script, model_id: getElevenLabsNarrationModel(), apply_text_normalization: 'on',
            ...(previousText ? { previous_text: previousText } : {}),
        }),
    });
    if (!response.ok) throw new Error(`ElevenLabs odmítlo generování (HTTP ${response.status}). Ověřte přístup k hlasu a kredity.`);
    const result = await response.json() as { audio_base64?: string; alignment?: CharacterAlignment };
    if (!result.audio_base64) throw new Error('ElevenLabs nevrátilo nahrávku. Před dalším pokusem zkontrolujte historii generování.');
    return { bytes: Buffer.from(result.audio_base64, 'base64'), alignment: result.alignment };
}

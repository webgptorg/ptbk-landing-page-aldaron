import { z } from 'zod';
import { MESSAGE_CONTEXT_MAX_LENGTH } from './messageModel';

export const MESSAGE_AUDIO_MAX_BYTES = 2_000_000_000;
export const MESSAGE_AUDIO_ACCEPT = 'audio/*,.m4a,.mp3,.wav,.aac,.ogg,.oga,.opus,.flac,.webm,.mp4,.amr,.3gp,.3gpp,.aif,.aiff,.wma';

export function validateMessageAudioFile(file: Pick<File, 'name' | 'type' | 'size'>): void {
    if (!file.size) throw new Error('Audio soubor je prázdný.');
    if (file.size > MESSAGE_AUDIO_MAX_BYTES) throw new Error('Vyberte audio soubor do 2 GB.');
    if (!file.type.startsWith('audio/') && !/\.(m4a|mp3|wav|aac|ogg|oga|opus|flac|webm|mp4|amr|3gp|3gpp|aif|aiff|wma)$/i.test(file.name)) {
        throw new Error('Vyberte audio soubor, například M4A, MP3 nebo WAV.');
    }
}

const transcriptSchema = z.object({
    text: z.string(),
});
const transcriptWordsSchema = z.object({
    words: z.array(z.object({
        text: z.string(), type: z.string().nullish(), speaker_id: z.string().nullish(),
    })).optional(),
});

/** Slice the provider's original text, rather than reconstructing or summarizing its words. */
export function formatMessageTranscript(filename: string, result: unknown): string {
    const parsed = transcriptSchema.safeParse(result);
    if (!parsed.success) throw new Error('ElevenLabs nevrátilo čitelný přepis. Před dalším pokusem zkontrolujte historii přepisů.', { cause: parsed.error });
    const { text } = parsed.data;
    if (!text.trim()) {
        throw new Error('ElevenLabs zpracovalo audio, ale nerozpoznalo žádnou řeč. Přepis je prázdný. Zkontrolujte oddělené audio tlačítkem „Zkontrolovat audio“ a poslechněte si ho před dalším placeným pokusem.');
    }
    // Optional word metadata must never invalidate a usable, already-paid transcript.
    const wordData = transcriptWordsSchema.safeParse(result);
    const words = wordData.success ? wordData.data.words : undefined;
    let transcript = text.trim();
    if (words?.some((word) => word.speaker_id)) {
        const labels = new Map<string, number>();
        const turns: string[] = [];
        let speaker: string | null | undefined;
        let start = 0;
        let cursor = 0;
        let compatible = true;
        const addTurn = (end: number) => {
            const passage = text.slice(start, end).trim();
            if (!passage) return;
            if (speaker && !labels.has(speaker)) labels.set(speaker, labels.size + 1);
            turns.push(`${speaker ? `Mluvčí ${labels.get(speaker)}` : 'Nerozlišený mluvčí'}:\n${passage}`);
        };
        for (const word of words) {
            if (!word.text.trim()) continue;
            const index = text.indexOf(word.text, cursor);
            if (index === -1) { compatible = false; break; }
            cursor = index + word.text.length;
            // Non-speech annotations stay exactly where the provider placed them.
            if (word.type === 'audio_event') continue;
            const next = word.speaker_id || null;
            if (speaker === undefined) speaker = next;
            else if (speaker !== next) { addTurn(index); start = index; speaker = next; }
        }
        if (compatible) { addTurn(text.length); transcript = turns.join('\n\n'); }
        // An incompatible word map never causes loss or fabrication of source text.
    }
    const name = filename.replace(/[\r\n\t]+/g, ' ').trim();
    return `Následuje přepsané audio: ${name}\n\n${transcript}`;
}

export function appendMessageTranscript(context: string, transcript: string): string {
    const combined = context ? `${context}\n\n${transcript}` : transcript;
    if (combined.length > MESSAGE_CONTEXT_MAX_LENGTH) {
        throw new Error('Přepis se nevejde do limitu 1 500 000 znaků. Zkraťte kontext a přidejte dokončený přepis tlačítkem níže.');
    }
    return combined;
}

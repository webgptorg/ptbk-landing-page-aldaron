import { requestOpenAiAudioTranscription } from '@/lib/audio/openAiAudioTranscription';
import { z } from 'zod';
import { MAXIMAL_SUBTITLE_AUDIO_BYTES, SUBTITLE_AUDIO_CHUNK_SECONDS, SUBTITLE_CUE_SCHEMA, type SubtitleLanguage, type SubtitleCue } from './workshopSubtitleTypes';

const SUBTITLE_TRANSCRIPTION_TIMEOUT_MILLISECONDS = 70_000;
const TRANSCRIPTION_SEGMENTS_SCHEMA = z.object({ segments: z.array(z.object({
    start: z.number().finite().nonnegative(), end: z.number().finite().nonnegative(), text: z.string().max(5_000),
})).max(2_000) });

export function isSubtitleAudioFileValid(file: File): boolean {
    return file.size > 0 && file.size <= MAXIMAL_SUBTITLE_AUDIO_BYTES && file.type === 'audio/wav';
}

/** Times returned here are chunk-relative; the browser adds the original recording position once. */
export async function transcribeWorkshopSubtitles(file: File, language: SubtitleLanguage): Promise<SubtitleCue[]> {
    if (!isSubtitleAudioFileValid(file)) throw new Error('Neplatný zvukový soubor.');
    const result = await requestOpenAiAudioTranscription({
        file, filename: 'workshop.wav', model: 'whisper-1', responseFormat: 'verbose_json',
        ...(language === 'mul' ? {} : { language }), timeoutMilliseconds: SUBTITLE_TRANSCRIPTION_TIMEOUT_MILLISECONDS,
    });
    const { segments } = TRANSCRIPTION_SEGMENTS_SCHEMA.parse(result);
    return segments.filter((segment) => segment.text.trim() !== '' && segment.end > segment.start).map((segment) => {
        if (segment.end > SUBTITLE_AUDIO_CHUNK_SECONDS + 1) throw new Error('Přepis vrátil neplatné časy.');
        return SUBTITLE_CUE_SCHEMA.parse({ startSeconds: segment.start, endSeconds: segment.end, text: segment.text });
    });
}

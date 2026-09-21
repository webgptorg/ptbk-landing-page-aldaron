import { z } from 'zod';

export const WORKSHOP_SUBTITLE_TABLE_NAME = 'workshop_subtitles';
export const MAXIMAL_SUBTITLE_FILE_BYTES = 2_000_000;
export const MAXIMAL_SUBTITLE_CUE_COUNT = 20_000;
export const MAXIMAL_SUBTITLE_DURATION_SECONDS = 86_400;
// Mono 16 kHz PCM fits comfortably below a 4.5 MB serverless request limit.
export const SUBTITLE_AUDIO_CHUNK_SECONDS = 90;
export const MAXIMAL_SUBTITLE_AUDIO_BYTES = 3_000_000;
export const SUBTITLE_LANGUAGE_LABELS = { cs: 'Čeština', en: 'English', mul: 'Čeština a angličtina' } as const;
export const SUBTITLE_LANGUAGE_SCHEMA = z.enum(['cs', 'en', 'mul']);
export type SubtitleLanguage = z.infer<typeof SUBTITLE_LANGUAGE_SCHEMA>;

const SUBTITLE_TIMESTAMP_SCHEMA = z.number().finite().min(0).max(MAXIMAL_SUBTITLE_DURATION_SECONDS)
    .transform((seconds) => Math.round(seconds * 1000) / 1000);

export const SUBTITLE_CUE_SCHEMA = z.object({
    startSeconds: SUBTITLE_TIMESTAMP_SCHEMA,
    endSeconds: SUBTITLE_TIMESTAMP_SCHEMA,
    text: z.string().trim().min(1).max(5_000).refine((text) => !text.includes('\u0000'), 'Text obsahuje neplatný znak.')
        .transform((text) => text.replace(/\r\n?/g, '\n').replace(/\n(?:[ \t]*\n)+/g, '\n')),
}).refine((cue) => cue.endSeconds > cue.startSeconds, 'Konec titulku musí být po začátku.');
export type SubtitleCue = z.infer<typeof SUBTITLE_CUE_SCHEMA>;

export const SUBTITLE_CUES_SCHEMA = z.array(SUBTITLE_CUE_SCHEMA).min(1).max(MAXIMAL_SUBTITLE_CUE_COUNT)
    .refine((cues) => cues.every((cue, index) => index === 0 || cue.startSeconds >= cues[index - 1]!.startSeconds),
        'Titulky musí být seřazené podle začátku.')
    .refine((cues) => new TextEncoder().encode(JSON.stringify(cues)).byteLength <= MAXIMAL_SUBTITLE_FILE_BYTES,
        'Titulky jsou příliš dlouhé.');

export const SUBTITLE_WRITE_SCHEMA = z.object({
    language: SUBTITLE_LANGUAGE_SCHEMA,
    cues: SUBTITLE_CUES_SCHEMA,
});
export const SUBTITLE_SOURCE_SCHEMA = z.object({
    source: z.enum(['manual', 'youtube', 'transcription']),
    sourceYoutubeVideoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/).nullable(),
    sourceFilename: z.string().trim().max(255).nullable(),
});
export const SUBTITLE_CREATE_SCHEMA = SUBTITLE_WRITE_SCHEMA.merge(SUBTITLE_SOURCE_SCHEMA);
export type WorkshopSubtitleValues = z.infer<typeof SUBTITLE_WRITE_SCHEMA>;
export type WorkshopSubtitleDraft = z.infer<typeof SUBTITLE_CREATE_SCHEMA>;
export type WorkshopSubtitleTrack = WorkshopSubtitleDraft & {
    readonly id: string;
    readonly createdAt: string;
    readonly updatedAt: string;
};
export type WorkshopSubtitleAdminState = {
    readonly tracks: readonly WorkshopSubtitleTrack[];
    readonly isTranscriptionConfigured: boolean;
};

import { z } from 'zod';

export const MESSAGE_SUMMARY_SCHEMA = z.object({
    maxCharacters: z.number().int().min(100).max(50_000),
    format: z.enum(['paragraphs', 'bullets', 'sentence']),
}).strict();

export type MessageSummary = z.infer<typeof MESSAGE_SUMMARY_SCHEMA>;
export const MESSAGE_SUMMARY_FORMAT_LABELS: Record<MessageSummary['format'], string> = {
    paragraphs: 'Odstavce',
    bullets: 'Odrážky',
    sentence: 'Jedna věta',
};

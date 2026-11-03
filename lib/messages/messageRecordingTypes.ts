import { z } from 'zod';

export const RECORDING_CHUNK_BYTES = 1024 * 1024;
export const RECORDING_SLICE_MS = 2000;
export const RECORDING_PART_MS = 5 * 60 * 1000;
export const recordingPartSchema = z.object({
    id: z.string().uuid(), recordingId: z.string().uuid(), title: z.string().trim().min(1).max(200),
    scope: z.union([z.literal('new'), z.string().uuid()]), startedAt: z.string().datetime(),
    endedAt: z.string().datetime().nullable(), mimeType: z.enum(['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/mp4;codecs=mp4a.40.2', 'audio/ogg;codecs=opus']),
    status: z.enum(['recording', 'complete', 'interrupted']), chunkCount: z.number().int().min(0).max(1_000_000),
    byteLength: z.number().int().min(0), transcript: z.string().max(2_000_000).optional(), attempted: z.boolean().optional(),
    backedUpChunks: z.number().int().min(0).optional(), backupSignature: z.string().optional(),
    remoteOnly: z.boolean().optional(),
    lastSavedAt: z.string().datetime().optional(),
    // Media lives in the existing Recording Studio. This database retains only message/transcript metadata.
    studioRecordingId: z.string().uuid().optional(),
    agentName: z.string().optional(),
    durationSeconds: z.number().min(0).optional(),
});
export type MessageRecordingPart = z.infer<typeof recordingPartSchema>;
export type MessageRecordingChunk = { partId: string; sequence: number; bytes: Blob; synced: boolean; durationSeconds?: number };
export function recordingFilename(part: MessageRecordingPart): string {
    const title = part.title.replace(/[\\/:*?"<>|\x00-\x1f]/g, '-').slice(0, 80);
    return `${title}-${part.startedAt.replace(/[:.]/g, '-')}-${part.id.slice(0, 6)}.${part.mimeType.includes('mp4') ? 'm4a' : part.mimeType.includes('ogg') ? 'ogg' : 'webm'}`;
}

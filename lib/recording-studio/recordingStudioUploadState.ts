import { z } from 'zod';

const UPLOAD_STATE_KEY_PREFIX = 'promptbook-recording-studio-upload:';
const UPLOAD_STATE_SCHEMA = z.object({
    version: z.literal(1), workshopId: z.string(), revisionId: z.string(), liveStartAt: z.string(),
    sourceIds: z.object({ editor: z.string().optional(), application: z.string().optional(), camera: z.string().optional() }),
});
export type RecordingStudioUploadState = z.infer<typeof UPLOAD_STATE_SCHEMA>;

/** Stable revision/source identities only: no credentials, signed URLs, file bytes or portable permissions. */
export function readRecordingStudioUploadState(recordingId: string): RecordingStudioUploadState | null {
    try {
        const result = UPLOAD_STATE_SCHEMA.safeParse(JSON.parse(localStorage.getItem(`${UPLOAD_STATE_KEY_PREFIX}${recordingId}`) ?? 'null'));
        return result.success ? result.data : null;
    } catch { return null; }
}

/** Called inside the same ownership commit as revision creation/completion, never by a stale UI effect. */
export function saveRecordingStudioUploadState(recordingId: string, state: RecordingStudioUploadState | null): void {
    if (state) localStorage.setItem(`${UPLOAD_STATE_KEY_PREFIX}${recordingId}`, JSON.stringify(state));
    else localStorage.removeItem(`${UPLOAD_STATE_KEY_PREFIX}${recordingId}`);
}

import { RECORDING_STUDIO_AUTHORITY } from '@/lib/recording-studio/recordingStudioAuthority';
import { runWithRecordingStudioLock } from '@/lib/recording-studio/recordingStudioLock';
import { appendRecordingChunk, readStudioRecording, saveStudioRecording } from '@/lib/recording-studio/recordingStudioStorage';
import type { StudioRecording } from '@/lib/recording-studio/recordingStudioTypes';
import type { MessageRecordingChunk, MessageRecordingPart } from './messageRecordingTypes';

let isClaimedInThisDocument = false;
export const LEGACY_MESSAGE_CAPTURE_LOCK = 'ptbk-message-meeting-capture';
const occupiedMessage = 'Recording Studio používá jiná záložka nebo otevřený rekordér. Dokončete v ní práci a zavřete ji; nahrávky ani nastavení se nemění.';

/** The same lock and fenced writes as Recording Studio; never changes its source preferences. */
export async function acquireMessageStudio(): Promise<() => Promise<void>> {
    if (isClaimedInThisDocument || RECORDING_STUDIO_AUTHORITY.heldAuthority) throw new Error(occupiedMessage);
    if (!navigator.locks) throw new Error('Pro bezpečné ukládání potřebuje Meeting Studio aktuální prohlížeč s podporou Web Locks.');
    isClaimedInThisDocument = true;
    let acquired!: (release: () => Promise<void>) => void;
    let rejected!: (error: unknown) => void;
    const ready = new Promise<() => Promise<void>>((resolve, reject) => { acquired = resolve; rejected = reject; });
    const operation = runWithRecordingStudioLock({ mode: 'if-available' }, {
        prepare: () => RECORDING_STUDIO_AUTHORITY.read(),
        run: async (lock, previous) => {
            if (!lock) throw new Error(occupiedMessage);
            // Older open tabs use this lock instead of the studio lock. Hold both until final data is committed.
            await navigator.locks.request(LEGACY_MESSAGE_CAPTURE_LOCK, { ifAvailable: true }, async legacyLock => {
                if (!legacyLock) throw new Error('V jiné záložce běží původní rekordér. Nejprve v ní dokončete nahrávání a obnovte ji. Původní audio zůstává zachované.');
                const authority = await RECORDING_STUDIO_AUTHORITY.claim(crypto.randomUUID(), previous.generation);
                if (!authority) throw new Error('Studio mezitím převzala jiná záložka. Zkuste nahrávání znovu.');
                let release!: () => void;
                const released = new Promise<void>(resolve => { release = resolve; });
                acquired(async () => { release(); await operation; });
                try { await released; }
                finally { RECORDING_STUDIO_AUTHORITY.surrender(authority); }
            });
        },
    });
    void operation.finally(() => { isClaimedInThisDocument = false; }).catch(rejected);
    return ready;
}

export function createMessageStudioRecording(part: MessageRecordingPart, agentName: string): StudioRecording {
    return {
        id: part.id, title: `Messages recording · ${agentName} · ${part.title}`, createdAt: part.startedAt,
        status: 'recording', durationSeconds: 0, trim: null, errorMessage: null, captureEndSeconds: null,
        tracks: [{ id: part.id, kind: 'microphone', label: `Messages recording · ${agentName}`, mimeType: part.mimeType,
            byteLength: 0, chunkCount: 0, startOffsetSeconds: 0, durationSeconds: 0,
            width: null, height: null, frameRate: null, isAudioIncluded: true }],
    };
}

/** The raw chunk and Recording Studio's counters are one transaction. No second copy of new media is written. */
export async function appendMessageStudioChunk(recordingId: string, chunk: MessageRecordingChunk): Promise<void> {
    const recording = await readStudioRecording(recordingId);
    if (!recording) throw new Error('Původní nahrávka v Recording Studiu není dostupná.');
    const track = recording.tracks[0];
    if (recording.status !== 'recording' || track.id !== chunk.partId || track.chunkCount !== chunk.sequence) {
        throw new Error('Pořadí ukládaného audia nesouhlasí; předchozí záznam nebyl přepsán.');
    }
    const durationSeconds = Math.max(recording.durationSeconds, chunk.durationSeconds ?? 0);
    await appendRecordingChunk({ ...recording, durationSeconds, tracks: [{ ...track, durationSeconds,
        byteLength: track.byteLength + chunk.bytes.size, chunkCount: track.chunkCount + 1 }] }, track.id, chunk.sequence, chunk.bytes);
}

export async function finishMessageStudioRecording(recordingId: string, interrupted: boolean, durationSeconds?: number): Promise<void> {
    const recording = await readStudioRecording(recordingId);
    if (!recording) throw new Error('Nahrávka nebyla nalezena v Recording Studiu.');
    const duration = Math.max(recording.durationSeconds, durationSeconds ?? 0);
    await saveStudioRecording({ ...recording, status: interrupted ? 'interrupted' : 'complete', durationSeconds: duration,
        captureEndSeconds: interrupted ? null : duration,
        tracks: recording.tracks.map(track => ({ ...track, durationSeconds: duration })),
        errorMessage: interrupted ? 'Meeting Studio bylo přerušeno. Zachované jsou průběžně uložené části audia.' : null });
}

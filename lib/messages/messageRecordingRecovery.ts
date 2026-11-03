import { appendMessageStudioChunk, createMessageStudioRecording, finishMessageStudioRecording } from './messageRecordingStudio';
import { listRecordingParts, loadRecordingChunks, patchRecordingPart } from './messageRecordingStorage';
import { readStudioRecording, saveStudioRecording } from '@/lib/recording-studio/recordingStudioStorage';

/** Run only while holding Recording Studio's ownership. Never removes the earlier local bytes or paid text. */
export async function preserveMessageRecordingsInStudio(): Promise<void> {
    for (const part of await listRecordingParts()) {
        if (part.studioRecordingId) {
            if (part.status === 'recording') {
                if (await readStudioRecording(part.studioRecordingId)) await finishMessageStudioRecording(part.studioRecordingId, true);
                await patchRecordingPart(part.id, { status: 'interrupted' });
            }
            continue;
        }
        if (part.remoteOnly) continue;
        const chunks = await loadRecordingChunks(part.id);
        if (!chunks.length) continue;
        if (chunks.length !== part.chunkCount || chunks.some((chunk, i) => chunk.sequence !== i)) {
            throw new Error('Starší místní nahrávka má neúplné pořadí bloků. Původní audio zůstává zachované.');
        }
        let recording = await readStudioRecording(part.id);
        const duration = Math.max(0, (new Date(part.endedAt ?? part.lastSavedAt ?? part.startedAt).getTime() - new Date(part.startedAt).getTime()) / 1000);
        if (!recording) {
            recording = createMessageStudioRecording(part, part.agentName ?? 'původní záznam');
            await saveStudioRecording(recording);
        }
        // A reload in the middle of this migration resumes the deterministic recording ID's committed prefix.
        const committed = recording.tracks[0].chunkCount;
        if (committed > chunks.length) throw new Error('Velikost starší zálohy nesouhlasí. Původní data nebyla změněna.');
        if (recording.tracks[0].byteLength !== chunks.slice(0, committed).reduce((sum, chunk) => sum + chunk.bytes.size, 0)) {
            throw new Error('Uložený začátek starší zálohy nesouhlasí. Původní data nebyla změněna.');
        }
        if (committed < chunks.length && recording.status !== 'recording') await saveStudioRecording({ ...recording, status: 'recording' });
        for (const chunk of chunks.slice(committed)) await appendMessageStudioChunk(part.id, { ...chunk, durationSeconds: duration });
        await finishMessageStudioRecording(part.id, part.status !== 'complete', duration);
        await patchRecordingPart(part.id, { studioRecordingId: part.id, durationSeconds: duration,
            status: part.status === 'complete' ? 'complete' : 'interrupted' });
    }
}

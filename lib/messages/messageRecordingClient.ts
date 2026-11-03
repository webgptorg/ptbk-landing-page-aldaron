import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import { loadRecordingChunks, loadRecordingPart, localRecordingFile, markRecordingChunkSynced, patchRecordingPart, listRecordingParts } from './messageRecordingStorage';
import { recordingFilename, type MessageRecordingPart } from './messageRecordingTypes';

const API = '/api/admin/messages/recordings';
const signature = (part: MessageRecordingPart) => JSON.stringify([part.status, part.endedAt, part.transcript, part.attempted]);
export async function syncRecordingBackups(): Promise<void> {
    for (const part of await listRecordingParts()) {
        const receipt = signature(part);
        if (part.backupSignature === receipt && part.backedUpChunks === part.chunkCount) continue;
        const writeMetadata = (value: MessageRecordingPart) => requestAdminJson(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value), signal: AbortSignal.timeout(20_000) });
        await writeMetadata(part);
        let backedUp = part.remoteOnly ? part.chunkCount : 0;
        for (const chunk of await loadRecordingChunks(part.id)) {
            if (!chunk.synced) {
                await requestAdminJson(`${API}/${part.id}?sequence=${chunk.sequence}`, { method: 'PUT', headers: { 'Content-Type': 'application/octet-stream' }, body: chunk.bytes, signal: AbortSignal.timeout(20_000) });
                await markRecordingChunkSynced(part.id, chunk.sequence);
            }
            backedUp++;
        }
        // Snapshot counters must never overwrite newer microphone chunks or a paid transcript.
        await patchRecordingPart(part.id, { backedUpChunks: backedUp, backupSignature: receipt });
    }
}
export const listServerRecordingParts = (before?: string) => requestAdminJson<{ parts: MessageRecordingPart[] }>(`${API}${before ? `?before=${encodeURIComponent(before)}` : ''}`, { signal: AbortSignal.timeout(20_000) });
export async function recordingFile(part: MessageRecordingPart): Promise<File> {
    const local = await localRecordingFile(part).catch(() => null);
    if (local) return local;
    const manifest = await requestAdminJson<{ chunks: { sequence: number; byteLength: number; sha256: string; url: string }[]; expectedChunks: number | null }>(`${API}/${part.id}`);
    if (!manifest.chunks.length) throw new Error('Pro tuto část zatím nejsou dostupná audio data.');
    if (manifest.chunks.some((chunk, i) => chunk.sequence !== i) || (manifest.expectedChunks !== null && manifest.chunks.length !== manifest.expectedChunks)) throw new Error('Serverová záloha zatím není celá. Otevřete původní prohlížeč a dokončete zálohování; audio zůstalo zachované.');
    const blobs: Blob[] = [];
    for (const chunk of manifest.chunks) {
        const response = await fetch(chunk.url, { credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(30_000) });
        if (!response.ok) throw new Error('Zálohu se nepodařilo stáhnout. Zkuste to znovu.');
        const bytes = await response.arrayBuffer();
        const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), byte => byte.toString(16).padStart(2, '0')).join('');
        if (bytes.byteLength !== chunk.byteLength || hash !== chunk.sha256) throw new Error('Kontrola původního audia nesouhlasí. Stahování bylo přerušeno.');
        blobs.push(new Blob([bytes]));
    }
    return new File(blobs, recordingFilename(part), { type: part.mimeType });
}
export async function persistRecordingTranscript(part: MessageRecordingPart, transcript?: string): Promise<void> {
    const local = await loadRecordingPart(part.id);
    if (!local) {
        // Remote-only audio stays remote; retaining its paid text does not copy the original bytes.
        const { saveRecordingPart } = await import('./messageRecordingStorage');
        await saveRecordingPart({ ...part, remoteOnly: true, attempted: true, ...(transcript ? { transcript } : {}) });
    } else await patchRecordingPart(part.id, { attempted: true, ...(transcript ? { transcript } : {}) });
}
export function downloadRecordingBlob(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob), anchor = document.createElement('a');
    anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove();
    // Mobile browsers may consume the URL asynchronously after the click.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

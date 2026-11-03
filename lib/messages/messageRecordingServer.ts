import 'server-only';
import { createHash } from 'node:crypto';
import { getAgentDatabase } from '@/lib/agents/agentDatabase';
import { getObjectStorage, signStoredObject } from '@/lib/storage/objectStorage';
import { RECORDING_CHUNK_BYTES, type MessageRecordingPart } from './messageRecordingTypes';

const unavailable = () => Object.assign(new Error('Serverovou zálohu nahrávky se nepodařilo uložit. Místní audio zůstává zachované.'), { status: 503 });
const conflict = () => Object.assign(new Error('Záloha obsahuje jiná data. Původní audio zůstalo zachované.'), { status: 409 });
export async function storeRecordingMetadata(part: MessageRecordingPart): Promise<void> {
    const db = getAgentDatabase();
    const { error } = await db.from('message_recording_parts').upsert({
        id: part.id, recording_id: part.recordingId, scope: part.scope, title: part.title,
        started_at: part.startedAt, ended_at: part.endedAt, mime_type: part.mimeType, status: part.status,
        expected_chunks: part.status === 'recording' ? null : part.chunkCount,
    }, { onConflict: 'id', ignoreDuplicates: true });
    if (error) throw unavailable();
    const { data: existing, error: lookupError } = await db.from('message_recording_parts').select('recording_id,mime_type,transcript').eq('id', part.id).single();
    if (lookupError || !existing) throw unavailable();
    if (existing.recording_id !== part.recordingId || existing.mime_type !== part.mimeType) throw conflict();
    if (part.status !== 'recording') {
        const { error: updateError } = await db.from('message_recording_parts').update({ status: part.status, ended_at: part.endedAt, expected_chunks: part.chunkCount }).eq('id', part.id);
        if (updateError) throw unavailable();
    }
    if (part.attempted) {
        const { error: attemptError } = await db.from('message_recording_parts').update({ transcription_attempted: true }).eq('id', part.id);
        if (attemptError) throw unavailable();
    }
    if (part.transcript) {
        if (existing.transcript && existing.transcript !== part.transcript) throw conflict();
        const { error: transcriptError } = await db.from('message_recording_parts').update({ transcript: part.transcript }).eq('id', part.id).is('transcript', null);
        if (transcriptError) throw unavailable();
    }
}
export async function storeRecordingBytes(partId: string, sequence: number, bytes: Uint8Array): Promise<void> {
    if (!bytes.length || bytes.length > RECORDING_CHUNK_BYTES) throw Object.assign(new Error('Neplatná velikost audio části.'), { status: 413 });
    const db = getAgentDatabase(), storage = getObjectStorage();
    const { data: part, error: partError } = await db.from('message_recording_parts').select('id').eq('id', partId).maybeSingle();
    if (partError) throw unavailable();
    if (!part) throw Object.assign(new Error('Nahrávka nebyla nalezena.'), { status: 404 });
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    // The hash makes lost upload responses retryable without overwriting an existing object.
    const objectKey = `message-meeting-recordings/${partId}/${sequence}-${sha256}`;
    const { data: old, error: oldError } = await db.from('message_recording_chunks').select('sha256,byte_length').eq('part_id', partId).eq('sequence', sequence).maybeSingle();
    if (oldError) throw unavailable();
    if (old) { if (old.sha256 !== sha256 || old.byte_length !== bytes.length) throw conflict(); return; }
    const { error: uploadError } = await storage.upload(objectKey, bytes, { upsert: false, contentType: 'application/octet-stream' });
    if (uploadError) {
        // An interrupted prior request may have stored the object but not its database row.
        const { data: prior, error: readError } = await storage.download(objectKey);
        if (readError || !prior || prior.size !== bytes.length || createHash('sha256').update(new Uint8Array(await prior.arrayBuffer())).digest('hex') !== sha256) throw unavailable();
    }
    const { error: insertError } = await db.from('message_recording_chunks').upsert({ part_id: partId, sequence, object_key: objectKey, byte_length: bytes.length, sha256 }, { onConflict: 'part_id,sequence', ignoreDuplicates: true });
    if (insertError) throw unavailable();
    const { data: confirmed } = await db.from('message_recording_chunks').select('sha256').eq('part_id', partId).eq('sequence', sequence).single();
    if (confirmed?.sha256 !== sha256) throw conflict();
}
export async function listRemoteRecordingParts(before?: string) {
    let query = getAgentDatabase().from('message_recording_parts').select('*').order('started_at', { ascending: false }).limit(100);
    if (before) query = query.lt('started_at', before);
    const { data, error } = await query;
    if (error) throw unavailable();
    return (data ?? []).map(row => ({ id: row.id, recordingId: row.recording_id, scope: row.scope, title: row.title,
        startedAt: new Date(row.started_at).toISOString(), endedAt: row.ended_at ? new Date(row.ended_at).toISOString() : null, mimeType: row.mime_type, status: row.status,
        chunkCount: row.expected_chunks ?? 0, byteLength: 0, transcript: row.transcript ?? undefined, attempted: row.transcription_attempted,
    } as MessageRecordingPart));
}
export async function remoteRecordingManifest(partId: string) {
    const db = getAgentDatabase();
    const { data: part, error: partError } = await db.from('message_recording_parts').select('expected_chunks').eq('id', partId).maybeSingle();
    if (partError) throw unavailable();
    if (!part) throw Object.assign(new Error('Nahrávka nebyla nalezena.'), { status: 404 });
    // Paging avoids Supabase's default 1,000-row truncation, including delayed background bursts.
    const chunks: { sequence: number; byteLength: number; sha256: string; url: string }[] = [];
    for (let from = 0; ; from += 500) {
        const { data, error } = await db.from('message_recording_chunks').select('sequence,object_key,byte_length,sha256').eq('part_id', partId).order('sequence').range(from, from + 499);
        if (error) throw unavailable();
        // Bounded parallel signing keeps a five-minute file well inside the function deadline.
        for (let offset = 0; offset < (data?.length ?? 0); offset += 20) {
            chunks.push(...await Promise.all((data ?? []).slice(offset, offset + 20).map(async chunk => ({
                sequence: chunk.sequence, byteLength: chunk.byte_length, sha256: chunk.sha256, url: await signStoredObject(chunk.object_key),
            }))));
        }
        if (!data || data.length < 500) break;
    }
    return { chunks, expectedChunks: part.expected_chunks as number | null };
}

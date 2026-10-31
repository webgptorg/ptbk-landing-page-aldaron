/** Explicit one-time import. Source and checkpoint must stay outside the public checkout. No speech is generated. */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { createHash } from 'node:crypto';
import type { SharedMessage } from '../../lib/messages/messageTypes';
import { createClient } from '@supabase/supabase-js';
import { createMessagePrefix, PAVOL_MESSAGE_AGENT_ID } from '../../lib/messages/messageModel';

async function main() {
    const [sourcePath, audioPath, checkpointPath] = process.argv.slice(2);
    if (!sourcePath || !audioPath || !checkpointPath) throw new Error('Usage: import-legacy-message.ts <message.json> <audio.mp3> <checkpoint.json>');
    for (const file of [sourcePath, audioPath, checkpointPath]) {
        const relative = path.relative(process.cwd(), path.resolve(file));
        if (!relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Editorial files must be outside the public checkout.');
    }
    const source = JSON.parse(await readFile(sourcePath, 'utf8')) as SharedMessage;
    if (source.version !== 1 || typeof source.markdown !== 'string' || typeof source.context !== 'string' || !source.audio) throw new Error('Invalid legacy source.');
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
    let id: string | undefined;
    try { id = (JSON.parse(await readFile(checkpointPath, 'utf8')) as { id?: string }).id; } catch { /* First explicit import. */ }
    if (!id) {
        const { generateShortcode } = await import('../../lib/shortener/generateShortcode');
        const { data, error } = await client.rpc('save_expanded_message', {
            target_id: null, target_title: source.title, target_markdown: source.markdown, target_context: source.context,
            target_introduction: 'V téhle zprávě rozděluji první vydání appky od navazujících kroků. Můžeme probrat minimum pro V0, ovládání celého projektu nebo kontrakt mezi appkou a enginem.',
            target_prefix: createMessagePrefix(source.title), target_domain: 'pavolhejny.cz', target_agent_id: PAVOL_MESSAGE_AGENT_ID,
            target_code_suffix: generateShortcode(),
        });
        if (error || !data) throw new Error('Import creation failed: ' + (error?.message ?? 'no ID'));
        id = data;
        await writeFile(checkpointPath, JSON.stringify({ id }), { mode: 0o600 });
    }
    const bytes = await readFile(audioPath);
    if (bytes.length !== source.audio.byteLength) throw new Error('Audio size differs from the reviewed source.');
    const audioHash = createHash('sha256').update(bytes).digest('hex');
    const key = `messages/${id}/legacy-${audioHash}.mp3`;
    const storage = client.storage.from(process.env.OBJECT_STORAGE_BUCKET!);
    const upload = await storage.upload(key, bytes, { contentType: 'audio/mpeg', upsert: false, cacheControl: '3600' });
    if (upload.error && upload.error.message !== 'The resource already exists') throw new Error('Audio upload failed: ' + upload.error.message);
    const download = await storage.download(key);
    if (download.error || !download.data || createHash('sha256').update(Buffer.from(await download.data.arrayBuffer())).digest('hex') !== audioHash) throw new Error('Stored audio did not pass integrity verification.');
    const { error: saveError } = await client.from('messages').update({ created_at: source.createdAt, audio: {
        ...source.audio, key, textHash: createHash('sha256').update(source.markdown).digest('hex'), timings: source.timings,
    } }).eq('id', id);
    if (saveError) throw new Error('Could not attach imported audio.');
    const { data, error } = await client.from('messages').select('prefix,code_suffix,domain,markdown,context,audio').eq('id', id).single();
    if (error || data?.markdown !== source.markdown || data?.context !== source.context || !isDeepStrictEqual(data?.audio?.timings, source.timings))
        throw new Error('Imported text or timing verification failed.');
    console.log(JSON.stringify({ id, url: `https://${data.domain}/${data.prefix}-${data.code_suffix}`, audioBytes: bytes.length, timedWords: data.audio.timings?.words?.length, verified: true }));
}
main().catch((error) => { console.error(error instanceof Error ? error.message : 'Import failed.'); process.exitCode = 1; });

#!/usr/bin/env node
/** Manual, one-recording API command. Never imported by the website or a build. */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';

const [id, mode = '--check'] = process.argv.slice(2);
if (!id || !['--check', '--run'].includes(mode)) throw new Error('Usage: node scripts/podcasts/transcribe.mjs <recording-id> [--check | --run]');
const index = JSON.parse(await readFile('podcasts/transcripts/index.json', 'utf8'));
const recording = index.recordings.find(item => item.id === id);
if (!recording) throw new Error('Select a reviewed recording from podcasts/transcripts/index.json.');
if (!recording.mediaUrl?.startsWith('https://')) throw new Error('A reviewed HTTPS media source is required.');
const outputDirectory = path.resolve('.tmp/podcast-transcriptions');
const outputFile = path.join(outputDirectory, `${id}.scribe.json`);
const startedFile = path.join(outputDirectory, `${id}.started.json`);
const exists = async filename => { try { await access(filename); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; } };
if (recording.status === 'transcribed' || await exists(outputFile)) {
    console.log(JSON.stringify({ id, status: 'already_transcribed', outputFile }));
    process.exit(0);
}
if (mode === '--check') {
    console.log(JSON.stringify({ id, status: 'ready_for_explicit_run', durationInSeconds: recording.durationInSeconds,
        outputFile, keyAvailable: Boolean(process.env.ELEVENLABS_API_KEY?.trim()) }));
    process.exit(0);
}
if (await exists(startedFile)) throw new Error('An earlier paid request may have completed. Check ElevenLabs history before another request; no automatic retry.');
const key = process.env.ELEVENLABS_API_KEY?.trim();
if (!key) throw new Error('Provide ELEVENLABS_API_KEY through a secret manager or a private environment; never put it in arguments or source.');
await mkdir(outputDirectory, { recursive: true });
const form = new FormData();
for (const [name, value] of Object.entries({ model_id: 'scribe_v2', source_url: recording.mediaUrl, language_code: 'cs',
    diarize: 'true', use_speaker_library: 'true', timestamps_granularity: 'word', no_verbatim: 'false', tag_audio_events: 'true' })) form.append(name, value);
await writeFile(startedFile, JSON.stringify({ id, sourceUrl: recording.mediaUrl, startedAt: new Date().toISOString() }, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ id, status: 'transcribing' }));
try {
    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST', headers: { 'xi-api-key': key }, body: form, redirect: 'error', signal: AbortSignal.timeout(30 * 60 * 1000),
    });
    if (!response.ok) throw new Error(`ElevenLabs returned HTTP ${response.status}. Check permissions, quota and source access; inspect history before retrying.`);
    // Preserve paid results before validation or conversion. A later local failure must never spend credits again.
    const raw = await response.text();
    const partial = `${outputFile}.partial`;
    await writeFile(partial, raw, { flag: 'wx' });
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.words) || !parsed.words.length) throw new Error('The provider result was retained but contains no word timings. Review it before import.');
    await writeFile(outputFile, raw, { flag: 'wx' });
    console.log(JSON.stringify({ id, status: 'saved', outputFile, words: parsed.words.length }));
} catch (error) {
    if (error instanceof Error && error.message.startsWith('ElevenLabs returned HTTP ')) console.error(error.message);
    else console.error('Transcription interrupted or could not be validated. Retained results and request state are in .tmp/podcast-transcriptions; inspect them and provider history before retrying.');
    process.exitCode = 1;
}

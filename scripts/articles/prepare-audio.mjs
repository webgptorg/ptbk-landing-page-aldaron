#!/usr/bin/env node
/**
 * MANUAL EDITORIAL TOOL. No build hook, runtime TTS or implicit regeneration.
 * Official API checked 2026-10-20; references are in README.md beside this file.
 */
import { readFile, writeFile, mkdir, stat, mkdtemp, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveArticleDirectory } from './generate-manifest.mjs';
import { splitScript, validateAlignment, alignmentToWords, wordsToVtt } from './audio-timing.mjs';

const apiOrigin = 'https://api.elevenlabs.io';
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const exists = async (filename) => { try { await stat(filename); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; } };

async function apiJson(endpoint, key, body) {
    const response = await fetch(`${apiOrigin}${endpoint}`, {
        method: body ? 'POST' : 'GET', redirect: 'error',
        headers: { 'xi-api-key': key, ...(body ? { 'Content-Type': 'application/json' } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(300000),
    });
    // Never include credentials, request headers or untrusted response bodies in errors/logs.
    if (!response.ok) throw new Error(`ElevenLabs ${body ? 'generation' : 'verification'} failed (HTTP ${response.status}). Check API permissions, quota and voice access in ElevenLabs.`);
    return { data: await response.json(), requestId: response.headers.get('request-id') ?? response.headers.get('x-request-id') };
}

async function findVoice(key, name, requestedId) {
    const matches = [];
    const visited = new Set();
    let token;
    do {
        const query = new URLSearchParams({ search: name, page_size: '100' });
        if (token) query.set('next_page_token', token);
        const { data } = await apiJson(`/v2/voices?${query}`, key);
        if (!Array.isArray(data.voices)) throw new Error('Unexpected ElevenLabs voice-list response.');
        matches.push(...data.voices.filter((voice) => voice.name === name && (!requestedId || voice.voice_id === requestedId)));
        token = data.has_more ? data.next_page_token : undefined;
        if (data.has_more && (!token || visited.has(token))) throw new Error('Invalid ElevenLabs voice pagination; no voice selected.');
        if (token) visited.add(token);
    } while (token);
    if (matches.length !== 1) throw new Error(`Expected exactly one accessible voice named "${name}"; found ${matches.length}. Resolve duplicates with --voice-id. No speech was generated.`);
    return matches[0];
}

function readOptions(args) {
    const options = { generate: false, voiceName: 'Pavol Hejný 2026', modelId: 'eleven_multilingual_v2', language: 'cs' };
    const positional = [];
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--generate') options.generate = true;
        else if (arg === '--check') { /* Safe read-only default. */ }
        else if (['--voice-id', '--voice-name', '--model', '--language'].includes(arg)) {
            const value = args[++i];
            if (!value || value.startsWith('--')) throw new Error(`Missing value for ${arg}.`);
            options[{ '--voice-id': 'voiceId', '--voice-name': 'voiceName', '--model': 'modelId', '--language': 'language' }[arg]] = value;
        } else if (arg.startsWith('--')) throw new Error(`Unknown option ${arg}.`);
        else positional.push(arg);
    }
    if (positional.length !== 1) throw new Error('Usage: node scripts/articles/prepare-audio.mjs <article-id> [--check | --generate] [--voice-id ID] [--model ID]');
    return { ...options, articleId: positional[0] };
}

async function finalizeRecording(directory, chunks, script, provenance) {
    const audioDirectory = path.join(directory, 'audio');
    const finalFile = path.join(audioDirectory, 'narration.mp3');
    if (await exists(finalFile)) throw new Error('narration.mp3 already exists. Review it instead of overwriting or regenerating it.');
    const temporary = await mkdtemp(path.join(tmpdir(), 'ptbk-article-audio-'));
    const alignment = { characters: [], character_start_times_seconds: [], character_end_times_seconds: [] };
    let offset = 0;
    const pcmFiles = [];
    try {
        for (let i = 0; i < chunks.length; i++) {
            const chunkDirectory = path.join(audioDirectory, 'generation', `chunk-${String(i + 1).padStart(4, '0')}`);
            const pcm = path.join(temporary, `${i}.pcm`);
            execFileSync('ffmpeg', ['-v', 'error', '-i', path.join(chunkDirectory, 'audio.mp3'), '-f', 's16le', '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '1', pcm], { stdio: ['ignore', 'ignore', 'pipe'] });
            const pcmBytes = await readFile(pcm);
            const duration = pcmBytes.length / (44100 * 2);
            const local = validateAlignment(JSON.parse(await readFile(path.join(chunkDirectory, 'alignment.json'), 'utf8')));
            const maxEnd = Math.max(...local.character_end_times_seconds);
            if (maxEnd > duration + 0.1) throw new Error(`Chunk ${i + 1} timestamps exceed decoded audio duration. Review alignment before publishing.`);
            alignment.characters.push(...local.characters);
            alignment.character_start_times_seconds.push(...local.character_start_times_seconds.map((time) => time + offset));
            alignment.character_end_times_seconds.push(...local.character_end_times_seconds.map((time) => time + offset));
            pcmFiles.push(pcmBytes);
            offset += duration;
        }
        const combinedPcm = path.join(temporary, 'combined.pcm');
        await writeFile(combinedPcm, Buffer.concat(pcmFiles));
        const temporaryMp3 = path.join(temporary, 'narration.mp3');
        execFileSync('ffmpeg', ['-v', 'error', '-f', 's16le', '-ar', '44100', '-ac', '1', '-i', combinedPcm, '-codec:a', 'libmp3lame', '-b:a', '128k', '-write_xing', '1', temporaryMp3], { stdio: ['ignore', 'ignore', 'pipe'] });
        const duration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', temporaryMp3], { encoding: 'utf8' }).trim());
        if (!Number.isFinite(duration) || duration <= 0) throw new Error('Could not verify final MP3 duration.');
        const words = alignmentToWords(alignment, provenance.language);
        await writeFile(path.join(audioDirectory, 'alignment.raw.json'), `${JSON.stringify({ version: 1, source: 'elevenlabs-character-alignment', scriptSha256: sha256(script), alignment, words }, null, 2)}\n`);
        await writeFile(path.join(audioDirectory, 'subtitles.vtt'), wordsToVtt(words));
        const finalMp3 = await readFile(temporaryMp3);
        await writeFile(finalFile, finalMp3, { flag: 'wx' });
        await writeFile(path.join(audioDirectory, 'generation.json'), `${JSON.stringify({ ...provenance, createdAt: new Date().toISOString(), scriptSha256: sha256(script), durationSeconds: duration, decodedDurationSeconds: offset, audioSha256: sha256(finalMp3), outputFile: 'audio/narration.mp3', status: 'awaiting-editorial-review', visualMapping: 'not-yet-verified' }, null, 2)}\n`);
        console.log(`Saved one final MP3 (${duration.toFixed(2)} s), real character/word timestamps, exact requests and spoken subtitles. Metadata remains pending until listening and visual mapping are reviewed.`);
    } finally { await rm(temporary, { recursive: true, force: true }); }
}

export async function main(args = process.argv.slice(2)) {
    const options = readOptions(args);
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) throw new Error('ELEVENLABS_API_KEY is not available. Supply it through a secure environment or secret manager; never paste it into chat, a command argument or a tracked file.');
    const directory = await resolveArticleDirectory(options.articleId);
    const script = await readFile(path.join(directory, 'audio', 'script.txt'), 'utf8');
    if (!script.trim()) throw new Error('The adapted audio/script.txt is empty.');
    const [voice, modelResult] = await Promise.all([findVoice(key, options.voiceName, options.voiceId), apiJson('/v1/models', key)]);
    if (!Array.isArray(modelResult.data)) throw new Error('Unexpected ElevenLabs model-list response.');
    const model = modelResult.data.find((entry) => entry.model_id === options.modelId);
    if (!model?.can_do_text_to_speech || !model.languages?.some((entry) => entry.language_id === options.language)) throw new Error('Selected model is not currently verified for speech in the requested language. No speech was generated.');
    const currentLimit = model.maximum_text_length_per_request;
    if (!Number.isInteger(currentLimit) || currentLimit < 100) throw new Error('The API did not return a usable maximum_text_length_per_request. Inspect the model before generating.');
    const chunks = splitScript(script, Math.min(currentLimit, 4000));
    console.log(`Verified voice: ${voice.name} (${voice.voice_id}); model: ${model.model_id}; language: ${options.language}; ${script.length} characters in ${chunks.length} requests.`);
    if (!options.generate) { console.log('Read-only verification complete. To perform this one-time paid generation, rerun with --generate.'); return; }
    // Check local prerequisites before the first billable request.
    for (const command of ['ffmpeg', 'ffprobe']) {
        try { execFileSync(command, ['-version'], { stdio: 'ignore' }); }
        catch { throw new Error(`${command} is required for one-file MP3 assembly and duration verification. No speech was generated.`); }
    }
    if (await exists(path.join(directory, 'audio', 'narration.mp3'))) throw new Error('narration.mp3 already exists. This tool never automatically regenerates a finished recording.');
    const provenance = { provider: 'ElevenLabs', voiceId: voice.voice_id, voiceName: voice.name, modelId: model.model_id, language: options.language, outputFormat: 'mp3_44100_128', storedVoiceSettings: voice.settings ?? null, source: 'https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps' };
    for (let i = 0; i < chunks.length; i++) {
        const chunkDirectory = path.join(directory, 'audio', 'generation', `chunk-${String(i + 1).padStart(4, '0')}`);
        const request = { text: chunks[i], model_id: model.model_id, ...(i ? { previous_text: chunks[i - 1].slice(-1000) } : {}), ...(i + 1 < chunks.length ? { next_text: chunks[i + 1].slice(0, 1000) } : {}) };
        const record = { ...provenance, request };
        const recordString = `${JSON.stringify(record, null, 2)}\n`;
        const requestFile = path.join(chunkDirectory, 'request.json');
        if (await exists(requestFile)) {
            if ((await readFile(requestFile, 'utf8')) !== recordString) throw new Error(`Existing chunk ${i + 1} was generated from different inputs. Review it manually; no overwrite is allowed.`);
            if (await exists(path.join(chunkDirectory, 'audio.mp3')) && await exists(path.join(chunkDirectory, 'alignment.json'))) { console.log(`Reusing completed chunk ${i + 1}/${chunks.length}.`); continue; }
            // A prior request may have incurred cost even if its response was lost. Never silently retry it.
            throw new Error(`Chunk ${i + 1} has an incomplete previous attempt. Check ElevenLabs history before removing that chunk directory and retrying.`);
        }
        await mkdir(chunkDirectory, { recursive: true });
        await writeFile(requestFile, recordString, { flag: 'wx' });
        await writeFile(path.join(chunkDirectory, 'script.txt'), chunks[i], { flag: 'wx' });
        const { data, requestId } = await apiJson(`/v1/text-to-speech/${encodeURIComponent(voice.voice_id)}/with-timestamps?output_format=mp3_44100_128`, key, request);
        if (typeof data.audio_base64 !== 'string' || !data.audio_base64.length) throw new Error(`Chunk ${i + 1} response contains no audio. Check ElevenLabs history before retrying.`);
        const alignment = validateAlignment(data.alignment);
        const audio = Buffer.from(data.audio_base64, 'base64');
        if (audio.length < 100) throw new Error(`Chunk ${i + 1} response contains no usable MP3.`);
        await writeFile(path.join(chunkDirectory, 'audio.mp3'), audio, { flag: 'wx' });
        await writeFile(path.join(chunkDirectory, 'alignment.json'), `${JSON.stringify(alignment, null, 2)}\n`, { flag: 'wx' });
        await writeFile(path.join(chunkDirectory, 'response.json'), `${JSON.stringify({ requestId, createdAt: new Date().toISOString(), ...(data.normalized_alignment ? { normalizedAlignment: data.normalized_alignment } : {}) }, null, 2)}\n`, { flag: 'wx' });
        console.log(`Saved chunk ${i + 1}/${chunks.length}.`);
    }
    await finalizeRecording(directory, chunks, script, provenance);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch((error) => { console.error(error.message); process.exitCode = 1; });

#!/usr/bin/env node
/** Explicit editorial file transfer. Never a build hook or TTS generation step. */
import { createHash } from 'node:crypto';
import { readFile, writeFile, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { resolveArticleDirectory } from './generate-manifest.mjs';

const articleId = process.argv[2];
const repository = 'webgptorg/ptbk-landing-page-aldaron';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

async function main() {
    if (process.argv.length !== 3) throw new Error('Usage: node scripts/articles/import-audio-blobs.mjs <article-id>');
    const directory = await resolveArticleDirectory(articleId);
    const manifest = JSON.parse(await readFile(path.join(directory, 'audio/import.json'), 'utf8'));
    if (manifest.schemaVersion !== 1 || manifest.articleId !== articleId || manifest.file !== 'audio/narration.mp3'
        || !Number.isInteger(manifest.bytes) || manifest.bytes < 100 || manifest.bytes > 100_000_000
        || !/^[a-f0-9]{64}$/.test(manifest.sha256) || !/^[a-f0-9]{40}$/.test(manifest.gitBlobSha)
        || !Array.isArray(manifest.parts) || !manifest.parts.length || manifest.parts.length > 256
        || manifest.parts.some((sha) => !/^[a-f0-9]{40}$/.test(sha))) throw new Error('Invalid reviewed audio import manifest.');
    const target = path.join(directory, manifest.file);
    const valid = (bytes) => bytes.length === manifest.bytes && hash(bytes) === manifest.sha256
        && createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex') === manifest.gitBlobSha;
    try {
        const existing = await readFile(target);
        if (!valid(existing)) throw new Error('A different recording already exists; refusing to overwrite it.');
        console.log('The exact reviewed MP3 already exists. No download or generation was needed.');
        return;
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (!process.env.GITHUB_TOKEN) throw new Error('A scoped GITHUB_TOKEN is required for the explicit file import.');
    const parts = [];
    for (const sha of manifest.parts) {
        const response = await fetch(`https://api.github.com/repos/${repository}/git/blobs/${sha}`, {
            headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
            redirect: 'error', signal: AbortSignal.timeout(30_000),
        });
        if (!response.ok) throw new Error(`Audio file transfer failed (HTTP ${response.status}); nothing was published.`);
        const blob = await response.json();
        if (blob.sha !== sha || blob.encoding !== 'base64' || typeof blob.content !== 'string' || blob.size > 393216) throw new Error('Unexpected audio part.');
        const bytes = Buffer.from(blob.content.replace(/\s/g, ''), 'base64');
        if (bytes.length !== blob.size || createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex') !== sha) throw new Error('An audio part failed its transfer checksum.');
        parts.push(bytes);
    }
    const bytes = Buffer.concat(parts);
    if (!valid(bytes)) throw new Error('The assembled file does not match the reviewed MP3. Nothing was published.');
    const temporary = `${target}.importing`;
    try {
        await writeFile(temporary, bytes, { flag: 'wx' });
        await rename(temporary, target);
    } finally { await rm(temporary, { force: true }); }
    console.log(`Imported the exact reviewed MP3: ${bytes.length} bytes. No audio was generated or retimed.`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });

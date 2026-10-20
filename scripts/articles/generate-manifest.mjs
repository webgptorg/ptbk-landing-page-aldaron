#!/usr/bin/env node
/** Explicit editorial command only. Never import this from a build or request path. */
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile, lstat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const mimeTypes = { '.md': 'text/markdown', '.yaml': 'application/yaml', '.yml': 'application/yaml', '.json': 'application/json', '.txt': 'text/plain', '.pdf': 'application/pdf', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.vtt': 'text/vtt', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css' };

export async function resolveArticleDirectory(articleId) {
    if (!articleId || !/^[a-z0-9][a-z0-9-]*$/.test(articleId)) throw new Error('Specify one article ID using lowercase letters, digits and hyphens.');
    const articlesRoot = await realpath(path.join(repositoryRoot, 'articles'));
    const directory = await realpath(path.join(articlesRoot, articleId));
    if (path.dirname(directory) !== articlesRoot) throw new Error('Article directory must be a direct child of articles/.');
    return directory;
}

export async function collectFiles(directory, relative = '') {
    const result = [];
    for (const entry of (await readdir(path.join(directory, relative), { withFileTypes: true })).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
        if (entry.name.startsWith('.') || (!relative && entry.name === 'metadata.json')) continue;
        const filePath = path.join(relative, entry.name);
        if ((await lstat(path.join(directory, filePath))).isSymbolicLink()) throw new Error(`Article files must not be symbolic links: ${filePath}`);
        if (entry.isDirectory()) result.push(...await collectFiles(directory, filePath));
        else if (entry.isFile()) {
            const bytes = await readFile(path.join(directory, filePath));
            result.push({ path: filePath.split(path.sep).join('/'), sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length, mimeType: mimeTypes[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream' });
        }
    }
    return result;
}

export function compareManifests(expected, actual) {
    const old = new Map(expected.map((entry) => [entry.path, entry]));
    const current = new Map(actual.map((entry) => [entry.path, entry]));
    const differences = [];
    for (const [name, entry] of current) {
        const prior = old.get(name);
        if (!prior) differences.push(`unrecorded: ${name}`);
        else if (prior.sha256 !== entry.sha256 || prior.bytes !== entry.bytes || prior.mimeType !== entry.mimeType) differences.push(`changed: ${name}`);
    }
    for (const name of old.keys()) if (!current.has(name)) differences.push(`missing: ${name}`);
    return differences;
}

export async function main(args = process.argv.slice(2)) {
    const audit = args.includes('--audit');
    if (args.some((arg) => arg.startsWith('--') && arg !== '--audit')) throw new Error('Usage: node scripts/articles/generate-manifest.mjs <article-id> [--audit]');
    const ids = args.filter((arg) => !arg.startsWith('--'));
    if (ids.length !== 1) throw new Error('Usage: node scripts/articles/generate-manifest.mjs <article-id> [--audit]');
    const directory = await resolveArticleDirectory(ids[0]);
    const manifestPath = path.join(directory, 'metadata.json');
    let prior = { schemaVersion: 1, files: [] };
    try { prior = JSON.parse(await readFile(manifestPath, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    const files = await collectFiles(directory);
    if (audit) {
        const differences = compareManifests(prior.files ?? [], files);
        if (differences.length) throw new Error(`Manual audit found differences:\n${differences.join('\n')}`);
        console.log(`Manual audit passed: ${files.length} files. No media generated.`);
        return;
    }
    await writeFile(manifestPath, `${JSON.stringify({ ...prior, schemaVersion: 1, files }, null, 2)}\n`);
    console.log(`Recorded SHA-256, MIME and byte size for ${files.length} files. Audio provenance preserved. No media generated.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch((error) => { console.error(error.message); process.exitCode = 1; });

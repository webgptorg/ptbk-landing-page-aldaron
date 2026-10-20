import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { collectFiles, compareManifests } from './generate-manifest.mjs';
import { splitScript, validateAlignment, alignmentToWords, wordsToVtt } from './audio-timing.mjs';

test('manual manifest hashes assets, excludes itself and reports changed/added/missing files', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'ptbk-manifest-check-'));
    try {
        await writeFile(path.join(directory, 'metadata.json'), '{"files":[]}');
        await writeFile(path.join(directory, 'content.md'), '# Článek');
        await mkdir(path.join(directory, 'audio'));
        await writeFile(path.join(directory, 'audio', 'script.txt'), 'Článek.');
        const original = await collectFiles(directory);
        assert.equal(original.length, 2);
        assert.equal(original.find((entry) => entry.path === 'content.md').bytes, Buffer.byteLength('# Článek'));
        assert.deepEqual(compareManifests(original, await collectFiles(directory)), []);
        await writeFile(path.join(directory, 'content.md'), '# Změna');
        await writeFile(path.join(directory, 'article.pdf'), 'fixture');
        await rm(path.join(directory, 'audio', 'script.txt'));
        assert.deepEqual(compareManifests(original, await collectFiles(directory)), ['unrecorded: article.pdf', 'changed: content.md', 'missing: audio/script.txt']);
    } finally { await rm(directory, { recursive: true, force: true }); }
});

test('chunking preserves the exact submitted text including separators', () => {
    const script = 'Titulek.\n\n' + 'Tohle je česká věta. '.repeat(150) + '\n\nPoslední odstavec.\n';
    const chunks = splitScript(script, 700);
    assert.equal(chunks.join(''), script);
    assert.ok(chunks.length > 1);
    assert.ok(chunks.every((chunk) => chunk.length <= 700));
    assert.throws(() => splitScript('x'.repeat(1000), 200), /token exceeds/);
});

test('word and sentence timings come from actual provider arrays, including non-BMP text', () => {
    const characters = Array.from('Ahoj světe. 🙂 Dál.');
    const alignment = { characters, character_start_times_seconds: characters.map((_, index) => index / 10), character_end_times_seconds: characters.map((_, index) => (index + 1) / 10) };
    const words = alignmentToWords(alignment);
    assert.equal(words[0].start, 0);
    assert.equal(words[0].end, 0.4);
    assert.equal(words[1].text, 'světe.');
    assert.equal(words.at(-1).text, 'Dál.');
    assert.equal(words.at(-1).end, characters.length / 10);
    assert.notEqual(words[0].sentenceId, words.at(-1).sentenceId);
    const vtt = wordsToVtt(words);
    assert.match(vtt, /^WEBVTT\n\n/);
    assert.match(vtt, /00:00:00.000 --> 00:00:01.100/);
    assert.throws(() => validateAlignment({ ...alignment, character_end_times_seconds: [] }), /array lengths/);
    assert.throws(() => validateAlignment({ ...alignment, character_start_times_seconds: characters.map(() => -1) }), /Invalid character/);
});

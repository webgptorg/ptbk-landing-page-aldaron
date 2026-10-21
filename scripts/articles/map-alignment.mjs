#!/usr/bin/env -S npx tsx
/** Explicit review/publish step; no guessed matching or invented timestamps. Run with tsx. */
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import { resolveArticleDirectory } from './generate-manifest.mjs';
import { renderArticleCover, renderArticleDocument } from '../../businesses/articles/articleDocument.ts';

const hash = (text) => createHash('sha256').update(text).digest('hex');
const args = process.argv.slice(2);
const articleId = args.find((arg) => !arg.startsWith('--'));
if (!articleId || args.some((arg) => arg.startsWith('--') && !['--template', '--publish-reviewed'].includes(arg)) || args.filter((arg) => !arg.startsWith('--')).length !== 1) {
    console.error('Usage: npx tsx scripts/articles/map-alignment.mjs <article-id> --template | --publish-reviewed');
    process.exitCode = 1;
} else {
    try {
        const directory = await resolveArticleDirectory(articleId);
        const markdown = await readFile(path.join(directory, 'content.md'), 'utf8');
        const script = await readFile(path.join(directory, 'audio', 'script.txt'), 'utf8');
        const editorial = yaml.load(await readFile(path.join(directory, 'metadata.yaml'), 'utf8'));
        const { words: bodyWords } = renderArticleDocument(markdown, editorial.title, editorial.perex);
        const coverWords = renderArticleCover(editorial.title, editorial.perex).words;
        const raw = JSON.parse(await readFile(path.join(directory, 'audio', 'alignment.raw.json'), 'utf8'));
        if (raw.scriptSha256 !== hash(script)) throw new Error('The script changed after generation. Review the recording explicitly; this command never regenerates it.');
        const mapPath = path.join(directory, 'audio', 'text-map.json');
        if (args.includes('--template')) {
            await writeFile(mapPath, `${JSON.stringify({ version: 1, contentSha256: hash(markdown), scriptSha256: hash(script), includesCover: true, reviewed: false, timingReviewed: false, listeningReviewed: false, reviewedBy: null, reviewedAt: null, visualWords: [...coverWords, ...bodyWords], spokenWords: raw.words, map: [], excludedVisualWords: [], excludedSpokenWords: [] }, null, 2)}\n`, { flag: 'wx' });
            console.log('Created an UNMAPPED review template. Map every spoken token and visual word explicitly; no timing was guessed or published.');
        } else if (args.includes('--publish-reviewed')) {
            const mapping = JSON.parse(await readFile(mapPath, 'utf8'));
            if (mapping.version !== 1 || mapping.contentSha256 !== hash(markdown) || mapping.scriptSha256 !== hash(script)) throw new Error('Review mapping does not match the current article and exact submitted script.');
            if (mapping.reviewed !== true || (mapping.listeningReviewed !== true && mapping.timingReviewed !== true) || !mapping.reviewedBy?.trim() || !Number.isFinite(Date.parse(mapping.reviewedAt))) throw new Error('Timing and visual mapping must be explicitly reviewed, with reviewer and date, before publication.');
            const visualWords = mapping.includesCover ? [...coverWords, ...bodyWords] : bodyWords;
            const visual = new Map(visualWords.map((word) => [word.id, word.text]));
            const usedVisual = new Set();
            const usedSpoken = new Set();
            const timed = [];
            for (const entry of mapping.map ?? []) {
                if (visual.get(entry.wordId) !== entry.visualText || usedVisual.has(entry.wordId)) throw new Error(`Invalid, changed or duplicate visual word: ${entry.wordId}`);
                if (!Array.isArray(entry.spokenIndexes) || !entry.spokenIndexes.length) throw new Error(`No real audio tokens mapped to ${entry.wordId}.`);
                if (entry.spokenIndexes.some((index, position) => position > 0 && index !== entry.spokenIndexes[position - 1] + 1)) throw new Error(`Spoken tokens for ${entry.wordId} must be consecutive and in order.`);
                const spoken = entry.spokenIndexes.map((index) => {
                    if (!Number.isInteger(index) || !raw.words[index] || usedSpoken.has(index)) throw new Error(`Unknown spoken token index ${index}.`);
                    usedSpoken.add(index);
                    return raw.words[index];
                });
                if (spoken.some((word) => word.sentenceId !== spoken[0].sentenceId)) throw new Error(`Visual word ${entry.wordId} spans different spoken sentences; review the map.`);
                usedVisual.add(entry.wordId);
                timed.push({ start: Math.min(...spoken.map((word) => word.start)), end: Math.max(...spoken.map((word) => word.end)), text: entry.visualText, wordId: entry.wordId, sentenceId: spoken[0].sentenceId });
            }
            for (const entry of mapping.excludedVisualWords ?? []) {
                if (visual.get(entry.wordId) !== entry.text || usedVisual.has(entry.wordId) || !entry.reason?.trim()) throw new Error('Each non-spoken visual token needs its exact text and a reason.');
                usedVisual.add(entry.wordId);
            }
            for (const entry of mapping.excludedSpokenWords ?? []) {
                if (raw.words[entry.index]?.text !== entry.text || usedSpoken.has(entry.index) || !entry.reason?.trim()) throw new Error('Each spoken-only token needs its exact text and a reason.');
                usedSpoken.add(entry.index);
            }
            if (usedVisual.size !== visualWords.length || usedSpoken.size !== raw.words.length || !timed.length) throw new Error(`Mapping is incomplete: ${usedVisual.size}/${visualWords.length} visual and ${usedSpoken.size}/${raw.words.length} spoken tokens accounted for.`);
            timed.sort((a, b) => a.start - b.start || a.end - b.end);
            const generation = JSON.parse(await readFile(path.join(directory, 'audio', 'generation.json'), 'utf8'));
            if (generation.scriptSha256 !== hash(script) || !Number.isFinite(generation.durationSeconds) || generation.durationSeconds <= 0) throw new Error('Missing verified recording provenance/duration.');
            const mp3 = await readFile(path.join(directory, 'audio', 'narration.mp3'));
            if (mp3.length < 100 || generation.audioSha256 !== hash(mp3)) throw new Error('The finished recording is missing or changed since alignment.');
            if (raw.audioSha256 && raw.audioSha256 !== hash(mp3)) throw new Error('The word alignment belongs to a different recording.');
            if (timed.some((word) => !Number.isFinite(word.start) || !Number.isFinite(word.end) || word.start < 0 || word.end <= word.start || word.end > generation.durationSeconds + 0.1)) throw new Error('A real timing falls outside the final recording.');
            const source = `${raw.source ?? 'elevenlabs-character-alignment'}-with-reviewed-visual-mapping`;
            await writeFile(path.join(directory, 'audio', 'words.json'), `${JSON.stringify({ version: 1, source, reviewedBy: mapping.reviewedBy, reviewedAt: mapping.reviewedAt, words: timed }, null, 2)}\n`);
            const metadataPath = path.join(directory, 'metadata.json');
            const metadata = JSON.parse(await readFile(metadataPath, 'utf8'));
            metadata.audio = { status: 'ready', file: 'audio/narration.mp3', durationSeconds: generation.durationSeconds, wordsFile: 'audio/words.json', subtitlesFile: 'audio/subtitles.vtt', voiceName: generation.voiceName, voiceId: generation.voiceId, modelId: generation.modelId, createdAt: generation.createdAt, provenance: generation, wordTimingsStatus: 'ready', wordTimingsSource: source, reviewedBy: mapping.reviewedBy, reviewedAt: mapping.reviewedAt };
            await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
            console.log(`Published ${timed.length} reviewed visual word mappings. Run generate-manifest.mjs manually, commit the files and build.`);
        } else throw new Error('Choose --template or --publish-reviewed.');
    } catch (error) { console.error(error.message); process.exitCode = 1; }
}

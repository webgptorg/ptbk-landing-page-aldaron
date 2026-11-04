#!/usr/bin/env node
/** Explicit offline import. Never run from build hooks, request handlers or scheduled jobs. */
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { scribeToVtt } from './scribe-vtt.mjs';

const [recordingId, inputFilename] = process.argv.slice(2);
if (!recordingId || !inputFilename) throw new Error('Usage: node scripts/podcasts/import-scribe.mjs <recording-id> <provider-json>');
const indexFilename = path.resolve('podcasts/transcripts/index.json');
const index = JSON.parse(await readFile(indexFilename, 'utf8'));
const recording = index.recordings.find(item => item.id === recordingId);
if (!recording) throw new Error('Recording must be reviewed in the archive index before import.');
const raw = await readFile(inputFilename);
const exported = JSON.parse(raw.toString('utf8'));
const result = exported.result ?? exported;
const converted = scribeToVtt(result, recordingId, recording.speakerMapping);
if (!converted.speakers.includes('pavol-hejny')) throw new Error('Pavol has not been identified. Review the speaker mapping before publishing.');
const lastEnd = Math.max(...converted.cues.map(cue => cue.end));
if (lastEnd < recording.durationInSeconds - 90 || lastEnd > recording.durationInSeconds + 90) {
    throw new Error('Transcript duration does not match the reviewed complete recording. Check the source or version.');
}
const vttFile = `podcasts/transcripts/${recordingId}.vtt`;
const rawFile = `podcasts/transcripts/raw/${recordingId}.scribe.json.gz`;
const sha256 = createHash('sha256').update(converted.vtt).digest('hex');
if (recording.status === 'transcribed' && recording.sha256 !== sha256) throw new Error('A different transcript is already committed. Review an explicit revision rather than overwriting it.');
await mkdir(path.dirname(rawFile), { recursive: true });
await writeFile(rawFile, gzipSync(raw, { mtime: 0 }));
await writeFile(vttFile, converted.vtt);
Object.assign(recording, { status: 'transcribed', transcriptFile: vttFile, rawFile, sha256,
    model: 'scribe_v2', importedAt: new Date().toISOString(), cueCount: converted.cues.length,
    actualLastCueEnd: lastEnd, speakerIds: converted.speakers });
if (recording.krajtaNumber !== undefined) {
    const episodeFilename = 'businesses/ai-ta-krajta/aiTaKrajtaEpisodes.json';
    const episodes = JSON.parse(await readFile(episodeFilename, 'utf8'));
    const episode = episodes.find(item => item.number === recording.krajtaNumber);
    if (!episode) throw new Error('The referenced Krajta episode no longer exists.');
    episode.transcriptFile = vttFile;
    delete episode.transcript;
    await writeFile(episodeFilename, JSON.stringify(episodes, null, 4) + '\n');
}
await writeFile(indexFilename, JSON.stringify(index, null, 2) + '\n');
console.log(JSON.stringify({ recordingId, vttFile, cues: converted.cues.length, speakerIds: converted.speakers }));

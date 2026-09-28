// Independently decode the eight-second editor fixture export with FFmpeg, outside browser codecs.
// Usage: node scripts/checkRecordingStudioEditor.mjs path/to/prepared-fixture.zip
// FFMPEG_PATH selects an installed binary. This never downloads a tool or uploads media.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { ZipReader, Uint8ArrayReader, Uint8ArrayWriter } from '@zip.js/zip.js';

const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const FRAME_WIDTH = 160;
const FRAME_HEIGHT = 90;
const AUDIO_SAMPLE_RATE = 48_000;
const archivePath = process.argv[2];
assert(archivePath, 'Pass the prepared-fixture.zip produced by the Playwright synchronization test.');
const archiveBytes = await readFile(archivePath);
assert(archiveBytes.length < 16 * 1024 * 1024, 'This checker accepts only the small deterministic fixture.');
const directory = await mkdtemp(join(tmpdir(), 'recording-editor-check-'));
const reader = new ZipReader(new Uint8ArrayReader(archiveBytes));
const decode = (filename, options) => {
    const result = spawnSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-i', filename, ...options, 'pipe:1'], { maxBuffer: 32 * 1024 * 1024 });
    if (result.error) throw result.error;
    assert.equal(result.status, 0, result.stderr.toString());
    return result.stdout;
};
const timecode = (frame) => {
    let ticks = 0;
    for (let bit = 0; bit < 12; bit++) if (frame[20 * FRAME_WIDTH + 13 + bit * 12] > 128) ticks += 1 << bit;
    return ticks / 100;
};
try {
    const entries = await reader.getEntries();
    const readEntry = async (filename) => {
        const entry = entries.find((candidate) => candidate.filename === filename);
        assert(entry && !entry.directory, `Missing archive file: ${filename}`);
        return entry.getData(new Uint8ArrayWriter());
    };
    const manifest = JSON.parse(new TextDecoder().decode(await readEntry('recording.json')));
    assert.equal(manifest.id, 'synchronized-fixture');
    assert.equal(manifest.schemaVersion, 3);
    assert.equal(manifest.isTrimIncluded, true);
    assert.equal(manifest.tracks.length, 3);
    const selection = manifest.editRecipe.selection;
    const duration = selection.endSeconds - selection.startSeconds;
    assert(duration > 0 && duration < 9);
    const report = { sessionId: manifest.id, selection, tracks: [] };
    for (const track of manifest.tracks) {
        assert.equal(track.preparation.status, 'prepared');
        assert(track.originalFile && track.trimmedFile);
        const filename = join(directory, basename(track.trimmedFile));
        await writeFile(filename, await readEntry(track.trimmedFile));
        const measured = { id: track.id, kind: track.kind };
        if (track.kind !== 'microphone') {
            const decoded = decode(filename, ['-map', '0:v:0', '-an', '-fps_mode', 'passthrough', '-pix_fmt', 'gray', '-f', 'rawvideo']);
            const frameSize = FRAME_WIDTH * FRAME_HEIGHT;
            const frameCount = decoded.length / frameSize;
            assert(Number.isInteger(frameCount) && frameCount > 0);
            measured.firstFrameSessionSeconds = timecode(decoded.subarray(0, frameSize));
            measured.lastFrameSessionSeconds = timecode(decoded.subarray(-frameSize));
            measured.frameCount = frameCount;
            assert(Math.abs(measured.firstFrameSessionSeconds - selection.startSeconds) <= 0.05, JSON.stringify(measured));
            assert(Math.abs(measured.lastFrameSessionSeconds - selection.endSeconds) <= 0.06, JSON.stringify(measured));
            // Independently inspect container timestamps as well as the decoded picture content.
            const packets = decode(filename, ['-map', '0:v:0', '-an', '-c:v', 'copy', '-f', 'framecrc']).toString();
            const timeBase = packets.match(/#tb 0:\s*(\d+)\/(\d+)/);
            assert(timeBase, 'Missing FFmpeg packet time base.');
            const secondsPerTick = Number(timeBase[1]) / Number(timeBase[2]);
            const timestamps = packets.split('\n').filter((line) => /^0,/.test(line)).map((line) => {
                const fields = line.split(',');
                return { start: Number(fields[2]) * secondsPerTick, end: (Number(fields[2]) + Number(fields[3])) * secondsPerTick };
            });
            assert(timestamps.length > 0);
            measured.videoStartSeconds = Math.min(...timestamps.map(({ start }) => start));
            measured.videoEndSeconds = Math.max(...timestamps.map(({ end }) => end));
            assert(Math.abs(measured.videoStartSeconds) <= 0.05, JSON.stringify(measured));
            assert(Math.abs(measured.videoEndSeconds - duration) <= 0.05, JSON.stringify(measured));
        }
        if (track.isAudioIncluded || track.kind === 'microphone') {
            const decoded = decode(filename, ['-map', '0:a:0', '-vn', '-ac', '1', '-ar', String(AUDIO_SAMPLE_RATE), '-f', 'f32le']);
            measured.audioDurationSeconds = decoded.length / 4 / AUDIO_SAMPLE_RATE;
            assert(Math.abs(measured.audioDurationSeconds - duration) <= 0.05, JSON.stringify(measured));
            const clapStarts = [];
            let lastLoudSample = -AUDIO_SAMPLE_RATE;
            for (let sample = 0; sample < decoded.length / 4; sample++) {
                if (Math.abs(decoded.readFloatLE(sample * 4)) < 0.08) continue;
                if (sample - lastLoudSample > AUDIO_SAMPLE_RATE * 0.1) clapStarts.push(sample / AUDIO_SAMPLE_RATE);
                lastLoudSample = sample;
            }
            measured.clapPreparedSeconds = clapStarts;
            const expectedClaps = Array.from({ length: Math.floor(selection.endSeconds) - Math.ceil(selection.startSeconds) + 1 }, (_, index) => Math.ceil(selection.startSeconds) + index - selection.startSeconds).filter((seconds) => seconds < duration);
            assert.equal(clapStarts.length, expectedClaps.length);
            measured.maximumClapErrorSeconds = Math.max(...clapStarts.map((seconds, index) => Math.abs(seconds - expectedClaps[index])));
            assert(measured.maximumClapErrorSeconds <= 0.05, JSON.stringify(measured));
        }
        report.tracks.push(measured);
    }
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} finally {
    await reader.close();
    // Only this process's freshly created temporary directory is removed.
    await rm(directory, { recursive: true, force: true });
}

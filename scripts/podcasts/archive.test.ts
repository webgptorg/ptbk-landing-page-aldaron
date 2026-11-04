import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { parseSubtitleFile } from '@/lib/workshops/subtitles/workshopSubtitleFormat';
import { readPodcastTranscript } from '@/lib/podcast/readPodcastTranscript';
import index from '@/podcasts/transcripts/index.json';
import episodes from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodes.json';

describe('the ten complete archival recordings', () => {
    it('retains every original token and real timing in a verified speaker-labelled VTT', () => {
        expect(index.recordings).toHaveLength(10);
        for (const entry of index.recordings) {
            expect(entry.status, entry.id).toBe('transcribed');
            const recording = entry as typeof entry & {
                transcriptFile: string; rawFile: string; sha256: string;
                sourceAudioDurationInSeconds: number;
                speakerMapping: Record<string, string>;
            };
            const vtt = readFileSync(recording.transcriptFile, 'utf8');
            const raw = JSON.parse(gunzipSync(readFileSync(recording.rawFile)).toString('utf8')) as {
                audio_duration_secs: number; words: { text: string; start: number; end: number }[];
            };
            const cues = parseSubtitleFile(vtt);
            expect(createHash('sha256').update(vtt).digest('hex'), entry.id).toBe(recording.sha256);
            expect(Math.abs(raw.audio_duration_secs - recording.sourceAudioDurationInSeconds), entry.id).toBeLessThan(2);
            expect(cues.length, entry.id).toBeGreaterThan(30);
            // Whitespace may change at cue boundaries; the actual spoken and event tokens must all survive.
            expect(cues.map(cue => cue.text).join('').replace(/\s/g, ''), entry.id).toBe(
                raw.words.map((word: { text: string }) => word.text).join('').replace(/\s/g, ''),
            );
            const starts = new Set(raw.words.map((word: { start: number }) => Math.round(word.start * 1000)));
            const ends = new Set(raw.words.map((word: { end: number }) => Math.round(word.end * 1000)));
            for (const cue of cues) {
                expect(starts.has(Math.round(cue.startSeconds * 1000)), entry.id).toBe(true);
                expect(ends.has(Math.round(cue.endSeconds * 1000)), entry.id).toBe(true);
            }
            expect(vtt, entry.id).toContain('<v pavol-hejny>');
            const voiceIds = Array.from(vtt.matchAll(/<v ([a-zA-Z0-9_-]+)>/g)).map(match => match[1]);
            expect(voiceIds.every(id => id === 'pavol-hejny' || id.startsWith(`${entry.id}-`)), entry.id).toBe(true);
        }
    });

    it('migrates only the seven selected Krajta rows while retaining searchable inline recordings', () => {
        const migrated = episodes.filter(episode => 'transcriptFile' in episode);
        expect(migrated.map(episode => episode.number).sort((a, b) => (a ?? -1) - (b ?? -1))).toEqual([56, 57, 61, 62, 63, 64, 65]);
        for (const episode of migrated) {
            expect('transcript' in episode).toBe(false);
            expect(readPodcastTranscript(episode).length).toBeGreaterThan(1000);
        }
        const legacy = episodes.filter(episode => !('transcriptFile' in episode));
        expect(legacy.length).toBeGreaterThan(0);
        for (const episode of legacy) expect(readPodcastTranscript(episode)).toBe(episode.transcript);
    });
});

import { readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import { parseSubtitleFile } from '@/lib/workshops/subtitles/workshopSubtitleFormat';

/** Committed transcripts are read on the server; neither source text nor filesystem paths enter page props. */
export type PodcastTranscriptSource = {
    readonly transcript?: string;
    readonly transcriptFile?: string;
};

const transcriptDirectory = resolve(process.cwd(), 'podcasts/transcripts');
const textByFilename = new Map<string, string>();

/** Keep inline archives working while individual recordings acquire a speaker-labelled WebVTT file. */
export function readPodcastTranscript(source: PodcastTranscriptSource): string {
    if (!source.transcriptFile) return source.transcript ?? '';

    const filename = resolve(process.cwd(), source.transcriptFile);
    const withinArchive = relative(transcriptDirectory, filename);
    if (!withinArchive || withinArchive.startsWith('..') || isAbsolute(withinArchive) || !filename.endsWith('.vtt')) {
        throw new Error('Podcast transcripts must be WebVTT files within podcasts/transcripts.');
    }

    const cached = textByFilename.get(filename);
    if (cached !== undefined) return cached;

    // Read only the text for existing full-text search. The original VTT keeps its times and voice spans intact.
    const text = parseSubtitleFile(readFileSync(filename, 'utf8')).map(cue => cue.text).join(' ');
    textByFilename.set(filename, text);
    return text;
}

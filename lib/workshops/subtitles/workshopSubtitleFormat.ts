import { MAXIMAL_SUBTITLE_FILE_BYTES, SUBTITLE_CUES_SCHEMA, type SubtitleCue } from './workshopSubtitleTypes';

const SUBTITLE_TIME_PATTERN = /^(?:(\d{2,}):)?([0-5]\d):([0-5]\d)[.,](\d{3})$/;
const SUBTITLE_ENTITIES: Readonly<Record<string, string>> = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', lrm: '\u200e', rlm: '\u200f',
};

/** Store plain Unicode text, never executable cue markup. */
export function normalizeSubtitleText(value: string): string {
    return value.replace(/<[^>]*>/g, '').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, name: string) => {
        if (!name.startsWith('#')) return SUBTITLE_ENTITIES[name.toLowerCase()] ?? entity;
        const codePoint = name.toLowerCase().startsWith('#x') ? parseInt(name.slice(2), 16) : Number(name.slice(1));
        return codePoint > 0 && codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : entity;
    }).replace(/\u0000/g, '').trim();
}

function parseSubtitleTime(value: string): number {
    const match = SUBTITLE_TIME_PATTERN.exec(value);
    if (!match) throw new Error(`Neplatný čas titulku: ${value}`);
    return Number(match[1] ?? 0) * 3600 + Number(match[2]) * 60 + Number(match[3]) + Number(match[4]) / 1000;
}

/** One strict SRT/WebVTT importer for pasted, uploaded and YouTube subtitles. */
export function parseSubtitleFile(value: string): SubtitleCue[] {
    if (new TextEncoder().encode(value).byteLength > MAXIMAL_SUBTITLE_FILE_BYTES) {
        throw new Error('Soubor titulků může mít nejvýše 2 MB.');
    }
    const blocks = value.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trim().split(/\n[ \t]*\n/);
    const cues: SubtitleCue[] = [];
    for (const block of blocks) {
        if (/^(WEBVTT(?:[ \t].*)?|NOTE(?:[ \t].*)?|STYLE|REGION)(?:\n|$)/.test(block)) continue;
        const lines = block.split('\n');
        const timingIndex = lines[0]?.includes('-->') ? 0 : 1;
        const timing = lines[timingIndex]?.match(/^(\S+)\s+-->\s+(\S+)(?:\s+.*)?$/);
        if (!timing) throw new Error('Očekáváme titulky ve formátu SRT nebo WebVTT, včetně časů.');
        cues.push({ startSeconds: parseSubtitleTime(timing[1]!), endSeconds: parseSubtitleTime(timing[2]!),
            text: normalizeSubtitleText(lines.slice(timingIndex + 1).join('\n')) });
    }
    const parsed = SUBTITLE_CUES_SCHEMA.safeParse(cues);
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Neplatné titulky.');
    return parsed.data;
}

export function formatSubtitleTime(seconds: number, separator = '.'): string {
    const milliseconds = Math.round(seconds * 1000);
    return `${String(Math.floor(milliseconds / 3_600_000)).padStart(2, '0')}:${String(Math.floor(milliseconds / 60_000) % 60).padStart(2, '0')}:${String(Math.floor(milliseconds / 1000) % 60).padStart(2, '0')}${separator}${String(milliseconds % 1000).padStart(3, '0')}`;
}

export function serializeSubtitleFile(cues: readonly SubtitleCue[], format: 'vtt' | 'srt' = 'vtt'): string {
    const separator = format === 'srt' ? ',' : '.';
    const body = cues.map((cue, index) => {
        const text = cue.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `${index + 1}\n${formatSubtitleTime(cue.startSeconds, separator)} --> ${formatSubtitleTime(cue.endSeconds, separator)}\n${text}`;
    }).join('\n\n');
    return `${format === 'vtt' ? 'WEBVTT\n\n' : ''}${body}\n`;
}

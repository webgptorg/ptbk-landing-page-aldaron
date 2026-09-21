import { z } from 'zod';
import { createYoutubeWatchUrl } from './youtubeEmbed';
import { parseSubtitleFile } from '@/lib/workshops/subtitles/workshopSubtitleFormat';
import { MAXIMAL_SUBTITLE_FILE_BYTES, type SubtitleCue } from '@/lib/workshops/subtitles/workshopSubtitleTypes';

const YOUTUBE_SUBTITLE_REQUEST_TIMEOUT_MILLISECONDS = 15_000;
const YOUTUBE_SUBTITLE_TOTAL_TIMEOUT_MILLISECONDS = 45_000;
const MAXIMAL_YOUTUBE_PAGE_BYTES = 5_000_000;
const YOUTUBE_PLAYER_URL = 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false';
const YOUTUBE_PLAYER_VERSION = '20.10.38';
const CAPTION_TRACKS_SCHEMA = z.array(z.object({ baseUrl: z.string(), languageCode: z.string(), kind: z.string().optional() })).max(100);

async function fetchYoutubeText(url: string, maximalBytes: number, signal: AbortSignal, options: { readonly body?: string; readonly userAgent?: string } = {}): Promise<string> {
    const response = await fetch(url, { cache: 'no-store', redirect: 'error',
        method: options.body ? 'POST' : 'GET', body: options.body,
        headers: { 'Accept-Language': 'cs,en;q=0.9', 'User-Agent': options.userAgent ?? 'Mozilla/5.0',
            ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
        signal: AbortSignal.any([signal, AbortSignal.timeout(YOUTUBE_SUBTITLE_REQUEST_TIMEOUT_MILLISECONDS)]) });
    if (!response.ok || !response.body) throw new Error('YouTube neodpověděl.');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let bytes = 0;
    let text = '';
    try {
        while (true) {
            const result = await reader.read();
            if (result.done) break;
            bytes += result.value.byteLength;
            if (bytes > maximalBytes) throw new Error('Odpověď YouTube je příliš velká.');
            text += decoder.decode(result.value, { stream: true });
        }
        return text + decoder.decode();
    } finally { await reader.cancel(); }
}

/** Read only a JSON array, respecting quoted brackets and escapes; never execute page scripts. */
function readCaptionTracks(html: string): z.infer<typeof CAPTION_TRACKS_SCHEMA> {
    const marker = /"captionTracks"\s*:\s*\[/.exec(html);
    if (!marker) return [];
    const start = marker.index + marker[0].length - 1;
    let depth = 0;
    let isQuoted = false;
    let isEscaped = false;
    for (let index = start; index < html.length; index++) {
        const character = html[index];
        if (isQuoted) {
            if (isEscaped) isEscaped = false;
            else if (character === '\\') isEscaped = true;
            else if (character === '"') isQuoted = false;
        } else if (character === '"') isQuoted = true;
        else if (character === '[') depth++;
        else if (character === ']' && --depth === 0) return CAPTION_TRACKS_SCHEMA.parse(JSON.parse(html.slice(start, index + 1)));
    }
    throw new Error('Seznam titulků YouTube nelze přečíst.');
}

function createCaptionUrl(baseUrl: string, videoId: string): string {
    const url = new URL(baseUrl);
    if (url.protocol !== 'https:' || !['www.youtube.com', 'youtube.com'].includes(url.hostname) ||
        url.port || url.username || url.password || url.pathname !== '/api/timedtext' || url.searchParams.get('v') !== videoId) {
        throw new Error('Neplatná adresa titulků YouTube.');
    }
    url.searchParams.set('fmt', 'vtt');
    return url.toString();
}

/** Prefer authored captions, then automatic captions in the requested original language; never silently translate. */
export async function fetchYoutubeSubtitles(videoId: string, language: 'cs' | 'en'): Promise<SubtitleCue[]> {
    // The public mobile player can supply working caption URLs even when watch-page tracks return an empty body.
    // Keep the ordinary watch page as a fallback; neither source requires private credentials or downloads the video.
    const sources = [
        { url: YOUTUBE_PLAYER_URL, options: { body: JSON.stringify({ videoId,
            context: { client: { clientName: 'ANDROID', clientVersion: YOUTUBE_PLAYER_VERSION } } }),
            userAgent: `com.google.android.youtube/${YOUTUBE_PLAYER_VERSION} (Linux; U; Android 14)` } },
        { url: createYoutubeWatchUrl(videoId), options: {} },
    ];
    const signal = AbortSignal.timeout(YOUTUBE_SUBTITLE_TOTAL_TIMEOUT_MILLISECONDS);
    let isSourceRead = false;
    let isTrackFound = false;
    for (const source of sources) {
        let tracks: z.infer<typeof CAPTION_TRACKS_SCHEMA>;
        try {
            tracks = readCaptionTracks(await fetchYoutubeText(source.url, MAXIMAL_YOUTUBE_PAGE_BYTES, signal, source.options));
            isSourceRead = true;
        } catch { continue; }
        const matchingTracks = tracks.filter((track) => track.languageCode.split('-')[0] === language)
            .sort((first, second) => Number(first.kind === 'asr') - Number(second.kind === 'asr')).slice(0, 2);
        isTrackFound ||= matchingTracks.length > 0;
        for (const track of matchingTracks) {
            try { return parseSubtitleFile(await fetchYoutubeText(createCaptionUrl(track.baseUrl, videoId), MAXIMAL_SUBTITLE_FILE_BYTES, signal)); }
            catch { /* Advertised captions can be empty or blocked. Try the next track or player response. */ }
        }
    }
    if (isTrackFound) throw new Error('YouTube titulky uvedl, ale jejich stažení se nezdařilo. Zkuste to znovu nebo použijte soubor titulků či nahrávku.');
    if (isSourceRead) throw new Error('YouTube neposkytl titulky ve vybraném jazyce. Vyberte jiný jazyk, vložte SRT/WebVTT nebo vytvořte titulky z nahrávky.');
    throw new Error('YouTube nyní nelze načíst. Zkuste to znovu, vložte SRT/WebVTT nebo vytvořte titulky z nahrávky.');
}

import { parseArticleWordTimings, type ArticleWordTimings } from '@/businesses/articles/articleTiming';
import { getStoryNarrationSegments } from '@/lib/workshops/storyRoomNarration';
import type { WorkshopStory } from '@/lib/workshops/storyRoomTypes';

type NarrationClip = { samples: Int16Array<ArrayBuffer>; timings: ArticleWordTimings | null };
const SAMPLE_RATE = 24_000;
const PAUSE_SAMPLES = Math.round(SAMPLE_RATE * 0.18);

async function loadClip(
    apiPath: string, storyId: string, segmentId: string, signal: AbortSignal, context: OfflineAudioContext,
): Promise<NarrationClip> {
    for (let attempt = 0; attempt < 30; attempt++) {
        const response = await fetch(apiPath, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, signal,
            body: JSON.stringify({ action: 'audio', storyId, segmentId, waitOnly: attempt > 0 }),
        });
        if (response.status === 409) {
            await new Promise((resolve) => window.setTimeout(resolve, 1_300));
            continue;
        }
        const data = await response.json() as { url?: string | null; timings?: unknown; error?: string };
        if (!response.ok) throw new Error(data.error ?? 'Předčítání se nepodařilo připravit.');
        if (!data.url) return { samples: new Int16Array(), timings: null };
        const media = await fetch(data.url, { signal });
        if (!media.ok) throw new Error('Zvuk se nepodařilo načíst.');
        const buffer = await context.decodeAudioData(await media.arrayBuffer());
        signal.throwIfAborted();
        const channel = buffer.getChannelData(0);
        const samples = new Int16Array(channel.length);
        for (let i = 0; i < channel.length; i++) {
            samples[i] = Math.round(Math.max(-1, Math.min(1, channel[i]!)) * 32767);
        }
        return { samples, timings: parseArticleWordTimings(data.timings) };
    }
    throw new Error('Předčítání se připravuje déle než obvykle. Zkus to znovu.');
}

function makeWaveHeader(sampleCount: number): ArrayBuffer {
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);
    for (const [offset, label] of [[0, 'RIFF'], [8, 'WAVEfmt '], [36, 'data']] as const) {
        for (let i = 0; i < label.length; i++) view.setUint8(offset + i, label.charCodeAt(i));
    }
    view.setUint32(4, 36 + sampleCount * 2, true);
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, SAMPLE_RATE, true);
    view.setUint32(28, SAMPLE_RATE * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    view.setUint32(40, sampleCount * 2, true);
    return buffer;
}

/** The player keeps a single seekable track. Immutable clips can be reused on either side of the network. */
export async function prepareStoryNarration(
    apiPath: string, story: WorkshopStory, signal: AbortSignal, clipCache: Map<string, NarrationClip>,
) {
    const segments = getStoryNarrationSegments(story);
    const context = new OfflineAudioContext(1, 1, SAMPLE_RATE);
    const clips: NarrationClip[] = [];
    for (let index = 0; index < segments.length; index += 3) {
        signal.throwIfAborted();
        const batch = await Promise.all(segments.slice(index, index + 3).map(async ({ id, text }) => {
            const cacheKey = `${story.id}:${id}:${text}`;
            const cached = clipCache.get(cacheKey);
            if (cached) return cached;
            const clip = await loadClip(apiPath, story.id, id, signal, context);
            clipCache.set(cacheKey, clip);
            return clip;
        }));
        clips.push(...batch);
    }

    const words: ArticleWordTimings['words'][number][] = [];
    const parts: BlobPart[] = [];
    let samplesWritten = 0;
    for (let index = 0; index < clips.length; index++) {
        const clip = clips[index]!;
        if (!clip.samples.length) continue;
        if (samplesWritten) {
            parts.push(new Int16Array(PAUSE_SAMPLES).buffer);
            samplesWritten += PAUSE_SAMPLES;
        }
        const start = samplesWritten / SAMPLE_RATE;
        const duration = clip.samples.length / SAMPLE_RATE;
        const segmentId = segments[index]!.id;
        for (const word of clip.timings?.words ?? []) {
            if (word.start >= duration) continue;
            words.push({
                ...word, wordId: `${segmentId}:${word.wordId}`, sentenceId: `${segmentId}:${word.sentenceId}`,
                start: start + word.start, end: start + Math.min(duration, word.end),
            });
        }
        parts.push(clip.samples.buffer);
        samplesWritten += clip.samples.length;
    }
    if (!samplesWritten) throw new Error('V příběhu zatím není co číst.');
    return {
        blob: new Blob([makeWaveHeader(samplesWritten), ...parts], { type: 'audio/wav' }),
        duration: samplesWritten / SAMPLE_RATE,
        timings: words.length ? { version: 1 as const, words } : undefined,
    };
}

export type StoryNarrationClipCache = Map<string, NarrationClip>;

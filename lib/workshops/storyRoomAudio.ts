import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import type { ArticleWordTimings } from '@/businesses/articles/articleTiming';
import {
    getElevenLabsNarrationModel, mapSpeechAlignment, resolveElevenLabsNarrator, synthesizeElevenLabsNarration,
} from '@/lib/audio-player/elevenLabsNarration';
import { runDatabaseTransaction } from '@/lib/database/runDatabaseTransaction';
import { putStoredObject, removeStoredObject, signStoredObject } from '@/lib/storage/objectStorage';
import { removeSpeechUrls } from '@/lib/text/speechText.mjs';
import { readStoryForNarration, StoryRoomError, type StoryAccess } from './storyRoomDatabase';
import { STORY_NARRATOR_VOICE } from './storyRoomBook';
import { getStoryNarrationSegments } from './storyRoomNarration';
import { ensureStoryVoice } from './storyRoomVoice';
import type { StoryAudioSegmentId } from './storyRoomTypes';

type CachedClip = { object_key: string | null; timings: ArticleWordTimings | null; is_pending: boolean };

export async function getStoryAudioClip(
    access: StoryAccess, storyId: string, segmentId: StoryAudioSegmentId, signal: AbortSignal, waitOnly = false,
) {
    const story = await readStoryForNarration(access, storyId, segmentId);
    const segments = getStoryNarrationSegments(story);
    const index = segments.findIndex(({ id }) => id === segmentId);
    const segment = segments[index];
    if (!segment) throw new StoryRoomError(404, 'Tahle část příběhu není k dispozici.');
    const words = Array.from(segment.text.matchAll(/\S+/g)).flatMap(([text], index) => {
        const spokenText = removeSpeechUrls(text).trim();
        return spokenText ? [{ id: `w${index}`, text, spokenText }] : [];
    });
    const script = words.map(({ spokenText }) => spokenText).join(' ');
    if (!script) return { url: null, timings: null };
    let voice = STORY_NARRATOR_VOICE;
    if (story.subject) {
        try {
            voice = await ensureStoryVoice(story.subject, signal, waitOnly);
        } catch (error) {
            signal.throwIfAborted();
            // A pending design can still succeed. A failed design or its cooldown should not block the dialogue.
            if (!(error instanceof StoryRoomError) || (error.status !== 502 && error.status !== 503)) throw error;
        }
    }
    const narrator = voice === STORY_NARRATOR_VOICE;
    const previous = segments[index - 1];
    const sharesSpeaker = previous?.speaker?.id === segment.speaker?.id && previous?.speaker?.name === segment.speaker?.name;
    const previousText = previous && sharesSpeaker ? removeSpeechUrls(previous.text).trim() : undefined;
    const narratorId = narrator ? process.env.ELEVENLABS_VOICE_ID?.trim() : undefined;
    const narratorName = narrator ? process.env.ELEVENLABS_VOICE_NAME?.trim() : undefined;
    // The introduction and adjacent stage directions keep the same script, voice and alignment as earlier recordings.
    const identity = narrator && !segment.speaker && !previous?.speaker
        ? [1, narratorId, narratorName]
        : [2, voice, narratorId, narratorName];
    const cacheKey = createHash('sha256').update(JSON.stringify([
        ...identity, getElevenLabsNarrationModel(), previousText, words,
    ])).digest('hex');
    const leaseId = randomUUID();
    const key = process.env.ELEVENLABS_API_KEY?.trim();
    const clip = await runDatabaseTransaction('reserving story narration', async (tx) => {
        const { rows: [cached] } = await tx.query<CachedClip>(
            `SELECT object_key, timings, COALESCE(lease_until > now(), false) AS is_pending
             FROM public.workshop_story_audio WHERE workshop_id = $1 AND cache_key = $2`,
            [access.workshopId, cacheKey],
        );
        if (cached?.object_key) return cached;
        if (cached?.is_pending) throw new StoryRoomError(409, 'Tahle část se právě načítá.');
        if (waitOnly) throw new StoryRoomError(503, 'Část příběhu se nepodařilo namluvit. Zkus to znovu.');
        if (!key || !process.env.OBJECT_STORAGE_BUCKET?.trim()) {
            throw new StoryRoomError(503, 'Předčítání teď není dostupné.');
        }
        const { rows } = await tx.query(
            `INSERT INTO public.workshop_story_audio (workshop_id, cache_key, lease_id, lease_until, attempts, last_attempt_at)
             VALUES ($1, $2, $3, now() + interval '45 seconds', 1, now())
             ON CONFLICT (workshop_id, cache_key) DO UPDATE SET
                 lease_id = EXCLUDED.lease_id, lease_until = EXCLUDED.lease_until,
                 attempts = CASE WHEN workshop_story_audio.last_attempt_at > now() - interval '10 minutes'
                     THEN workshop_story_audio.attempts + 1 ELSE 1 END,
                 last_attempt_at = now()
             WHERE workshop_story_audio.object_key IS NULL
                 AND (workshop_story_audio.lease_until IS NULL OR workshop_story_audio.lease_until <= now())
                 AND (workshop_story_audio.attempts < 3 OR workshop_story_audio.last_attempt_at <= now() - interval '10 minutes')
             RETURNING lease_id`,
            [access.workshopId, cacheKey, leaseId],
        );
        if (rows.length) return null;
        const { rows: [winner] } = await tx.query<CachedClip>(
            `SELECT object_key, timings, COALESCE(lease_until > now(), false) AS is_pending
             FROM public.workshop_story_audio WHERE workshop_id = $1 AND cache_key = $2`,
            [access.workshopId, cacheKey],
        );
        if (winner?.object_key) return winner;
        if (winner?.is_pending) throw new StoryRoomError(409, 'Tahle část se právě načítá.');
        throw new StoryRoomError(503, 'Předčítání zkus znovu za několik minut.');
    });
    if (clip?.object_key) return { url: await signStoredObject(clip.object_key), timings: clip.timings, voice };

    const objectKey = `workshops/story/${access.workshopId}/${cacheKey}-${leaseId}.mp3`;
    let uploaded = false;
    let published = false;
    try {
        const providerSignal = AbortSignal.any([signal, AbortSignal.timeout(24_000)]);
        const voiceId = narrator ? (await resolveElevenLabsNarrator(key!, providerSignal)).id : voice;
        const { bytes, alignment } = await synthesizeElevenLabsNarration(key!, voiceId, script, providerSignal, previousText);
        if (!bytes.length || bytes.length > 1_500_000) throw new StoryRoomError(502, 'Nahrávku se nepodařilo načíst.');
        const timings = mapSpeechAlignment({ script, words }, alignment) ?? null;
        await putStoredObject(objectKey, bytes, 'audio/mpeg');
        uploaded = true;
        published = await runDatabaseTransaction('publishing story narration', async (tx) => {
            const { rows } = await tx.query(
                `UPDATE public.workshop_story_audio SET object_key = $4, timings = $5::jsonb, lease_id = NULL, lease_until = NULL
                 WHERE workshop_id = $1 AND cache_key = $2 AND lease_id = $3 AND lease_until > now() RETURNING cache_key`,
                [access.workshopId, cacheKey, leaseId, objectKey, timings ? JSON.stringify(timings) : null],
            );
            return rows.length > 0;
        });
        if (!published) throw new StoryRoomError(409, 'Tahle část se právě načítá.');
        return { url: await signStoredObject(objectKey), timings, voice };
    } catch (error) {
        if (error instanceof StoryRoomError) throw error;
        console.warn('Story narration failed.', error instanceof Error ? error.message : 'unknown');
        throw new StoryRoomError(502, 'Některý z hlasů se teď nepodařilo načíst. Zkus to znovu.');
    } finally {
        if (!published) {
            if (uploaded) await removeStoredObject(objectKey).catch(() => undefined);
            await runDatabaseTransaction('releasing story narration', async (tx) => {
                await tx.query(
                    `UPDATE public.workshop_story_audio SET lease_id = NULL, lease_until = NULL
                     WHERE workshop_id = $1 AND cache_key = $2 AND lease_id = $3`,
                    [access.workshopId, cacheKey, leaseId],
                );
            }).catch(() => undefined);
        }
    }
}

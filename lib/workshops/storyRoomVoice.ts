import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import { readElevenLabsErrorCode } from '@/lib/audio-player/elevenLabsNarration';
import { runDatabaseTransaction } from '@/lib/database/runDatabaseTransaction';
import { getStoryBookText, getStoryVoiceFromObjectKey, getStoryVoiceId, STORY_VOICE_OBJECT_PREFIX } from './storyRoomBook';
import { readStoryVoiceSubject, StoryRoomError, type StoryAccess, type StoryVoiceSubject } from './storyRoomDatabase';

const API_ORIGIN = 'https://api.elevenlabs.io';
const VOICE_SAMPLE = 'Za regálem tiše zašustil papír. Poslouchej, kniha má pro nás zprávu. Pojď blíž a podíváme se, jak to celé začalo.';
const VOICE_TIMEOUT = 65_000;

async function voiceError(response: Response, operation: string) {
    const code = await readElevenLabsErrorCode(response);
    return new Error(`ElevenLabs ${operation} HTTP ${response.status}${code ? ` (${code})` : ''}`);
}

type VoiceCacheRow = { workshop_id: string; object_key: string | null; is_pending: boolean; is_cooling_down: boolean };

async function reserveVoice(subject: StoryVoiceSubject, leaseId: string, hasKey: boolean, waitOnly: boolean) {
    return runDatabaseTransaction('reserving a workshop character voice', async (tx) => {
        // Voice resources use a separate namespace from the hexadecimal keys of rendered clips.
        // The transaction lock also deduplicates a prepared role requested from two different workshops.
        await tx.query('SELECT pg_advisory_xact_lock(hashtext($1), 1)', [subject.key]);
        const { rows: [cached] } = await tx.query<VoiceCacheRow>(
            `SELECT workshop_id, object_key, COALESCE(lease_until > now(), false) AS is_pending,
                COALESCE(last_attempt_at > now() - interval '3 minutes', false) AS is_cooling_down
             FROM public.workshop_story_audio WHERE cache_key = $1`,
            [subject.key],
        );
        const workshopId = cached?.workshop_id ?? subject.workshopId;
        const voice = getStoryVoiceFromObjectKey(cached?.object_key);
        if (voice) return { voice, workshopId };
        if (cached?.is_pending) throw new StoryRoomError(409, 'Hlas postavy se právě tvoří.');
        if (waitOnly || cached?.is_cooling_down) throw new StoryRoomError(503, 'Hlas postavy zkus připravit za několik minut.');
        if (!hasKey) throw new StoryRoomError(503, 'Vytváření hlasů teď není dostupné.');
        await tx.query(
            `INSERT INTO public.workshop_story_audio (workshop_id, cache_key, lease_id, lease_until, attempts, last_attempt_at)
             VALUES ($1, $2, $3, now() + interval '100 seconds', 1, now())
             ON CONFLICT (workshop_id, cache_key) DO UPDATE SET lease_id = EXCLUDED.lease_id, lease_until = EXCLUDED.lease_until,
                 attempts = workshop_story_audio.attempts + 1, last_attempt_at = now()`,
            [workshopId, subject.key, leaseId],
        );
        return { voice: undefined, workshopId };
    });
}

async function generateVoice(subject: StoryVoiceSubject, key: string, signal: AbortSignal) {
    const headers = { 'xi-api-key': key, 'Content-Type': 'application/json' };
    const voiceName = `Promptbook Story ${createHash('sha256').update(subject.key).digest('hex').slice(0, 20)}`;
    // Recover an already saved provider voice if an earlier job lost its response or cache row.
    const lookup = await fetch(`${API_ORIGIN}/v2/voices?search=${encodeURIComponent(voiceName)}&page_size=100`, { headers, signal });
    if (!lookup.ok) throw await voiceError(lookup, 'voice lookup');
    const found = await lookup.json() as { voices?: { name: string; voice_id: string }[] };
    const existing = found.voices?.find(({ name }) => name === voiceName);
    if (existing) {
        const id = getStoryVoiceId(existing.voice_id);
        if (!id) throw new Error('ElevenLabs returned an invalid saved voice ID.');
        return id;
    }
    const voiceDescription = [
        'An original adult voice actor portraying a fictional fairy-tale character in natural Czech (cs-CZ).',
        'Give the role a distinctive timbre, pace and expression suitable for a family audio play.',
        'Use clear Czech pronunciation. Do not imitate any real person or existing performance.',
        `Role: ${getStoryBookText(subject.book).replace(/\s+/g, ' ').slice(0, 640)}`,
    ].join(' ');
    const preview = await fetch(`${API_ORIGIN}/v1/text-to-voice/design`, {
        method: 'POST', headers, signal,
        body: JSON.stringify({
            voice_description: voiceDescription, model_id: 'eleven_multilingual_ttv_v2',
            text: VOICE_SAMPLE, stream_previews: true,
        }),
    });
    if (!preview.ok) throw await voiceError(preview, 'Voice Design');
    const data = await preview.json() as { previews?: { generated_voice_id: string; language?: string }[] };
    const selected = data.previews?.find(({ language }) => language === 'cs') ?? data.previews?.[0];
    const previewId = getStoryVoiceId(selected?.generated_voice_id);
    if (!previewId) throw new Error('ElevenLabs returned no usable preview.');
    const created = await fetch(`${API_ORIGIN}/v1/text-to-voice`, {
        method: 'POST', headers, signal,
        body: JSON.stringify({
            voice_name: voiceName, voice_description: voiceDescription, generated_voice_id: previewId,
        }),
    });
    if (!created.ok) throw await voiceError(created, 'voice save');
    const result = await created.json() as { voice_id?: string };
    const id = getStoryVoiceId(result.voice_id);
    if (!id) throw new Error('ElevenLabs returned no saved voice ID.');
    return id;
}

/** A role reuses its saved ElevenLabs voice across turns, browsers and prepared casts in other workshops. */
export async function ensureStoryVoice(subject: StoryVoiceSubject, signal: AbortSignal, waitOnly = false) {
    if (subject.reference) return subject.reference;
    const key = process.env.ELEVENLABS_API_KEY?.trim();
    const lease = randomUUID();
    const reservation = await reserveVoice(subject, lease, Boolean(key), waitOnly);
    if (reservation.voice) return reservation.voice;
    let published = false;
    try {
        const voice = await generateVoice(subject, key!, AbortSignal.any([signal, AbortSignal.timeout(VOICE_TIMEOUT)]));
        published = await runDatabaseTransaction('publishing a workshop character voice', async (tx) => {
            const { rows } = await tx.query(
                `UPDATE public.workshop_story_audio SET object_key = $4, lease_id = NULL, lease_until = NULL
                 WHERE workshop_id = $1 AND cache_key = $2 AND lease_id = $3 RETURNING cache_key`,
                [reservation.workshopId, subject.key, lease, `${STORY_VOICE_OBJECT_PREFIX}${voice}`],
            );
            return rows.length === 1;
        });
        if (!published) throw new StoryRoomError(409, 'Hlas postavy se právě tvoří.');
        return voice;
    } catch (error) {
        if (error instanceof StoryRoomError) throw error;
        console.warn('Workshop voice design failed.', error instanceof Error ? error.message : 'unknown');
        throw new StoryRoomError(502, `Hlas pro postavu ${subject.name} se v ElevenLabs nepodařilo vytvořit.`);
    } finally {
        if (!published) {
            await runDatabaseTransaction('releasing a workshop character voice', async (tx) => {
                await tx.query(
                    `UPDATE public.workshop_story_audio SET lease_id = NULL, lease_until = NULL
                     WHERE workshop_id = $1 AND cache_key = $2 AND lease_id = $3`,
                    [reservation.workshopId, subject.key, lease],
                );
            }).catch(() => undefined);
        }
    }
}

export async function prepareStoryVoices(access: StoryAccess, characterIds: readonly string[]) {
    const signal = AbortSignal.timeout(130_000);
    for (let index = 0; index < characterIds.length && !signal.aborted; index += 3) {
        await Promise.allSettled(characterIds.slice(index, index + 3).map(async (id) => {
            const subject = await readStoryVoiceSubject(access, id);
            if (subject) await ensureStoryVoice(subject, signal);
        }));
    }
}

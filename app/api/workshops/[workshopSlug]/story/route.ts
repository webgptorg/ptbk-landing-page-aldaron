import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { migrateDatabaseOnStartup } from '@/lib/database/migrateDatabase';
import { getPublicRequestHostname, isPrimarySiteHostname } from '@/lib/domains/publicDomainRouting';
import { allowPublicChatRequest } from '@/lib/messages/publicChatRateLimit';
import { signStoredObject } from '@/lib/storage/objectStorage';
import { getStoryAudioClip } from '@/lib/workshops/storyRoomAudio';
import { createStoryPortraitUrl, getStoryBookText } from '@/lib/workshops/storyRoomBook';
import {
    claimStoryTurn, finishStoryCharacterGeneration, finishStoryTurn, getStoryRoomShareUrl, readStoryPortraitObject, readStoryRoom,
    requireStoryRoomWriteAccess, reserveStoryCharacterGeneration, reserveStoryPortrait, saveStoryRoomCommand, StoryRoomError,
} from '@/lib/workshops/storyRoomDatabase';
import { checkStoryText, generateStoryCharacterBook, generateStoryLine, validateCustomStoryBook } from '@/lib/workshops/storyRoomGeneration';
import { STORY_EVENT_TYPE } from '@/lib/workshops/storyRoomPaths';
import { canGenerateStoryPortrait, generateStoryPortrait } from '@/lib/workshops/storyRoomPortrait';
import { prepareStoryVoices } from '@/lib/workshops/storyRoomVoice';
import { STORY_AUDIO_SEGMENT, STORY_ID, STORY_ROOM_COMMAND } from '@/lib/workshops/storyRoomTypes';
import { findWorkshopBySlug, getWorkshopDatabaseOrNull } from '@/lib/workshops/workshopDatabase';
import { authenticateWorkshopParticipant } from '@/lib/workshops/workshopSession';
import { after, type NextRequest } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 180;

const MAX_BODY_BYTES = 34_000;

function json(body: unknown, status = 200) {
    return Response.json(body, {
        status, headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' },
    });
}

type StoryRouteContext = { readonly params: Promise<{ readonly workshopSlug: string }> };

async function getAccess(request: NextRequest, context: StoryRouteContext) {
    const host = getPublicRequestHostname(request.headers, request.nextUrl.hostname);
    if (!isPrimarySiteHostname(host) && !(process.env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(host))) {
        throw new StoryRoomError(404, 'Dílna se otevírá na ptbk.io.');
    }
    await migrateDatabaseOnStartup();
    const { workshopSlug } = await context.params;
    const supabase = getWorkshopDatabaseOrNull();
    if (!supabase) throw new StoryRoomError(503, 'Dílnu se teď nepodařilo otevřít.');
    const workshop = await findWorkshopBySlug(supabase, workshopSlug, true);
    if (!workshop || workshop.room_kind !== 'workshop' || workshop.event_type !== STORY_EVENT_TYPE) {
        throw new StoryRoomError(404, 'Tahle příběhová dílna není dostupná.');
    }
    const participant = await authenticateWorkshopParticipant(supabase, request, workshop.id, workshop.slug);
    return { access: { workshopId: workshop.id, participantId: participant?.id ?? null }, participant, supabase, workshopSlug };
}

function errorResponse(error: unknown) {
    if (error instanceof StoryRoomError) return json({ error: error.message }, error.status);
    const code = error instanceof Error && 'code' in error && typeof error.code === 'string' ? error.code : undefined;
    console.error('Workshop story operation failed.', { name: error instanceof Error ? error.name : 'unknown', code });
    return json({ error: 'Dílna teď neodpovídá. Zkus to za chvilku.' }, 503);
}

const REQUEST_SCHEMA = z.union([
    STORY_ROOM_COMMAND,
    z.object({ action: z.literal('share') }).strict(),
    z.object({ action: z.literal('prepare-voices'), storyId: STORY_ID.optional() }).strict(),
    z.object({ action: z.literal('audio'), storyId: STORY_ID, segmentId: STORY_AUDIO_SEGMENT, waitOnly: z.boolean().optional() }).strict(),
]);

async function readCommand(request: Request) {
    const reader = request.body?.getReader();
    if (!reader) return REQUEST_SCHEMA.safeParse(null);
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    try {
        for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            bytes += value.length;
            if (bytes > MAX_BODY_BYTES) { await reader.cancel(); return REQUEST_SCHEMA.safeParse(null); }
            chunks.push(value);
        }
        return REQUEST_SCHEMA.safeParse(JSON.parse(Buffer.concat(chunks).toString('utf8')));
    } catch {
        return REQUEST_SCHEMA.safeParse(null);
    }
}

export async function GET(request: NextRequest, context: StoryRouteContext) {
    try {
        const { searchParams } = request.nextUrl;
        const { access, participant } = await getAccess(request, context);
        if (searchParams.has('portrait')) {
            const portraitId = STORY_ID.safeParse(searchParams.get('portrait'));
            if (!portraitId.success) return json({ error: 'Tento portrét v dílně není.' }, 404);
            const url = await signStoredObject(await readStoryPortraitObject(access, portraitId.data));
            return new Response(null, { status: 307, headers: {
                Location: url, 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow',
            } });
        }
        const storyId = STORY_ID.safeParse(searchParams.get('story'));
        return json(await readStoryRoom(access, storyId.success ? storyId.data : null, participant));
    } catch (error) {
        return errorResponse(error);
    }
}

export async function POST(request: NextRequest, context: StoryRouteContext) {
    try {
        const crossSiteResponse = getCrossSiteResponseOrNull(request);
        if (crossSiteResponse) return crossSiteResponse;
        const parsed = await readCommand(request);
        if (!parsed.success) return json({ error: 'Zkontroluj, že je text vyplněný a není příliš dlouhý.' }, 400);
        const command = parsed.data;
        const { access, participant, supabase, workshopSlug } = await getAccess(request, context);
        if (command.action === 'share') return json({ url: await getStoryRoomShareUrl(access, workshopSlug, supabase) });
        if (command.action === 'audio') {
            return json(await getStoryAudioClip(access, command.storyId, command.segmentId, request.signal, command.waitOnly));
        }
        if (!access.participantId) return json({ error: 'Nejdřív se připoj do dílny a počkej na schválení.' }, 401);
        if (command.action === 'prepare-voices') {
            await requireStoryRoomWriteAccess(access);
            if (!process.env.ELEVENLABS_API_KEY?.trim() || !allowPublicChatRequest(`story-voices:${access.workshopId}`, 1)) {
                return json({});
            }
            const room = await readStoryRoom(access, command.storyId ?? null, participant);
            const missing = new Set(room.characters.filter(({ voice, voiceStatus }) => !voice && !voiceStatus).map(({ id }) => id));
            const priority = [
                ...(room.story?.lines.flatMap(({ characterId, kind }) => kind === 'speech' && characterId ? [characterId] : []) ?? []),
                ...(room.story?.cast ?? []),
            ];
            const ids = Array.from(new Set([...priority, ...Array.from(missing)])).filter((id) => missing.has(id)).slice(0, 12);
            if (ids.length) after(() => prepareStoryVoices(access, ids));
            return json({});
        }
        if (command.action === 'character' || command.action === 'generate-character' || command.action === 'portrait' || command.action === 'create') {
            await requireStoryRoomWriteAccess(access);
            const isBookSave = command.action === 'character';
            const editKey = isBookSave ? 'story-book' : 'story-edit';
            if (!allowPublicChatRequest(`${editKey}:${access.workshopId}:${access.participantId}`, isBookSave ? 60 : undefined)) {
                return json({ error: 'Chvilku počkej a pak zkus uložit změnu znovu.' }, 429);
            }
            if (command.action === 'portrait') {
                if (!canGenerateStoryPortrait()) return json({ error: 'Kreslení portrétů teď není dostupné.' }, 503);
                const reservation = await reserveStoryPortrait(access, command.id, createStoryPortraitUrl(workshopSlug, command.id));
                if (reservation) after(() => generateStoryPortrait(access, command.id, reservation.lease, reservation.book));
                return json({ characterId: command.id });
            }
            if (command.action === 'generate-character') {
                await checkStoryText(command.description, request.signal);
                const lease = await reserveStoryCharacterGeneration(access, command.id);
                if (lease) {
                    const portraitUrl = canGenerateStoryPortrait() ? createStoryPortraitUrl(workshopSlug, command.id) : undefined;
                    let book: string;
                    try {
                        book = await generateStoryCharacterBook(command.description, request.signal);
                        await finishStoryCharacterGeneration(access, command.id, lease, book, portraitUrl);
                    } catch (error) {
                        await finishStoryCharacterGeneration(access, command.id, lease, null).catch(() => undefined);
                        if (error instanceof StoryRoomError) throw error;
                        return json({ error: 'Postavu se nepodařilo vymyslet. Zkus to prosím znovu.' }, 502);
                    }
                    const designVoice = Boolean(process.env.ELEVENLABS_API_KEY?.trim());
                    if (portraitUrl || designVoice) after(async () => {
                        await Promise.allSettled([
                            portraitUrl ? generateStoryPortrait(access, command.id, lease, book) : undefined,
                            designVoice ? prepareStoryVoices(access, [command.id]) : undefined,
                        ]);
                    });
                }
                return json({ characterId: command.id });
            }
            if (command.action === 'character') {
                validateCustomStoryBook(command.book);
                await checkStoryText(getStoryBookText(command.book), request.signal);
            } else {
                await checkStoryText(`${command.title}
${command.premise}`, request.signal);
            }
        }
        if (command.action !== 'turn') {
            return json(await saveStoryRoomCommand(access, command));
        }
        if (!process.env.OPENAI_API_KEY?.trim()) return json({ error: 'AI je teď nedostupná.' }, 503);
        const claim = await claimStoryTurn(access, command);
        if (claim) {
            try {
                const line = await generateStoryLine(claim, command.requestId, request.signal);
                await finishStoryTurn(access, command, claim.leaseId, line);
                return json({ storyId: command.storyId, line });
            } catch (error) {
                try { await finishStoryTurn(access, command, claim.leaseId, null); }
                catch { console.warn('Workshop story turn lease could not be released.'); }
                if (error instanceof StoryRoomError) throw error;
                console.warn('Workshop story generation did not finish.', error instanceof Error ? error.name : 'unknown');
                return json({ error: 'Další tah se nepovedl. Zkus to znovu.' }, 502);
            }
        }
        return json({ storyId: command.storyId });
    } catch (error) {
        return errorResponse(error);
    }
}

import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { migrateDatabaseOnStartup } from '@/lib/database/migrateDatabase';
import { getPublicRequestHostname, isPrimarySiteHostname } from '@/lib/domains/publicDomainRouting';
import { allowPublicChatRequest } from '@/lib/messages/publicChatRateLimit';
import { getStoryAudioClip } from '@/lib/workshops/storyRoomAudio';
import {
    claimStoryTurn, finishStoryCharacterGeneration, finishStoryTurn, getStoryRoomShareUrl, readStoryRoom, requireStoryRoomWriteAccess,
    reserveStoryCharacterGeneration, saveStoryRoomCommand, StoryRoomError,
} from '@/lib/workshops/storyRoomDatabase';
import { checkStoryText, generateStoryCharacterBook, generateStoryLine, validateCustomStoryBook } from '@/lib/workshops/storyRoomGeneration';
import { STORY_EVENT_TYPE } from '@/lib/workshops/storyRoomPaths';
import { STORY_AUDIO_SEGMENT, STORY_ID, STORY_ROOM_COMMAND } from '@/lib/workshops/storyRoomTypes';
import { findWorkshopBySlug, getWorkshopDatabaseOrNull } from '@/lib/workshops/workshopDatabase';
import { authenticateWorkshopParticipant } from '@/lib/workshops/workshopSession';
import { NextRequest } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 45;

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
        const storyId = STORY_ID.safeParse(request.nextUrl.searchParams.get('story'));
        const { access, participant } = await getAccess(request, context);
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
        const { access, supabase, workshopSlug } = await getAccess(request, context);
        if (command.action === 'share') return json({ url: await getStoryRoomShareUrl(access, workshopSlug, supabase) });
        if (command.action === 'audio') {
            return json(await getStoryAudioClip(access, command.storyId, command.segmentId, request.signal, command.waitOnly));
        }
        if (!access.participantId) return json({ error: 'Nejdřív se připoj do dílny a počkej na schválení.' }, 401);
        if (command.action === 'character' || command.action === 'generate-character' || command.action === 'create') {
            await requireStoryRoomWriteAccess(access);
            if (!allowPublicChatRequest(`story-edit:${access.workshopId}:${access.participantId}`)) {
                return json({ error: 'Chvilku počkej a pak zkus uložit změnu znovu.' }, 429);
            }
            if (command.action === 'generate-character') {
                await checkStoryText(command.description, request.signal);
                const lease = await reserveStoryCharacterGeneration(access, command.id);
                if (lease) {
                    try {
                        const book = await generateStoryCharacterBook(command.description, request.signal);
                        await finishStoryCharacterGeneration(access, command.id, lease, book);
                    } catch (error) {
                        await finishStoryCharacterGeneration(access, command.id, lease, null).catch(() => undefined);
                        if (error instanceof StoryRoomError) throw error;
                        return json({ error: 'Postavu se nepodařilo vymyslet. Zkus to prosím znovu.' }, 502);
                    }
                }
                return json({ characterId: command.id });
            }
            if (command.action === 'character') {
                validateCustomStoryBook(command.book);
                await checkStoryText(command.book, request.signal);
            } else {
                await checkStoryText(`${command.title}
${command.premise}`, request.signal);
            }
        }
        if (command.action !== 'turn') {
            return json({ storyId: await saveStoryRoomCommand(access, command) });
        }
        if (!process.env.OPENAI_API_KEY?.trim()) return json({ error: 'AI je teď nedostupná.' }, 503);
        const claim = await claimStoryTurn(access, command);
        if (claim) {
            try {
                const line = await generateStoryLine(claim, command.requestId, request.signal);
                await finishStoryTurn(access, command, claim.leaseId, line);
            } catch (error) {
                try { await finishStoryTurn(access, command, claim.leaseId, null); }
                catch { console.warn('Workshop story turn lease could not be released.'); }
                if (error instanceof StoryRoomError) throw error;
                console.warn('Workshop story generation did not finish.', error instanceof Error ? error.name : 'unknown');
                return json({ error: 'Postavě se tah nepovedl. Klikni na ni znovu.' }, 502);
            }
        }
        return json({ storyId: command.storyId });
    } catch (error) {
        return errorResponse(error);
    }
}

import { migrateDatabaseOnStartup } from '@/lib/database/migrateDatabase';
import { getPublicRequestHostname, isPrimarySiteHostname } from '@/lib/domains/publicDomainRouting';
import { allowPublicChatRequest } from '@/lib/messages/publicChatRateLimit';
import {
    claimStoryTurn, finishStoryTurn, hashStoryToken, readStoryRoom,
    requireStoryRoomWriteAccess, saveStoryRoomCommand, StoryRoomError,
} from '@/lib/workshops/storyRoomDatabase';
import { checkStoryText, generateStoryLine, validateCustomStoryBook } from '@/lib/workshops/storyRoomGeneration';
import { STORY_ID, STORY_INVITE, STORY_ROOM_COMMAND } from '@/lib/workshops/storyRoomTypes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 45;

const MAX_BODY_BYTES = 34_000;

function json(body: unknown, status = 200) {
    return Response.json(body, {
        status, headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' },
    });
}

function getAccess(request: Request) {
    const url = new URL(request.url);
    const host = getPublicRequestHostname(request.headers, url.hostname);
    if (!isPrimarySiteHostname(host) && !(process.env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(host))) {
        throw new StoryRoomError(404, 'Dílna se otevírá na ptbk.io.');
    }
    const invite = STORY_INVITE.safeParse(request.headers.get('x-story-invite'));
    const browser = STORY_ID.safeParse(request.headers.get('x-story-browser'));
    if (!invite.success || !browser.success) throw new StoryRoomError(404, 'Zadej platný kód dílny.');
    return { inviteHash: hashStoryToken(invite.data), ownerHash: hashStoryToken(browser.data) };
}

function errorResponse(error: unknown) {
    if (error instanceof StoryRoomError) return json({ error: error.message }, error.status);
    const code = error instanceof Error && 'code' in error && typeof error.code === 'string' ? error.code : undefined;
    console.error('Workshop story operation failed.', { name: error instanceof Error ? error.name : 'unknown', code });
    return json({ error: 'Dílna teď neodpovídá. Zkus to za chvilku.' }, 503);
}

async function readCommand(request: Request) {
    const reader = request.body?.getReader();
    if (!reader) return STORY_ROOM_COMMAND.safeParse(null);
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    try {
        for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            bytes += value.length;
            if (bytes > MAX_BODY_BYTES) { await reader.cancel(); return STORY_ROOM_COMMAND.safeParse(null); }
            chunks.push(value);
        }
        return STORY_ROOM_COMMAND.safeParse(JSON.parse(Buffer.concat(chunks).toString('utf8')));
    } catch {
        return STORY_ROOM_COMMAND.safeParse(null);
    }
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const storyId = STORY_ID.safeParse(url.searchParams.get('story'));
        const access = getAccess(request);
        await migrateDatabaseOnStartup();
        return json(await readStoryRoom(access, storyId.success ? storyId.data : null));
    } catch (error) {
        return errorResponse(error);
    }
}

export async function POST(request: Request) {
    try {
        const access = getAccess(request);
        const origin = request.headers.get('origin');
        if (origin && origin !== new URL(request.url).origin) return json({ error: 'Neplatný požadavek.' }, 403);
        const parsed = await readCommand(request);
        if (!parsed.success) return json({ error: 'Zkontroluj, že je text vyplněný a není příliš dlouhý.' }, 400);
        const command = parsed.data;
        await migrateDatabaseOnStartup();
        if (command.action === 'character' || command.action === 'create') {
            if (!allowPublicChatRequest(`story-edit:${access.inviteHash}:${access.ownerHash}`)) {
                return json({ error: 'Chvilku počkej a pak zkus uložit změnu znovu.' }, 429);
            }
            await requireStoryRoomWriteAccess(access);
            if (command.action === 'character') {
                validateCustomStoryBook(command.book);
                await checkStoryText(command.book, request.signal);
            } else {
                await checkStoryText(`${command.title}\n${command.premise}`, request.signal);
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

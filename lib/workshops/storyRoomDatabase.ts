import 'server-only';
import { randomUUID } from 'node:crypto';
import { SITE_URL } from '@/lib/metadata/site-config';
import { createAdHocShortcodeLink } from '@/lib/shortener/shortcodeLinkAdHoc';
import { createPublicShortcodeLinkUrl } from '@/lib/shortener/shortcodeLink';
import { createWorkshopSelectionPath } from '@/lib/workshops/workshopParticipantLink';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ManagedAgent } from '@/lib/agents/agentModel';
import { runDatabaseTransaction, type DatabaseTransaction } from '@/lib/database/runDatabaseTransaction';
import {
    STORY_ROOM_MAX_LINES, type StoryCharacter, type StoryLine, type StoryRoomState,
    type StoryRoomCommand, type StoryRoomParticipant, type StorySummary, type StoryTurn, type WorkshopStory,
} from './storyRoomTypes';
import { getManagedStoryBook, getTemplateStoryBook, STORY_TEMPLATE_BY_ID, STORY_TEMPLATES } from './storyRoomCast';
import { STORY_EVENT_TYPE, STORY_ROOM_PATH } from './storyRoomPaths';

const MAX_GENERATION_ATTEMPTS = 600;
const MAX_PARALLEL_GENERATIONS = 8;
const MAX_STORIES = 40;
const MAX_CUSTOM_CHARACTERS = 60;
const MAX_CAST = 12;

export class StoryRoomError extends Error {
    constructor(readonly status: number, message: string) {
        super(message);
    }
}

export type StoryAccess = {
    readonly workshopId: string;
    readonly participantId: string | null;
};

type RoomRow = {
    workshop_id: string;
    agent_ids: string[];
    book_overrides: Record<string, string>;
    can_write: boolean;
    generation_attempts: number;
};
type StoryRow = {
    id: string; title: string; premise: string; character_ids: string[]; lines: StoryLine[]; is_busy: boolean;
};
type CharacterRow = { id: string; name: string; book_source: string };

const STORY_END = "COALESCE(w.ends_at, w.starts_at + interval '1 hour')";

async function getRoom(tx: DatabaseTransaction, access: StoryAccess, writing = false): Promise<RoomRow> {
    // Every story event uses the same room data. A newly created occurrence starts with an empty stage.
    await tx.query(
        `INSERT INTO public.workshop_story_rooms (workshop_id, write_until, read_until)
         SELECT w.id, ${STORY_END} + interval '2 hours', ${STORY_END} + interval '7 days 2 hours'
         FROM public.workshops AS w
         WHERE w.id = $1 AND w.room_kind = 'workshop' AND w.event_type = $2
           AND w.is_published AND NOT w.is_deleted AND ${STORY_END} + interval '7 days 2 hours' > now()
           AND NOT EXISTS (SELECT 1 FROM public.workshop_story_rooms WHERE workshop_id = w.id)
         ON CONFLICT (workshop_id) DO NOTHING`,
        [access.workshopId, STORY_EVENT_TYPE],
    );
    const { rows: [room] } = await tx.query<RoomRow>(
        `SELECT r.workshop_id, r.agent_ids, r.book_overrides, r.generation_attempts,
                ${STORY_END} + interval '2 hours' > now() AS can_write
         FROM public.workshop_story_rooms AS r JOIN public.workshops AS w ON w.id = r.workshop_id
         WHERE w.id = $1 AND w.room_kind = 'workshop' AND w.event_type = $2
           AND w.is_published AND NOT w.is_deleted AND ${STORY_END} + interval '7 days 2 hours' > now()
         ${writing ? 'FOR UPDATE OF r' : ''}`,
        [access.workshopId, STORY_EVENT_TYPE],
    );
    if (!room) throw new StoryRoomError(404, 'Tahle příběhová dílna už není dostupná.');
    if (writing) {
        if (!room.can_write) throw new StoryRoomError(403, 'Dílna je teď otevřená už jen pro čtení.');
        // Lock the same participant row the workshop moderation uses. A revocation also applies to an in-flight turn.
        const { rows } = await tx.query(
            `SELECT id FROM public.workshop_participants
             WHERE workshop_id = $1 AND id = $2 AND NOT is_interaction_banned AND (is_trusted OR is_moderator)
             FOR SHARE`,
            [access.workshopId, access.participantId],
        );
        if (!rows.length) throw new StoryRoomError(403, 'Ke hraní potřebuješ schválení od organizátora.');
    }
    return room;
}

async function getStory(tx: DatabaseTransaction, roomId: string, storyId: string): Promise<StoryRow> {
    const { rows: [story] } = await tx.query<StoryRow>(
        `SELECT id, title, premise, character_ids, lines, COALESCE(pending_until > now(), false) AS is_busy
         FROM public.workshop_stories WHERE workshop_id = $1 AND id = $2`,
        [roomId, storyId],
    );
    if (!story) throw new StoryRoomError(404, 'Tento příběh v dílně není.');
    return story;
}

function bookName(book: string): string {
    return book.split(/\r?\n/, 1)[0]!.trim();
}

async function getCharacters(tx: DatabaseTransaction, room: RoomRow, canEdit: boolean): Promise<StoryCharacter[]> {
    const { rows: managed } = await tx.query<Pick<CharacterRow, 'id' | 'name'>>(
        `SELECT id, name FROM public.workshop_agents WHERE id = ANY($1::uuid[]) AND is_enabled
         ORDER BY array_position($1::uuid[], id)`,
        [room.agent_ids],
    );
    const { rows: custom } = await tx.query<CharacterRow>(
        `SELECT id, name, book_source FROM public.workshop_story_characters
         WHERE workshop_id = $1 AND pending_id IS NULL ORDER BY created_at, id`,
        [room.workshop_id],
    );
    const prepared = STORY_TEMPLATES.map((template) => {
        const override = room.book_overrides[template.id];
        return {
            id: template.id, name: override ? bookName(override) : template.name, avatar: template.avatar,
            ...(canEdit ? { book: override ?? getTemplateStoryBook(template) } : {}),
        };
    });
    return [
        ...prepared,
        ...managed.filter(({ id }) => !STORY_TEMPLATE_BY_ID.has(id)).map(({ id, name }) => {
            const override = room.book_overrides[id];
            return {
                id, name: override ? bookName(override) : name, avatar: 'sparkles' as const,
                ...(canEdit ? { book: override ?? getManagedStoryBook(name) } : {}),
            };
        }),
        ...custom.map(({ id, name, book_source }) => ({ id, name, ...(canEdit ? { book: book_source } : {}) })),
    ];
}

async function getCharacter(tx: DatabaseTransaction, room: RoomRow, id: string): Promise<ManagedAgent> {
    const override = room.book_overrides[id];
    const template = STORY_TEMPLATE_BY_ID.get(id);
    if (template) {
        return { id, name: override ? bookName(override) : template.name, bookSource: override ?? getTemplateStoryBook(template), isEnabled: true };
    }
    const { rows: [row] } = await tx.query<CharacterRow>(
        `SELECT id, name, book_source FROM public.workshop_agents
         WHERE id = $1 AND id = ANY($2::uuid[]) AND is_enabled
         UNION ALL
         SELECT id, name, book_source FROM public.workshop_story_characters WHERE id = $1 AND workshop_id = $3 AND pending_id IS NULL
         LIMIT 1`,
        [id, room.agent_ids, room.workshop_id],
    );
    if (row) return { id: row.id, name: override ? bookName(override) : row.name, bookSource: override ?? row.book_source, isEnabled: true };
    throw new StoryRoomError(404, 'Tato postava v dílně není dostupná.');
}

export async function readStoryRoom(
    access: StoryAccess, storyId: string | null, participant: StoryRoomParticipant | null,
): Promise<StoryRoomState> {
    return runDatabaseTransaction('reading workshop story room', async (tx) => {
        const room = await getRoom(tx, access);
        const { rows: stories } = await tx.query<StorySummary>(
            'SELECT id, title FROM public.workshop_stories WHERE workshop_id = $1 ORDER BY created_at, id',
            [room.workshop_id],
        );
        const selected = stories.find(({ id }) => id === storyId) ?? stories[0];
        const story = selected ? await getStory(tx, room.workshop_id, selected.id) : null;
        const canWrite = room.can_write && Boolean(
            participant && !participant.isInteractionBanned && (participant.isTrusted || participant.isModerator),
        );
        return {
            characters: await getCharacters(tx, room, canWrite),
            stories,
            story: story ? {
                id: story.id, title: story.title, premise: story.premise, cast: story.character_ids,
                lines: story.lines, isBusy: story.is_busy,
            } : null,
            isWritingOpen: room.can_write,
            canWrite,
            participant: participant ? { fullname: participant.fullname, isInteractionBanned: participant.isInteractionBanned } : null,
            canGenerate: Boolean(process.env.OPENAI_API_KEY?.trim()) && room.generation_attempts < MAX_GENERATION_ATTEMPTS,
        };
    });
}

export async function requireStoryRoomWriteAccess(access: StoryAccess) {
    await runDatabaseTransaction('checking workshop story access', async (tx) => { await getRoom(tx, access, true); });
}

export async function reserveStoryCharacterGeneration(access: StoryAccess, characterId: string): Promise<string | null> {
    return runDatabaseTransaction('reserving story character generation', async (tx) => {
        const room = await getRoom(tx, access, true);
        if (STORY_TEMPLATE_BY_ID.has(characterId) || room.agent_ids.includes(characterId)) {
            throw new StoryRoomError(409, 'Tahle postava už v dílně je.');
        }
        await tx.query(
            'DELETE FROM public.workshop_story_characters WHERE workshop_id = $1 AND pending_until <= now()',
            [room.workshop_id],
        );
        const { rows: [previous] } = await tx.query<{ workshop_id: string; pending_id: string | null }>(
            'SELECT workshop_id, pending_id FROM public.workshop_story_characters WHERE id = $1', [characterId],
        );
        if (previous?.workshop_id === room.workshop_id && !previous.pending_id) return null;
        if (previous) throw new StoryRoomError(409, 'Tahle postava už se připravuje.');
        await checkCapacity(tx, 'workshop_story_characters', room.workshop_id, MAX_CUSTOM_CHARACTERS);
        await countGenerationAttempt(tx, room);
        const leaseId = randomUUID();
        await tx.query(
            `INSERT INTO public.workshop_story_characters (id, workshop_id, name, book_source, pending_id, pending_until)
             VALUES ($1, $2, '', '', $3, now() + interval '45 seconds')`,
            [characterId, room.workshop_id, leaseId],
        );
        return leaseId;
    });
}

export async function finishStoryCharacterGeneration(access: StoryAccess, characterId: string, leaseId: string, book: string | null) {
    await runDatabaseTransaction('finishing story character generation', async (tx) => {
        if (book === null) {
            await tx.query(
                'DELETE FROM public.workshop_story_characters WHERE workshop_id = $1 AND id = $2 AND pending_id = $3',
                [access.workshopId, characterId, leaseId],
            );
            return;
        }
        await getRoom(tx, access, true);
        const { rows } = await tx.query(
            `UPDATE public.workshop_story_characters SET name = $4, book_source = $5, pending_id = NULL, pending_until = NULL
             WHERE workshop_id = $1 AND id = $2 AND pending_id = $3 AND pending_until > now() RETURNING id`,
            [access.workshopId, characterId, leaseId, bookName(book), book],
        );
        if (!rows.length) throw new StoryRoomError(409, 'Čas na vytvoření postavy vypršel. Zkus to znovu.');
    });
}

async function countGenerationAttempt(tx: DatabaseTransaction, room: RoomRow) {
    if (room.generation_attempts >= MAX_GENERATION_ATTEMPTS) {
        throw new StoryRoomError(429, 'Dílna vyčerpala počet AI tahů.');
    }
    await tx.query(
        'UPDATE public.workshop_story_rooms SET generation_attempts = generation_attempts + 1 WHERE workshop_id = $1',
        [room.workshop_id],
    );
}

export async function getStoryRoomShareUrl(access: StoryAccess, slug: string, supabase: SupabaseClient) {
    return runDatabaseTransaction('sharing workshop story room', async (tx) => {
        const room = await getRoom(tx, access);
        await tx.query('SELECT workshop_id FROM public.workshop_story_rooms WHERE workshop_id = $1 FOR UPDATE', [room.workshop_id]);
        const url = new URL(createWorkshopSelectionPath(STORY_ROOM_PATH, slug), SITE_URL).href;
        const note = `Příběhová dílna (${room.workshop_id})`;
        const { rows: [existing] } = await tx.query<{ shortcode: string }>(
            `SELECT shortcode FROM public."ShortcodeLink"
             WHERE note = $1 AND url = ARRAY[$2]::text[] AND "isAdHoc" AND "sourceApp" = 'online-workshop'
             ORDER BY id LIMIT 1`,
            [note, url],
        );
        if (existing) return createPublicShortcodeLinkUrl(existing.shortcode);
        const result = await createAdHocShortcodeLink(supabase, { urls: [url], note, sourceApp: 'online-workshop' });
        if (!result.shortcodeLink) throw new StoryRoomError(503, 'Krátký odkaz se nepodařilo vytvořit. Zkus to znovu.');
        return createPublicShortcodeLinkUrl(result.shortcodeLink.shortcode);
    });
}

export async function readStoryForNarration(access: StoryAccess, storyId: string) {
    return runDatabaseTransaction('reading workshop story for narration', async (tx) => {
        const room = await getRoom(tx, access);
        const { title, premise, lines } = await getStory(tx, room.workshop_id, storyId);
        return { title, premise, lines };
    });
}

async function checkCapacity(
    tx: DatabaseTransaction, table: 'workshop_stories' | 'workshop_story_characters', roomId: string, limit: number,
) {
    const { rows: [row] } = await tx.query<{ count: number }>(
        `SELECT count(*)::int AS count FROM public.${table} WHERE workshop_id = $1`, [roomId],
    );
    if (row!.count >= limit) throw new StoryRoomError(409, 'V dílně už je plno. Vyber si z toho, co už vzniklo.');
}

export async function saveStoryRoomCommand(
    access: StoryAccess, command: Exclude<StoryRoomCommand, StoryTurn | { action: 'generate-character' }>,
): Promise<string | null> {
    return runDatabaseTransaction('updating workshop story room', async (tx) => {
        const room = await getRoom(tx, access, true);
        const roomId = room.workshop_id;
        if (command.action === 'create') {
            const { rows } = await tx.query('SELECT 1 FROM public.workshop_stories WHERE id = $1 AND workshop_id = $2', [
                command.id, roomId,
            ]);
            if (!rows.length) {
                await checkCapacity(tx, 'workshop_stories', roomId, MAX_STORIES);
                await tx.query(
                    'INSERT INTO public.workshop_stories (id, workshop_id, title, premise, character_ids) VALUES ($1,$2,$3,$4,$5)',
                    [command.id, roomId, command.title, command.premise, STORY_TEMPLATES.slice(0, 3).map(({ id }) => id)],
                );
            }
            return command.id;
        }
        if (command.action === 'character') {
            if (STORY_TEMPLATE_BY_ID.has(command.id) || room.agent_ids.includes(command.id)) {
                // Story edits belong to this occurrence. Managed Books in the agent registry are never overwritten.
                await getCharacter(tx, room, command.id);
                await tx.query(
                    `UPDATE public.workshop_story_rooms
                     SET book_overrides = jsonb_set(book_overrides, ARRAY[$2]::text[], to_jsonb($3::text))
                     WHERE workshop_id = $1`,
                    [roomId, command.id, command.book],
                );
                return null;
            }
            const { rows } = await tx.query(
                `UPDATE public.workshop_story_characters SET name = $3, book_source = $4
                 WHERE id = $1 AND workshop_id = $2 AND pending_id IS NULL RETURNING id`,
                [command.id, roomId, bookName(command.book), command.book],
            );
            if (!rows.length) throw new StoryRoomError(404, 'Tato postava v dílně není.');
            return null;
        }
        const story = await getStory(tx, roomId, command.storyId);
        if (story.is_busy) throw new StoryRoomError(409, 'Postava právě hraje. Chvilku počkej.');
        const hasCharacter = story.character_ids.includes(command.characterId);
        if (hasCharacter === command.include) return story.id;
        if (command.include) {
            await getCharacter(tx, room, command.characterId);
            if (story.character_ids.length >= MAX_CAST) throw new StoryRoomError(409, 'Na scénu se vejde nejvýš 12 postav.');
        }
        const cast = command.include
            ? [...story.character_ids, command.characterId]
            : story.character_ids.filter((id) => id !== command.characterId);
        await tx.query('UPDATE public.workshop_stories SET character_ids = $2 WHERE id = $1', [story.id, cast]);
        return story.id;
    });
}

export type ClaimedStoryTurn = {
    readonly agent: ManagedAgent;
    readonly story: Pick<WorkshopStory, 'title' | 'premise' | 'lines'>;
    readonly leaseId: string;
};

/** Reserve one turn before calling the model. The database lock is released during generation. */
export async function claimStoryTurn(access: StoryAccess, command: StoryTurn): Promise<ClaimedStoryTurn | null> {
    return runDatabaseTransaction('claiming workshop story turn', async (tx) => {
        const room = await getRoom(tx, access, true);
        const story = await getStory(tx, room.workshop_id, command.storyId);
        if (story.lines.some(({ id }) => id === command.requestId)) return null;
        if (story.is_busy) throw new StoryRoomError(409, 'Na scéně už někdo hraje. Chvilku počkej.');
        if (!story.character_ids.includes(command.characterId)) throw new StoryRoomError(409, 'Nejdřív přidej postavu na scénu.');
        if (story.lines.length >= STORY_ROOM_MAX_LINES) throw new StoryRoomError(409, 'Příběh je plný. Můžeš si ho stáhnout a začít další.');
        const { rows: [running] } = await tx.query<{ count: number }>(
            'SELECT count(*)::int AS count FROM public.workshop_stories WHERE workshop_id = $1 AND pending_until > now()',
            [room.workshop_id],
        );
        if (running!.count >= MAX_PARALLEL_GENERATIONS) throw new StoryRoomError(429, 'Hraje hodně příběhů naráz. Zkus to za chvilku.');
        const agent = await getCharacter(tx, room, command.characterId);
        const leaseId = randomUUID();
        await tx.query(
            "UPDATE public.workshop_stories SET pending_id = $2, pending_until = now() + interval '45 seconds' WHERE id = $1",
            [story.id, leaseId],
        );
        await countGenerationAttempt(tx, room);
        return { agent, story, leaseId };
    });
}

export async function finishStoryTurn(access: StoryAccess, command: StoryTurn, leaseId: string, line: StoryLine | null) {
    return runDatabaseTransaction('finishing workshop story turn', async (tx) => {
        if (line) {
            const room = await getRoom(tx, access, true);
            await getCharacter(tx, room, command.characterId);
            const { rows } = await tx.query(
                `UPDATE public.workshop_stories
                 SET lines = lines || $3::jsonb, pending_id = NULL, pending_until = NULL
                 WHERE id = $1 AND pending_id = $2 AND pending_until > now() AND workshop_id = $4
                 RETURNING id`,
                [command.storyId, leaseId, JSON.stringify([line]), room.workshop_id],
            );
            if (!rows.length) throw new StoryRoomError(409, 'Tento tah vypršel. Klikni na postavu znovu.');
            return;
        }
        await tx.query(
            `UPDATE public.workshop_stories SET pending_id = NULL, pending_until = NULL
             WHERE workshop_id = $1 AND id = $2 AND pending_id = $3`,
            [access.workshopId, command.storyId, leaseId],
        );
    });
}

import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import type { ManagedAgent } from '@/lib/agents/agentModel';
import { runDatabaseTransaction, type DatabaseTransaction } from '@/lib/database/runDatabaseTransaction';
import {
    STORY_ROOM_MAX_LINES, type StoryCharacter, type StoryLine, type StoryRoomState,
    type StoryRoomCommand, type StorySummary, type StoryTurn, type WorkshopStory,
} from './storyRoomTypes';

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

export type StoryAccess = { readonly inviteHash: string; readonly ownerHash: string };

export function hashStoryToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
}

type RoomRow = { workshop_id: string; agent_ids: string[]; can_write: boolean; generation_attempts: number };
type StoryRow = {
    id: string; title: string; premise: string; character_ids: string[]; lines: StoryLine[]; is_busy: boolean;
};
type CharacterRow = {
    id: string; name: string; book_source: string; is_workshop_agent: boolean; is_owned: boolean;
};

async function getRoom(tx: DatabaseTransaction, access: StoryAccess, writing = false): Promise<RoomRow> {
    const { rows: [room] } = await tx.query<RoomRow>(
        `SELECT r.workshop_id, r.agent_ids, r.write_until > now() AS can_write, r.generation_attempts
         FROM public.workshop_story_rooms AS r JOIN public.workshops AS w ON w.id = r.workshop_id
         WHERE r.invite_hash = $1 AND r.read_until > now() AND NOT w.is_deleted
         ${writing ? 'FOR UPDATE OF r' : ''}`,
        [access.inviteHash],
    );
    if (!room) throw new StoryRoomError(404, 'Tento kód neplatí nebo už byla dílna uzavřena.');
    if (writing && !room.can_write) throw new StoryRoomError(403, 'Dílna je teď otevřená už jen pro čtení.');
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

async function getCharacters(tx: DatabaseTransaction, room: RoomRow, ownerHash: string): Promise<StoryCharacter[]> {
    const { rows } = await tx.query<CharacterRow>(
        `SELECT id, name, NULL AS book_source, true AS is_workshop_agent, false AS is_owned
         FROM public.workshop_agents WHERE id = ANY($1::uuid[]) AND is_enabled
         ORDER BY array_position($1::uuid[], id)`, [room.agent_ids],
    );
    const { rows: custom } = await tx.query<CharacterRow>(
        `SELECT id, name, CASE WHEN owner_hash = $2 THEN book_source END AS book_source,
                false AS is_workshop_agent, owner_hash = $2 AS is_owned
         FROM public.workshop_story_characters WHERE workshop_id = $1 ORDER BY created_at, id`,
        [room.workshop_id, ownerHash],
    );
    return [...rows, ...custom].map((row) => ({
        id: row.id, name: row.name, isWorkshopAgent: row.is_workshop_agent,
        ...(row.is_owned ? { book: row.book_source } : {}),
    }));
}

async function getCharacter(tx: DatabaseTransaction, room: RoomRow, id: string): Promise<ManagedAgent> {
    const { rows: [row] } = await tx.query<Pick<CharacterRow, 'id' | 'name' | 'book_source'>>(
        `SELECT id, name, book_source FROM public.workshop_agents
         WHERE id = $1 AND id = ANY($2::uuid[]) AND is_enabled
         UNION ALL
         SELECT id, name, book_source FROM public.workshop_story_characters WHERE id = $1 AND workshop_id = $3
         LIMIT 1`,
        [id, room.agent_ids, room.workshop_id],
    );
    if (!row) throw new StoryRoomError(404, 'Tato postava v dílně není dostupná.');
    return { id: row.id, name: row.name, bookSource: row.book_source, isEnabled: true };
}

export async function readStoryRoom(access: StoryAccess, storyId: string | null): Promise<StoryRoomState> {
    return runDatabaseTransaction('reading workshop story room', async (tx) => {
        const room = await getRoom(tx, access);
        const { rows: stories } = await tx.query<StorySummary>(
            'SELECT id, title FROM public.workshop_stories WHERE workshop_id = $1 ORDER BY created_at, id',
            [room.workshop_id],
        );
        const selected = stories.find(({ id }) => id === storyId) ?? stories[0];
        const story = selected ? await getStory(tx, room.workshop_id, selected.id) : null;
        return {
            characters: await getCharacters(tx, room, access.ownerHash),
            stories,
            story: story ? {
                id: story.id, title: story.title, premise: story.premise, cast: story.character_ids,
                lines: story.lines, isBusy: story.is_busy,
            } : null,
            canWrite: room.can_write,
            canGenerate: Boolean(process.env.OPENAI_API_KEY?.trim()) && room.generation_attempts < MAX_GENERATION_ATTEMPTS,
        };
    });
}

export async function requireStoryRoomWriteAccess(access: StoryAccess) {
    await runDatabaseTransaction('checking workshop story access', async (tx) => { await getRoom(tx, access, true); });
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
    access: StoryAccess, command: Exclude<StoryRoomCommand, StoryTurn>,
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
                    [command.id, roomId, command.title, command.premise, room.agent_ids.slice(0, 3)],
                );
            }
            return command.id;
        }
        if (command.action === 'character') {
            const { rows: [previous] } = await tx.query<{ owner_hash: string; workshop_id: string }>(
                'SELECT owner_hash, workshop_id FROM public.workshop_story_characters WHERE id = $1', [command.id],
            );
            if (previous && (previous.owner_hash !== access.ownerHash || previous.workshop_id !== roomId)) {
                throw new StoryRoomError(403, 'Book může upravit prohlížeč, ve kterém postava vznikla.');
            }
            if (!previous) await checkCapacity(tx, 'workshop_story_characters', roomId, MAX_CUSTOM_CHARACTERS);
            const name = command.book.split('\n')[0]!.trim();
            await tx.query(
                `INSERT INTO public.workshop_story_characters (id, workshop_id, owner_hash, name, book_source)
                 VALUES ($1,$2,$3,$4,$5)
                 ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, book_source = EXCLUDED.book_source
                 WHERE workshop_story_characters.workshop_id = EXCLUDED.workshop_id
                   AND workshop_story_characters.owner_hash = EXCLUDED.owner_hash`,
                [command.id, roomId, access.ownerHash, name, command.book],
            );
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
        if (room.generation_attempts >= MAX_GENERATION_ATTEMPTS) throw new StoryRoomError(429, 'Dílna vyčerpala počet tahů.');
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
        await tx.query(
            'UPDATE public.workshop_story_rooms SET generation_attempts = generation_attempts + 1 WHERE workshop_id = $1',
            [room.workshop_id],
        );
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
            `UPDATE public.workshop_stories AS s SET pending_id = NULL, pending_until = NULL
             FROM public.workshop_story_rooms AS r
             WHERE s.workshop_id = r.workshop_id AND r.invite_hash = $1 AND s.id = $2 AND s.pending_id = $3`,
            [access.inviteHash, command.storyId, leaseId],
        );
    });
}

import { PGlite } from '@electric-sql/pglite';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, expect, it, vi } from 'vitest';
import type { DatabaseTransaction } from '@/lib/database/runDatabaseTransaction';
import type { StoryRoomCommand, StoryRoomState, StoryTurn } from '@/lib/workshops/storyRoomTypes';

const fixture = vi.hoisted(() => ({ database: undefined as PGlite | undefined }));
vi.mock('server-only', () => ({}));
vi.mock('@/lib/database/runDatabaseTransaction', () => ({
    runDatabaseTransaction: (_label: string, run: (tx: DatabaseTransaction) => Promise<unknown>) =>
        fixture.database!.transaction((tx) => run({ query: (sql, values) => tx.query(sql, values ? [...values] : undefined) })),
}));

import { GET, POST } from './route';
import { hashStoryToken } from '@/lib/workshops/storyRoomDatabase';

const INVITE = 'ABCD234EFGH567J';
const OWNER = randomUUID();
const GUEST = randomUUID();
const URL = 'https://www.ptbk.io/api/workshops/story-room';
const LIBRARY_EVENT = 'https://www.mlp.cz/cz/akce/pribeh-ktery-se-sam-odehrava-pise-promptboo/12791';

beforeAll(async () => {
    fixture.database = new PGlite();
    await fixture.database.exec(`
        CREATE ROLE anon;
        CREATE ROLE authenticated;
        CREATE ROLE service_role;
        CREATE TABLE public.workshops (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text UNIQUE NOT NULL, room_kind text NOT NULL,
            event_type text NOT NULL, title text NOT NULL, starts_at timestamptz NOT NULL, ends_at timestamptz,
            location_kind text, location_label text, price_czk integer, external_url text,
            is_deleted boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
        );
        CREATE TABLE public.workshop_agents (
            id uuid PRIMARY KEY, name text NOT NULL, book_source text NOT NULL, is_enabled boolean NOT NULL DEFAULT true
        );
        INSERT INTO public.workshops (slug, room_kind, event_type, title, starts_at, external_url)
        VALUES ('already-in-calendar', 'workshop', 'external', 'Příběhová dílna', now(), '${LIBRARY_EVENT}?from=calendar');
    `);
    await fixture.database.exec(readFileSync('migrations/2026-11-0700-workshop-story-room.sql', 'utf8'));
    await fixture.database.query(
        "UPDATE public.workshop_story_rooms SET invite_hash = $1, write_until = now() + interval '1 hour', read_until = now() + interval '1 day'",
        [hashStoryToken(INVITE)],
    );
    vi.stubEnv('OPENAI_API_KEY', 'test-only');
});

afterAll(async () => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    await fixture.database?.close();
});

function headers(browser: string, invite = INVITE) {
    return { 'x-story-invite': invite, 'x-story-browser': browser, 'content-type': 'application/json', origin: 'https://www.ptbk.io' };
}

function post(browser: string, body: StoryRoomCommand) {
    return POST(new Request(URL, { method: 'POST', headers: headers(browser), body: JSON.stringify(body) }));
}

async function read(browser: string, storyId?: string): Promise<StoryRoomState> {
    const response = await GET(new Request(storyId ? `${URL}?story=${storyId}` : URL, { headers: headers(browser) }));
    expect(response.status).toBe(200);
    return response.json() as Promise<StoryRoomState>;
}

it('uses the existing workshop and shares stories and characters while protecting Book edits', async () => {
    expect((await fixture.database!.query('SELECT slug FROM public.workshops')).rows).toEqual([{ slug: 'already-in-calendar' }]);
    expect((await GET(new Request(URL, { headers: headers(OWNER, 'BAD') }))).status).toBe(404);
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ results: [{ flagged: false }] })));

    const storyId = randomUUID();
    const characterId = randomUUID();
    const book = 'Drak Pěna\nPERSONA Vyfukuji bubliny.\nKNOWLEDGE V jedné bublině jsem našel klíč.';
    expect((await post(OWNER, { action: 'create', id: storyId, title: 'Stará mapa', premise: 'V mapě se objevil nový ostrov.' })).status).toBe(200);
    expect((await post(OWNER, { action: 'character', id: characterId, book })).status).toBe(200);
    expect((await post(GUEST, { action: 'character', id: characterId, book: book.replace('Pěna', 'Stín') })).status).toBe(403);
    expect((await post(GUEST, { action: 'cast', storyId, characterId, include: true })).status).toBe(200);

    const guestRoom = await read(GUEST, storyId);
    expect(guestRoom.story).toMatchObject({ id: storyId, title: 'Stará mapa', cast: expect.arrayContaining([characterId]) });
    expect(guestRoom.characters.find(({ id }) => id === characterId)).toEqual({ id: characterId, name: 'Drak Pěna', isWorkshopAgent: false });
    expect((await read(OWNER, storyId)).characters.find(({ id }) => id === characterId)?.book).toBe(book);
    expect(guestRoom.characters.filter(({ isWorkshopAgent }) => isWorkshopAgent).every(({ book: source }) => source === undefined)).toBe(true);
});

it('publishes exactly one vetted sentence and rejects a concurrent or replayed turn', async () => {
    const story = (await read(OWNER)).story!;
    const command: StoryTurn = { action: 'turn', storyId: story.id, characterId: story.cast[0]!, requestId: randomUUID() };
    let startGeneration!: () => void;
    let continueGeneration!: () => void;
    const generationStarted = new Promise<void>((resolve) => { startGeneration = resolve; });
    const generationCanFinish = new Promise<void>((resolve) => { continueGeneration = resolve; });
    const provider = vi.fn(async (url: string) => {
        if (url.endsWith('/moderations')) return Response.json({ results: [{ flagged: false }] });
        startGeneration();
        await generationCanFinish;
        return Response.json({ output: [{ content: [
            { type: 'output_text', text: JSON.stringify({ kind: 'speech', text: 'Podívejte, inkoust se hýbe! Máme jít blíž?' }) },
        ] }] });
    });
    vi.stubGlobal('fetch', provider);

    const first = post(OWNER, command);
    await Promise.race([generationStarted, first.then(() => { throw new Error('Generation did not start.'); })]);
    try {
        expect((await read(GUEST)).story?.isBusy).toBe(true);
        expect((await post(GUEST, { ...command, requestId: randomUUID() })).status).toBe(409);
    } finally {
        continueGeneration();
    }
    expect((await first).status).toBe(200);
    expect((await post(OWNER, command)).status).toBe(200);
    expect((await read(GUEST)).story?.lines).toEqual([
        { id: command.requestId, characterName: 'Alenka', kind: 'speech', text: 'Podívejte, inkoust se hýbe!' },
    ]);
    expect(provider.mock.calls.map(([url]) => url)).toEqual(['https://api.openai.com/v1/responses', 'https://api.openai.com/v1/moderations']);
});

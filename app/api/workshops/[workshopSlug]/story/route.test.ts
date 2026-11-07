import { PGlite } from '@electric-sql/pglite';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { NextRequest } from 'next/server';
import { afterAll, beforeAll, expect, it, vi } from 'vitest';
import type { DatabaseTransaction } from '@/lib/database/runDatabaseTransaction';
import type { StoryRoomCommand, StoryRoomState, StoryTurn } from '@/lib/workshops/storyRoomTypes';

const fixture = vi.hoisted(() => ({
    database: undefined as PGlite | undefined,
    upload: vi.fn(),
    shortLink: vi.fn(),
    background: [] as Array<() => Promise<void>>,
}));
vi.mock('next/server', async (importOriginal) => ({
    ...await importOriginal<typeof import('next/server')>(),
    after: (job: () => Promise<void>) => { fixture.background.push(job); },
}));
vi.mock('server-only', () => ({}));
vi.mock('@/lib/database/migrateDatabase', () => ({ migrateDatabaseOnStartup: async () => undefined }));
vi.mock('@/lib/database/runDatabaseTransaction', () => ({
    runDatabaseTransaction: (_label: string, run: (tx: DatabaseTransaction) => Promise<unknown>) =>
        fixture.database!.transaction((tx) => run({ query: (sql, values) => tx.query(sql, values ? [...values] : undefined) })),
}));
vi.mock('@/lib/workshops/workshopDatabase', () => ({
    getWorkshopDatabaseOrNull: () => ({}),
    findWorkshopBySlug: async (_client: unknown, slug: string) => (await fixture.database!.query(
        'SELECT * FROM public.workshops WHERE slug = $1 AND NOT is_deleted AND is_published', [slug],
    )).rows[0] ?? null,
}));
vi.mock('@/lib/workshops/workshopSession', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/lib/workshops/workshopSession')>();
    return {
        ...actual,
        authenticateWorkshopParticipant: async (_client: unknown, request: NextRequest, workshopId: string, slug: string) => {
            const token = actual.readWorkshopSessionToken(request, slug);
            if (!token) return null;
            const { rows: [participant] } = await fixture.database!.query<Parameters<typeof actual.mapWorkshopParticipantRow>[0]>(
                'SELECT * FROM public.workshop_participants WHERE workshop_id = $1 AND session_token_hash = $2',
                [workshopId, actual.hashWorkshopSessionToken(token)],
            );
            return participant ? actual.mapWorkshopParticipantRow(participant) : null;
        },
    };
});
vi.mock('@/lib/shortener/shortcodeLinkAdHoc', () => ({ createAdHocShortcodeLink: fixture.shortLink }));
vi.mock('@/lib/storage/objectStorage', () => ({
    putStoredObject: fixture.upload,
    removeStoredObject: vi.fn(),
    signStoredObject: async (key: string) => `https://storage.invalid/${key}`,
}));

import { GET, POST } from './route';
import { POST as retiredStoryPost } from '../../story-room/route';
import { getWorkshopSessionCookieName } from '@/lib/workshops/workshopConstants';
import { hashWorkshopSessionToken } from '@/lib/workshops/workshopSession';

const APPROVED = 'approved-browser-session';
const SECOND_APPROVED = 'second-approved-browser-session';
const PENDING = 'pending-browser-session';
const BANNED = 'banned-browser-session';
const SLUG = 'already-in-calendar';
const URL = `https://www.ptbk.io/api/workshops/${SLUG}/story`;
const context = { params: Promise.resolve({ workshopSlug: SLUG }) };
const LIBRARY_EVENT = 'https://www.mlp.cz/cz/akce/pribeh-ktery-se-sam-odehrava-pise-promptboo/12791';

beforeAll(async () => {
    fixture.database = new PGlite();
    await fixture.database.exec(`
        CREATE ROLE anon;
        CREATE ROLE authenticated;
        CREATE ROLE service_role;
        CREATE TABLE public.workshops (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text UNIQUE NOT NULL, room_kind text NOT NULL,
            event_type text NOT NULL, title text NOT NULL, description text NOT NULL DEFAULT '', starts_at timestamptz NOT NULL,
            ends_at timestamptz, is_published boolean NOT NULL DEFAULT false,
            location_kind text, location_label text, price_czk integer, external_url text,
            is_deleted boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
        );
        CREATE TABLE public.workshop_agents (
            id uuid PRIMARY KEY, name text NOT NULL, book_source text NOT NULL, is_enabled boolean NOT NULL DEFAULT true
        );
        CREATE TABLE public.workshop_participants (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(), workshop_id uuid NOT NULL, fullname text NOT NULL,
            email text NOT NULL, connected_at timestamptz NOT NULL DEFAULT now(), session_token_hash text NOT NULL,
            is_trusted boolean NOT NULL, is_moderator boolean NOT NULL, is_interaction_banned boolean NOT NULL
        );
        CREATE TABLE public."ShortcodeLink" (
            id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY, shortcode text UNIQUE NOT NULL,
            note text, url text[] NOT NULL, "isAdHoc" boolean NOT NULL, "sourceApp" text NOT NULL
        );
        INSERT INTO public.workshops (slug, room_kind, event_type, title, starts_at, external_url)
        VALUES ('${SLUG}', 'workshop', 'external', 'Příběhová dílna', now(), '${LIBRARY_EVENT}?from=calendar'),
               ('other-workshop', 'workshop', 'online-workshop', 'Jiná akce', now(), NULL);
        INSERT INTO public.workshop_agents (id, name, book_source)
        VALUES ('a3307473-e95b-4e34-9e84-1c15daecf238', 'Pavol Hejný', 'Pavol Hejný
PERSONA Soukromá výchozí role.');
    `);
    for (const filename of [
        '2026-09-1400-workshop-soft-delete', '2026-11-0700-workshop-story-room', '2026-11-0701-workshop-story-event',
        '2026-11-0702-workshop-story-portraits',
    ]) {
        await fixture.database.exec(readFileSync(`migrations/${filename}.sql`, 'utf8'));
    }
    for (const [token, trusted, banned] of [
        [APPROVED, true, false], [SECOND_APPROVED, true, false], [PENDING, false, false], [BANNED, true, true],
    ] as const) {
        await fixture.database.query(
            `INSERT INTO public.workshop_participants
                (workshop_id, fullname, email, session_token_hash, is_trusted, is_moderator, is_interaction_banned)
             SELECT id, 'Testovací čtenář', 'story@example.org', $1, $2, false, $3 FROM public.workshops WHERE slug = $4`,
            [hashWorkshopSessionToken(token), trusted, banned, SLUG],
        );
    }
    vi.stubEnv('OPENAI_API_KEY', 'test-only');
    vi.stubEnv('ELEVENLABS_API_KEY', 'test-only');
    vi.stubEnv('ELEVENLABS_VOICE_ID', 'test-narrator');
    vi.stubEnv('OBJECT_STORAGE_BUCKET', 'test-bucket');
    fixture.shortLink.mockImplementation(async (_client, { urls, note }) => {
        // The real shortener has its own connection. Use the current fixture transaction to emulate that write.
        return { shortcodeLink: { shortcode: 'PtBkTest' }, urls, note };
    });
});

afterAll(async () => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    await fixture.database?.close();
});

function headers(token?: string) {
    return {
        'content-type': 'application/json', origin: 'https://www.ptbk.io',
        ...(token ? { cookie: `${getWorkshopSessionCookieName(SLUG)}=${token}` } : {}),
    };
}

function post(token: string | undefined, body: StoryRoomCommand | { action: string; [key: string]: unknown }) {
    return POST(new NextRequest(URL, { method: 'POST', headers: headers(token), body: JSON.stringify(body) }), context);
}

async function read(token?: string, storyId?: string): Promise<StoryRoomState> {
    const response = await GET(new NextRequest(storyId ? `${URL}?story=${storyId}` : URL, { headers: headers(token) }), context);
    expect(response.status).toBe(200);
    return response.json() as Promise<StoryRoomState>;
}

it('migrates only the existing library occurrence, and makes no legacy invite a writing credential', async () => {
    expect((await fixture.database!.query('SELECT slug, event_type, title FROM public.workshops ORDER BY slug')).rows).toEqual([
        { slug: SLUG, event_type: 'story', title: 'Dny AI v knihovně' },
        { slug: 'other-workshop', event_type: 'online-workshop', title: 'Jiná akce' },
    ]);
    expect(retiredStoryPost().status).toBe(410);
    const guest = await read();
    expect(guest.story?.title).toBe('Kniha, která si pamatovala zítřek');
    expect(guest.characters.length).toBeGreaterThan(10);
    expect(guest.characters.every(({ book }) => book === undefined)).toBe(true);
    const command = { action: 'character', id: randomUUID(), book: 'Drak Pěna\nPERSONA Vyfukuje bubliny.' } as const;
    expect((await post(undefined, command)).status).toBe(401);
    expect((await post(PENDING, command)).status).toBe(403);
    expect((await post(BANNED, command)).status).toBe(403);
    expect((await read(PENDING)).participant).toMatchObject({ fullname: 'Testovací čtenář' });
    expect((await read(PENDING)).canWrite).toBe(false);
    expect((await read(APPROVED)).canWrite).toBe(true);
});

it('shares generated characters and lets other approved participants edit the local Books', async () => {
    const provider = vi.fn(async (url: string) => {
        if (url.endsWith('/moderations')) return Response.json({ results: [{ flagged: false }] });
        if (url.endsWith('/images/generations')) {
            return Response.json({ data: [{ b64_json: readFileSync('public/story-portraits/alenka.webp', 'base64') }] });
        }
        return Response.json({ output: [{ content: [{ type: 'output_text', text: JSON.stringify({
            name: 'Drak Pěna', persona: 'Vyfukuje bubliny.', knowledge: 'V bublině našel klíč.', rule: 'Chraň kamarády.',
        }) }] }] });
    });
    vi.stubGlobal('fetch', provider);
    const characterId = randomUUID();
    const story = (await read()).story!;
    const generated = { action: 'generate-character', id: characterId, description: 'Drak s bublinami' } as const;
    expect((await post(PENDING, generated)).status).toBe(403);
    expect((await post(APPROVED, generated)).status).toBe(200);
    expect((await post(APPROVED, generated)).status).toBe(200);
    expect(provider.mock.calls.filter(([url]) => url.endsWith('/responses'))).toHaveLength(1);
    expect((await read()).characters.find(({ id }) => id === characterId)).toMatchObject({ id: characterId, name: 'Drak Pěna', portraitStatus: 'pending' });
    expect((await read()).characters.find(({ id }) => id === characterId)?.image).toBeUndefined();
    expect(fixture.background).toHaveLength(1);
    expect((await read(APPROVED)).characters.find(({ id }) => id === characterId)?.book).toContain(`META IMAGE https://ptbk.io/api/workshops/${SLUG}/story?portrait=${characterId}`);

    const beforeEdit = (await read(APPROVED)).characters.find(({ id }) => id === characterId)!;
    expect(beforeEdit.bookRevision).toMatch(/^[a-f0-9]{64}$/);
    const book = `Drak Stín\nPERSONA Vyfukuje zlaté bubliny.\nMETA COLOR #346968\nMETA IMAGE /api/workshops/${SLUG}/story?portrait=${characterId}`;
    expect((await post(SECOND_APPROVED, { action: 'character', id: characterId, book: `${book}\nMETA IMAGE https://other.example/portrait.png` })).status).toBe(400);
    const edit = { action: 'character', id: characterId, book, baseRevision: beforeEdit.bookRevision } as const;
    const saved = await post(SECOND_APPROVED, edit);
    expect(saved.status).toBe(200);
    expect(await saved.json()).toMatchObject({ bookRevision: expect.stringMatching(/^[a-f0-9]{64}$/) });
    expect((await post(SECOND_APPROVED, edit)).status).toBe(200);
    expect((await post(APPROVED, { ...edit, book: book.replace('Stín', 'Oheň') })).status).toBe(409);
    expect((await post(APPROVED, { action: 'cast', storyId: story.id, characterId, include: true })).status).toBe(200);
    expect((await read(APPROVED)).characters.find(({ id }) => id === characterId)?.book).toBe(book);
    expect((await read()).story?.cast).toContain(characterId);
    expect((await post(PENDING, { action: 'portrait', id: characterId })).status).toBe(403);
    expect((await post(APPROVED, { action: 'portrait', id: characterId })).status).toBe(200);
    expect(fixture.background).toHaveLength(1);
    await fixture.background.shift()!();
    expect(provider.mock.calls.filter(([url]) => url.endsWith('/images/generations'))).toHaveLength(1);
    expect((await read()).characters.find(({ id }) => id === characterId)).toMatchObject({
        name: 'Drak Stín', color: '#346968', image: `/api/workshops/${SLUG}/story?portrait=${characterId}`,
    });
    expect((await GET(new NextRequest(`${URL}?portrait=${characterId}`, { headers: headers() }), context)).headers.get('location'))
        .toMatch(/^https:\/\/storage\.invalid\/workshops\/story\/.+\.webp$/);
    expect((await GET(new NextRequest(`${URL}?portrait=${randomUUID()}`, { headers: headers() }), context)).status).toBe(404);

    const pavol = (await read(APPROVED)).characters.find(({ name }) => name === 'Pavol Hejný')!;
    expect(pavol.book).not.toContain('Soukromá výchozí role.');
    expect((await post(APPROVED, { action: 'character', id: pavol.id, book: 'Pavol vypravěč\nPERSONA Průvodce v knihovně.' })).status).toBe(200);
    expect((await read()).characters.find(({ id }) => id === pavol.id)?.name).toBe('Pavol vypravěč');
    expect((await fixture.database!.query('SELECT name FROM public.workshop_agents WHERE id = $1', [pavol.id])).rows).toEqual([{ name: 'Pavol Hejný' }]);
});

it('appends one vetted line, including when two people click at once or a request is replayed', async () => {
    const story = (await read()).story!;
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

    const first = post(APPROVED, command);
    await Promise.race([generationStarted, first.then(() => { throw new Error('Generation did not start.'); })]);
    try {
        expect((await read()).story?.isBusy).toBe(true);
        expect((await post(SECOND_APPROVED, { ...command, requestId: randomUUID() })).status).toBe(409);
    } finally {
        continueGeneration();
    }
    expect((await first).status).toBe(200);
    expect((await post(APPROVED, command)).status).toBe(200);
    expect((await read()).story?.lines).toEqual([
        { id: command.requestId, characterId: command.characterId, characterName: 'Alenka', kind: 'speech', text: 'Podívejte, inkoust se hýbe!' },
    ]);
    expect(provider.mock.calls.map(([url]) => url)).toEqual(['https://api.openai.com/v1/responses', 'https://api.openai.com/v1/moderations']);
});

it('reuses measured ElevenLabs clips when an extra line is added', async () => {
    fixture.upload.mockClear();
    const story = (await read()).story!;
    const provider = vi.fn(async (_url: string, init: RequestInit) => {
        const { text } = JSON.parse(init.body as string) as { text: string };
        const characters = Array.from(text);
        return Response.json({
            audio_base64: Buffer.from('mp3').toString('base64'),
            alignment: {
                characters, character_start_times_seconds: characters.map((_, i) => i / 10),
                character_end_times_seconds: characters.map((_, i) => (i + 1) / 10),
            },
        });
    });
    vi.stubGlobal('fetch', provider);
    const clip = (segmentId: string) => post(undefined, { action: 'audio', storyId: story.id, segmentId });
    const first = await clip('title');
    expect(first.status).toBe(200);
    expect(await first.json()).toMatchObject({ url: expect.stringContaining('storage.invalid'), timings: { words: expect.any(Array) } });
    expect((await clip('premise')).status).toBe(200);
    expect((await clip(story.lines[0]!.id)).status).toBe(200);
    expect((await clip('title')).status).toBe(200);
    expect((await clip('premise')).status).toBe(200);
    expect(provider).toHaveBeenCalledTimes(3);
    expect(fixture.upload).toHaveBeenCalledTimes(3);
    expect(provider.mock.calls.every(([url]) => url.includes('/test-narrator/with-timestamps'))).toBe(true);
    expect((await clip(randomUUID())).status).toBe(404);
});

it('chooses the next speaker from the current cast and keeps their earlier lines after they leave', async () => {
    const story = (await read()).story!;
    const alice = story.cast[0]!;
    const sherlock = story.cast[1]!;
    const provider = vi.fn(async (url: string, options: RequestInit) => {
        if (url.endsWith('/moderations')) return Response.json({ results: [{ flagged: false }] });
        const body = JSON.parse(options.body as string) as {
            text: { format: { schema: { properties: { characterId: { enum: string[] } } } } };
            input: { content: { text: string }[] }[];
        };
        expect(body.text.format.schema.properties.characterId.enum).toEqual(story.cast.filter((id) => id !== alice));
        expect(body.input[0].content[0].text).toContain('Podívejte, inkoust se hýbe!');
        return Response.json({ output: [{ content: [{ type: 'output_text', text: JSON.stringify({
            characterId: sherlock, kind: 'speech', text: 'Zkusím tu stopu prozkoumat lupou.',
        }) }] }] });
    });
    vi.stubGlobal('fetch', provider);
    expect((await post(APPROVED, { action: 'cast', storyId: story.id, characterId: alice, include: false })).status).toBe(200);
    const automatic: StoryTurn = { action: 'turn', storyId: story.id, requestId: randomUUID() };
    expect((await post(PENDING, automatic)).status).toBe(403);
    expect((await post(APPROVED, automatic)).status).toBe(200);
    expect((await post(APPROVED, automatic)).status).toBe(200);
    const updated = (await read()).story!;
    expect(updated.cast).not.toContain(alice);
    expect(updated.lines[0]?.characterId).toBe(alice);
    expect(updated.lines.at(-1)).toMatchObject({ id: automatic.requestId, characterId: sherlock, characterName: 'Sherlock Holmes' });
    expect(provider.mock.calls.filter(([url]) => url.endsWith('/responses'))).toHaveLength(1);
});

it('serves the same workshop shortener URL for the dialog and PDF', async () => {
    const shortUrl = 'https://ptbk.io/PtBkTest';
    const first = await post(undefined, { action: 'share' });
    expect(first.status).toBe(200);
    expect(await first.json()).toEqual({ url: shortUrl });
    const [, { urls, note, sourceApp }] = fixture.shortLink.mock.calls[0]!;
    await fixture.database!.query(
        'INSERT INTO public."ShortcodeLink" (shortcode, url, note, "isAdHoc", "sourceApp") VALUES ($1,$2,$3,true,$4)',
        ['PtBkTest', urls, note, sourceApp],
    );
    expect(await (await post(undefined, { action: 'share' })).json()).toEqual({ url: shortUrl });
    expect(urls).toEqual([`https://ptbk.io/cs/pribeh?workshop=${SLUG}`]);
    expect(fixture.shortLink).toHaveBeenCalledTimes(1);
});

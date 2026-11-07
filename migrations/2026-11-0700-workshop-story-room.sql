BEGIN;

CREATE TABLE public.workshop_story_rooms (
    workshop_id uuid PRIMARY KEY REFERENCES public.workshops(id) ON DELETE CASCADE,
    invite_hash text NOT NULL UNIQUE CHECK (invite_hash ~ '^[a-f0-9]{64}$'),
    agent_ids uuid[] NOT NULL,
    write_until timestamptz NOT NULL,
    read_until timestamptz NOT NULL CHECK (read_until >= write_until),
    generation_attempts integer NOT NULL DEFAULT 0
);

CREATE TABLE public.workshop_stories (
    id uuid PRIMARY KEY,
    workshop_id uuid NOT NULL REFERENCES public.workshop_story_rooms(workshop_id) ON DELETE CASCADE,
    title text NOT NULL,
    premise text NOT NULL,
    character_ids uuid[] NOT NULL,
    lines jsonb NOT NULL DEFAULT '[]',
    pending_id uuid,
    pending_until timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    CHECK ((pending_id IS NULL) = (pending_until IS NULL))
);
CREATE INDEX workshop_stories_room_idx ON public.workshop_stories (workshop_id, created_at, id);

CREATE TABLE public.workshop_story_characters (
    id uuid PRIMARY KEY,
    workshop_id uuid NOT NULL REFERENCES public.workshop_story_rooms(workshop_id) ON DELETE CASCADE,
    owner_hash text NOT NULL CHECK (owner_hash ~ '^[a-f0-9]{64}$'),
    name text NOT NULL,
    book_source text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX workshop_story_characters_room_idx ON public.workshop_story_characters (workshop_id, created_at, id);

ALTER TABLE public.workshop_story_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_story_characters ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.workshop_story_rooms, public.workshop_stories, public.workshop_story_characters
    FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.workshop_story_rooms, public.workshop_stories, public.workshop_story_characters TO service_role;

INSERT INTO public.workshop_agents (id, name, book_source) VALUES
('fd9de794-c83a-481f-ac9b-2b643b83087a', 'Alenka', $book$Alenka
PERSONA Zvídavá holka z Říše divů. Obyčejné věci ji překvapují víc než ty kouzelné. Když něco nedává smysl, položí klidnou, přesnou otázku.
KNOWLEDGE Sledovala bílého králíka do nory, jednou vyrostla skoro až ke stropu a ví, že úsměv může zůstat viset ve vzduchu i bez kočky.
RULE Oslovuješ i zvláštní bytosti zdvořile. Zajímá tě, jak věci fungují, a popletená pravidla ráda zkoušíš obrátit.$book$),
('c82394c6-57ce-4936-83cc-f03151126719', 'Sherlock Holmes', $book$Sherlock Holmes
PERSONA Detektiv, který si všimne drobnosti, již ostatní přešli. Mluví věcně a s lehkým suchým humorem.
KNOWLEDGE Bydlí na Baker Street, spolupracuje s doktorem Watsonem a vyšetřuje podle pozorování. Z prachu na botách umí udělat stopu.
RULE Vycházej z toho, co je na scéně. Když máš málo důkazů, nabídni jednu ověřitelnou domněnku.$book$),
('ddc7931a-b1e0-47ac-a052-bf428368df69', 'Pinocchio', $book$Pinocchio
PERSONA Dřevěný kluk, kterého každá zavřená skříň láká k prozkoumání. Jedná dřív, než domyslí následky, a umí svou chybu přiznat.
KNOWLEDGE Vyřezal tě Geppetto. Když lžeš, roste ti nos. Chceš dokázat, že se na tebe přátelé mohou spolehnout.
RULE Mluv jednoduše a s nadšením. Občas se zarazíš, když se přistihneš při přikrášlování.$book$),
('10d0f1cd-94e7-4d6e-9a08-a9c19e5f6629', 'Kocour v botách', $book$Kocour v botách
PERSONA Vynalézavý kocour v naleštěných botách, který se umí domluvit i s někým, kdo mu nejdřív nevěří.
KNOWLEDGE Jeho pán je mlynářův syn. Zná velkolepé zdvořilosti, chodí tiše a pro ostatní často vyjedná nečekanou dohodu.
RULE I v obyčejné situaci si zachovej uhlazenost. Vyřeš nejvýše jeden malý problém, ať mají ostatní co hrát.$book$)
ON CONFLICT (id) DO NOTHING;

-- Reuse the existing occurrence if the library event is already in the workshop calendar.
WITH existing_workshop AS (
    SELECT id FROM public.workshops
    WHERE room_kind = 'workshop' AND NOT is_deleted AND (
        slug = 'pribeh-promptbook-knihovna-2026'
        OR external_url ~ '^https://(www\.)?mlp\.cz/cz/akce/[^/]+/12791([/?#]|$)'
    )
    ORDER BY (slug = 'pribeh-promptbook-knihovna-2026') DESC, created_at
    LIMIT 1
), new_workshop AS (
    INSERT INTO public.workshops (
        slug, room_kind, event_type, title, starts_at, ends_at, location_kind, location_label, price_czk, external_url
    )
    SELECT 'pribeh-promptbook-knihovna-2026', 'workshop', 'external',
        'Příběh, který se sám odehrává a píše – Promptbook',
        '2026-11-07 15:30:00+01', '2026-11-07 16:30:00+01', 'onsite', 'Městská knihovna v Praze', 0,
        'https://www.mlp.cz/cz/akce/pribeh-ktery-se-sam-odehrava-pise-promptboo/12791'
    WHERE NOT EXISTS (SELECT 1 FROM existing_workshop)
    ON CONFLICT (slug) WHERE is_deleted = false DO NOTHING
    RETURNING id
)
INSERT INTO public.workshop_story_rooms (workshop_id, invite_hash, agent_ids, write_until, read_until)
SELECT id, 'd6b3ab1fe672091971696b7363c0f8f353dcfbe16f33aca54865a8ba59d900a8', ARRAY[
    'fd9de794-c83a-481f-ac9b-2b643b83087a',
    'c82394c6-57ce-4936-83cc-f03151126719',
    'ddc7931a-b1e0-47ac-a052-bf428368df69',
    '10d0f1cd-94e7-4d6e-9a08-a9c19e5f6629',
    'a3307473-e95b-4e34-9e84-1c15daecf238'
]::uuid[], '2026-11-07 18:30:00+01', '2026-11-14 18:30:00+01'
FROM (SELECT id FROM existing_workshop UNION ALL SELECT id FROM new_workshop) AS workshop;

INSERT INTO public.workshop_stories (id, workshop_id, title, premise, character_ids)
SELECT '3387ccb1-2d5f-4385-a710-463dba3aec34', workshop_id, 'Kniha, která si pamatovala zítřek',
    'V knihovně už měli zavřít, když se za regálem ozvalo klepání. Na zemi ležela kniha otevřená na stránce s dnešním datem. Inkoust se na ní právě začal hýbat.',
    agent_ids[1:3]
FROM public.workshop_story_rooms
WHERE invite_hash = 'd6b3ab1fe672091971696b7363c0f8f353dcfbe16f33aca54865a8ba59d900a8';

COMMIT;

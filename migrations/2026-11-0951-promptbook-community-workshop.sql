BEGIN;

-- Publish the term and its waiting room. The host adds the live stream in workshop administration.
INSERT INTO public.workshops (
    id, slug, room_kind, event_type, title, description,
    starts_at, ends_at, location_kind, price_czk, is_published, community_slugs
)
VALUES (
    '4c858f5e-1d24-4574-81b5-ac55f1649ae6',
    'promptbook-e-mailova-automatizace-2026-11-13',
    'workshop',
    'online-workshop',
    'Jak automatizovat e-maily a navazující práci',
    $description$Na bezplatném online workshopu s Pavolem Hejným postavíme v Promptbooku agendu, která zpracuje příchozí e-mail a posune práci dál.

- Roztřídíme zprávy a dohledáme kontext ve vlákně nebo v evidenci kontaktů.
- Připravíme odpověď a podle obsahu založíme úkol, aktualizujeme záznam nebo předáme požadavek kolegovi.
- Nastavíme pravidla pro kroky, které mohou proběhnout samy, a pro ty, které čekají na schválení.

Budeme pracovat s ukázkovými e-maily. Pokud máte vlastní scénář, přineste anonymizovaný příklad.$description$,
    '2026-11-13T13:00:00+01:00',
    '2026-11-13T14:00:00+01:00',
    'online',
    0,
    true,
    ARRAY['promptbook']::text[]
)
ON CONFLICT DO NOTHING;

-- These are messages from the organizing team, stored as admin-authored comments without a participant or votes.
INSERT INTO public.workshop_comments (
    id, workshop_id, author_name, body, status, is_artificial, origin, moderated_at, created_at
)
SELECT seed.id, room.id, 'Tým Promptbooku', seed.body, 'approved', true, 'artificial', now(), seed.created_at
FROM public.workshops AS room
CROSS JOIN (VALUES
    (
        '102ed4ef-4f1b-4cb8-b61b-845dd7b369fb'::uuid,
        'Vítejte v komunitě Promptbook. Najdete tu praktické návody, workshopy a diskuzi k tomu, co svěřit agentům a jak si nastavit pravidla. Napište, na čem pracujete a kde vám automatizace může uvolnit ruce.',
        now()
    ),
    (
        '3e879e38-9c0c-4d4e-866c-32932bac9f51'::uuid,
        'Co by se u vás mělo stát po přečtení e-mailu? Založit úkol, dohledat kontakt, nebo třeba připomenout odpověď? Napište sem jeden příklad bez osobních údajů. V pátek si právě takové scénáře ukážeme na workshopu.',
        now() - interval '1 second'
    )
) AS seed(id, body, created_at)
WHERE room.slug = 'komunita-promptbook'
    AND room.room_kind = 'community'
    AND NOT room.is_deleted
ON CONFLICT (id) DO NOTHING;

COMMIT;

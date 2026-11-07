BEGIN;

ALTER TABLE public.workshop_story_rooms
    ALTER COLUMN invite_hash DROP NOT NULL,
    ALTER COLUMN agent_ids SET DEFAULT ARRAY['a3307473-e95b-4e34-9e84-1c15daecf238']::uuid[],
    ADD COLUMN book_overrides jsonb NOT NULL DEFAULT '{}';

ALTER TABLE public.workshop_story_characters
    ALTER COLUMN owner_hash DROP NOT NULL,
    ADD COLUMN pending_id uuid,
    ADD COLUMN pending_until timestamptz,
    ADD CONSTRAINT workshop_story_character_lease CHECK ((pending_id IS NULL) = (pending_until IS NULL));

CREATE TABLE public.workshop_story_audio (
    workshop_id uuid NOT NULL REFERENCES public.workshop_story_rooms(workshop_id) ON DELETE CASCADE,
    cache_key text NOT NULL,
    object_key text,
    timings jsonb,
    lease_id uuid,
    lease_until timestamptz,
    attempts integer NOT NULL DEFAULT 0,
    last_attempt_at timestamptz,
    PRIMARY KEY (workshop_id, cache_key),
    CHECK ((lease_id IS NULL) = (lease_until IS NULL))
);

ALTER TABLE public.workshop_story_audio ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.workshop_story_audio FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.workshop_story_audio TO service_role;

-- Update only the exact occurrence to which the original story installation was attached.
UPDATE public.workshops AS w
SET event_type = 'story',
    is_published = true,
    title = 'Dny AI v knihovně',
    location_kind = 'onsite',
    location_label = 'Ústřední knihovna, Mariánské náměstí, Praha',
    description = 'Příběh, který se sám odehrává a píše. Společně vymyslíme postavy a rozehrajeme pohádku.'
FROM public.workshop_story_rooms AS r
WHERE r.workshop_id = w.id AND w.room_kind = 'workshop' AND NOT w.is_deleted
    AND r.invite_hash = 'd6b3ab1fe672091971696b7363c0f8f353dcfbe16f33aca54865a8ba59d900a8';

COMMIT;

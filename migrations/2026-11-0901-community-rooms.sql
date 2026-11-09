BEGIN;

DROP INDEX public.workshops_one_community_idx;

ALTER TABLE public.workshops
    DROP CONSTRAINT workshops_community_slug,
    ADD CONSTRAINT workshops_community_slug CHECK (
        (room_kind = 'community') = (slug IN ('komunita', 'komunita-promptbook'))
    );

-- Keep the Developers room ID and slug so its participants, sessions, projects and polls stay attached.
UPDATE public.workshops
SET title = 'Vývojáři'
WHERE room_kind = 'community' AND slug = 'komunita';

INSERT INTO public.workshops (slug, room_kind, title, description, starts_at, is_published)
VALUES (
    'komunita-promptbook', 'community', 'Promptbook',
    'Práce s agenty Promptbooku, automatizace a praktické workshopy.',
    '2026-11-09T00:00:00+00:00', true
);

CREATE INDEX workshop_participants_room_normalized_email_idx
    ON public.workshop_participants (workshop_id, lower(btrim(email)));

CREATE FUNCTION public.get_community_participations_by_email(participant_emails text[])
RETURNS TABLE (email text, room_slug text)
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT DISTINCT lower(btrim(participant.email)), room.slug
    FROM public.workshops AS room
    JOIN public.workshop_participants AS participant ON participant.workshop_id = room.id
    WHERE room.room_kind = 'community'
      AND NOT room.is_deleted
      AND lower(btrim(participant.email)) = ANY(participant_emails);
$$;

REVOKE ALL ON FUNCTION public.get_community_participations_by_email(text[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_community_participations_by_email(text[]) TO service_role;

COMMIT;

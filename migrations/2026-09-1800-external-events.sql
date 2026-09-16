-- A term of an event which somebody else holds carries the address it is held at.
--
-- The lecturers of the community speak at conferences and workshops of other
-- organizers. Such a term is listed like every other term, but it leads to the
-- page of its organizer instead of to a room or a landing page of this
-- application, so it needs the one thing an internally held term never has: its
-- own public address.
--
-- The address is deliberately only checked for being a public web address rather
-- than against the kind of event carrying it. Which kinds of event are held
-- elsewhere stays described in the event registry of the application, exactly as
-- the kinds of event themselves already are.

BEGIN;

ALTER TABLE public.workshops
    ADD COLUMN IF NOT EXISTS external_url text;

ALTER TABLE public.workshops
    DROP CONSTRAINT IF EXISTS workshops_external_url;
ALTER TABLE public.workshops
    ADD CONSTRAINT workshops_external_url CHECK (
        external_url IS NULL OR external_url ~* '^https?://'
    );

-- A permanent room is no event, so it has no address of an event either.
ALTER TABLE public.workshops
    DROP CONSTRAINT IF EXISTS workshops_event_fields;
ALTER TABLE public.workshops
    ADD CONSTRAINT workshops_event_fields CHECK (
        (room_kind = 'workshop') = (event_type IS NOT NULL)
        AND (event_type IS NULL) = (location_kind IS NULL)
        AND (event_type IS NULL) = (price_czk IS NULL)
        AND (event_type IS NOT NULL OR char_length(location_label) = 0)
        AND (event_type IS NOT NULL OR maximum_participant_count IS NULL)
        AND (event_type IS NOT NULL OR external_url IS NULL)
    );

COMMIT;

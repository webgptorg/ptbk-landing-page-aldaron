--
-- A duplicated workshop gets fresh copies of the community polls which were about the source occurrence. The source
-- polls remain shared with their existing occurrences, while real votes stay isolated from the new occurrence.

BEGIN;

CREATE OR REPLACE FUNCTION public.duplicate_workshop_attached_polls(
    source_workshop_id uuid,
    target_workshop_id uuid
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    source_workshop_kind text;
    target_workshop_kind text;
    source_poll record;
    duplicated_poll_id uuid;
BEGIN
    SELECT workshop.room_kind
    INTO source_workshop_kind
    FROM public.workshops AS workshop
    WHERE workshop.id = source_workshop_id;

    SELECT workshop.room_kind
    INTO target_workshop_kind
    FROM public.workshops AS workshop
    WHERE workshop.id = target_workshop_id;

    IF source_workshop_id = target_workshop_id
       OR source_workshop_kind IS DISTINCT FROM 'workshop'
       OR target_workshop_kind IS DISTINCT FROM 'workshop' THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_DUPLICATE_POLL_WORKSHOP_INVALID';
    END IF;

    FOR source_poll IN
        SELECT
            poll.id,
            poll.workshop_id,
            poll.question,
            poll.is_closed,
            poll.is_visible
        FROM public.workshop_polls AS poll
        INNER JOIN public.workshop_poll_workshops AS attachment
            ON attachment.poll_id = poll.id
        WHERE attachment.workshop_id = source_workshop_id
        ORDER BY poll.created_at ASC, poll.id ASC
    LOOP
        INSERT INTO public.workshop_polls (
            workshop_id,
            question,
            is_closed,
            is_visible
        )
        VALUES (
            source_poll.workshop_id,
            source_poll.question,
            source_poll.is_closed,
            source_poll.is_visible
        )
        RETURNING id INTO duplicated_poll_id;

        INSERT INTO public.workshop_poll_options (
            poll_id,
            label,
            sort_order,
            artificial_vote_count
        )
        SELECT
            duplicated_poll_id,
            poll_option.label,
            poll_option.sort_order,
            poll_option.artificial_vote_count
        FROM public.workshop_poll_options AS poll_option
        WHERE poll_option.poll_id = source_poll.id
        ORDER BY poll_option.sort_order ASC;

        INSERT INTO public.workshop_poll_workshops (poll_id, workshop_id)
        VALUES (duplicated_poll_id, target_workshop_id);
    END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.duplicate_workshop_attached_polls(uuid, uuid)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.duplicate_workshop_attached_polls(uuid, uuid)
    TO service_role;

COMMIT;

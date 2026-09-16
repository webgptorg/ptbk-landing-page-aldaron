-- Member-written answers in community polls.
--
-- An enabled other-answer field adds one ordinary poll option, then records the writer's vote for that same option in
-- one transaction. The answer remains anonymous: only its text is public, while the existing e-mail-owned vote table
-- remains the sole private attribution. Because a poll can also be read from an attached workshop, this one storage
-- and procedure keep every room on the same choices and aggregate.

BEGIN;

ALTER TABLE public.workshop_polls
    ADD COLUMN IF NOT EXISTS is_other_option_enabled boolean NOT NULL DEFAULT false;

ALTER TABLE public.workshop_poll_options
    ADD COLUMN IF NOT EXISTS is_created_by_participant boolean NOT NULL DEFAULT false;

-- The prepared choices remain a small editable list. Member-written choices have their own generous bound so one
-- poll still has a bounded response suitable for every room which loads it.
DROP FUNCTION IF EXISTS public.create_community_workshop_poll(uuid, text, text[], boolean, boolean, uuid[]);

CREATE FUNCTION public.create_community_workshop_poll(
    target_workshop_id uuid,
    target_question text,
    target_options text[],
    target_is_closed boolean,
    target_is_visible boolean,
    target_is_other_option_enabled boolean,
    target_attached_workshop_ids uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    created_poll_id uuid;
BEGIN
    IF target_question IS NULL OR char_length(btrim(target_question)) NOT BETWEEN 1 AND 500 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_QUESTION_INVALID';
    END IF;

    IF target_options IS NULL OR cardinality(target_options) NOT BETWEEN 2 AND 8 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_OPTIONS_INVALID';
    END IF;

    IF target_is_closed IS NULL
        OR target_is_visible IS NULL
        OR target_is_other_option_enabled IS NULL THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_SETTINGS_INVALID';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM unnest(target_options) AS poll_option(label)
        WHERE poll_option.label IS NULL OR char_length(btrim(poll_option.label)) NOT BETWEEN 1 AND 200
    ) OR EXISTS (
        SELECT 1
        FROM unnest(target_options) AS poll_option(label)
        GROUP BY lower(btrim(poll_option.label))
        HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_OPTIONS_INVALID';
    END IF;

    INSERT INTO public.workshop_polls (
        workshop_id,
        question,
        is_closed,
        is_visible,
        is_other_option_enabled
    )
    VALUES (
        target_workshop_id,
        btrim(target_question),
        target_is_closed,
        target_is_visible,
        target_is_other_option_enabled
    )
    RETURNING id INTO created_poll_id;

    INSERT INTO public.workshop_poll_options (poll_id, label, sort_order)
    SELECT
        created_poll_id,
        btrim(poll_option.label),
        (poll_option.position - 1)::integer
    FROM unnest(target_options) WITH ORDINALITY AS poll_option(label, position);

    PERFORM public.write_community_workshop_poll_workshops(created_poll_id, target_attached_workshop_ids);

    RETURN created_poll_id;
END;
$$;

-- Prepared answers are the only answers an administrator can edit. Participant answers deliberately survive an edit,
-- and are returned to the end of the option order after the prepared choices. This prevents an old edit form from
-- deleting an answer a member wrote while it was open.
DROP FUNCTION IF EXISTS public.update_community_workshop_poll(uuid, uuid, text, jsonb, boolean, boolean, uuid[]);

CREATE FUNCTION public.update_community_workshop_poll(
    target_workshop_id uuid,
    target_poll_id uuid,
    target_question text,
    target_options jsonb,
    target_is_closed boolean,
    target_is_visible boolean,
    target_is_other_option_enabled boolean,
    target_attached_workshop_ids uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    locked_poll_id uuid;
BEGIN
    IF target_question IS NULL OR char_length(btrim(target_question)) NOT BETWEEN 1 AND 500 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_QUESTION_INVALID';
    END IF;

    IF target_options IS NULL
        OR jsonb_typeof(target_options) <> 'array'
        OR jsonb_array_length(target_options) NOT BETWEEN 2 AND 8 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_OPTIONS_INVALID';
    END IF;

    IF target_is_closed IS NULL
        OR target_is_visible IS NULL
        OR target_is_other_option_enabled IS NULL THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_SETTINGS_INVALID';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM jsonb_array_elements(target_options) AS target_option(value)
        WHERE jsonb_typeof(target_option.value) <> 'object'
           OR NOT (target_option.value ? 'label')
           OR jsonb_typeof(target_option.value -> 'label') <> 'string'
           OR char_length(btrim(target_option.value ->> 'label')) NOT BETWEEN 1 AND 200
           OR (
               target_option.value ? 'id'
               AND (
                   jsonb_typeof(target_option.value -> 'id') <> 'string'
                   OR (target_option.value ->> 'id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
               )
           )
    ) THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_OPTIONS_INVALID';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM jsonb_array_elements(target_options) AS target_option(value)
        GROUP BY lower(btrim(target_option.value ->> 'label'))
        HAVING count(*) > 1
    ) OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements(target_options) AS target_option(value)
        WHERE target_option.value ? 'id'
        GROUP BY target_option.value ->> 'id'
        HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_OPTIONS_INVALID';
    END IF;

    SELECT poll.id
    INTO locked_poll_id
    FROM public.workshop_polls AS poll
    INNER JOIN public.workshops AS workshop
        ON workshop.id = poll.workshop_id
    WHERE poll.id = target_poll_id
      AND poll.workshop_id = target_workshop_id
      AND workshop.room_kind = 'community'
    FOR UPDATE OF poll;

    IF NOT FOUND THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_NOT_FOUND';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM jsonb_array_elements(target_options) AS target_option(value)
        WHERE target_option.value ? 'id'
          AND NOT EXISTS (
              SELECT 1
              FROM public.workshop_poll_options AS existing_option
              WHERE existing_option.id = (target_option.value ->> 'id')::uuid
                AND existing_option.poll_id = locked_poll_id
                AND existing_option.is_created_by_participant = false
          )
    ) THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_OPTION_INVALID';
    END IF;

    -- The editor only sees prepared options, but its labels still have to remain distinct from every answer members
    -- already wrote. The lock above closes the race with a new other answer while this comparison is made.
    IF EXISTS (
        SELECT 1
        FROM jsonb_array_elements(target_options) AS target_option(value)
        INNER JOIN public.workshop_poll_options AS participant_option
            ON participant_option.poll_id = locked_poll_id
           AND participant_option.is_created_by_participant
        WHERE lower(btrim(target_option.value ->> 'label')) = lower(btrim(participant_option.label))
    ) THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_OPTIONS_INVALID';
    END IF;

    UPDATE public.workshop_polls
    SET
        question = btrim(target_question),
        is_closed = target_is_closed,
        is_visible = target_is_visible,
        is_other_option_enabled = target_is_other_option_enabled
    WHERE id = locked_poll_id;

    -- Move all positions out of the prepared range before reassigning the prepared answers. There can be at most 208
    -- rows here (eight prepared and 200 participant-created), so this fixed safe offset cannot collide.
    UPDATE public.workshop_poll_options
    SET sort_order = sort_order + 1000
    WHERE poll_id = locked_poll_id;

    DELETE FROM public.workshop_poll_options AS existing_option
    WHERE existing_option.poll_id = locked_poll_id
      AND existing_option.is_created_by_participant = false
      AND NOT EXISTS (
          SELECT 1
          FROM jsonb_array_elements(target_options) AS target_option(value)
          WHERE target_option.value ? 'id'
            AND (target_option.value ->> 'id')::uuid = existing_option.id
      );

    UPDATE public.workshop_poll_options AS existing_option
    SET
        label = btrim(target_option.value ->> 'label'),
        sort_order = (target_option.position - 1)::integer
    FROM jsonb_array_elements(target_options) WITH ORDINALITY AS target_option(value, position)
    WHERE target_option.value ? 'id'
      AND existing_option.poll_id = locked_poll_id
      AND existing_option.is_created_by_participant = false
      AND existing_option.id = (target_option.value ->> 'id')::uuid;

    INSERT INTO public.workshop_poll_options (poll_id, label, sort_order)
    SELECT
        locked_poll_id,
        btrim(target_option.value ->> 'label'),
        (target_option.position - 1)::integer
    FROM jsonb_array_elements(target_options) WITH ORDINALITY AS target_option(value, position)
    WHERE NOT (target_option.value ? 'id');

    WITH participant_options AS (
        SELECT
            poll_option.id,
            row_number() OVER (ORDER BY poll_option.sort_order ASC, poll_option.created_at ASC, poll_option.id ASC) AS position
        FROM public.workshop_poll_options AS poll_option
        WHERE poll_option.poll_id = locked_poll_id
          AND poll_option.is_created_by_participant
    )
    UPDATE public.workshop_poll_options AS poll_option
    SET sort_order = (jsonb_array_length(target_options) + participant_options.position - 1)::integer
    FROM participant_options
    WHERE poll_option.id = participant_options.id;

    PERFORM public.write_community_workshop_poll_workshops(locked_poll_id, target_attached_workshop_ids);

    RETURN locked_poll_id;
END;
$$;

-- A write of a member-provided option shares the normal vote procedure rather than adding a second action type. The
-- poll row lock serializes it with all administrative edits and with another member writing the same answer, so it
-- can reuse a matching answer or append exactly one new option before the vote is upserted.
DROP FUNCTION IF EXISTS public.set_community_workshop_poll_vote(uuid, uuid, uuid, uuid, text);

CREATE FUNCTION public.set_community_workshop_poll_vote(
    target_room_id uuid,
    target_poll_id uuid,
    target_option_id uuid,
    target_other_option_label text,
    target_participant_id uuid,
    target_voter_email text
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    poll_owner_workshop_id uuid;
    poll_is_closed boolean;
    poll_is_visible boolean;
    poll_is_other_option_enabled boolean;
    normalized_voter_email text;
    normalized_other_option_label text;
    selected_option_id uuid;
    participant_created_option_count integer;
    next_sort_order integer;
    MAXIMAL_PARTICIPANT_CREATED_OPTION_COUNT constant integer := 200;
BEGIN
    IF (target_option_id IS NULL) = (target_other_option_label IS NULL) THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_VOTE_INVALID';
    END IF;

    normalized_voter_email := lower(btrim(target_voter_email));
    IF normalized_voter_email IS NULL OR char_length(normalized_voter_email) NOT BETWEEN 3 AND 320 THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_VOTER_EMAIL_INVALID';
    END IF;

    IF target_other_option_label IS NOT NULL THEN
        normalized_other_option_label := btrim(target_other_option_label);
        IF normalized_other_option_label IS NULL
            OR char_length(normalized_other_option_label) NOT BETWEEN 1 AND 200 THEN
            RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_OTHER_OPTION_INVALID';
        END IF;
    END IF;

    SELECT
        poll.workshop_id,
        poll.is_closed,
        poll.is_visible,
        poll.is_other_option_enabled
    INTO
        poll_owner_workshop_id,
        poll_is_closed,
        poll_is_visible,
        poll_is_other_option_enabled
    FROM public.workshop_polls AS poll
    WHERE poll.id = target_poll_id
    FOR UPDATE;

    IF NOT FOUND OR NOT poll_is_visible THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_NOT_VISIBLE';
    END IF;
    IF poll_is_closed THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_CLOSED';
    END IF;
    IF target_other_option_label IS NOT NULL AND NOT poll_is_other_option_enabled THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_OTHER_OPTION_DISABLED';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.workshop_participants AS participant
        WHERE participant.id = target_participant_id
          AND participant.workshop_id = target_room_id
          AND lower(btrim(participant.email)) = normalized_voter_email
    ) THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_PARTICIPANT_INVALID';
    END IF;

    IF poll_owner_workshop_id <> target_room_id
       AND NOT EXISTS (
           SELECT 1
           FROM public.workshop_poll_workshops AS attachment
           WHERE attachment.poll_id = target_poll_id
             AND attachment.workshop_id = target_room_id
       ) THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_NOT_ATTACHED';
    END IF;

    IF target_option_id IS NULL THEN
        SELECT poll_option.id
        INTO selected_option_id
        FROM public.workshop_poll_options AS poll_option
        WHERE poll_option.poll_id = target_poll_id
          AND lower(btrim(poll_option.label)) = lower(normalized_other_option_label)
        ORDER BY poll_option.is_created_by_participant ASC, poll_option.sort_order ASC
        LIMIT 1;

        IF NOT FOUND THEN
            SELECT count(*)::integer
            INTO participant_created_option_count
            FROM public.workshop_poll_options AS poll_option
            WHERE poll_option.poll_id = target_poll_id
              AND poll_option.is_created_by_participant;

            IF participant_created_option_count >= MAXIMAL_PARTICIPANT_CREATED_OPTION_COUNT THEN
                RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_OTHER_OPTION_LIMIT_REACHED';
            END IF;

            SELECT coalesce(max(poll_option.sort_order), -1) + 1
            INTO next_sort_order
            FROM public.workshop_poll_options AS poll_option
            WHERE poll_option.poll_id = target_poll_id;

            INSERT INTO public.workshop_poll_options (
                poll_id,
                label,
                sort_order,
                is_created_by_participant
            )
            VALUES (
                target_poll_id,
                normalized_other_option_label,
                next_sort_order,
                true
            )
            RETURNING id INTO selected_option_id;
        END IF;
    ELSE
        selected_option_id := target_option_id;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.workshop_poll_options AS poll_option
        WHERE poll_option.id = selected_option_id
          AND poll_option.poll_id = target_poll_id
    ) THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_OPTION_NOT_FOUND';
    END IF;

    INSERT INTO public.workshop_poll_votes (
        workshop_id,
        poll_id,
        option_id,
        participant_id,
        voter_email
    )
    VALUES (
        poll_owner_workshop_id,
        target_poll_id,
        selected_option_id,
        target_participant_id,
        normalized_voter_email
    )
    ON CONFLICT (poll_id, voter_email) DO UPDATE
    SET
        option_id = EXCLUDED.option_id,
        participant_id = EXCLUDED.participant_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_community_workshop_poll(uuid, text, text[], boolean, boolean, boolean, uuid[])
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_community_workshop_poll(uuid, uuid, text, jsonb, boolean, boolean, boolean, uuid[])
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_community_workshop_poll_vote(uuid, uuid, uuid, text, uuid, text)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_community_workshop_poll(uuid, text, text[], boolean, boolean, boolean, uuid[])
    TO service_role;
GRANT EXECUTE ON FUNCTION public.update_community_workshop_poll(uuid, uuid, text, jsonb, boolean, boolean, boolean, uuid[])
    TO service_role;
GRANT EXECUTE ON FUNCTION public.set_community_workshop_poll_vote(uuid, uuid, uuid, text, uuid, text)
    TO service_role;

COMMIT;

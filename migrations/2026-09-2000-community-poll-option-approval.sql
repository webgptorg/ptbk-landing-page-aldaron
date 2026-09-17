-- Member-written poll answers wait for the very same moderation a chat message waits for.
--
-- An answer somebody writes through the other-answer field is now a submission with a lifecycle instead of an
-- immediately public choice: it is pending until a moderator decides about it, while a trusted member and a moderator
-- have theirs approved as they write it. The vote of the writer is recorded at once either way, so their decision is
-- never lost while their answer waits, and nobody else receives the answer or its vote until it is approved.
--
-- The answer also carries who wrote it. A poll belongs to the community, but it can be answered from any workshop
-- occurrence attached to it, so the durable identity is the normalized e-mail which already owns the vote; the
-- room-local participant and the name they connected with travel with it as the context an administrator reads.

BEGIN;

ALTER TABLE public.workshop_poll_options
    ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved';
ALTER TABLE public.workshop_poll_options
    ADD COLUMN IF NOT EXISTS author_participant_id uuid;
ALTER TABLE public.workshop_poll_options
    ADD COLUMN IF NOT EXISTS author_name text;
ALTER TABLE public.workshop_poll_options
    ADD COLUMN IF NOT EXISTS author_email text;

-- The answer outlives the room session which wrote it, exactly as the vote it was written together with does.
ALTER TABLE public.workshop_poll_options
    DROP CONSTRAINT IF EXISTS workshop_poll_options_author_participant_fk;
ALTER TABLE public.workshop_poll_options
    ADD CONSTRAINT workshop_poll_options_author_participant_fk FOREIGN KEY (author_participant_id)
        REFERENCES public.workshop_participants(id) ON DELETE SET NULL;

-- An answer written before this migration was public the moment it was written, so it stays approved. Its writer is
-- recovered from the first vote it ever received, which is the vote the writing itself cast.
UPDATE public.workshop_poll_options AS poll_option
SET
    author_email = earliest_vote.voter_email,
    author_participant_id = earliest_vote.participant_id,
    author_name = earliest_vote.fullname
FROM (
    SELECT DISTINCT ON (poll_vote.option_id)
        poll_vote.option_id,
        poll_vote.voter_email,
        poll_vote.participant_id,
        participant.fullname
    FROM public.workshop_poll_votes AS poll_vote
    LEFT JOIN public.workshop_participants AS participant
        ON participant.id = poll_vote.participant_id
    ORDER BY poll_vote.option_id, poll_vote.created_at ASC, poll_vote.id ASC
) AS earliest_vote
WHERE poll_option.id = earliest_vote.option_id
  AND poll_option.is_created_by_participant
  AND poll_option.author_email IS NULL;

ALTER TABLE public.workshop_poll_options
    DROP CONSTRAINT IF EXISTS workshop_poll_options_status_valid;
ALTER TABLE public.workshop_poll_options
    ADD CONSTRAINT workshop_poll_options_status_valid CHECK (status IN ('pending', 'approved', 'rejected'));

-- Only a member-written answer can wait for a decision or name a writer. A prepared choice of the administration is
-- the poll itself speaking, so it is always public and never attributed. A member-written answer whose writer can no
-- longer be recovered is deliberately still allowed, because an answer of the past must not be lost to a rule added
-- after it was written.
ALTER TABLE public.workshop_poll_options
    DROP CONSTRAINT IF EXISTS workshop_poll_options_prepared_is_unattributed;
ALTER TABLE public.workshop_poll_options
    ADD CONSTRAINT workshop_poll_options_prepared_is_unattributed CHECK (
        is_created_by_participant
        OR (
            status = 'approved'
            AND author_participant_id IS NULL
            AND author_name IS NULL
            AND author_email IS NULL
        )
    );

ALTER TABLE public.workshop_poll_options
    DROP CONSTRAINT IF EXISTS workshop_poll_options_author_email_normalized;
ALTER TABLE public.workshop_poll_options
    ADD CONSTRAINT workshop_poll_options_author_email_normalized CHECK (
        author_email IS NULL
        OR (char_length(author_email) BETWEEN 3 AND 320 AND author_email = lower(btrim(author_email)))
    );

ALTER TABLE public.workshop_poll_options
    DROP CONSTRAINT IF EXISTS workshop_poll_options_author_name_length;
ALTER TABLE public.workshop_poll_options
    ADD CONSTRAINT workshop_poll_options_author_name_length CHECK (
        author_name IS NULL OR char_length(author_name) BETWEEN 1 AND 200
    );

CREATE INDEX IF NOT EXISTS workshop_poll_options_status_idx
    ON public.workshop_poll_options (poll_id, status);

-- Writing an answer and voting for it stay one transaction, and the decision about who may already read that answer
-- is made here as well. A matching answer is only ever reused when the person writing it may see it, so a waiting
-- answer of somebody else can neither be discovered by guessing its text nor silently swallow another member's vote.
DROP FUNCTION IF EXISTS public.set_community_workshop_poll_vote(uuid, uuid, uuid, text, uuid, text);

CREATE FUNCTION public.set_community_workshop_poll_vote(
    target_room_id uuid,
    target_poll_id uuid,
    target_option_id uuid,
    target_other_option_label text,
    target_other_option_status text,
    target_participant_id uuid,
    target_voter_name text,
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
    normalized_voter_name text;
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
    normalized_voter_name := nullif(btrim(coalesce(target_voter_name, '')), '');

    IF target_other_option_label IS NOT NULL THEN
        normalized_other_option_label := btrim(target_other_option_label);
        IF normalized_other_option_label IS NULL
            OR char_length(normalized_other_option_label) NOT BETWEEN 1 AND 200 THEN
            RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_OTHER_OPTION_INVALID';
        END IF;

        -- A written answer either waits for a moderator or is public at once. Nothing else may be written, so a
        -- forged request cannot smuggle an already rejected answer into the poll.
        IF target_other_option_status IS NULL OR target_other_option_status NOT IN ('pending', 'approved') THEN
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
          AND (
              poll_option.status = 'approved'
              OR (poll_option.status = 'pending' AND poll_option.author_email = normalized_voter_email)
          )
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
                is_created_by_participant,
                status,
                author_participant_id,
                author_name,
                author_email
            )
            VALUES (
                target_poll_id,
                normalized_other_option_label,
                next_sort_order,
                true,
                target_other_option_status,
                target_participant_id,
                normalized_voter_name,
                normalized_voter_email
            )
            RETURNING id INTO selected_option_id;
        END IF;
    ELSE
        selected_option_id := target_option_id;
    END IF;

    -- An answer nobody may see is no answer at all here either, so a stale or forged identifier cannot vote for a
    -- rejected answer or for one still waiting for somebody else's moderation.
    IF NOT EXISTS (
        SELECT 1
        FROM public.workshop_poll_options AS poll_option
        WHERE poll_option.id = selected_option_id
          AND poll_option.poll_id = target_poll_id
          AND (
              poll_option.status = 'approved'
              OR (poll_option.status = 'pending' AND poll_option.author_email = normalized_voter_email)
          )
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

-- The prepared-answer editor keeps its rule that a prepared choice may not repeat an answer a member wrote, but a
-- rejected answer is no longer in the poll at all, so it can no longer silently refuse an administrator's wording.
DROP FUNCTION IF EXISTS public.update_community_workshop_poll(uuid, uuid, text, jsonb, boolean, boolean, boolean, uuid[]);

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
    -- already wrote and the poll still shows. The lock above closes the race with a new other answer while this
    -- comparison is made.
    IF EXISTS (
        SELECT 1
        FROM jsonb_array_elements(target_options) AS target_option(value)
        INNER JOIN public.workshop_poll_options AS participant_option
            ON participant_option.poll_id = locked_poll_id
           AND participant_option.is_created_by_participant
           AND participant_option.status <> 'rejected'
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

-- Deciding about one member-written answer and correcting its wording are one moderation, exactly as approving a chat
-- message and fixing its text are. A prepared choice of the administration is deliberately out of reach here: it is
-- edited as part of its poll, so a question and its prepared answers keep changing in one transaction.
CREATE OR REPLACE FUNCTION public.moderate_community_workshop_poll_option(
    target_workshop_id uuid,
    target_poll_id uuid,
    target_option_id uuid,
    target_status text,
    target_label text
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    locked_option_id uuid;
    normalized_label text;
BEGIN
    IF target_status IS NULL AND target_label IS NULL THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_OPTION_INVALID';
    END IF;

    IF target_status IS NOT NULL AND target_status NOT IN ('approved', 'rejected') THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_OPTION_INVALID';
    END IF;

    IF target_label IS NOT NULL THEN
        normalized_label := btrim(target_label);
        IF char_length(normalized_label) NOT BETWEEN 1 AND 200 THEN
            RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_OPTION_INVALID';
        END IF;
    END IF;

    SELECT poll_option.id
    INTO locked_option_id
    FROM public.workshop_poll_options AS poll_option
    INNER JOIN public.workshop_polls AS poll
        ON poll.id = poll_option.poll_id
    INNER JOIN public.workshops AS workshop
        ON workshop.id = poll.workshop_id
    WHERE poll_option.id = target_option_id
      AND poll_option.poll_id = target_poll_id
      AND poll.workshop_id = target_workshop_id
      AND workshop.room_kind = 'community'
      AND poll_option.is_created_by_participant
    FOR UPDATE OF poll_option;

    IF NOT FOUND THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_OPTION_NOT_FOUND';
    END IF;

    -- A corrected answer stays as distinct from the other answers of its poll as a prepared one has to be. A rejected
    -- answer is no longer shown anywhere, so it never blocks the wording of the answer which replaces it.
    IF normalized_label IS NOT NULL AND EXISTS (
        SELECT 1
        FROM public.workshop_poll_options AS other_option
        WHERE other_option.poll_id = target_poll_id
          AND other_option.id <> locked_option_id
          AND other_option.status <> 'rejected'
          AND lower(btrim(other_option.label)) = lower(normalized_label)
    ) THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'WORKSHOP_POLL_OPTION_DUPLICATE';
    END IF;

    UPDATE public.workshop_poll_options
    SET
        label = coalesce(normalized_label, label),
        status = coalesce(target_status, status)
    WHERE id = locked_option_id;

    RETURN locked_option_id;
END;
$$;

-- Removing a member-written answer removes the votes cast for it as well, through the foreign key the votes already
-- have. A prepared choice keeps being removed by editing its poll.
CREATE OR REPLACE FUNCTION public.delete_community_workshop_poll_option(
    target_workshop_id uuid,
    target_poll_id uuid,
    target_option_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    deleted_option_id uuid;
BEGIN
    DELETE FROM public.workshop_poll_options AS poll_option
    USING public.workshop_polls AS poll, public.workshops AS workshop
    WHERE poll_option.id = target_option_id
      AND poll_option.poll_id = target_poll_id
      AND poll_option.is_created_by_participant
      AND poll.id = poll_option.poll_id
      AND poll.workshop_id = target_workshop_id
      AND workshop.id = poll.workshop_id
      AND workshop.room_kind = 'community'
    RETURNING poll_option.id INTO deleted_option_id;

    IF deleted_option_id IS NULL THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_OPTION_NOT_FOUND';
    END IF;

    RETURN deleted_option_id;
END;
$$;

REVOKE ALL ON FUNCTION public.set_community_workshop_poll_vote(uuid, uuid, uuid, text, text, uuid, text, text)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_community_workshop_poll(uuid, uuid, text, jsonb, boolean, boolean, boolean, uuid[])
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.moderate_community_workshop_poll_option(uuid, uuid, uuid, text, text)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_community_workshop_poll_option(uuid, uuid, uuid)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_community_workshop_poll_vote(uuid, uuid, uuid, text, text, uuid, text, text)
    TO service_role;
GRANT EXECUTE ON FUNCTION public.update_community_workshop_poll(uuid, uuid, text, jsonb, boolean, boolean, boolean, uuid[])
    TO service_role;
GRANT EXECUTE ON FUNCTION public.moderate_community_workshop_poll_option(uuid, uuid, uuid, text, text)
    TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_community_workshop_poll_option(uuid, uuid, uuid)
    TO service_role;

COMMIT;

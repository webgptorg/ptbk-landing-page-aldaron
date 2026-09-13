-- A duplicated workshop becomes another occurrence of the same community polls as its source. Only the attachment
-- rows are copied: poll, option, and vote identities remain shared everywhere those polls are attached.

BEGIN;

CREATE OR REPLACE FUNCTION public.copy_workshop_poll_attachments(
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
    source_poll_id uuid;
    target_attached_workshop_ids uuid[];
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
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_WORKSHOP_INVALID';
    END IF;

    FOR source_poll_id IN
        SELECT attachment.poll_id
        FROM public.workshop_poll_workshops AS attachment
        WHERE attachment.workshop_id = source_workshop_id
    LOOP
        SELECT array_agg(attachment.workshop_id ORDER BY attachment.workshop_id)
        INTO target_attached_workshop_ids
        FROM public.workshop_poll_workshops AS attachment
        WHERE attachment.poll_id = source_poll_id
          AND attachment.workshop_id <> target_workshop_id;

        -- The existing writer is the one place which also guards the number and uniqueness of poll attachments.
        PERFORM public.write_community_workshop_poll_workshops(
            source_poll_id,
            array_append(COALESCE(target_attached_workshop_ids, ARRAY[]::uuid[]), target_workshop_id)
        );
    END LOOP;
END;
$$;

-- Existing application processes can still call the former procedure while a deployment rolls forward. It delegates
-- to the one implementation above, so it now preserves the same shared polls instead of creating new ones.
CREATE OR REPLACE FUNCTION public.duplicate_workshop_attached_polls(
    source_workshop_id uuid,
    target_workshop_id uuid
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    PERFORM public.copy_workshop_poll_attachments(source_workshop_id, target_workshop_id);
END;
$$;

REVOKE ALL ON FUNCTION public.copy_workshop_poll_attachments(uuid, uuid)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.copy_workshop_poll_attachments(uuid, uuid)
    TO service_role;

REVOKE ALL ON FUNCTION public.duplicate_workshop_attached_polls(uuid, uuid)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.duplicate_workshop_attached_polls(uuid, uuid)
    TO service_role;

COMMIT;

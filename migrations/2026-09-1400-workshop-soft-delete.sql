-- Workshop occurrences remain available for audit after an administrator removes them. Their related room data and
-- their community-poll attachments therefore stay in place; every regular query simply leaves flagged occurrences out.

BEGIN;

ALTER TABLE public.workshops
    ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;

-- A deleted occurrence no longer occupies the public address of a new occurrence. Every lookup of a slug already
-- excludes deleted rows, while this partial uniqueness guard still prevents two active rooms sharing an address.
ALTER TABLE public.workshops
    DROP CONSTRAINT IF EXISTS workshops_slug_key;

CREATE UNIQUE INDEX IF NOT EXISTS workshops_active_slug_key
    ON public.workshops (slug)
    WHERE is_deleted = false;

-- The public lists and the administration selector both start by choosing one active kind of room and ordering it by
-- its schedule. Keeping that common read indexed avoids making a growing deleted archive part of the normal path.
CREATE INDEX IF NOT EXISTS workshops_active_kind_starts_at_idx
    ON public.workshops (room_kind, starts_at DESC)
    WHERE is_deleted = false;

-- Existing attachment rows deliberately survive a soft deletion. A deleted occurrence cannot, however, become a new
-- poll subject through a stale or forged administrative request.
CREATE OR REPLACE FUNCTION public.enforce_community_workshop_poll_attachment()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.workshop_polls AS poll
        INNER JOIN public.workshops AS community
            ON community.id = poll.workshop_id
        WHERE poll.id = NEW.poll_id
          AND community.room_kind = 'community'
    ) THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_OWNER_INVALID';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.workshops AS workshop
        WHERE workshop.id = NEW.workshop_id
          AND workshop.room_kind = 'workshop'
          AND workshop.is_deleted = false
    ) THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'WORKSHOP_POLL_WORKSHOP_INVALID';
    END IF;

    RETURN NEW;
END;
$$;

COMMIT;

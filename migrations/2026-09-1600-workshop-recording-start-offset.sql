-- The stream which a workshop broadcasts becomes its paid recording once the
-- workshop ends. An offset lets that replay skip the waiting room without
-- publishing and maintaining a second, trimmed copy of the same video.

BEGIN;

ALTER TABLE public.workshops
    ADD COLUMN IF NOT EXISTS recording_start_offset_seconds integer NOT NULL DEFAULT 0
        CHECK (recording_start_offset_seconds >= 0);

COMMIT;

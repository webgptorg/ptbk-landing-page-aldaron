-- Keep the existing video-led behavior for every event which has no explicit primary stage setting.

BEGIN;

ALTER TABLE public.workshops
    ADD COLUMN IF NOT EXISTS primary_stage_content text NOT NULL DEFAULT 'video'
        CHECK (primary_stage_content IN ('video', 'presentation', 'repository'));

COMMIT;

BEGIN;

ALTER TABLE public.managed_articles
    ADD COLUMN audio_generation_token uuid,
    ADD COLUMN audio_generation_until timestamptz;

NOTIFY pgrst, 'reload schema';

COMMIT;

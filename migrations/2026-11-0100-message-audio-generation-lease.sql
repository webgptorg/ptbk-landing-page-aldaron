BEGIN;

-- Some deployed Messages tables predate the audio lease columns. Repair them in a new migration;
-- keep the original migration immutable and preserve messages, recordings and any active lease.
ALTER TABLE public.messages
    ADD COLUMN IF NOT EXISTS audio_generation_token uuid,
    ADD COLUMN IF NOT EXISTS audio_generation_until timestamptz;

NOTIFY pgrst, 'reload schema';

COMMIT;

-- Private original meeting audio, independent of message creation/deletion.
BEGIN;
CREATE TABLE IF NOT EXISTS public.message_recording_parts (
    id uuid PRIMARY KEY,
    recording_id uuid NOT NULL,
    scope text NOT NULL,
    title text NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
    started_at timestamptz NOT NULL,
    ended_at timestamptz,
    mime_type text NOT NULL,
    status text NOT NULL CHECK (status IN ('recording', 'complete', 'interrupted')),
    expected_chunks integer CHECK (expected_chunks >= 0),
    transcript text,
    transcription_attempted boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS message_recording_parts_order ON public.message_recording_parts (started_at DESC, id DESC);
CREATE TABLE IF NOT EXISTS public.message_recording_chunks (
    part_id uuid NOT NULL REFERENCES public.message_recording_parts(id),
    sequence integer NOT NULL CHECK (sequence >= 0),
    object_key text NOT NULL UNIQUE,
    byte_length integer NOT NULL CHECK (byte_length BETWEEN 1 AND 1048576),
    sha256 text NOT NULL,
    PRIMARY KEY (part_id, sequence)
);
ALTER TABLE public.message_recording_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_recording_chunks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.message_recording_parts, public.message_recording_chunks FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.message_recording_parts, public.message_recording_chunks TO service_role;
NOTIFY pgrst, 'reload schema';
COMMIT;

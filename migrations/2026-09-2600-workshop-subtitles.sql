BEGIN;

-- Independent language tracks with original-video timing; never part of a public room projection.
CREATE TABLE public.workshop_subtitles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
    language text NOT NULL CHECK (language IN ('cs', 'en', 'mul')),
    cues jsonb NOT NULL CHECK (jsonb_typeof(cues) = 'array' AND jsonb_array_length(cues) BETWEEN 1 AND 20000
        AND octet_length(cues::text) <= 2200000),
    source text NOT NULL CHECK (source IN ('manual', 'youtube', 'transcription')),
    source_youtube_video_id text CHECK (source_youtube_video_id ~ '^[A-Za-z0-9_-]{11}$'),
    source_filename text CHECK (char_length(source_filename) <= 255),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX workshop_subtitles_room_idx ON public.workshop_subtitles (workshop_id, created_at);
ALTER TABLE public.workshop_subtitles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.workshop_subtitles FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.workshop_subtitles TO service_role;

COMMIT;

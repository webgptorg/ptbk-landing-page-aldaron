BEGIN;

-- Keep each existing occurrence in the original community, including calendar history.
-- Assignments live on the occurrence so changing both destinations is one write and registration stays shared.
ALTER TABLE public.workshops
    ADD COLUMN community_slugs text[] NOT NULL DEFAULT ARRAY['vyvojari']::text[],
    ADD CONSTRAINT workshops_community_publication_check CHECK (
        community_slugs IN (
            ARRAY[]::text[],
            ARRAY['vyvojari']::text[],
            ARRAY['promptbook']::text[],
            ARRAY['vyvojari', 'promptbook']::text[],
            ARRAY['promptbook', 'vyvojari']::text[]
        )
        AND (
            event_type IS DISTINCT FROM 'ai-supervize-mini'
            OR NOT (community_slugs @> ARRAY['promptbook']::text[])
        )
    );

CREATE INDEX workshops_community_publication_idx ON public.workshops USING gin (community_slugs);

COMMIT;

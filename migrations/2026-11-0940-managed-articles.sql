BEGIN;

-- The entire publication map and its canonical are changed in one row update.
CREATE FUNCTION public.valid_managed_article_placements(placements jsonb, canonical_destination text)
RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path = '' AS $$
DECLARE
    placement jsonb;
    destination text;
    visibility text;
    destinations text[] := '{}';
    first_visibility text;
BEGIN
    IF jsonb_typeof(placements) <> 'array' OR jsonb_array_length(placements) > 4 THEN
        RETURN false;
    END IF;
    FOR placement IN SELECT value FROM jsonb_array_elements(placements) LOOP
        destination := placement->>'destination';
        visibility := placement->>'visibility';
        IF destination IS NULL OR destination NOT IN ('promptbook-blog','personal-blog','vyvojari','promptbook')
            OR destination = ANY(destinations)
            OR visibility IS NULL OR visibility NOT IN ('public','members','paid')
            OR (first_visibility IS NOT NULL AND visibility <> first_visibility)
            OR (destination IN ('promptbook-blog','personal-blog') AND visibility <> 'public') THEN
            RETURN false;
        END IF;
        destinations := array_append(destinations, destination);
        first_visibility := visibility;
    END LOOP;
    IF cardinality(destinations) = 0 THEN RETURN canonical_destination IS NULL; END IF;
    RETURN canonical_destination IS NOT NULL AND canonical_destination = ANY(destinations);
END;
$$;

CREATE TABLE public.managed_articles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    revision uuid NOT NULL DEFAULT gen_random_uuid(),
    language text NOT NULL CHECK (language IN ('cs','en')),
    slug text NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length(slug) <= 100),
    author_id text NOT NULL CHECK (char_length(author_id) > 0),
    title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 200),
    perex text NOT NULL CHECK (char_length(perex) <= 1000),
    markdown text NOT NULL CHECK (char_length(markdown) <= 250000),
    placements jsonb NOT NULL DEFAULT '[]',
    canonical_destination text,
    published_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    audio_asset jsonb,
    pdf_asset jsonb,
    words_asset jsonb,
    subtitles_asset jsonb,
    UNIQUE (language, slug),
    CHECK (public.valid_managed_article_placements(placements, canonical_destination)),
    CHECK (canonical_destination IS NULL OR
        (published_at IS NOT NULL AND btrim(perex) <> '' AND btrim(markdown) <> ''))
);

ALTER TABLE public.managed_articles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.managed_articles FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.managed_articles TO service_role;

-- Git remains the source for historic article content, author, recordings, and variants.
-- This small overlay adds publication destinations without changing any legacy URL.
CREATE TABLE public.legacy_article_placements (
    legacy_id text PRIMARY KEY CHECK (legacy_id ~ '^[a-z0-9][a-z0-9-]*$'),
    communities text[] NOT NULL DEFAULT '{}',
    canonical_destination text NOT NULL,
    CHECK (
        communities <@ ARRAY['vyvojari','promptbook']::text[]
        AND array_position(communities, NULL) IS NULL
        AND (cardinality(communities) < 2 OR (cardinality(communities) = 2 AND communities[1] <> communities[2]))
    ),
    CHECK (canonical_destination IN ('promptbook-blog','personal-blog') OR canonical_destination = ANY(communities))
);
ALTER TABLE public.legacy_article_placements ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.legacy_article_placements FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.legacy_article_placements TO service_role;

NOTIFY pgrst, 'reload schema';
COMMIT;

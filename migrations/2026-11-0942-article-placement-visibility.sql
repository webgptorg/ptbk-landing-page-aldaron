BEGIN;

-- Each placement controls its own access. A public copy must identify a public canonical URL.
CREATE OR REPLACE FUNCTION public.valid_managed_article_placements(placements jsonb, canonical_destination text)
RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path = '' AS $$
DECLARE
    placement jsonb;
    destination text;
    visibility text;
    destinations text[] := '{}';
    canonical_visibility text;
    has_public_placement boolean := false;
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
            OR (destination IN ('promptbook-blog','personal-blog') AND visibility <> 'public') THEN
            RETURN false;
        END IF;
        destinations := array_append(destinations, destination);
        has_public_placement := has_public_placement OR visibility = 'public';
        IF destination = canonical_destination THEN
            canonical_visibility := visibility;
        END IF;
    END LOOP;
    IF cardinality(destinations) = 0 THEN RETURN canonical_destination IS NULL; END IF;
    RETURN canonical_visibility IS NOT NULL
        AND (NOT has_public_placement OR canonical_visibility = 'public');
END;
$$;

COMMIT;

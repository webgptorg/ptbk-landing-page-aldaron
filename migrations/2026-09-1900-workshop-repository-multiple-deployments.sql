-- The project a term is about can run in more than one public place, so a workshop now keeps an ordered array of
-- deployment addresses instead of a single one. NULL means the project is published nowhere; the first address is the
-- one a term card is previewed from. An existing single address becomes a one-element array, so nothing which was
-- already connected loses where it runs.
--
-- The addresses are guarded exactly as they were while there was one of them: each has to be an HTTP(S) address. They
-- are joined by a space for that check, because no address may contain whitespace, which makes the joined value one
-- unambiguous line of addresses.

BEGIN;

ALTER TABLE public.workshops
    ADD COLUMN IF NOT EXISTS deployment_urls text[];

UPDATE public.workshops
SET deployment_urls = ARRAY[deployment_url]
WHERE deployment_urls IS NULL
  AND deployment_url IS NOT NULL;

ALTER TABLE public.workshops
    DROP CONSTRAINT IF EXISTS workshops_repository_connection;

ALTER TABLE public.workshops
    DROP COLUMN IF EXISTS deployment_url;

ALTER TABLE public.workshops
    DROP CONSTRAINT IF EXISTS workshops_repository_deployment_urls_values;

ALTER TABLE public.workshops
    ADD CONSTRAINT workshops_repository_deployment_urls_values CHECK (
        deployment_urls IS NULL
        OR (
            cardinality(deployment_urls) BETWEEN 1 AND 50
            AND array_position(deployment_urls, NULL::text) IS NULL
            AND array_position(deployment_urls, '') IS NULL
            AND array_to_string(deployment_urls, ' ') ~* '^https?://\S+( https?://\S+)*$'
        )
    );

ALTER TABLE public.workshops
    ADD CONSTRAINT workshops_repository_connection CHECK (
        github_repository IS NOT NULL
        OR (github_repository_branches IS NULL AND deployment_urls IS NULL)
    );

COMMIT;

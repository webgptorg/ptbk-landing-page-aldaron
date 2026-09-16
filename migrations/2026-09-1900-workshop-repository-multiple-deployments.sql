-- A workshop project can run in more than one public place. The ordered array keeps every
-- deployment on the one repository connection, so clearing the project still clears every
-- branch pattern and deployment together. Existing single deployment addresses remain first.

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
            AND array_to_string(deployment_urls, '|') ~* '^https?://[^|]+(\\|https?://[^|]+)*$'
        )
    );

ALTER TABLE public.workshops
    ADD CONSTRAINT workshops_repository_connection CHECK (
        github_repository IS NOT NULL
        OR (github_repository_branches IS NULL AND deployment_urls IS NULL)
    );

COMMIT;

-- A term can be about a project, exactly as it can carry a stream. The project is
-- one connection rather than three loose settings: the repository on GitHub written
-- as `owner/name`, the branch which is followed, and the address the project runs
-- at. The branch and the deployment therefore only exist while a repository is
-- connected, so unsetting the connection can never leave either of them behind.
--
-- What has been committed in that repository is deliberately stored nowhere. It is
-- read from the feed GitHub publishes, so the room shows the commits themselves
-- rather than a copy of them which could disagree with the repository.

BEGIN;

ALTER TABLE public.workshops
    ADD COLUMN IF NOT EXISTS github_repository text
        CHECK (github_repository IS NULL OR github_repository ~ '^[A-Za-z0-9][A-Za-z0-9-]{0,38}/[A-Za-z0-9._-]{1,100}$');

ALTER TABLE public.workshops
    ADD COLUMN IF NOT EXISTS github_repository_branch text
        CHECK (github_repository_branch IS NULL OR btrim(github_repository_branch) <> '');

ALTER TABLE public.workshops
    ADD COLUMN IF NOT EXISTS deployment_url text
        CHECK (deployment_url IS NULL OR deployment_url ~* '^https?://');

ALTER TABLE public.workshops
    DROP CONSTRAINT IF EXISTS workshops_repository_connection;
ALTER TABLE public.workshops
    ADD CONSTRAINT workshops_repository_connection CHECK (
        github_repository IS NOT NULL
        OR (github_repository_branch IS NULL AND deployment_url IS NULL)
    );

COMMIT;

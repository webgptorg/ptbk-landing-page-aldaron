-- A workshop now keeps one branch selection: NULL means the repository default, a non-empty array names selected
-- branches, and an empty array means all branches. Existing single-branch connections become one-element arrays.
-- The cardinality guard applies only to explicitly selected branch names; the empty all-branches marker stays valid.

BEGIN;

ALTER TABLE public.workshops
    ADD COLUMN IF NOT EXISTS github_repository_branches text[];

UPDATE public.workshops
SET github_repository_branches = ARRAY[github_repository_branch]
WHERE github_repository_branches IS NULL
  AND github_repository_branch IS NOT NULL;

ALTER TABLE public.workshops
    DROP CONSTRAINT IF EXISTS workshops_repository_connection;

ALTER TABLE public.workshops
    DROP COLUMN IF EXISTS github_repository_branch;

ALTER TABLE public.workshops
    ADD CONSTRAINT workshops_repository_branches_values CHECK (
        github_repository_branches IS NULL
        OR (
            cardinality(github_repository_branches) <= 50
            AND array_position(github_repository_branches, NULL::text) IS NULL
            AND array_position(github_repository_branches, '') IS NULL
        )
    );

ALTER TABLE public.workshops
    ADD CONSTRAINT workshops_repository_connection CHECK (
        github_repository IS NOT NULL
        OR (github_repository_branches IS NULL AND deployment_url IS NULL)
    );

COMMIT;

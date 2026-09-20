BEGIN;

ALTER TABLE public.workshops
    ADD COLUMN github_repository_start_commit text,
    ADD COLUMN github_repository_end_commit text,
    ADD CONSTRAINT workshops_repository_start_commit_format
        CHECK (github_repository_start_commit IS NULL OR github_repository_start_commit ~ '^[0-9a-f]{7,40}$'),
    ADD CONSTRAINT workshops_repository_end_commit_format
        CHECK (github_repository_end_commit IS NULL OR github_repository_end_commit ~ '^[0-9a-f]{7,40}$');

ALTER TABLE public.workshops DROP CONSTRAINT workshops_repository_connection;
ALTER TABLE public.workshops ADD CONSTRAINT workshops_repository_connection CHECK (
    github_repository IS NOT NULL OR (
        github_repository_branches IS NULL AND deployment_urls IS NULL
        AND github_repository_start_commit IS NULL AND github_repository_end_commit IS NULL
    )
);

COMMIT;

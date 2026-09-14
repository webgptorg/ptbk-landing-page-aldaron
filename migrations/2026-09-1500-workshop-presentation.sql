-- A presentation belongs directly to one workshop term, just as its stream and connected project do. It is only a
-- public address: PDFs, PowerPoint files, and GitHub Markdown pages all remain where their author publishes them.
-- The room treats it as a shared special material, not as scheduled or membership-gated workshop content.

BEGIN;

ALTER TABLE public.workshops
    ADD COLUMN IF NOT EXISTS presentation_url text
        CHECK (presentation_url IS NULL OR presentation_url ~* '^https?://');

COMMIT;

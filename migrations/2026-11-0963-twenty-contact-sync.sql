BEGIN;

-- Delivery bookkeeping only. The original source tables and their write paths are independent of this table.
CREATE TABLE public.twenty_contact_sync (
    external_id text PRIMARY KEY,
    source_version text NOT NULL,
    attempts integer NOT NULL,
    next_attempt_at timestamptz,
    last_error text
);

ALTER TABLE public.twenty_contact_sync ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.twenty_contact_sync FROM PUBLIC, anon, authenticated;

COMMIT;

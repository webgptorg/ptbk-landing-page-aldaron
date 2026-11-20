BEGIN;

CREATE TABLE public.ecosystem_api_keys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 120),
    token_hash text NOT NULL UNIQUE CHECK (token_hash ~ '^[a-f0-9]{64}$'),
    token_prefix text NOT NULL CHECK (token_prefix ~ '^ptbk_[A-Za-z0-9_-]{8}$'),
    scopes text[] NOT NULL CHECK (
        cardinality(scopes) BETWEEN 1 AND 2 AND array_position(scopes, NULL) IS NULL
        AND scopes <@ ARRAY['licenses:read','identity:exchange']::text[]
    ),
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by text NOT NULL CHECK (char_length(created_by) BETWEEN 1 AND 64),
    expires_at timestamptz CHECK (expires_at > created_at),
    revoked_at timestamptz,
    revoked_by text,
    CHECK ((revoked_at IS NULL) = (revoked_by IS NULL))
);

CREATE INDEX ecosystem_api_keys_created_idx ON public.ecosystem_api_keys (created_at DESC, id);
ALTER TABLE public.ecosystem_api_keys ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ecosystem_api_keys FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.ecosystem_api_keys TO service_role;

COMMIT;

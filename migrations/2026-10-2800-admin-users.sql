-- The environment-backed admin remains outside this table and is always a superadministrator.
CREATE TABLE public.admin_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username text NOT NULL UNIQUE CHECK (
        username = lower(username) AND username <> 'admin'
        AND length(username) BETWEEN 3 AND 64 AND username ~ '^[a-z0-9][a-z0-9._-]*$'
    ),
    password_hash text NOT NULL CHECK (password_hash ~ '^scrypt-32768-8-3:[a-f0-9]{32}:[a-f0-9]{128}$'),
    permissions text[] NOT NULL DEFAULT '{}' CHECK (
        array_position(permissions, NULL) IS NULL
        AND permissions <@ ARRAY['workshops','community','studio','contacts','shortener','discount-codes']::text[]
    ),
    is_enabled boolean NOT NULL DEFAULT true,
    session_version uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE FUNCTION public.refresh_admin_user_session_version()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
    NEW.updated_at := now();
    -- Permissions are reloaded on every request. Password and enabled-state changes additionally revoke old cookies,
    -- including when a disabled account is subsequently enabled again.
    IF NEW.password_hash IS DISTINCT FROM OLD.password_hash OR NEW.is_enabled IS DISTINCT FROM OLD.is_enabled THEN
        NEW.session_version := gen_random_uuid();
    END IF;
    RETURN NEW;
END;
$$;
CREATE TRIGGER refresh_admin_user_session_version BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION public.refresh_admin_user_session_version();

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_users FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_users TO service_role;
REVOKE ALL ON FUNCTION public.refresh_admin_user_session_version() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_admin_user_session_version() TO service_role;

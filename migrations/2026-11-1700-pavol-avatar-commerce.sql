BEGIN;
-- Pavol avatar is a separate product. No existing orders, agents, memberships or auth templates change.
CREATE TABLE IF NOT EXISTS public.avatar_principals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE CHECK (email = lower(btrim(email)) AND length(email) BETWEEN 3 AND 254),
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.avatar_sessions (
    token_hash text PRIMARY KEY CHECK (token_hash ~ '^[a-f0-9]{64}$'),
    principal_id uuid NOT NULL REFERENCES public.avatar_principals(id) ON DELETE CASCADE,
    expires_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS avatar_sessions_principal ON public.avatar_sessions(principal_id);
CREATE INDEX IF NOT EXISTS avatar_sessions_expiry ON public.avatar_sessions(expires_at);
CREATE TABLE IF NOT EXISTS public.avatar_orders (
    id uuid PRIMARY KEY,
    principal_id uuid NOT NULL REFERENCES public.avatar_principals(id),
    email text NOT NULL CHECK (email = lower(btrim(email))),
    fullname text NOT NULL,
    customer_type text NOT NULL CHECK (customer_type IN ('individual','business')),
    billing_name text NOT NULL,
    company_id text,
    vat_id text,
    billing_address jsonb NOT NULL CHECK (jsonb_typeof(billing_address) = 'object'),
    country text NOT NULL CHECK (country IN ('CZ','SK')),
    base_amount integer NOT NULL CHECK (base_amount >= 0),
    currency text NOT NULL DEFAULT 'czk' CHECK (currency = 'czk'),
    terms_version text NOT NULL,
    seller jsonb NOT NULL CHECK (jsonb_typeof(seller) = 'object'),
    legal_snapshot jsonb NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(legal_snapshot) = 'object'),
    usage_limits jsonb NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(usage_limits) = 'object'),
    immediate_start_accepted boolean NOT NULL DEFAULT false,
    request_fingerprint text NOT NULL DEFAULT '',
    status text NOT NULL DEFAULT 'pending',
    is_test boolean NOT NULL,
    stripe_customer_id text,
    stripe_session_id text UNIQUE,
    stripe_subscription_id text UNIQUE,
    paid_through timestamptz,
    cancel_at_period_end boolean NOT NULL DEFAULT false,
    invoice_url text,
    revision integer NOT NULL DEFAULT 0 CHECK (revision >= 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK ((customer_type = 'business' AND company_id IS NOT NULL) OR
           (customer_type = 'individual' AND company_id IS NULL AND vat_id IS NULL))
);
CREATE INDEX IF NOT EXISTS avatar_orders_principal ON public.avatar_orders(principal_id,is_test,created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS avatar_one_open_order ON public.avatar_orders(principal_id,is_test)
    WHERE status IN ('pending','active','trialing','past_due','unpaid','paused');
CREATE TABLE IF NOT EXISTS public.avatar_invoices (
    stripe_invoice_id text PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES public.avatar_orders(id),
    paid_at timestamptz NOT NULL,
    paid_through timestamptz NOT NULL,
    amount_paid integer NOT NULL CHECK (amount_paid >= 0),
    refunded_amount integer NOT NULL DEFAULT 0 CHECK (refunded_amount >= 0),
    currency text NOT NULL CHECK (currency = 'czk'),
    invoice_url text,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS avatar_invoices_order_period ON public.avatar_invoices(order_id,paid_through);
CREATE TABLE IF NOT EXISTS public.avatar_stripe_events (
    id text PRIMARY KEY,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.avatar_usage (
    principal_id uuid NOT NULL REFERENCES public.avatar_principals(id) ON DELETE CASCADE,
    period_start timestamptz NOT NULL,
    used integer NOT NULL DEFAULT 0 CHECK (used >= 0),
    PRIMARY KEY (principal_id,period_start)
);
CREATE TABLE IF NOT EXISTS public.avatar_auth_attempts (
    key text PRIMARY KEY,
    window_start timestamptz NOT NULL,
    attempts integer NOT NULL CHECK (attempts >= 0)
);
CREATE OR REPLACE FUNCTION public.avatar_allow_auth_attempt(attempt_key text, attempt_limit integer, window_seconds integer)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, public AS $function$
DECLARE accepted integer; window_boundary timestamptz;
BEGIN
    IF length(attempt_key) > 128 OR attempt_limit < 1 OR attempt_limit > 100 OR window_seconds < 30 OR window_seconds > 86400 THEN
        RETURN false;
    END IF;
    window_boundary := to_timestamp(floor(extract(epoch from now()) / window_seconds) * window_seconds);
    INSERT INTO public.avatar_auth_attempts(key,window_start,attempts) VALUES(attempt_key,window_boundary,1)
    ON CONFLICT(key) DO UPDATE SET
        window_start = EXCLUDED.window_start,
        attempts = CASE WHEN avatar_auth_attempts.window_start < EXCLUDED.window_start THEN 1 ELSE avatar_auth_attempts.attempts + 1 END
    WHERE avatar_auth_attempts.window_start < EXCLUDED.window_start OR avatar_auth_attempts.attempts < attempt_limit
    RETURNING attempts INTO accepted;
    RETURN accepted IS NOT NULL;
END;
$function$;
ALTER TABLE public.avatar_principals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_stripe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_auth_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.avatar_principals, public.avatar_sessions, public.avatar_orders, public.avatar_invoices,
    public.avatar_stripe_events, public.avatar_usage, public.avatar_auth_attempts FROM PUBLIC, anon, authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.avatar_principals, public.avatar_sessions, public.avatar_orders, public.avatar_invoices,
    public.avatar_stripe_events, public.avatar_usage, public.avatar_auth_attempts TO service_role;
REVOKE ALL ON FUNCTION public.avatar_allow_auth_attempt(text,integer,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.avatar_allow_auth_attempt(text,integer,integer) TO service_role;
-- Accepted product, payer and legal editions are immutable; Stripe lifecycle columns remain mutable.
CREATE OR REPLACE FUNCTION public.avatar_preserve_order_contract()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, public AS $function$
BEGIN
    IF ROW(NEW.principal_id,NEW.email,NEW.fullname,NEW.customer_type,NEW.billing_name,NEW.company_id,NEW.vat_id,
        NEW.billing_address,NEW.country,NEW.base_amount,NEW.currency,NEW.terms_version,NEW.seller,NEW.legal_snapshot,
        NEW.usage_limits,NEW.is_test,NEW.immediate_start_accepted,NEW.request_fingerprint,NEW.created_at)
       IS DISTINCT FROM
       ROW(OLD.principal_id,OLD.email,OLD.fullname,OLD.customer_type,OLD.billing_name,OLD.company_id,OLD.vat_id,
        OLD.billing_address,OLD.country,OLD.base_amount,OLD.currency,OLD.terms_version,OLD.seller,OLD.legal_snapshot,
        OLD.usage_limits,OLD.is_test,OLD.immediate_start_accepted,OLD.request_fingerprint,OLD.created_at)
    THEN RAISE EXCEPTION 'Avatar order contract is immutable' USING ERRCODE = '23514'; END IF;
    RETURN NEW;
END;
$function$;
DROP TRIGGER IF EXISTS avatar_preserve_order_contract ON public.avatar_orders;
CREATE TRIGGER avatar_preserve_order_contract BEFORE UPDATE ON public.avatar_orders
    FOR EACH ROW EXECUTE FUNCTION public.avatar_preserve_order_contract();
REVOKE ALL ON FUNCTION public.avatar_preserve_order_contract() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.avatar_preserve_order_contract() TO service_role;

CREATE TABLE IF NOT EXISTS public.avatar_settings (
    key text PRIMARY KEY CHECK (length(key) BETWEEN 1 AND 100),
    value text NOT NULL CHECK (length(value) BETWEEN 1 AND 500),
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.avatar_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.avatar_settings FROM PUBLIC, anon, authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.avatar_settings TO service_role;
-- A late or concurrent pre-refund snapshot must never erase a confirmed refund.
CREATE OR REPLACE FUNCTION public.avatar_preserve_invoice_refunds()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, public AS $function$
BEGIN
    NEW.refunded_amount := greatest(OLD.refunded_amount, NEW.refunded_amount);
    RETURN NEW;
END;
$function$;
DROP TRIGGER IF EXISTS avatar_preserve_invoice_refunds ON public.avatar_invoices;
CREATE TRIGGER avatar_preserve_invoice_refunds BEFORE UPDATE ON public.avatar_invoices
    FOR EACH ROW EXECUTE FUNCTION public.avatar_preserve_invoice_refunds();
REVOKE ALL ON FUNCTION public.avatar_preserve_invoice_refunds() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.avatar_preserve_invoice_refunds() TO service_role;
COMMIT;

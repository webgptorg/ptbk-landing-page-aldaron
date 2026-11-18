BEGIN;

-- Additive only: old rules, purchases, counters and reservations keep their meaning.
ALTER TABLE public.discount_codes
    ADD COLUMN price_rule jsonb,
    ADD COLUMN applies_everywhere boolean NOT NULL DEFAULT false,
    ADD COLUMN definition_version integer NOT NULL DEFAULT 1 CHECK (definition_version > 0),
    ADD CONSTRAINT discount_codes_price_rule CHECK (price_rule IS NULL OR (
        jsonb_typeof(price_rule) = 'object' AND price_rule->>'currency' = 'CZK'
        AND CASE price_rule->>'kind'
            WHEN 'fixed' THEN jsonb_typeof(price_rule->'amount') = 'number' AND (price_rule->>'amount')::numeric BETWEEN 0 AND 1000000000
            WHEN 'amount' THEN jsonb_typeof(price_rule->'amount') = 'number' AND (price_rule->>'amount')::numeric BETWEEN 0 AND 1000000000
            WHEN 'formula' THEN jsonb_typeof(price_rule->'expression') = 'string' AND char_length(price_rule->>'expression') BETWEEN 1 AND 500
            ELSE false END
    ) IS TRUE),
    DROP CONSTRAINT discount_codes_promoted_exact_promptbook,
    ADD CONSTRAINT discount_codes_promoted_exact_promptbook CHECK (
        NOT is_promoted OR (position('*' IN code) = 0 AND
            (applies_everywhere OR place_ids && ARRAY['promptbook-start', 'promptbook-business']::text[]))
    );

CREATE FUNCTION public.version_discount_definition() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, public AS $$
BEGIN
    IF ROW(NEW.code,NEW.percent,NEW.price_rule,NEW.subscription_discount_duration_months,NEW.starts_at,NEW.ends_at,
        NEW.place_ids,NEW.applies_everywhere,NEW.is_enabled,NEW.maximum_use_count)
       IS DISTINCT FROM ROW(OLD.code,OLD.percent,OLD.price_rule,OLD.subscription_discount_duration_months,OLD.starts_at,OLD.ends_at,
        OLD.place_ids,OLD.applies_everywhere,OLD.is_enabled,OLD.maximum_use_count) THEN
        NEW.definition_version := OLD.definition_version + 1;
    ELSE NEW.definition_version := OLD.definition_version;
    END IF;
    RETURN NEW;
END; $$;
CREATE TRIGGER version_discount_definition BEFORE UPDATE ON public.discount_codes
FOR EACH ROW EXECUTE FUNCTION public.version_discount_definition();

CREATE OR REPLACE FUNCTION public.is_discount_code_open(discount public.discount_codes, discount_place_id text)
RETURNS boolean LANGUAGE sql STABLE SET search_path = public, pg_temp AS $$
    SELECT discount.is_enabled AND discount.starts_at <= now() AND discount.ends_at >= now()
        AND (discount.applies_everywhere OR discount_place_id = ANY(discount.place_ids)
            OR (cardinality(discount.place_ids) = 0 AND discount_place_id NOT IN ('promptbook-start','promptbook-business')));
$$;

ALTER TABLE public.promptbook_discount_reservations
    ADD COLUMN price_rule jsonb,
    ADD COLUMN definition_version integer NOT NULL DEFAULT 1;
-- Snapshot at the original INSERT, inside the atomic claim, including for old RPC callers.
CREATE FUNCTION public.snapshot_reserved_discount_rule() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, public AS $$
BEGIN
    SELECT code.price_rule, code.definition_version INTO NEW.price_rule, NEW.definition_version
    FROM public.discount_codes code WHERE code.id = NEW.discount_code_id;
    RETURN NEW;
END; $$;
CREATE TRIGGER snapshot_reserved_discount_rule BEFORE INSERT ON public.promptbook_discount_reservations
FOR EACH ROW EXECUTE FUNCTION public.snapshot_reserved_discount_rule();

CREATE OR REPLACE FUNCTION public.reserve_subscription_discount_code(
    submitted_code text,
    place_id text,
    reservation_id uuid
)
RETURNS TABLE (
    status text,
    code text,
    percent integer,
    remaining_use_count integer,
    subscription_discount_duration_months integer
)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    reservation public.promptbook_discount_reservations;
    claimed_discount public.discount_codes;
    resolved_discount_id uuid;
BEGIN
    IF place_id NOT IN ('promptbook-start', 'promptbook-business', 'pavol-avatar-full') THEN
        RETURN QUERY SELECT 'unusable'::text, submitted_code, NULL::integer, NULL::integer, NULL::integer;
        RETURN;
    END IF;

    PERFORM pg_advisory_xact_lock(hashtextextended(reservation_id::text, 0));
    SELECT existing.* INTO reservation
    FROM public.promptbook_discount_reservations AS existing
    WHERE existing.id = reservation_id;

    IF FOUND THEN
        IF reservation.state = 'released' OR reservation.submitted_code <> submitted_code OR reservation.place_id <> place_id THEN
            RETURN QUERY SELECT 'unusable'::text, submitted_code, NULL::integer, NULL::integer, NULL::integer;
        ELSE
            RETURN QUERY SELECT 'applied'::text, reservation.code, reservation.percent,
                reservation.remaining_use_count, reservation.subscription_discount_duration_months;
        END IF;
        RETURN;
    END IF;

    SELECT matching.id INTO resolved_discount_id FROM public.resolve_discount_code(submitted_code) AS matching;

    UPDATE public.discount_codes AS discount
    SET use_count = discount.use_count + 1
    WHERE discount.id = resolved_discount_id
      AND public.is_discount_code_open(discount, place_id)
      AND (discount.maximum_use_count IS NULL OR discount.use_count < discount.maximum_use_count)
    RETURNING discount.* INTO claimed_discount;

    IF FOUND THEN
        INSERT INTO public.promptbook_discount_reservations AS existing (
            id, discount_code_id, submitted_code, place_id, code, percent, remaining_use_count,
            subscription_discount_duration_months
        ) VALUES (
            reservation_id, claimed_discount.id, submitted_code, place_id, claimed_discount.code, claimed_discount.percent,
            claimed_discount.maximum_use_count - claimed_discount.use_count,
            claimed_discount.subscription_discount_duration_months
        ) RETURNING existing.* INTO reservation;

        RETURN QUERY SELECT 'applied'::text, reservation.code, reservation.percent,
            reservation.remaining_use_count, reservation.subscription_discount_duration_months;
        RETURN;
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.discount_codes AS discount
        WHERE discount.id = resolved_discount_id
          AND public.is_discount_code_open(discount, place_id)
          AND discount.use_count >= discount.maximum_use_count
    ) THEN
        RETURN QUERY SELECT 'exhausted'::text, submitted_code, NULL::integer, 0, NULL::integer;
        RETURN;
    END IF;

    RETURN QUERY SELECT 'unusable'::text, submitted_code, NULL::integer, NULL::integer, NULL::integer;
END;
$$;



-- New versioned RPCs extend replies without changing old deployed signatures.
CREATE FUNCTION public.reserve_subscription_discount_code_v2(submitted_code text, place_id text, reservation_id uuid)
RETURNS TABLE(status text, code text, percent integer, remaining_use_count integer,
    subscription_discount_duration_months integer, price_rule jsonb, definition_version integer)
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE claim record; rule jsonb; version integer;
BEGIN
    -- Separate statements advance the command snapshot after the inner function INSERTs.
    SELECT * INTO claim FROM public.reserve_subscription_discount_code(submitted_code, place_id, reservation_id);
    IF claim.status = 'applied' THEN
        SELECT reservation.price_rule, reservation.definition_version INTO rule, version
        FROM public.promptbook_discount_reservations reservation WHERE reservation.id = reservation_id;
    END IF;
    RETURN QUERY SELECT claim.status,claim.code,claim.percent,claim.remaining_use_count,claim.subscription_discount_duration_months,rule,version;
END;
$$;

CREATE FUNCTION public.consume_discount_code_v2(discount_code text, discount_place_id text)
RETURNS TABLE(status text, code text, percent integer, remaining_use_count integer,
    subscription_discount_duration_months integer, price_rule jsonb, definition_version integer)
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE claim record; rule jsonb; version integer;
BEGIN
    SELECT * INTO claim FROM public.consume_discount_code(discount_code, discount_place_id);
    IF claim.status = 'applied' THEN
        -- The original conditional UPDATE holds this row lock until our transaction ends.
        SELECT current.price_rule, current.definition_version INTO rule, version FROM public.discount_codes current WHERE current.code = claim.code;
    END IF;
    RETURN QUERY SELECT claim.status,claim.code,claim.percent,claim.remaining_use_count,claim.subscription_discount_duration_months,rule,version;
END; $$;

ALTER TABLE public.promptbook_orders ADD COLUMN discount_snapshot jsonb;
ALTER TABLE public.avatar_orders ADD COLUMN discount_snapshot jsonb;
ALTER TABLE public.community_memberships ADD COLUMN discount_snapshot jsonb;

-- A separate history preserves accepted membership attempts even when the live membership row is reused.
CREATE TABLE public.discount_purchase_snapshots (
    product text NOT NULL,
    purchase_id text NOT NULL,
    snapshot jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY(product,purchase_id)
);
ALTER TABLE public.discount_purchase_snapshots ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.discount_purchase_snapshots FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT ON public.discount_purchase_snapshots TO service_role;

CREATE FUNCTION public.preserve_purchase_discount_snapshot() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, public AS $$
BEGIN
    IF NEW.discount_snapshot IS DISTINCT FROM OLD.discount_snapshot THEN
        RAISE EXCEPTION 'Accepted discount snapshot is immutable' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END; $$;
CREATE TRIGGER preserve_purchase_discount_snapshot BEFORE UPDATE ON public.promptbook_orders
FOR EACH ROW EXECUTE FUNCTION public.preserve_purchase_discount_snapshot();
CREATE TRIGGER preserve_purchase_discount_snapshot BEFORE UPDATE ON public.avatar_orders
FOR EACH ROW EXECUTE FUNCTION public.preserve_purchase_discount_snapshot();

CREATE FUNCTION public.record_purchase_discount_snapshot() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, public AS $$
DECLARE reference text;
BEGIN
    reference := CASE WHEN TG_TABLE_NAME = 'community_memberships' THEN COALESCE(to_jsonb(NEW)->>'stripe_checkout_session_id', NEW.id::text) ELSE NEW.id::text END;
    IF NEW.discount_snapshot IS NOT NULL THEN
        INSERT INTO public.discount_purchase_snapshots(product,purchase_id,snapshot)
        VALUES(TG_TABLE_NAME,reference,NEW.discount_snapshot) ON CONFLICT DO NOTHING;
    END IF;
    RETURN NEW;
END; $$;
CREATE TRIGGER record_purchase_discount_snapshot AFTER INSERT ON public.promptbook_orders
FOR EACH ROW EXECUTE FUNCTION public.record_purchase_discount_snapshot();
CREATE TRIGGER record_purchase_discount_snapshot AFTER INSERT ON public.avatar_orders
FOR EACH ROW EXECUTE FUNCTION public.record_purchase_discount_snapshot();
CREATE TRIGGER record_purchase_discount_snapshot AFTER INSERT OR UPDATE OF discount_snapshot ON public.community_memberships
FOR EACH ROW EXECUTE FUNCTION public.record_purchase_discount_snapshot();

REVOKE ALL ON FUNCTION public.version_discount_definition(),public.snapshot_reserved_discount_rule(),
    public.preserve_purchase_discount_snapshot(),public.record_purchase_discount_snapshot() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.version_discount_definition(),public.snapshot_reserved_discount_rule(),
    public.preserve_purchase_discount_snapshot(),public.record_purchase_discount_snapshot() TO service_role;
REVOKE ALL ON FUNCTION public.reserve_subscription_discount_code_v2(text,text,uuid),public.consume_discount_code_v2(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_subscription_discount_code_v2(text,text,uuid),public.consume_discount_code_v2(text,text) TO service_role;
COMMIT;

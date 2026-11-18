BEGIN;

-- Avatar joins the existing global code registry and atomic subscription reservations.
-- Existing contracts, code definitions, counters and reservations are not rewritten.
ALTER TABLE public.avatar_orders
    ADD COLUMN discount_code text,
    ADD COLUMN discount_percent integer,
    ADD COLUMN discount_months integer,
    ADD CONSTRAINT avatar_order_discount_snapshot CHECK (
        (discount_code IS NULL AND discount_percent IS NULL AND discount_months IS NULL)
        OR (discount_code IS NOT NULL AND char_length(discount_code) BETWEEN 1 AND 100
            AND discount_code ~ '^[A-Z0-9*]+(?:_[A-Z0-9*]+)*$'
            AND discount_percent IS NOT NULL AND discount_percent BETWEEN 1 AND 100
            AND (discount_months IS NULL OR discount_months BETWEEN 1 AND 36))
    );

CREATE OR REPLACE FUNCTION public.avatar_preserve_order_contract()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, public AS $function$
BEGIN
    IF ROW(NEW.principal_id,NEW.email,NEW.fullname,NEW.customer_type,NEW.billing_name,NEW.company_id,NEW.vat_id,
        NEW.billing_address,NEW.country,NEW.base_amount,NEW.discount_code,NEW.discount_percent,NEW.discount_months,NEW.currency,NEW.terms_version,NEW.seller,NEW.legal_snapshot,
        NEW.usage_limits,NEW.is_test,NEW.immediate_start_accepted,NEW.request_fingerprint,NEW.created_at)
       IS DISTINCT FROM
       ROW(OLD.principal_id,OLD.email,OLD.fullname,OLD.customer_type,OLD.billing_name,OLD.company_id,OLD.vat_id,
        OLD.billing_address,OLD.country,OLD.base_amount,OLD.discount_code,OLD.discount_percent,OLD.discount_months,OLD.currency,OLD.terms_version,OLD.seller,OLD.legal_snapshot,
        OLD.usage_limits,OLD.is_test,OLD.immediate_start_accepted,OLD.request_fingerprint,OLD.created_at)
    THEN RAISE EXCEPTION 'Avatar order contract is immutable' USING ERRCODE = '23514'; END IF;
    RETURN NEW;
END;
$function$;

-- The historical private reservation table intentionally remains in place: all products
-- serialize against the same code counter and no reservations or audit history are copied.
CREATE FUNCTION public.reserve_subscription_discount_code(
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


-- Older deployed Promptbook callers keep their exact RPC signature and plan-only scope.
CREATE OR REPLACE FUNCTION public.reserve_promptbook_discount_code(
    submitted_code text, place_id text, reservation_id uuid
)
RETURNS TABLE(status text, code text, percent integer, remaining_use_count integer, subscription_discount_duration_months integer)
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp
AS $$
BEGIN
    IF place_id NOT IN ('promptbook-start', 'promptbook-business') THEN
        RETURN QUERY SELECT 'unusable'::text, submitted_code, NULL::integer, NULL::integer, NULL::integer;
        RETURN;
    END IF;
    RETURN QUERY SELECT * FROM public.reserve_subscription_discount_code(submitted_code, place_id, reservation_id);
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_subscription_discount_code(text,text,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_subscription_discount_code(text,text,uuid) TO service_role;

-- Client-selected avatar order IDs must never settle another product's reservation with the same ID.
-- Keep the original private settlement and its Promptbook callers intact, with a scoped entry point.
CREATE FUNCTION public.settle_subscription_discount_reservation(
    reservation_id uuid, is_redeemed boolean, reservation_place_id text
)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp
AS $$
BEGIN
    PERFORM pg_advisory_xact_lock(hashtextextended(reservation_id::text, 0));
    IF EXISTS (
        SELECT 1 FROM public.promptbook_discount_reservations AS reservation
        WHERE reservation.id = reservation_id AND reservation.place_id = reservation_place_id
    ) THEN
        PERFORM public.settle_promptbook_discount_reservation(reservation_id, is_redeemed);
    END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.settle_subscription_discount_reservation(uuid,boolean,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_subscription_discount_reservation(uuid,boolean,text) TO service_role;
COMMIT;

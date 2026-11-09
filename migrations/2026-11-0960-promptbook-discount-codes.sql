BEGIN;

ALTER TABLE public.discount_codes
    ADD COLUMN is_promoted boolean NOT NULL DEFAULT false,
    ADD CONSTRAINT discount_codes_promoted_exact_promptbook CHECK (
        NOT is_promoted OR (
            position('*' IN code) = 0
            AND place_ids && ARRAY['promptbook-start', 'promptbook-business']::text[]
        )
    );

-- Legacy all-places codes keep working on their existing offers. Promptbook must be selected explicitly.
CREATE OR REPLACE FUNCTION public.is_discount_code_open(
    discount public.discount_codes,
    discount_place_id text
)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT discount.is_enabled
       AND discount.starts_at <= now()
       AND discount.ends_at >= now()
       AND (
            discount_place_id = ANY (discount.place_ids)
            OR (
                cardinality(discount.place_ids) = 0
                AND discount_place_id NOT IN ('promptbook-start', 'promptbook-business')
            )
       );
$$;

CREATE TABLE public.promptbook_discount_reservations (
    id uuid PRIMARY KEY,
    discount_code_id uuid NOT NULL,
    submitted_code text NOT NULL,
    place_id text NOT NULL,
    code text NOT NULL,
    percent integer NOT NULL,
    remaining_use_count integer,
    subscription_discount_duration_months integer,
    state text NOT NULL DEFAULT 'reserved' CHECK (state IN ('reserved', 'redeemed', 'released')),
    created_at timestamptz NOT NULL DEFAULT now(),
    settled_at timestamptz
);

ALTER TABLE public.promptbook_discount_reservations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.promptbook_discount_reservations FROM PUBLIC, anon, authenticated;

-- An order can only take one use, even when checkout creation is retried. The conditional UPDATE
-- serializes claims for the last use and snapshots the same row that was actually decremented.
CREATE FUNCTION public.reserve_promptbook_discount_code(
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
    IF place_id NOT IN ('promptbook-start', 'promptbook-business') THEN
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

CREATE FUNCTION public.settle_promptbook_discount_reservation(
    reservation_id uuid,
    is_redeemed boolean
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    settled_discount_id uuid;
BEGIN
    PERFORM pg_advisory_xact_lock(hashtextextended(reservation_id::text, 0));
    UPDATE public.promptbook_discount_reservations AS reservation
    SET state = CASE WHEN is_redeemed THEN 'redeemed' ELSE 'released' END,
        settled_at = now()
    WHERE reservation.id = reservation_id AND reservation.state = 'reserved'
    RETURNING reservation.discount_code_id INTO settled_discount_id;

    IF NOT is_redeemed AND settled_discount_id IS NOT NULL THEN
        UPDATE public.discount_codes AS discount
        SET use_count = GREATEST(discount.use_count - 1, 0)
        WHERE discount.id = settled_discount_id;
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_promptbook_discount_code(text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.settle_promptbook_discount_reservation(uuid, boolean) FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.promptbook_discount_reservations TO service_role;
GRANT EXECUTE ON FUNCTION public.reserve_promptbook_discount_code(text, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.settle_promptbook_discount_reservation(uuid, boolean) TO service_role;

COMMIT;

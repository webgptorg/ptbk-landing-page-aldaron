-- Existing memberships and Stripe identifiers belong to the Developers community.
BEGIN;

ALTER TABLE public.community_memberships
    ADD COLUMN community_id text NOT NULL DEFAULT 'vyvojari',
    ADD CONSTRAINT community_memberships_community_id_check
        CHECK (community_id IN ('vyvojari', 'promptbook'));

CREATE UNIQUE INDEX community_memberships_community_email_key
    ON public.community_memberships (community_id, email);

DROP INDEX public.community_memberships_email_key;

CREATE FUNCTION public.get_scoped_community_membership_admin_page(
    target_community_id text,
    target_search_query text,
    target_status text,
    target_is_test_payment boolean,
    target_sort_by text,
    target_sort_direction text,
    target_limit integer,
    target_offset integer
)
RETURNS TABLE (
    id uuid,
    email text,
    fullname text,
    plan_id text,
    status text,
    monthly_price_czk integer,
    discount_code text,
    discount_percent integer,
    stripe_customer_id text,
    stripe_subscription_id text,
    stripe_checkout_session_id text,
    is_test_payment boolean,
    current_period_ends_at timestamptz,
    activated_at timestamptz,
    canceled_at timestamptz,
    created_at timestamptz,
    updated_at timestamptz,
    total_count bigint
)
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
    sort_column text := CASE target_sort_by
        WHEN 'updatedAt' THEN 'updated_at'
        WHEN 'createdAt' THEN 'created_at'
        WHEN 'fullname' THEN 'fullname'
        WHEN 'email' THEN 'email'
        WHEN 'status' THEN 'status'
        WHEN 'monthlyPriceCzk' THEN 'monthly_price_czk'
        WHEN 'activatedAt' THEN 'activated_at'
        WHEN 'currentPeriodEndsAt' THEN 'current_period_ends_at'
        WHEN 'canceledAt' THEN 'canceled_at'
    END;
    sort_direction text := CASE target_sort_direction
        WHEN 'ASCENDING' THEN 'ASC'
        WHEN 'DESCENDING' THEN 'DESC'
    END;
BEGIN
    IF target_community_id IS NULL OR target_community_id NOT IN ('vyvojari', 'promptbook')
        OR (target_status IS NOT NULL AND target_status NOT IN ('pending', 'active', 'past-due', 'canceled'))
        OR sort_column IS NULL OR sort_direction IS NULL
        OR target_limit IS NULL OR target_limit NOT BETWEEN 1 AND 200
        OR target_offset IS NULL OR target_offset < 0
    THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'COMMUNITY_MEMBERSHIP_PAGE_INVALID';
    END IF;

    RETURN QUERY EXECUTE format(
        'SELECT membership.id, membership.email, membership.fullname, membership.plan_id,
                membership.status, membership.monthly_price_czk, membership.discount_code,
                membership.discount_percent, membership.stripe_customer_id, membership.stripe_subscription_id,
                membership.stripe_checkout_session_id, membership.is_test_payment, membership.current_period_ends_at,
                membership.activated_at, membership.canceled_at, membership.created_at, membership.updated_at,
                count(*) OVER () AS total_count
            FROM public.community_memberships AS membership
            WHERE membership.community_id = $1
                AND (btrim($2) = '''' OR membership.fullname ILIKE ''%%'' || btrim($2) || ''%%''
                    OR membership.email ILIKE ''%%'' || btrim($2) || ''%%'')
                AND ($3 IS NULL OR membership.status = $3)
                AND ($4 IS NULL OR membership.is_test_payment = $4)
            ORDER BY membership.%I %s NULLS LAST, membership.id ASC
            LIMIT $5 OFFSET $6',
        sort_column, sort_direction
    ) USING target_community_id, target_search_query, target_status, target_is_test_payment, target_limit, target_offset;
END;
$$;

REVOKE ALL ON FUNCTION public.get_scoped_community_membership_admin_page(text, text, text, boolean, text, text, integer, integer)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_scoped_community_membership_admin_page(text, text, text, boolean, text, text, integer, integer)
    TO service_role;

COMMIT;

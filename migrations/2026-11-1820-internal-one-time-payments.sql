-- A completed zero-charge purchase has a real private receipt, without a fabricated Stripe charge.
-- The Contact insert, receipt, registration and existing Contact outbox triggers commit together.
BEGIN;

ALTER TABLE public."Contact" ADD COLUMN IF NOT EXISTS "oneTimePayment" jsonb;

CREATE TABLE public.internal_purchase_payments (
    id uuid PRIMARY KEY,
    contact_id integer NOT NULL UNIQUE,
    source text NOT NULL,
    status text NOT NULL CHECK (status = 'paid'),
    provider text NOT NULL CHECK (provider = 'internal'),
    method text NOT NULL CHECK (method = 'no_charge'),
    currency text NOT NULL CHECK (currency ~ '^[a-z]{3}$'),
    amount_before_waiver bigint NOT NULL CHECK (amount_before_waiver >= 0),
    waived_amount bigint NOT NULL CHECK (waived_amount = amount_before_waiver),
    amount_due bigint NOT NULL CHECK (amount_due = 0),
    amount_paid bigint NOT NULL CHECK (amount_paid = 0),
    settlement_reason text NOT NULL CHECK (settlement_reason IN ('zero_total', 'below_gateway_minimum')),
    gateway text NOT NULL,
    gateway_minimum_amount bigint NOT NULL CHECK (gateway_minimum_amount > 0),
    gateway_policy_version integer NOT NULL CHECK (gateway_policy_version > 0),
    completed_at timestamptz NOT NULL,
    buyer_snapshot jsonb NOT NULL,
    purchase_snapshot jsonb NOT NULL,
    receipt jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CHECK ((amount_before_waiver = 0 AND settlement_reason = 'zero_total') OR
        (amount_before_waiver > 0 AND amount_before_waiver < gateway_minimum_amount AND
            settlement_reason = 'below_gateway_minimum'))
);

COMMENT ON TABLE public.internal_purchase_payments IS
    'Immutable paid zero-charge receipts for one-time purchases. Invoice input uses amount_due=0 and the separate waiver, never treats amount_before_waiver as cash received. Not a Stripe payment test. No FK: accepted purchase evidence survives contact deletion.';

ALTER TABLE public.internal_purchase_payments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.internal_purchase_payments FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON public.internal_purchase_payments TO service_role;

CREATE FUNCTION public.record_internal_purchase_payment() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE payment jsonb := NEW."oneTimePayment"; purchase jsonb;
BEGIN
    IF payment IS NULL THEN RETURN NEW; END IF;
    -- Public lead submissions cannot supply oneTimePayment. Only the server's registration flow
    -- authors it, after calculating the offer and checking capacity and code scope.
    IF NEW."placeName" IS DISTINCT FROM 'AiSupervizeMiniWorkshopRegistration' OR
        NEW."isWaitlisted" IS TRUE OR payment->>'collection' IS DISTINCT FROM 'internal' OR
        payment->>'version' IS DISTINCT FROM '1' THEN
        RAISE EXCEPTION 'Invalid internal purchase payment source';
    END IF;
    purchase := NEW."userNote"::jsonb;
    IF purchase->>'registrationType' IS DISTINCT FROM 'AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION' OR
        (purchase->>'computedFinalPriceCzk') IS NULL OR
        round((purchase->>'computedFinalPriceCzk')::numeric * 100) IS DISTINCT FROM
            (payment->>'amountBeforeWaiver')::numeric THEN
        RAISE EXCEPTION 'Internal purchase payment does not match accepted price';
    END IF;
    INSERT INTO public.internal_purchase_payments (
        id, contact_id, source, status, provider, method, currency,
        amount_before_waiver, waived_amount, amount_due, amount_paid, settlement_reason,
        gateway, gateway_minimum_amount, gateway_policy_version, completed_at,
        buyer_snapshot, purchase_snapshot, receipt
    ) VALUES (
        (payment->>'id')::uuid, NEW.id, NEW."placeName", payment->>'status', payment->>'provider',
        payment->>'method', payment->>'currency', (payment->>'amountBeforeWaiver')::bigint,
        (payment->>'waivedAmount')::bigint, (payment->>'amountDue')::bigint,
        (payment->>'amountPaid')::bigint, payment->>'reason', payment->>'gateway',
        (payment->>'gatewayMinimumAmount')::bigint, (payment->>'gatewayPolicyVersion')::integer,
        (payment->>'completedAt')::timestamptz,
        jsonb_build_object('fullname', NEW.fullname, 'email', NEW.email,
            'company', purchase->'company', 'invoiceType', purchase->'invoiceType',
            'billingDetails', purchase->'billingDetails'),
        purchase, payment
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER contact_record_internal_purchase_payment AFTER INSERT ON public."Contact"
FOR EACH ROW WHEN (NEW."oneTimePayment" IS NOT NULL)
EXECUTE FUNCTION public.record_internal_purchase_payment();

CREATE FUNCTION public.protect_internal_purchase_payment() RETURNS trigger
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
    IF TG_TABLE_NAME = 'Contact' THEN
        IF NEW."oneTimePayment" IS DISTINCT FROM OLD."oneTimePayment" THEN
            RAISE EXCEPTION 'Accepted one-time payment receipt is immutable';
        END IF;
        RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Accepted one-time payment receipt is immutable';
END;
$$;

CREATE TRIGGER contact_protect_internal_purchase_payment BEFORE UPDATE OF "oneTimePayment" ON public."Contact"
FOR EACH ROW EXECUTE FUNCTION public.protect_internal_purchase_payment();
CREATE TRIGGER internal_purchase_payments_immutable BEFORE UPDATE OR DELETE ON public.internal_purchase_payments
FOR EACH ROW EXECUTE FUNCTION public.protect_internal_purchase_payment();

REVOKE ALL ON FUNCTION public.record_internal_purchase_payment() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.protect_internal_purchase_payment() FROM PUBLIC, anon, authenticated, service_role;
COMMIT;

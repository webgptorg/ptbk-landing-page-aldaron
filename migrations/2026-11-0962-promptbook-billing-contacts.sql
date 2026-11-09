BEGIN;

ALTER TABLE public."Contact"
    ADD COLUMN "promptbookBillingOrderId" uuid,
    ADD CONSTRAINT contact_promptbook_billing_order_unique UNIQUE ("promptbookBillingOrderId");

COMMENT ON COLUMN public."Contact"."promptbookBillingOrderId" IS
    'Stable source ID of a paid Promptbook subscription order, used to deduplicate payment and onboarding retries.';

COMMIT;

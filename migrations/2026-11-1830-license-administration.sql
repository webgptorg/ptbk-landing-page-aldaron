BEGIN;

-- Manual rights are independent of purchases. Revocation/deletion retain the original row and its audit.
ALTER TABLE public.promptbook_license_grants
 ADD COLUMN display_label text NOT NULL DEFAULT 'Individuální oprávnění',
 ADD COLUMN revoked_at timestamptz,
 ADD COLUMN deleted_at timestamptz,
 ADD COLUMN revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
 ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now(),
 ADD CONSTRAINT promptbook_grant_label CHECK (length(btrim(display_label)) BETWEEN 1 AND 120 AND display_label !~ '[<>[:cntrl:]]');

CREATE TABLE public.promptbook_license_grant_history (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 grant_id uuid NOT NULL REFERENCES public.promptbook_license_grants(id),
 action text NOT NULL CHECK (action IN ('grant','update','revoke','restore','delete')),
 actor text NOT NULL,
 reason text NOT NULL CHECK (length(btrim(reason)) BETWEEN 5 AND 1000),
 before_value jsonb,
 after_value jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.promptbook_license_grant_history ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.promptbook_license_grant_history FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.promptbook_license_grant_history TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.promptbook_license_grant_history_id_seq TO service_role;

-- One transaction, optimistic revision check, and no writes to orders, payments or subscriptions.
CREATE FUNCTION public.admin_mutate_promptbook_grant(
 p_action text, p_email text, p_grant uuid, p_revision integer, p_kind text,
 p_label text, p_capabilities jsonb, p_seats integer, p_from timestamptz,
 p_until timestamptz, p_reason text, p_actor text, p_is_test boolean
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE old_row public.promptbook_license_grants; new_row public.promptbook_license_grants; target_account uuid;
BEGIN
 IF p_action IS NULL OR p_action NOT IN ('grant','update','revoke','restore','delete')
 OR p_reason IS NULL OR length(btrim(p_reason)) NOT BETWEEN 5 AND 1000
 OR p_actor IS NULL OR length(btrim(p_actor)) NOT BETWEEN 1 AND 200 OR p_is_test IS NULL THEN
  RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='Invalid grant change';
 END IF;
 IF p_action IN ('grant','update') AND (
  p_kind IS NULL OR p_kind NOT IN ('custom','partner') OR p_label IS NULL
  OR length(btrim(p_label)) NOT BETWEEN 1 AND 120 OR p_capabilities IS NULL
  OR jsonb_typeof(p_capabilities)<>'object' OR p_seats IS NULL OR p_seats NOT BETWEEN 0 AND 1000
  OR p_from IS NULL OR (p_until IS NOT NULL AND p_until<=p_from)) THEN
  RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='Invalid grant values';
 END IF;
 IF p_action='grant' THEN
  IF p_email IS NULL OR length(p_email) NOT BETWEEN 3 AND 254 OR p_email<>lower(btrim(p_email)) THEN
   RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='Invalid account email';
  END IF;
  INSERT INTO public.promptbook_license_accounts(email,is_test) VALUES(p_email,p_is_test)
   ON CONFLICT(email,is_test) DO NOTHING;
  SELECT id INTO STRICT target_account FROM public.promptbook_license_accounts WHERE email=p_email AND is_test=p_is_test;
  -- Serialize retries by caller-supplied stable ID, before checking for an earlier successful insert.
  IF p_grant IS NOT NULL THEN
   PERFORM pg_advisory_xact_lock(hashtextextended(p_grant::text,0));
   SELECT * INTO old_row FROM public.promptbook_license_grants WHERE id=p_grant;
   IF FOUND THEN
    IF old_row.account_id=target_account AND old_row.kind=p_kind AND old_row.display_label=p_label
     AND old_row.capabilities=p_capabilities AND old_row.community_seats=p_seats AND old_row.valid_from=p_from
     AND old_row.valid_until IS NOT DISTINCT FROM p_until AND old_row.reason=p_reason THEN RETURN old_row.id; END IF;
    RAISE EXCEPTION USING ERRCODE='40001', MESSAGE='Grant request already used';
   END IF;
  END IF;
  INSERT INTO public.promptbook_license_grants(id,account_id,kind,display_label,capabilities,community_seats,valid_from,valid_until,reason)
   VALUES(coalesce(p_grant,gen_random_uuid()),target_account,p_kind,p_label,p_capabilities,p_seats,p_from,p_until,p_reason) RETURNING * INTO new_row;
 ELSE
  SELECT g.* INTO old_row FROM public.promptbook_license_grants g
   JOIN public.promptbook_license_accounts a ON a.id=g.account_id
   WHERE g.id=p_grant AND a.is_test=p_is_test FOR UPDATE OF g;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='P0002', MESSAGE='Grant not found'; END IF;
  IF p_revision IS NULL OR old_row.revision<>p_revision THEN
   RAISE EXCEPTION USING ERRCODE='40001', MESSAGE='Grant changed; reload before editing';
  END IF;
  -- A trial's single activation/campaign cannot be rewritten or restarted by this editor.
  IF old_row.kind='trial' OR old_row.deleted_at IS NOT NULL THEN
   RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='Grant is read only';
  END IF;
  UPDATE public.promptbook_license_grants SET
   kind=CASE WHEN p_action='update' THEN p_kind ELSE kind END,
   display_label=CASE WHEN p_action='update' THEN p_label ELSE display_label END,
   capabilities=CASE WHEN p_action='update' THEN p_capabilities ELSE capabilities END,
   community_seats=CASE WHEN p_action='update' THEN p_seats ELSE community_seats END,
   valid_from=CASE WHEN p_action='update' THEN p_from ELSE valid_from END,
   valid_until=CASE WHEN p_action='update' THEN p_until ELSE valid_until END,
   reason=CASE WHEN p_action='update' THEN p_reason ELSE reason END,
   revoked_at=CASE WHEN p_action IN ('revoke','delete') THEN now() WHEN p_action='restore' THEN NULL ELSE revoked_at END,
   deleted_at=CASE WHEN p_action='delete' THEN now() ELSE deleted_at END,
   revision=revision+1, updated_at=now()
   WHERE id=p_grant RETURNING * INTO new_row;
 END IF;
 INSERT INTO public.promptbook_license_grant_history(grant_id,action,actor,reason,before_value,after_value)
  VALUES(new_row.id,p_action,p_actor,p_reason,CASE WHEN p_action='grant' THEN NULL ELSE to_jsonb(old_row) END,to_jsonb(new_row));
 RETURN new_row.id;
END; $$;
REVOKE ALL ON FUNCTION public.admin_mutate_promptbook_grant(text,text,uuid,integer,text,text,jsonb,integer,timestamptz,timestamptz,text,text,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_mutate_promptbook_grant(text,text,uuid,integer,text,text,jsonb,integer,timestamptz,timestamptz,text,text,boolean) TO service_role;

-- These are private read models over the existing sources of truth, never a second billing system.
CREATE VIEW public.promptbook_admin_licenses WITH (security_invoker=true) AS
 SELECT rights.*, CASE WHEN deleted_at IS NOT NULL THEN 'deleted' WHEN revoked_at IS NOT NULL THEN 'revoked'
  WHEN evidence_missing THEN 'unverified' WHEN valid_from>now() THEN 'scheduled' WHEN valid_until IS NOT NULL AND valid_until<=now() THEN 'expired'
  ELSE 'active' END AS state
 FROM (
  SELECT g.id, a.id AS account_id, a.email, a.is_test, 'manual'::text AS source, g.kind,
   CASE WHEN g.kind='trial' THEN 'Business – zkušební období' ELSE g.display_label END AS label,
   g.valid_from,g.valid_until,g.capabilities,g.community_seats,g.revoked_at,g.deleted_at,g.revision,g.reason,g.created_at,
   NULL::uuid AS order_id, false AS evidence_missing
  FROM public.promptbook_license_grants g JOIN public.promptbook_license_accounts a ON a.id=g.account_id
  UNION ALL
  SELECT o.id,a.id,o.email,o.is_test,'subscription', 'subscription',
   CASE o.plan WHEN 'business' THEN 'Business' ELSE 'Start' END,
   o.confirmed_at,CASE WHEN receipts.retained_until IS NOT NULL THEN least(o.paid_through,receipts.retained_until) ELSE o.paid_through END,
   jsonb_build_object('engineProjects',1,'specialists',CASE o.plan WHEN 'business' THEN 10 ELSE 3 END,
    'controllingUsers',CASE o.plan WHEN 'business' THEN 5 ELSE 1 END,
    'harnessInstances',CASE o.plan WHEN 'business' THEN NULL ELSE 1 END,
    'browserProfiles',CASE o.plan WHEN 'business' THEN 5 ELSE 1 END,'remoteControl',true),
   CASE o.plan WHEN 'business' THEN 10 ELSE 1 END,
   CASE WHEN receipts.invoice_count>0 AND receipts.retained_until IS NULL THEN o.confirmed_at ELSE NULL::timestamptz END,
   NULL::timestamptz,o.revision,'Licence z potvrzeného předplatného',o.created_at,o.id,
   receipts.invoice_count>0 AND NOT receipts.period_verified
  FROM public.promptbook_orders o LEFT JOIN public.promptbook_license_accounts a ON a.email=o.email AND a.is_test=o.is_test
  LEFT JOIN LATERAL (
   SELECT count(*) AS invoice_count,
    max(i.paid_through) FILTER (WHERE i.amount_paid=0 OR i.refunded_amount<i.amount_paid) AS retained_until,
    coalesce(bool_or(i.paid_through=o.paid_through),false) AS period_verified
   FROM public.promptbook_invoices i WHERE i.order_id=o.id
  ) receipts ON true
  WHERE o.confirmed_at IS NOT NULL AND o.stripe_subscription_id IS NOT NULL AND o.paid_through IS NOT NULL
 ) rights;

CREATE VIEW public.promptbook_admin_subscriptions WITH (security_invoker=true) AS
 SELECT 'promptbook'::text AS product,id,email,is_test,created_at,status,plan AS label,
  NULL::text AS community_id,stripe_subscription_id,stripe_customer_id,stripe_session_id,
  paid_through,cancel_at_period_end,discount_code,base_amount,'czk'::text AS currency
 FROM public.promptbook_orders
 UNION ALL
 SELECT 'community',id,email,is_test_payment,created_at,status,plan_id,community_id,
  stripe_subscription_id,stripe_customer_id,stripe_checkout_session_id,current_period_ends_at,
  is_cancellation_scheduled,discount_code,monthly_price_czk*100,'czk'
 FROM public.community_memberships
 UNION ALL
 SELECT 'avatar',id,email,is_test,created_at,status,'Pavol Hejný AI – Full',NULL,
  stripe_subscription_id,stripe_customer_id,stripe_session_id,paid_through,cancel_at_period_end,
  discount_code,base_amount,currency
 FROM public.avatar_orders;
REVOKE ALL ON public.promptbook_admin_licenses,public.promptbook_admin_subscriptions FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.promptbook_admin_licenses,public.promptbook_admin_subscriptions TO service_role;
COMMIT;

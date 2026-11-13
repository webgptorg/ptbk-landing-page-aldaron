BEGIN;
CREATE TABLE public.promptbook_license_accounts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 email text NOT NULL CHECK (email = lower(trim(email))),
 is_test boolean NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(email, is_test)
);
CREATE TABLE public.promptbook_license_grants (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 account_id uuid NOT NULL REFERENCES public.promptbook_license_accounts(id),
 kind text NOT NULL CHECK (kind IN ('trial','partner','custom')),
 campaign text,
 valid_from timestamptz NOT NULL DEFAULT now(),
 valid_until timestamptz,
 capabilities jsonb NOT NULL CHECK (jsonb_typeof(capabilities) = 'object'),
 community_seats integer NOT NULL DEFAULT 0 CHECK (community_seats >= 0),
 reason text NOT NULL,
 activation_evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(account_id, campaign),
 CHECK(valid_until IS NULL OR valid_until > valid_from)
);
CREATE TABLE public.promptbook_community_seats (
 account_id uuid NOT NULL REFERENCES public.promptbook_license_accounts(id),
 email text NOT NULL CHECK (email = lower(trim(email))),
 assigned_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(account_id,email)
);
CREATE TABLE public.promptbook_app_tickets (
 token_hash text PRIMARY KEY CHECK (token_hash ~ '^[a-f0-9]{64}$'),
 account_id uuid NOT NULL REFERENCES public.promptbook_license_accounts(id),
 challenge text NOT NULL CHECK(length(challenge) BETWEEN 32 AND 128),
 expires_at timestamptz NOT NULL,
 consumed_at timestamptz
);
CREATE TABLE public.promptbook_referral_history (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 account_id uuid REFERENCES public.promptbook_license_accounts(id),
 order_id uuid REFERENCES public.promptbook_orders(id),
 code text,
 provenance text NOT NULL,
 reason text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (account_id IS NOT NULL OR order_id IS NOT NULL)
);
ALTER TABLE public.promptbook_orders ADD COLUMN referral_code text;
ALTER TABLE public.promptbook_license_accounts ADD COLUMN referral_code text;
ALTER TABLE public."Contact" ADD COLUMN "promptbookTrialGrantId" uuid UNIQUE;
ALTER TABLE public.promptbook_license_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promptbook_license_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promptbook_community_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promptbook_app_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promptbook_referral_history ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.promptbook_license_accounts, public.promptbook_license_grants,
 public.promptbook_community_seats, public.promptbook_app_tickets, public.promptbook_referral_history FROM anon, authenticated;
GRANT ALL ON public.promptbook_license_accounts, public.promptbook_license_grants,
 public.promptbook_community_seats, public.promptbook_app_tickets, public.promptbook_referral_history TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.promptbook_referral_history_id_seq TO service_role;

-- Service-only atomic activation: concurrent requests and reloads cannot restart the trial.
CREATE FUNCTION public.activate_promptbook_trial(p_account uuid, p_campaign text, p_capabilities jsonb, p_evidence jsonb, p_acceptance jsonb)
RETURNS uuid LANGUAGE plpgsql SET search_path = public AS $$
DECLARE grant_id uuid; account_row public.promptbook_license_accounts;
BEGIN
 SELECT * INTO STRICT account_row FROM public.promptbook_license_accounts WHERE id=p_account FOR UPDATE;
 SELECT id INTO grant_id FROM public.promptbook_license_grants WHERE account_id=p_account AND campaign=p_campaign;
 IF grant_id IS NOT NULL THEN RETURN grant_id; END IF;
 INSERT INTO public.promptbook_license_grants(account_id,kind,campaign,valid_until,capabilities,community_seats,reason,activation_evidence)
 VALUES(p_account,'trial',p_campaign,now()+interval '14 days',p_capabilities,10,'Explicit activation after engine preparation',p_acceptance) RETURNING id INTO grant_id;
 IF NOT account_row.is_test THEN
 INSERT INTO public."Contact"(email,"appName","placeName","isContacted","isWaitlisted","userNote","submissionEvidence","promptbookTrialGrantId")
 VALUES(account_row.email,'Promptbook','promptbook-business-trial',false,false,
 'Výslovná aktivace 14denní Business zkoušky bez karty; doporučení: '||coalesce(account_row.referral_code,'neuvedeno'),p_evidence,grant_id);
 END IF;
 RETURN grant_id;
END; $$;
REVOKE ALL ON FUNCTION public.activate_promptbook_trial(uuid,text,jsonb,jsonb,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.activate_promptbook_trial(uuid,text,jsonb,jsonb,jsonb) TO service_role;

-- Serialize membership allocation on the account; an over-capacity software warning is not a community grant.
CREATE FUNCTION public.assign_promptbook_community_seat(p_account uuid,p_email text,p_limit integer)
RETURNS boolean LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 PERFORM 1 FROM public.promptbook_license_accounts WHERE id=p_account FOR UPDATE;
 IF EXISTS(SELECT 1 FROM public.promptbook_community_seats WHERE account_id=p_account AND email=p_email) THEN RETURN true; END IF;
 IF (SELECT count(*) FROM public.promptbook_community_seats WHERE account_id=p_account)>=p_limit THEN RETURN false; END IF;
 INSERT INTO public.promptbook_community_seats(account_id,email) VALUES(p_account,p_email);
 RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.assign_promptbook_community_seat(uuid,text,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assign_promptbook_community_seat(uuid,text,integer) TO service_role;
CREATE FUNCTION public.audit_promptbook_order_referral() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF TG_OP='INSERT' OR NEW.referral_code IS DISTINCT FROM OLD.referral_code THEN
  INSERT INTO public.promptbook_referral_history(order_id,code,provenance,reason)
  VALUES(NEW.id,NEW.referral_code,'checkout','Customer attribution; manual commission confirmation required');
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER promptbook_order_referral_audit AFTER INSERT OR UPDATE OF referral_code ON public.promptbook_orders
FOR EACH ROW EXECUTE FUNCTION public.audit_promptbook_order_referral();
CREATE FUNCTION public.correct_promptbook_referral(p_account uuid,p_code text,p_reason text) RETURNS void
LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 PERFORM 1 FROM public.promptbook_license_accounts WHERE id=p_account FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Account not found'; END IF;
 INSERT INTO public.promptbook_referral_history(account_id,code,provenance,reason) VALUES(p_account,p_code,'admin',p_reason);
 UPDATE public.promptbook_license_accounts SET referral_code=p_code WHERE id=p_account;
END; $$;
REVOKE ALL ON FUNCTION public.correct_promptbook_referral(uuid,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.correct_promptbook_referral(uuid,text,text) TO service_role;
CREATE FUNCTION public.set_promptbook_customer_referral(p_account uuid,p_code text,p_provenance text) RETURNS void
LANGUAGE plpgsql SET search_path=public AS $$
DECLARE current_code text;
BEGIN
 IF p_provenance NOT IN ('link','customer') THEN RAISE EXCEPTION 'Invalid provenance'; END IF;
 SELECT referral_code INTO STRICT current_code FROM public.promptbook_license_accounts WHERE id=p_account FOR UPDATE;
 IF current_code IS NOT DISTINCT FROM p_code THEN RETURN; END IF;
 INSERT INTO public.promptbook_referral_history(account_id,code,provenance,reason)
 VALUES(p_account,p_code,p_provenance,'Customer attribution, not a confirmed commission');
 UPDATE public.promptbook_license_accounts SET referral_code=p_code WHERE id=p_account;
END; $$;
REVOKE ALL ON FUNCTION public.set_promptbook_customer_referral(uuid,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_promptbook_customer_referral(uuid,text,text) TO service_role;
COMMIT;

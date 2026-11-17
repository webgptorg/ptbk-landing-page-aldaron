-- Isolated, private connector credentials and Telegram delivery state for Pavol Avatar.
CREATE TABLE IF NOT EXISTS public.pavol_avatar_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.avatar_principals(id) ON DELETE CASCADE,
    label text NOT NULL CHECK (char_length(label) BETWEEN 1 AND 80),
    token_hash text NOT NULL UNIQUE CHECK (token_hash ~ '^[a-f0-9]{64}$'),
    created_at timestamptz NOT NULL DEFAULT now(),
    revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS pavol_avatar_tokens_user_idx ON public.pavol_avatar_tokens(user_id);
CREATE TABLE IF NOT EXISTS public.pavol_avatar_telegram_links (
    telegram_user_id text PRIMARY KEY CHECK (telegram_user_id ~ '^[0-9]{1,20}$'),
    user_id uuid NOT NULL REFERENCES public.avatar_principals(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.pavol_avatar_telegram_codes (
    code_hash text PRIMARY KEY CHECK (code_hash ~ '^[a-f0-9]{64}$'),
    user_id uuid NOT NULL UNIQUE REFERENCES public.avatar_principals(id) ON DELETE CASCADE,
    expires_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pavol_avatar_telegram_codes_expiry_idx ON public.pavol_avatar_telegram_codes(expires_at);
CREATE TABLE IF NOT EXISTS public.pavol_avatar_telegram_updates (
    update_id bigint PRIMARY KEY,
    telegram_user_id text NOT NULL CHECK (telegram_user_id ~ '^[0-9]{1,20}$'),
    status text NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
    claim_id uuid NOT NULL,
    claimed_at timestamptz NOT NULL DEFAULT now(),
    response text,
    sent_chunks integer NOT NULL DEFAULT 0 CHECK (sent_chunks >= 0)
);
ALTER TABLE public.pavol_avatar_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pavol_avatar_telegram_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pavol_avatar_telegram_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pavol_avatar_telegram_updates ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pavol_avatar_tokens, public.pavol_avatar_telegram_links,
    public.pavol_avatar_telegram_codes, public.pavol_avatar_telegram_updates FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.pavol_avatar_tokens, public.pavol_avatar_telegram_links,
    public.pavol_avatar_telegram_codes, public.pavol_avatar_telegram_updates TO service_role;

CREATE OR REPLACE FUNCTION public.avatar_consume_telegram_code(p_code_hash text, p_telegram_user_id text)
RETURNS TABLE(user_id uuid) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user_id uuid;
BEGIN
    IF p_telegram_user_id !~ '^[0-9]{1,20}$' THEN RETURN; END IF;
    DELETE FROM public.pavol_avatar_telegram_codes c
        WHERE c.code_hash = p_code_hash AND c.expires_at > now() RETURNING c.user_id INTO v_user_id;
    IF v_user_id IS NULL THEN RETURN; END IF;
    INSERT INTO public.pavol_avatar_telegram_links(telegram_user_id, user_id)
        VALUES(p_telegram_user_id, v_user_id)
        ON CONFLICT(telegram_user_id) DO UPDATE SET user_id = EXCLUDED.user_id, created_at = now();
    RETURN QUERY SELECT v_user_id;
END;
$$;

-- A successful claim is durable across instances. Failed/expired workers can resume stored reply delivery.
CREATE OR REPLACE FUNCTION public.avatar_claim_telegram_update(
    p_update_id bigint, p_telegram_user_id text, p_claim_id uuid
) RETURNS TABLE(claimed boolean, response text, sent_chunks integer, pending boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.pavol_avatar_telegram_updates%ROWTYPE;
BEGIN
    INSERT INTO public.pavol_avatar_telegram_updates(update_id, telegram_user_id, status, claim_id)
        VALUES(p_update_id, p_telegram_user_id, 'processing', p_claim_id) ON CONFLICT DO NOTHING;
    SELECT * INTO v_row FROM public.pavol_avatar_telegram_updates u WHERE u.update_id = p_update_id FOR UPDATE;
    IF v_row.telegram_user_id <> p_telegram_user_id OR v_row.status = 'completed' THEN
        RETURN QUERY SELECT false, NULL::text, 0, false; RETURN;
    END IF;
    IF v_row.claim_id <> p_claim_id AND v_row.status = 'processing' AND v_row.claimed_at > now() - interval '3 minutes' THEN
        RETURN QUERY SELECT false, NULL::text, 0, true; RETURN;
    END IF;
    UPDATE public.pavol_avatar_telegram_updates SET status = 'processing', claim_id = p_claim_id, claimed_at = now()
        WHERE update_id = p_update_id;
    RETURN QUERY SELECT true, v_row.response, v_row.sent_chunks, false;
END;
$$;
REVOKE ALL ON FUNCTION public.avatar_consume_telegram_code(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.avatar_claim_telegram_update(bigint, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.avatar_consume_telegram_code(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.avatar_claim_telegram_update(bigint, text, uuid) TO service_role;

-- Disconnect revokes outstanding pairing links in the same transaction.
CREATE OR REPLACE FUNCTION public.avatar_disconnect_telegram_account(p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    DELETE FROM public.pavol_avatar_telegram_codes WHERE user_id = p_user_id;
    DELETE FROM public.pavol_avatar_telegram_links WHERE user_id = p_user_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.avatar_disconnect_telegram_user(p_telegram_user_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user_id uuid;
BEGIN
    SELECT user_id INTO v_user_id FROM public.pavol_avatar_telegram_links WHERE telegram_user_id = p_telegram_user_id;
    IF v_user_id IS NOT NULL THEN
        DELETE FROM public.pavol_avatar_telegram_codes WHERE user_id = v_user_id;
        DELETE FROM public.pavol_avatar_telegram_links WHERE telegram_user_id = p_telegram_user_id AND user_id = v_user_id;
    END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.avatar_disconnect_telegram_account(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.avatar_disconnect_telegram_user(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.avatar_disconnect_telegram_account(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.avatar_disconnect_telegram_user(text) TO service_role;

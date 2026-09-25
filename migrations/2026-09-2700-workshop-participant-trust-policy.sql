-- Room-local trust policy and an atomic, reviewed promotion of existing participants.
BEGIN;

ALTER TABLE public.workshops
    ADD COLUMN is_auto_trust_new_participants boolean NOT NULL DEFAULT false;

-- Read the policy at identity creation, never on a later room fetch. The room lock orders joins with bulk promotion,
-- so a join cannot slip between the reviewed set and its update. The row lock orders joins with policy changes.
CREATE FUNCTION public.apply_workshop_participant_trust_policy()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    PERFORM pg_advisory_xact_lock(hashtext('workshop-participant-trust'), hashtext(NEW.workshop_id::text));
    SELECT workshop.is_auto_trust_new_participants
    INTO NEW.is_trusted
    FROM public.workshops AS workshop
    WHERE workshop.id = NEW.workshop_id
    FOR SHARE;

    RETURN NEW;
END;
$$;

CREATE TRIGGER workshop_participants_apply_trust_policy
BEFORE INSERT ON public.workshop_participants
FOR EACH ROW
EXECUTE FUNCTION public.apply_workshop_participant_trust_policy();

-- Counts and the preview token always describe the complete room, independent of admin filters or pages.
CREATE FUNCTION public.get_workshop_participant_trust_summary(target_workshop_id uuid)
RETURNS TABLE (
    trusted_count bigint,
    untrusted_count bigint,
    moderator_count bigint,
    eligible_count bigint,
    eligibility_token text,
    is_automatic_trust_enabled boolean
)
LANGUAGE sql VOLATILE
SET search_path = public, pg_temp
AS $$
    SELECT
        count(participant.id) FILTER (WHERE NOT participant.is_moderator AND participant.is_trusted),
        count(participant.id) FILTER (WHERE NOT participant.is_moderator AND NOT participant.is_trusted),
        count(participant.id) FILTER (WHERE participant.is_moderator),
        count(participant.id) FILTER (WHERE NOT participant.is_moderator AND NOT participant.is_trusted),
        md5(COALESCE(string_agg(participant.id::text, ',' ORDER BY participant.id)
            FILTER (WHERE NOT participant.is_moderator AND NOT participant.is_trusted), '')),
        workshop.is_auto_trust_new_participants
    FROM public.workshops AS workshop
    LEFT JOIN public.workshop_participants AS participant ON participant.workshop_id = workshop.id
    WHERE workshop.id = target_workshop_id
    GROUP BY workshop.id;
$$;

CREATE FUNCTION public.set_workshop_automatic_participant_trust(
    target_workshop_id uuid,
    is_new_participant_trust_enabled boolean
)
RETURNS TABLE (
    trusted_count bigint,
    untrusted_count bigint,
    moderator_count bigint,
    eligible_count bigint,
    eligibility_token text,
    is_automatic_trust_enabled boolean
)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.workshops
    SET is_auto_trust_new_participants = is_new_participant_trust_enabled
    WHERE id = target_workshop_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Workshop not found';
    END IF;

    RETURN QUERY SELECT * FROM public.get_workshop_participant_trust_summary(target_workshop_id);
END;
$$;

CREATE FUNCTION public.trust_all_workshop_participants(
    target_workshop_id uuid,
    expected_eligibility_token text
)
RETURNS TABLE (is_stale boolean, changed_count bigint)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    current_eligibility_token text;
    changed_participant_count bigint;
BEGIN
    -- The advisory lock blocks new identities at their insert trigger. The lighter parent lock keeps the room
    -- present without deadlocking an individual promotion whose approval trigger inserts an agent job for it.
    PERFORM pg_advisory_xact_lock(hashtext('workshop-participant-trust'), hashtext(target_workshop_id::text));
    PERFORM 1 FROM public.workshops WHERE id = target_workshop_id FOR KEY SHARE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Workshop not found';
    END IF;

    PERFORM 1 FROM public.workshop_participants
    WHERE workshop_id = target_workshop_id
    FOR UPDATE;

    SELECT summary.eligibility_token INTO current_eligibility_token
    FROM public.get_workshop_participant_trust_summary(target_workshop_id) AS summary;

    IF current_eligibility_token IS DISTINCT FROM expected_eligibility_token THEN
        RETURN QUERY SELECT true, 0::bigint;
        RETURN;
    END IF;

    -- The existing promotion trigger approves pending submissions in this same transaction, and its existing
    -- comment trigger enqueues newly approved comments without duplicate replies.
    UPDATE public.workshop_participants
    SET is_trusted = true
    WHERE workshop_id = target_workshop_id AND NOT is_trusted AND NOT is_moderator;
    GET DIAGNOSTICS changed_participant_count = ROW_COUNT;

    RETURN QUERY SELECT false, changed_participant_count;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_workshop_participant_trust_policy(),
    public.get_workshop_participant_trust_summary(uuid),
    public.set_workshop_automatic_participant_trust(uuid, boolean),
    public.trust_all_workshop_participants(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_workshop_participant_trust_policy() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_workshop_participant_trust_summary(uuid),
    public.set_workshop_automatic_participant_trust(uuid, boolean),
    public.trust_all_workshop_participants(uuid, text) TO service_role;

COMMIT;

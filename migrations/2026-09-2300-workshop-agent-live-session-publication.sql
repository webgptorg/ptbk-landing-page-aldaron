-- Lock the live capture while publishing its question. A concurrent Stop or
-- replacement must commit either before the validity check or after publication.
-- Keep the original agent migration immutable for databases which applied it.
BEGIN;

CREATE OR REPLACE FUNCTION public.finish_workshop_agent_job(target_job_id uuid, target_lease_token uuid,
    target_body text DEFAULT NULL, target_error_code text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE
    job public.workshop_agent_jobs;
    agent public.workshop_agents;
    assignment public.workshop_agent_assignments;
    room public.workshops;
    source_comment public.workshop_comments;
    parent_comment public.workshop_comments;
    saved_comment_id uuid;
    is_valid boolean;
BEGIN
    SELECT * INTO job FROM public.workshop_agent_jobs WHERE id = target_job_id FOR UPDATE;
    IF job.id IS NULL OR job.status <> 'running' OR job.lease_token IS DISTINCT FROM target_lease_token OR job.lease_until <= now() THEN RETURN NULL; END IF;
    IF target_error_code IS NOT NULL THEN
        UPDATE public.workshop_agent_jobs SET status = CASE WHEN attempts >= 3 THEN 'failed' ELSE 'pending' END,
            error_code = left(target_error_code, 100), available_at = now() + make_interval(secs => 30 * attempts),
            lease_until = NULL, lease_token = NULL, finished_at = CASE WHEN attempts >= 3 THEN now() ELSE NULL END
        WHERE id = job.id;
        RETURN NULL;
    END IF;
    SELECT * INTO agent FROM public.workshop_agents WHERE id = job.agent_id FOR SHARE;
    SELECT * INTO assignment FROM public.workshop_agent_assignments WHERE workshop_id = job.workshop_id AND agent_id = job.agent_id FOR SHARE;
    SELECT * INTO room FROM public.workshops WHERE id = job.workshop_id FOR SHARE;
    is_valid := agent.is_enabled AND agent.book_source = job.book_source AND agent.name = job.agent_name
        AND room.is_published AND NOT room.is_deleted AND room.external_url IS NULL
        AND room.room_kind IN ('workshop', 'community') AND NOT ('chat' = ANY(room.disabled_panels));
    IF job.trigger_comment_id IS NOT NULL THEN
        SELECT * INTO source_comment FROM public.workshop_comments WHERE id = job.trigger_comment_id FOR SHARE;
        SELECT * INTO parent_comment FROM public.workshop_comments WHERE id = coalesce(source_comment.parent_comment_id, source_comment.id) FOR SHARE;
        is_valid := is_valid AND assignment.is_reply_enabled AND source_comment.status = 'approved'
            AND source_comment.body = job.source_body AND parent_comment.status = 'approved';
        IF source_comment.participant_id IS NOT NULL THEN
            PERFORM 1 FROM public.workshop_participants WHERE id = source_comment.participant_id AND NOT is_interaction_banned FOR SHARE;
            is_valid := is_valid AND FOUND;
        END IF;
    ELSE
        is_valid := is_valid AND assignment.is_listening AND room.room_kind = 'workshop'
            AND room.starts_at <= now() AND (room.ends_at IS NULL OR room.ends_at > now())
            AND job.created_at > now() - interval '2 minutes';
        -- Unlike an EXISTS-only check, this waits for a concurrent Stop and keeps
        -- the surviving session stable until the reply and job commit together.
        PERFORM 1 FROM public.workshop_agent_audio_sessions AS session
            JOIN public.workshop_agent_transcripts AS transcript
                ON transcript.session_id = session.session_id AND transcript.workshop_id = session.workshop_id
            WHERE session.workshop_id = job.workshop_id AND session.expires_at > now() AND transcript.id = job.transcript_id
            FOR SHARE OF session, transcript;
        is_valid := is_valid AND FOUND;
    END IF;
    IF is_valid IS TRUE AND target_body IS NOT NULL AND char_length(btrim(target_body)) BETWEEN 1 AND 2000 THEN
        INSERT INTO public.workshop_comments
            (workshop_id, participant_id, parent_comment_id, author_name, body, status, is_artificial, origin,
                agent_id, agent_job_id, agent_turn_depth, moderated_at)
        VALUES (job.workshop_id, NULL, parent_comment.id, job.agent_name, btrim(target_body), 'approved', true, 'agent',
            job.agent_id, job.id, job.turn_depth, now()) RETURNING id INTO saved_comment_id;
    END IF;
    UPDATE public.workshop_agent_jobs SET status = CASE WHEN saved_comment_id IS NULL THEN 'skipped' ELSE 'replied' END,
        finished_at = now(), lease_until = NULL, lease_token = NULL WHERE id = job.id;
    RETURN saved_comment_id;
END;
$$;

COMMIT;

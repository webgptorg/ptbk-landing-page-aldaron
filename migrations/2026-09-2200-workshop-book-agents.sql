-- Reusable Book personalities, room assignments and a durable, leased reply queue.
-- Public chat still reads workshop_comments. Only the service role can read Books,
-- transcripts, jobs or their provenance; bots never acquire participant sessions.
BEGIN;

CREATE TABLE public.workshop_agents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 200),
    book_source text NOT NULL CHECK (char_length(btrim(book_source)) BETWEEN 3 AND 50000),
    is_enabled boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.workshop_agent_assignments (
    workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
    agent_id uuid NOT NULL REFERENCES public.workshop_agents(id) ON DELETE CASCADE,
    is_reply_enabled boolean NOT NULL DEFAULT false,
    is_listening boolean NOT NULL DEFAULT false,
    reply_cooldown_seconds integer NOT NULL DEFAULT 60 CHECK (reply_cooldown_seconds BETWEEN 15 AND 3600),
    question_interval_seconds integer NOT NULL DEFAULT 180 CHECK (question_interval_seconds BETWEEN 60 AND 3600),
    next_reply_at timestamptz NOT NULL DEFAULT now(),
    next_question_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (workshop_id, agent_id)
);

CREATE TABLE public.workshop_agent_audio_sessions (
    workshop_id uuid PRIMARY KEY REFERENCES public.workshops(id) ON DELETE CASCADE,
    session_id uuid NOT NULL,
    expires_at timestamptz NOT NULL,
    last_sequence integer NOT NULL DEFAULT -1,
    next_chunk_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.workshop_agent_transcripts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
    session_id uuid NOT NULL,
    sequence integer NOT NULL CHECK (sequence >= 0),
    body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 6000),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (id, workshop_id),
    UNIQUE (workshop_id, session_id, sequence)
);
CREATE INDEX workshop_agent_transcripts_recent_idx ON public.workshop_agent_transcripts (workshop_id, created_at DESC);

ALTER TABLE public.workshop_comments
    ADD COLUMN origin text NOT NULL DEFAULT 'user' CHECK (origin IN ('user', 'artificial', 'agent')),
    ADD COLUMN agent_id uuid REFERENCES public.workshop_agents(id),
    ADD COLUMN agent_job_id uuid,
    ADD COLUMN agent_turn_depth integer NOT NULL DEFAULT 0 CHECK (agent_turn_depth BETWEEN 0 AND 2);
UPDATE public.workshop_comments SET origin = 'artificial' WHERE is_artificial;
-- is_artificial remains the legacy synthetic-activity shortcut for links and analytics.
ALTER TABLE public.workshop_comments ADD CONSTRAINT workshop_comments_origin_identity CHECK (
    (origin = 'user' AND NOT is_artificial AND participant_id IS NOT NULL AND agent_id IS NULL AND agent_job_id IS NULL AND agent_turn_depth = 0)
    OR (origin = 'artificial' AND is_artificial AND participant_id IS NULL AND agent_id IS NULL AND agent_job_id IS NULL AND agent_turn_depth = 0)
    OR (origin = 'agent' AND is_artificial AND participant_id IS NULL AND agent_id IS NOT NULL AND agent_job_id IS NOT NULL AND agent_turn_depth > 0)
);

CREATE TABLE public.workshop_agent_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
    agent_id uuid NOT NULL REFERENCES public.workshop_agents(id),
    trigger_comment_id uuid,
    transcript_id uuid,
    turn_depth integer NOT NULL CHECK (turn_depth BETWEEN 1 AND 2),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'replied', 'skipped', 'failed')),
    attempts integer NOT NULL DEFAULT 0,
    available_at timestamptz NOT NULL DEFAULT now(),
    lease_token uuid,
    lease_until timestamptz,
    -- Snapshots describe exactly the personality and stimulus used by this run.
    book_source text,
    agent_name text,
    source_body text,
    error_code text,
    created_at timestamptz NOT NULL DEFAULT now(),
    finished_at timestamptz,
    UNIQUE (id, workshop_id, agent_id),
    UNIQUE (agent_id, trigger_comment_id),
    UNIQUE (agent_id, transcript_id),
    CHECK ((trigger_comment_id IS NULL) <> (transcript_id IS NULL)),
    FOREIGN KEY (trigger_comment_id, workshop_id) REFERENCES public.workshop_comments(id, workshop_id) ON DELETE CASCADE,
    FOREIGN KEY (transcript_id, workshop_id) REFERENCES public.workshop_agent_transcripts(id, workshop_id) ON DELETE CASCADE
);
CREATE INDEX workshop_agent_jobs_queue_idx ON public.workshop_agent_jobs (available_at, created_at)
    WHERE status IN ('pending', 'running');
CREATE INDEX workshop_agent_jobs_room_idx ON public.workshop_agent_jobs (workshop_id, created_at DESC);
CREATE UNIQUE INDEX workshop_comments_agent_job_idx ON public.workshop_comments (agent_job_id) WHERE agent_job_id IS NOT NULL;
ALTER TABLE public.workshop_comments ADD CONSTRAINT workshop_comments_agent_job_fk
    FOREIGN KEY (agent_job_id, workshop_id, agent_id)
    REFERENCES public.workshop_agent_jobs(id, workshop_id, agent_id) ON DELETE CASCADE;

ALTER TABLE public.workshop_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_agent_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_agent_audio_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_agent_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_agent_jobs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.workshop_agents, public.workshop_agent_assignments, public.workshop_agent_audio_sessions,
    public.workshop_agent_transcripts, public.workshop_agent_jobs FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.workshop_agents, public.workshop_agent_assignments, public.workshop_agent_audio_sessions,
    public.workshop_agent_transcripts, public.workshop_agent_jobs TO service_role;

-- Saving the reusable definition and its assignment is one operation. No room gets
-- an agent merely because it exists in the shared library.
CREATE FUNCTION public.save_workshop_agent(
    target_workshop_id uuid, target_agent_id uuid, target_name text, target_book_source text,
    target_is_enabled boolean, target_is_reply_enabled boolean, target_is_listening boolean,
    target_reply_cooldown_seconds integer, target_question_interval_seconds integer
) RETURNS uuid LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE saved_agent_id uuid;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.workshops WHERE id = target_workshop_id AND NOT is_deleted
        AND room_kind IN ('workshop', 'community') AND external_url IS NULL
        AND (NOT target_is_listening OR room_kind = 'workshop')) THEN
        RAISE EXCEPTION 'WORKSHOP_AGENT_ROOM_INVALID';
    END IF;
    IF target_agent_id IS NULL THEN
        INSERT INTO public.workshop_agents (name, book_source, is_enabled)
        VALUES (btrim(target_name), target_book_source, target_is_enabled) RETURNING id INTO saved_agent_id;
    ELSE
        UPDATE public.workshop_agents SET name = btrim(target_name), book_source = target_book_source,
            is_enabled = target_is_enabled, updated_at = now()
        WHERE id = target_agent_id RETURNING id INTO saved_agent_id;
        IF saved_agent_id IS NULL THEN RAISE EXCEPTION 'WORKSHOP_AGENT_NOT_FOUND'; END IF;
    END IF;
    INSERT INTO public.workshop_agent_assignments
        (workshop_id, agent_id, is_reply_enabled, is_listening, reply_cooldown_seconds, question_interval_seconds)
    VALUES (target_workshop_id, saved_agent_id, target_is_reply_enabled, target_is_listening,
        target_reply_cooldown_seconds, target_question_interval_seconds)
    ON CONFLICT (workshop_id, agent_id) DO UPDATE SET
        is_reply_enabled = EXCLUDED.is_reply_enabled, is_listening = EXCLUDED.is_listening,
        reply_cooldown_seconds = EXCLUDED.reply_cooldown_seconds,
        question_interval_seconds = EXCLUDED.question_interval_seconds;
    RETURN saved_agent_id;
END;
$$;

-- Every approval path reaches this trigger: trusted users, manual moderators,
-- automatic approval, artificial messages, and other agents. Edits and repeated
-- approvals cannot restart a conversation. Replies stay one visual level deep.
CREATE FUNCTION public.enqueue_workshop_comment_agents() RETURNS trigger
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
    IF NEW.status <> 'approved' OR NEW.agent_turn_depth >= 2 THEN RETURN NEW; END IF;
    IF TG_OP = 'UPDATE' AND OLD.status = 'approved' THEN RETURN NEW; END IF;
    IF NOT EXISTS (SELECT 1 FROM public.workshops WHERE id = NEW.workshop_id AND is_published AND NOT is_deleted
        AND room_kind IN ('workshop', 'community') AND external_url IS NULL AND NOT ('chat' = ANY(disabled_panels))) THEN
        RETURN NEW;
    END IF;
    INSERT INTO public.workshop_agent_jobs (workshop_id, agent_id, trigger_comment_id, turn_depth)
    SELECT NEW.workshop_id, assignment.agent_id, NEW.id, NEW.agent_turn_depth + 1
    FROM public.workshop_agent_assignments AS assignment
    JOIN public.workshop_agents AS agent ON agent.id = assignment.agent_id
    WHERE assignment.workshop_id = NEW.workshop_id AND assignment.is_reply_enabled AND agent.is_enabled
        AND agent.id IS DISTINCT FROM NEW.agent_id
    ORDER BY assignment.next_reply_at, agent.id
    LIMIT CASE WHEN NEW.agent_turn_depth = 0 THEN 2 ELSE 1 END
    ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$$;
CREATE TRIGGER workshop_comments_enqueue_agents AFTER INSERT OR UPDATE OF status ON public.workshop_comments
    FOR EACH ROW EXECUTE FUNCTION public.enqueue_workshop_comment_agents();

CREATE FUNCTION public.enqueue_workshop_transcript_agents() RETURNS trigger
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.workshop_agent_audio_sessions
        WHERE workshop_id = NEW.workshop_id AND session_id = NEW.session_id AND expires_at > now()) THEN RETURN NEW; END IF;
    IF NOT EXISTS (SELECT 1 FROM public.workshops WHERE id = NEW.workshop_id AND room_kind = 'workshop'
        AND is_published AND NOT is_deleted AND external_url IS NULL AND NOT ('chat' = ANY(disabled_panels))
        AND starts_at <= now() AND (ends_at IS NULL OR ends_at > now())) THEN RETURN NEW; END IF;
    INSERT INTO public.workshop_agent_jobs (workshop_id, agent_id, transcript_id, turn_depth)
    SELECT NEW.workshop_id, assignment.agent_id, NEW.id, 1
    FROM public.workshop_agent_assignments AS assignment
    JOIN public.workshop_agents AS agent ON agent.id = assignment.agent_id
    WHERE assignment.workshop_id = NEW.workshop_id AND assignment.is_listening AND agent.is_enabled
        AND assignment.next_question_at <= now()
        AND NOT EXISTS (SELECT 1 FROM public.workshop_agent_jobs AS job WHERE job.workshop_id = NEW.workshop_id
            AND job.agent_id = agent.id AND job.transcript_id IS NOT NULL AND job.status IN ('pending', 'running'))
    ORDER BY assignment.next_question_at, agent.id LIMIT 2 ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$$;
CREATE TRIGGER workshop_transcripts_enqueue_agents AFTER INSERT ON public.workshop_agent_transcripts
    FOR EACH ROW EXECUTE FUNCTION public.enqueue_workshop_transcript_agents();

-- One live capture per room; stale browser sessions release themselves after 90s.
CREATE FUNCTION public.start_workshop_agent_audio(target_workshop_id uuid, target_session_id uuid)
RETURNS boolean LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
    INSERT INTO public.workshop_agent_audio_sessions (workshop_id, session_id, expires_at)
    VALUES (target_workshop_id, target_session_id, now() + interval '90 seconds')
    ON CONFLICT (workshop_id) DO UPDATE SET session_id = EXCLUDED.session_id, expires_at = EXCLUDED.expires_at,
        last_sequence = -1, next_chunk_at = now()
    WHERE workshop_agent_audio_sessions.expires_at < now();
    RETURN FOUND;
END;
$$;

-- Reserve before calling OpenAI, so duplicated uploads and simultaneous admin tabs
-- cannot transcribe twice. A failed upload stops that capture instead of retrying it.
CREATE FUNCTION public.reserve_workshop_agent_audio_chunk(target_workshop_id uuid, target_session_id uuid, target_sequence integer)
RETURNS boolean LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
    UPDATE public.workshop_agent_audio_sessions SET last_sequence = target_sequence,
        expires_at = now() + interval '90 seconds', next_chunk_at = now() + interval '5 seconds'
    WHERE workshop_id = target_workshop_id AND session_id = target_session_id AND expires_at > now()
        AND last_sequence < target_sequence AND next_chunk_at <= now();
    RETURN FOUND;
END;
$$;

-- The claim is shared across server instances. A short transaction lock serializes
-- claims in the same room; the durable lease protects the time spent awaiting AI.
CREATE FUNCTION public.claim_workshop_agent_job(target_workshop_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE claimed_job public.workshop_agent_jobs; candidate public.workshop_agent_jobs;
BEGIN
    UPDATE public.workshop_agent_jobs SET status = 'skipped', finished_at = now(), error_code = 'expired'
    WHERE status IN ('pending', 'running') AND (lease_until IS NULL OR lease_until < now())
        AND (created_at < now() - interval '30 minutes'
            OR (transcript_id IS NOT NULL AND created_at < now() - interval '2 minutes'));
    UPDATE public.workshop_agent_jobs SET status = 'failed', finished_at = now(), error_code = 'lease_expired'
    WHERE status = 'running' AND lease_until < now() AND attempts >= 3;

    SELECT job.* INTO candidate FROM public.workshop_agent_jobs AS job
    JOIN public.workshop_agents AS agent ON agent.id = job.agent_id AND agent.is_enabled
    JOIN public.workshop_agent_assignments AS assignment ON assignment.agent_id = job.agent_id AND assignment.workshop_id = job.workshop_id
    JOIN public.workshops AS room ON room.id = job.workshop_id
    WHERE (target_workshop_id IS NULL OR job.workshop_id = target_workshop_id)
        AND (job.status = 'pending' OR (job.status = 'running' AND job.lease_until < now()))
        AND job.attempts < 3 AND job.available_at <= now() AND assignment.next_reply_at <= now()
        AND room.is_published AND NOT room.is_deleted AND room.external_url IS NULL
        AND room.room_kind IN ('workshop', 'community') AND NOT ('chat' = ANY(room.disabled_panels))
        AND ((job.trigger_comment_id IS NOT NULL AND assignment.is_reply_enabled)
            OR (job.transcript_id IS NOT NULL AND assignment.is_listening AND room.room_kind = 'workshop'
                AND assignment.next_question_at <= now() AND room.starts_at <= now() AND (room.ends_at IS NULL OR room.ends_at > now())
                AND EXISTS (SELECT 1 FROM public.workshop_agent_audio_sessions AS session
                    JOIN public.workshop_agent_transcripts AS transcript ON transcript.session_id = session.session_id AND transcript.workshop_id = session.workshop_id
                    WHERE session.workshop_id = job.workshop_id AND session.expires_at > now() AND transcript.id = job.transcript_id)))
        AND (job.trigger_comment_id IS NULL OR EXISTS (
            SELECT 1 FROM public.workshop_comments AS source_comment
            JOIN public.workshop_comments AS parent_comment ON parent_comment.id = coalesce(source_comment.parent_comment_id, source_comment.id)
            WHERE source_comment.id = job.trigger_comment_id AND source_comment.status = 'approved' AND parent_comment.status = 'approved'
                AND (source_comment.participant_id IS NULL OR EXISTS (
                    SELECT 1 FROM public.workshop_participants WHERE id = source_comment.participant_id AND NOT is_interaction_banned))))
        AND NOT EXISTS (SELECT 1 FROM public.workshop_agent_jobs AS running_job WHERE running_job.workshop_id = job.workshop_id
            AND running_job.status = 'running' AND running_job.lease_until > now())
    ORDER BY job.available_at, job.created_at, job.id LIMIT 1 FOR UPDATE OF job SKIP LOCKED;
    IF candidate.id IS NULL THEN RETURN NULL; END IF;
    IF NOT pg_try_advisory_xact_lock(hashtextextended('workshop-agent:' || candidate.workshop_id::text, 0)) THEN RETURN NULL; END IF;
    IF EXISTS (SELECT 1 FROM public.workshop_agent_jobs WHERE workshop_id = candidate.workshop_id
        AND status = 'running' AND lease_until > now()) THEN RETURN NULL; END IF;

    UPDATE public.workshop_agent_jobs AS job SET status = 'running', attempts = attempts + 1,
        lease_token = gen_random_uuid(), lease_until = now() + interval '60 seconds', error_code = NULL,
        book_source = agent.book_source, agent_name = agent.name,
        source_body = CASE WHEN job.trigger_comment_id IS NOT NULL
            THEN (SELECT body FROM public.workshop_comments WHERE id = job.trigger_comment_id AND status = 'approved')
            ELSE (SELECT body FROM public.workshop_agent_transcripts WHERE id = job.transcript_id) END
    FROM public.workshop_agents AS agent WHERE job.id = candidate.id AND agent.id = job.agent_id RETURNING job.* INTO claimed_job;
    UPDATE public.workshop_agent_assignments SET next_reply_at = now() + make_interval(secs => reply_cooldown_seconds),
        next_question_at = CASE WHEN claimed_job.transcript_id IS NOT NULL THEN now() + make_interval(secs => question_interval_seconds) ELSE next_question_at END
    WHERE workshop_id = claimed_job.workshop_id AND agent_id = claimed_job.agent_id;
    RETURN to_jsonb(claimed_job);
END;
$$;

-- Recheck the current source, Book, assignment and room under locks before publishing.
-- An edit, rejection, ban, disable, deletion, timeout or ended live session wins over
-- an in-flight generation. Inserting the reply and completing its job are atomic.
CREATE FUNCTION public.finish_workshop_agent_job(target_job_id uuid, target_lease_token uuid,
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
        -- Share-lock the participant too, so a simultaneous ban cannot be missed.
        IF source_comment.participant_id IS NOT NULL THEN
            PERFORM 1 FROM public.workshop_participants WHERE id = source_comment.participant_id AND NOT is_interaction_banned FOR SHARE;
            is_valid := is_valid AND FOUND;
        END IF;
    ELSE
        is_valid := is_valid AND assignment.is_listening AND room.room_kind = 'workshop'
            AND room.starts_at <= now() AND (room.ends_at IS NULL OR room.ends_at > now())
            AND job.created_at > now() - interval '2 minutes'
            AND EXISTS (SELECT 1 FROM public.workshop_agent_audio_sessions AS session
                JOIN public.workshop_agent_transcripts AS transcript ON transcript.session_id = session.session_id AND transcript.workshop_id = session.workshop_id
                WHERE session.workshop_id = job.workshop_id AND session.expires_at > now() AND transcript.id = job.transcript_id);
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

REVOKE ALL ON FUNCTION public.save_workshop_agent(uuid, uuid, text, text, boolean, boolean, boolean, integer, integer),
    public.enqueue_workshop_comment_agents(), public.enqueue_workshop_transcript_agents(),
    public.start_workshop_agent_audio(uuid, uuid), public.reserve_workshop_agent_audio_chunk(uuid, uuid, integer),
    public.claim_workshop_agent_job(uuid), public.finish_workshop_agent_job(uuid, uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_workshop_agent(uuid, uuid, text, text, boolean, boolean, boolean, integer, integer),
    public.enqueue_workshop_comment_agents(), public.enqueue_workshop_transcript_agents(),
    public.start_workshop_agent_audio(uuid, uuid), public.reserve_workshop_agent_audio_chunk(uuid, uuid, integer),
    public.claim_workshop_agent_job(uuid), public.finish_workshop_agent_job(uuid, uuid, text, text) TO service_role;

COMMIT;

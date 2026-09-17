-- AI may approve only the unchanged pending contribution it reviewed. Human moderation remains authoritative.
BEGIN;

-- Private provenance, without a second copy of participant identities or submission bodies.
CREATE TABLE public.workshop_submission_auto_approvals (
    submission_kind text NOT NULL CHECK (submission_kind IN ('comment', 'poll-option', 'project')),
    submission_id uuid NOT NULL,
    model text NOT NULL CHECK (char_length(model) BETWEEN 1 AND 200),
    approved_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (submission_kind, submission_id)
);
ALTER TABLE public.workshop_submission_auto_approvals ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.workshop_submission_auto_approvals FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.workshop_submission_auto_approvals TO service_role;

CREATE FUNCTION public.approve_workshop_submission_automatically(
    target_submission_kind text,
    target_submission_id uuid,
    target_participant_id uuid,
    expected_content jsonb,
    target_model text
)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    approved_submission_id uuid;
BEGIN
    -- Holding this lock until the update commits serializes approval with a moderator silencing the author.
    PERFORM participant.id
    FROM public.workshop_participants AS participant
    WHERE participant.id = target_participant_id
      AND NOT participant.is_interaction_banned
    FOR SHARE;
    IF NOT FOUND THEN
        RETURN false;
    END IF;

    CASE target_submission_kind
        WHEN 'comment' THEN
            UPDATE public.workshop_comments AS comment
            SET status = 'approved'
            WHERE comment.id = target_submission_id
              AND comment.participant_id = target_participant_id
              AND comment.status = 'pending'
              AND jsonb_build_object('body', comment.body) = expected_content
            RETURNING comment.id INTO approved_submission_id;
        WHEN 'poll-option' THEN
            -- The question is reviewed with the answer; keep it stable through this decision as well.
            PERFORM poll.id
            FROM public.workshop_polls AS poll
            INNER JOIN public.workshop_poll_options AS poll_option ON poll_option.poll_id = poll.id
            WHERE poll_option.id = target_submission_id
              AND poll.question = expected_content ->> 'question'
            FOR SHARE OF poll;
            IF NOT FOUND THEN
                RETURN false;
            END IF;

            UPDATE public.workshop_poll_options AS poll_option
            SET status = 'approved'
            FROM public.workshop_polls AS poll
            WHERE poll_option.id = target_submission_id
              AND poll_option.poll_id = poll.id
              AND poll_option.author_participant_id = target_participant_id
              AND poll_option.is_created_by_participant
              AND poll_option.status = 'pending'
              AND jsonb_build_object('question', poll.question, 'label', poll_option.label) = expected_content
            RETURNING poll_option.id INTO approved_submission_id;
        WHEN 'project' THEN
            UPDATE public.community_projects AS project
            SET status = 'approved'
            WHERE project.id = target_submission_id
              AND project.author_community_participant_id = target_participant_id
              AND project.status = 'pending'
              AND jsonb_build_object(
                  'url', project.url, 'title', project.title, 'description', project.description,
                  'previewImageUrl', project.preview_image_url
              ) = expected_content
            RETURNING project.id INTO approved_submission_id;
        ELSE
            RETURN false;
    END CASE;

    IF approved_submission_id IS NULL THEN
        RETURN false;
    END IF;

    INSERT INTO public.workshop_submission_auto_approvals (submission_kind, submission_id, model)
    VALUES (target_submission_kind, approved_submission_id, target_model)
    ON CONFLICT (submission_kind, submission_id) DO NOTHING;
    RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_workshop_submission_automatically(text, uuid, uuid, jsonb, text)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_workshop_submission_automatically(text, uuid, uuid, jsonb, text)
    TO service_role;

COMMIT;

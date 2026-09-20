-- A room-local promotion approves the same pending submissions its moderation count describes.
BEGIN;

CREATE VIEW public.workshop_pending_participant_submissions AS
    SELECT participant_id, 'comment'::text AS submission_kind, id AS submission_id
    FROM public.workshop_comments
    WHERE status = 'pending' AND participant_id IS NOT NULL
    UNION ALL
    SELECT author_participant_id, 'poll-option'::text, id
    FROM public.workshop_poll_options
    WHERE status = 'pending' AND is_created_by_participant AND author_participant_id IS NOT NULL
    UNION ALL
    SELECT author_community_participant_id, 'project'::text, id
    FROM public.community_projects
    WHERE status = 'pending';

REVOKE ALL ON public.workshop_pending_participant_submissions FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.workshop_pending_participant_submissions TO service_role;

CREATE INDEX workshop_comments_pending_author_idx
    ON public.workshop_comments (participant_id) WHERE status = 'pending';
CREATE INDEX workshop_poll_options_pending_author_idx
    ON public.workshop_poll_options (author_participant_id) WHERE status = 'pending' AND is_created_by_participant;
CREATE INDEX community_projects_pending_author_idx
    ON public.community_projects (author_community_participant_id) WHERE status = 'pending';

-- Count complete histories in one batch, independently of the chat's visible-message limit.
CREATE FUNCTION public.get_workshop_pending_submission_counts(target_workshop_id uuid, target_participant_ids uuid[])
RETURNS TABLE (participant_id uuid, pending_submission_count bigint)
LANGUAGE sql STABLE
SET search_path = public, pg_temp
AS $$
    SELECT participant.id, count(submission.submission_id)
    FROM public.workshop_participants AS participant
    LEFT JOIN public.workshop_pending_participant_submissions AS submission
        ON submission.participant_id = participant.id
    WHERE participant.workshop_id = target_workshop_id
      AND participant.id = ANY(target_participant_ids)
    GROUP BY participant.id;
$$;

-- The participant update and all approvals commit or roll back together, whichever UI granted the role.
-- Shared poll answers follow their actual author participant, including answers written through an attached workshop.
CREATE FUNCTION public.approve_promoted_workshop_participant_submissions()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.workshop_comments AS comment
    SET status = 'approved'
    FROM public.workshop_pending_participant_submissions AS submission
    WHERE submission.participant_id = NEW.id AND submission.submission_kind = 'comment'
      AND comment.id = submission.submission_id AND comment.status = 'pending';

    UPDATE public.workshop_poll_options AS poll_option
    SET status = 'approved'
    FROM public.workshop_pending_participant_submissions AS submission
    WHERE submission.participant_id = NEW.id AND submission.submission_kind = 'poll-option'
      AND poll_option.id = submission.submission_id AND poll_option.status = 'pending';

    UPDATE public.community_projects AS project
    SET status = 'approved'
    FROM public.workshop_pending_participant_submissions AS submission
    WHERE submission.participant_id = NEW.id AND submission.submission_kind = 'project'
      AND project.id = submission.submission_id AND project.status = 'pending';

    RETURN NEW;
END;
$$;

CREATE TRIGGER workshop_participants_approve_pending_submissions
AFTER UPDATE OF is_trusted, is_moderator, is_interaction_banned ON public.workshop_participants
FOR EACH ROW
WHEN (
    NOT NEW.is_interaction_banned AND (NEW.is_trusted OR NEW.is_moderator)
    AND (
        (NEW.is_trusted AND NOT OLD.is_trusted)
        OR (NEW.is_moderator AND NOT OLD.is_moderator)
        OR OLD.is_interaction_banned
    )
)
EXECUTE FUNCTION public.approve_promoted_workshop_participant_submissions();

REVOKE ALL ON FUNCTION public.get_workshop_pending_submission_counts(uuid, uuid[]),
    public.approve_promoted_workshop_participant_submissions() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_workshop_pending_submission_counts(uuid, uuid[]),
    public.approve_promoted_workshop_participant_submissions() TO service_role;

COMMIT;

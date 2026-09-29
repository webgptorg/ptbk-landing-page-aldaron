BEGIN;

ALTER TABLE public.workshops
    ADD COLUMN video_source text NOT NULL DEFAULT 'youtube'
        CHECK (video_source IN ('youtube', 'hosted')),
    ADD COLUMN hosted_recording_revision_id uuid;

CREATE TABLE public.workshop_hosted_recording_revisions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'processing', 'ready', 'published', 'superseded', 'cancelled', 'failed')),
    live_start_at timestamptz NOT NULL,
    duration_seconds double precision,
    validation_report jsonb,
    player_metadata jsonb,
    published_at timestamptz,
    superseded_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (duration_seconds IS NULL OR (duration_seconds > 0 AND duration_seconds <= 43200))
);
CREATE INDEX workshop_hosted_recording_revision_workshop_idx
    ON public.workshop_hosted_recording_revisions (workshop_id, created_at DESC);

CREATE TABLE public.workshop_hosted_recording_assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    revision_id uuid NOT NULL REFERENCES public.workshop_hosted_recording_revisions(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN (
        'editor', 'application', 'camera', 'manifest', 'workshop',
        'subtitle-editor', 'subtitle-application', 'subtitle-camera',
        'activity', 'events', 'commits'
    )),
    source_id text CHECK (source_id IS NULL OR char_length(source_id) BETWEEN 1 AND 120),
    filename text NOT NULL CHECK (char_length(filename) BETWEEN 1 AND 255),
    content_type text NOT NULL,
    byte_length bigint NOT NULL CHECK (byte_length > 0 AND byte_length <= 53687091200),
    object_key text NOT NULL UNIQUE,
    upload_id text NOT NULL,
    status text NOT NULL DEFAULT 'uploading' CHECK (status IN ('uploading', 'completing', 'complete')),
    completion_started_at timestamptz,
    measured_duration_seconds double precision,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (revision_id, role)
);

-- Publication and verification lock the revision row first. Asset registration and
-- completion take that same lock, so a late upload cannot enter a ready revision.
CREATE FUNCTION public.guard_workshop_hosted_recording_asset_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE revision_status text;
BEGIN
    SELECT status INTO revision_status
    FROM public.workshop_hosted_recording_revisions
    WHERE id = NEW.revision_id FOR UPDATE;
    IF revision_status NOT IN ('draft', 'failed') THEN
        RAISE EXCEPTION 'Hosted recording revision is locked';
    END IF;
    RETURN NEW;
END;
$$;
CREATE TRIGGER guard_workshop_hosted_recording_asset_write
    BEFORE INSERT OR UPDATE ON public.workshop_hosted_recording_assets
    FOR EACH ROW EXECUTE FUNCTION public.guard_workshop_hosted_recording_asset_write();

ALTER TABLE public.workshops
    ADD CONSTRAINT workshop_hosted_recording_revision_fk
    FOREIGN KEY (hosted_recording_revision_id)
    REFERENCES public.workshop_hosted_recording_revisions(id) ON DELETE SET NULL;

ALTER TABLE public.workshops
    ADD CONSTRAINT workshop_hosted_video_needs_revision
    CHECK (video_source = 'youtube' OR hosted_recording_revision_id IS NOT NULL);

-- One database transaction changes the pointer. The old immutable revision stays readable
-- briefly for players that were already connected to it.
CREATE FUNCTION public.publish_workshop_hosted_recording(target_revision_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    target_workshop_id uuid;
    previous_revision_id uuid;
BEGIN
    SELECT workshop_id INTO target_workshop_id
    FROM public.workshop_hosted_recording_revisions
    WHERE id = target_revision_id AND status = 'ready'
        AND validation_report->>'isValid' = 'true'
        AND player_metadata IS NOT NULL FOR UPDATE;
    IF target_workshop_id IS NULL THEN
        RAISE EXCEPTION 'Hosted recording is not ready';
    END IF;
    SELECT hosted_recording_revision_id INTO previous_revision_id
    FROM public.workshops WHERE id = target_workshop_id AND is_deleted = false FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Workshop not found'; END IF;
    UPDATE public.workshop_hosted_recording_revisions
    SET status = 'superseded', superseded_at = now(), updated_at = now()
    WHERE id = previous_revision_id AND id <> target_revision_id;
    UPDATE public.workshop_hosted_recording_revisions
    SET status = 'published', published_at = now(), updated_at = now()
    WHERE id = target_revision_id;
    UPDATE public.workshops
    SET hosted_recording_revision_id = target_revision_id, video_source = 'hosted', updated_at = now()
    WHERE id = target_workshop_id;
    RETURN previous_revision_id;
END;
$$;

CREATE FUNCTION public.remove_workshop_hosted_recording(target_workshop_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE previous_revision_id uuid;
BEGIN
    SELECT hosted_recording_revision_id INTO previous_revision_id
    FROM public.workshops WHERE id = target_workshop_id AND is_deleted = false FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Workshop not found'; END IF;
    UPDATE public.workshops SET hosted_recording_revision_id = NULL,
        video_source = 'youtube', updated_at = now() WHERE id = target_workshop_id;
    UPDATE public.workshop_hosted_recording_revisions
    SET status = 'superseded', superseded_at = now(), updated_at = now()
    WHERE id = previous_revision_id;
    RETURN previous_revision_id;
END;
$$;

CREATE FUNCTION public.cancel_workshop_hosted_recording(target_revision_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_workshop_id uuid;
BEGIN
    SELECT workshop_id INTO target_workshop_id
    FROM public.workshop_hosted_recording_revisions
    WHERE id = target_revision_id AND status IN ('draft', 'failed', 'ready') FOR UPDATE;
    IF target_workshop_id IS NULL THEN RETURN false; END IF;
    PERFORM 1 FROM public.workshops WHERE id = target_workshop_id FOR UPDATE;
    IF EXISTS (SELECT 1 FROM public.workshops
        WHERE id = target_workshop_id AND hosted_recording_revision_id = target_revision_id) THEN
        RETURN false;
    END IF;
    UPDATE public.workshop_hosted_recording_revisions
    SET status = 'cancelled', updated_at = now()
    WHERE id = target_revision_id;
    RETURN true;
END;
$$;

-- Claim cleanup under the same revision-then-workshop lock order as publication.
-- Deletion of private objects happens only after this makes publication impossible.
CREATE FUNCTION public.claim_workshop_hosted_recording_cleanup(
    target_revision_id uuid, old_upload_cutoff timestamptz, old_revision_cutoff timestamptz
)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    target_workshop_id uuid;
    revision_status text;
    revision_updated_at timestamptz;
    revision_superseded_at timestamptz;
    current_revision_id uuid;
BEGIN
    SELECT workshop_id, status, updated_at, superseded_at
    INTO target_workshop_id, revision_status, revision_updated_at,
        revision_superseded_at
    FROM public.workshop_hosted_recording_revisions
    WHERE id = target_revision_id FOR UPDATE;
    IF NOT FOUND THEN RETURN false; END IF;
    SELECT hosted_recording_revision_id INTO current_revision_id
    FROM public.workshops WHERE id = target_workshop_id FOR UPDATE;
    IF current_revision_id = target_revision_id THEN RETURN false; END IF;
    IF (revision_status IN ('draft', 'failed', 'processing', 'cancelled')
            AND revision_updated_at < old_upload_cutoff)
        OR (revision_status = 'ready' AND revision_updated_at < old_revision_cutoff)
        OR (revision_status = 'superseded'
            AND revision_superseded_at < old_revision_cutoff) THEN
        UPDATE public.workshop_hosted_recording_revisions
        SET status = 'cancelled', updated_at = now() WHERE id = target_revision_id;
        RETURN true;
    END IF;
    RETURN false;
END;
$$;

ALTER TABLE public.workshop_hosted_recording_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_hosted_recording_assets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.workshop_hosted_recording_revisions,
    public.workshop_hosted_recording_assets FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.workshop_hosted_recording_revisions,
    public.workshop_hosted_recording_assets TO service_role;
REVOKE ALL ON FUNCTION public.publish_workshop_hosted_recording(uuid),
    public.remove_workshop_hosted_recording(uuid),
    public.cancel_workshop_hosted_recording(uuid),
    public.claim_workshop_hosted_recording_cleanup(uuid, timestamptz, timestamptz),
    public.guard_workshop_hosted_recording_asset_write() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_workshop_hosted_recording(uuid),
    public.remove_workshop_hosted_recording(uuid),
    public.cancel_workshop_hosted_recording(uuid),
    public.claim_workshop_hosted_recording_cleanup(uuid, timestamptz, timestamptz) TO service_role;

COMMIT;

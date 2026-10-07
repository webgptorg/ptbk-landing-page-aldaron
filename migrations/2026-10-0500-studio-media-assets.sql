-- Independent private objects. A Studio project need not have a workshop or publish anything.
CREATE TABLE public.studio_media_assets (
    id uuid PRIMARY KEY,
    client_asset_id uuid NOT NULL,
    object_key text NOT NULL UNIQUE CHECK (object_key = 'studio-assets/' || id::text),
    upload_id text,
    filename text NOT NULL,
    content_type text NOT NULL,
    byte_length bigint NOT NULL CHECK (byte_length > 0 AND byte_length <= 53687091200),
    source_fingerprint text NOT NULL,
    part_checksums jsonb NOT NULL,
    media_bounds jsonb NOT NULL,
    status text NOT NULL CHECK (status IN ('allocating','uploading','completing','verified','cancelled','deleting')),
    operation_token uuid,
    operation_started_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    verified_at timestamptz
);
CREATE TABLE public.studio_media_project_references (
    project_id uuid NOT NULL,
    asset_id uuid NOT NULL REFERENCES public.studio_media_assets(id) ON DELETE RESTRICT,
    PRIMARY KEY (project_id, asset_id)
);

CREATE FUNCTION public.retain_studio_media_project_reference(target_project_id uuid, target_asset_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE asset_status text;
BEGIN
    SELECT status INTO asset_status FROM public.studio_media_assets WHERE id=target_asset_id FOR UPDATE;
    IF NOT FOUND OR asset_status IN ('cancelled','deleting') THEN RAISE EXCEPTION 'Studio asset unavailable'; END IF;
    INSERT INTO public.studio_media_project_references(project_id,asset_id) VALUES(target_project_id,target_asset_id) ON CONFLICT DO NOTHING;
END;
$$;

-- References and cleanup serialize on the same object row. Local recipes are not account-wide project sync.
CREATE FUNCTION public.set_studio_media_project_references(target_project_id uuid, target_asset_ids uuid[])
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_asset_id uuid; asset_status text;
BEGIN
    FOREACH target_asset_id IN ARRAY target_asset_ids LOOP
        SELECT status INTO asset_status FROM public.studio_media_assets WHERE id = target_asset_id FOR UPDATE;
        IF NOT FOUND OR asset_status IN ('cancelled','deleting') THEN RAISE EXCEPTION 'Studio asset unavailable'; END IF;
        INSERT INTO public.studio_media_project_references(project_id,asset_id) VALUES(target_project_id,target_asset_id) ON CONFLICT DO NOTHING;
    END LOOP;
    -- Removal is explicit reconciliation after the browser has saved its recipe.
    DELETE FROM public.studio_media_project_references WHERE project_id=target_project_id AND NOT (asset_id=ANY(target_asset_ids));
END;
$$;

CREATE FUNCTION public.claim_studio_media_cleanup(target_asset_id uuid, old_upload_cutoff timestamptz, old_object_cutoff timestamptz)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE asset public.studio_media_assets%ROWTYPE;
BEGIN
    SELECT * INTO asset FROM public.studio_media_assets WHERE id=target_asset_id FOR UPDATE;
    IF NOT FOUND OR EXISTS(SELECT 1 FROM public.studio_media_project_references WHERE asset_id=asset.id) THEN RETURN false; END IF;
    IF (asset.status IN ('allocating','uploading','completing','cancelled') AND asset.updated_at < old_upload_cutoff)
        OR (asset.status='verified' AND asset.updated_at < old_object_cutoff) OR asset.status='deleting' THEN
        UPDATE public.studio_media_assets SET status='deleting', operation_token=NULL WHERE id=asset.id;
        RETURN true;
    END IF;
    RETURN false;
END;
$$;

-- Completion leases cannot mutate identity or resurrect cancelled/claimed objects.
CREATE FUNCTION public.guard_studio_media_identity()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
    IF NEW.id<>OLD.id OR NEW.client_asset_id<>OLD.client_asset_id OR NEW.object_key<>OLD.object_key OR NEW.filename<>OLD.filename
        OR NEW.content_type<>OLD.content_type OR NEW.byte_length<>OLD.byte_length OR NEW.source_fingerprint<>OLD.source_fingerprint
        OR NEW.part_checksums<>OLD.part_checksums OR NEW.media_bounds<>OLD.media_bounds THEN RAISE EXCEPTION 'Studio source identity is immutable'; END IF;
    IF OLD.status IN ('cancelled','deleting') AND NEW.status NOT IN ('cancelled','deleting') THEN RAISE EXCEPTION 'Studio object is retired'; END IF;
    RETURN NEW;
END;
$$;
CREATE TRIGGER guard_studio_media_identity BEFORE UPDATE ON public.studio_media_assets FOR EACH ROW EXECUTE FUNCTION public.guard_studio_media_identity();

ALTER TABLE public.studio_media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_media_project_references ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.studio_media_assets, public.studio_media_project_references FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.studio_media_assets, public.studio_media_project_references TO service_role;
REVOKE ALL ON FUNCTION public.retain_studio_media_project_reference(uuid,uuid), public.set_studio_media_project_references(uuid,uuid[]), public.claim_studio_media_cleanup(uuid,timestamptz,timestamptz), public.guard_studio_media_identity() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.retain_studio_media_project_reference(uuid,uuid), public.set_studio_media_project_references(uuid,uuid[]), public.claim_studio_media_cleanup(uuid,timestamptz,timestamptz), public.guard_studio_media_identity() TO service_role;

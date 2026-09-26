-- Persist workshop material ordering as one order-only transaction.
BEGIN;

CREATE OR REPLACE FUNCTION public.reorder_workshop_content_blocks(
    target_workshop_id uuid,
    ordered_content_ids uuid[]
)
RETURNS TABLE (
    outcome text,
    material_ids uuid[],
    is_changed boolean,
    was_reconciled boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_material_ids uuid[] := ARRAY[]::uuid[];
    requested_existing_ids uuid[] := ARRAY[]::uuid[];
    unlisted_material_ids uuid[] := ARRAY[]::uuid[];
    next_material_ids uuid[] := ARRAY[]::uuid[];
    is_material_owned_elsewhere boolean := false;
    is_order_changed boolean := false;
    is_material_order_reconciled boolean := false;
BEGIN
    IF ordered_content_ids IS NULL
        OR array_position(ordered_content_ids, NULL) IS NOT NULL
        OR cardinality(ordered_content_ids) > 100001
        OR cardinality(ordered_content_ids) <> (
            SELECT count(DISTINCT requested_id)
            FROM unnest(ordered_content_ids) AS requested(requested_id)
        ) THEN
        RETURN QUERY SELECT 'invalid_request', ARRAY[]::uuid[], false, false;
        RETURN;
    END IF;

    -- The parent lock also serializes inserts through the material foreign key. Existing rows are locked below so a
    -- concurrent delete cannot make a partially applied order or silently remove an unrelated material.
    PERFORM workshop.id
    FROM public.workshops AS workshop
    WHERE workshop.id = target_workshop_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT 'workshop_not_found', ARRAY[]::uuid[], false, false;
        RETURN;
    END IF;

    PERFORM material.id
    FROM public.workshop_content_blocks AS material
    WHERE material.workshop_id = target_workshop_id
    ORDER BY material.sort_order, material.unlock_at, material.id
    FOR UPDATE;

    SELECT coalesce(array_agg(material.id ORDER BY material.sort_order, material.unlock_at, material.id), ARRAY[]::uuid[])
    INTO current_material_ids
    FROM public.workshop_content_blocks AS material
    WHERE material.workshop_id = target_workshop_id;

    SELECT EXISTS (
        SELECT 1
        FROM public.workshop_content_blocks AS material
        WHERE material.id = ANY(ordered_content_ids)
          AND material.workshop_id <> target_workshop_id
    ) INTO is_material_owned_elsewhere;

    IF is_material_owned_elsewhere THEN
        RETURN QUERY SELECT 'invalid_material', current_material_ids, false, false;
        RETURN;
    END IF;

    -- Preserve the requested relative order for records which still exist. Concurrent deletions disappear, and
    -- concurrent additions are kept at the end in their current deterministic order.
    SELECT coalesce(array_agg(requested.material_id ORDER BY requested.position), ARRAY[]::uuid[])
    INTO requested_existing_ids
    FROM unnest(ordered_content_ids) WITH ORDINALITY AS requested(material_id, position)
    JOIN public.workshop_content_blocks AS material
      ON material.id = requested.material_id
     AND material.workshop_id = target_workshop_id;

    SELECT coalesce(array_agg(material.id ORDER BY material.sort_order, material.unlock_at, material.id), ARRAY[]::uuid[])
    INTO unlisted_material_ids
    FROM public.workshop_content_blocks AS material
    WHERE material.workshop_id = target_workshop_id
      AND NOT (material.id = ANY(requested_existing_ids));

    next_material_ids := requested_existing_ids || unlisted_material_ids;
    is_material_order_reconciled := next_material_ids IS DISTINCT FROM ordered_content_ids;
    is_order_changed := current_material_ids IS DISTINCT FROM next_material_ids OR is_material_order_reconciled;

    IF NOT is_order_changed THEN
        SELECT EXISTS (
            SELECT 1
            FROM unnest(next_material_ids) WITH ORDINALITY AS requested(material_id, position)
            JOIN public.workshop_content_blocks AS material ON material.id = requested.material_id
            WHERE material.sort_order <> requested.position - 1
        ) INTO is_order_changed;
    END IF;

    IF is_order_changed THEN
        UPDATE public.workshop_content_blocks AS material
        SET sort_order = requested.position - 1
        FROM unnest(next_material_ids) WITH ORDINALITY AS requested(material_id, position)
        WHERE material.id = requested.material_id
          AND material.workshop_id = target_workshop_id;
    END IF;

    RETURN QUERY SELECT 'ok', next_material_ids, is_order_changed, is_material_order_reconciled;
END;
$$;

REVOKE ALL ON FUNCTION public.reorder_workshop_content_blocks(uuid, uuid[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reorder_workshop_content_blocks(uuid, uuid[]) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reorder_workshop_content_blocks(uuid, uuid[]) TO service_role;

COMMIT;

ALTER TABLE public.workshop_story_characters
    ADD COLUMN portrait_lease_id uuid,
    ADD COLUMN portrait_lease_until timestamptz,
    ADD COLUMN portrait_object_key text,
    ADD CONSTRAINT workshop_story_portrait_lease CHECK ((portrait_lease_id IS NULL) = (portrait_lease_until IS NULL));

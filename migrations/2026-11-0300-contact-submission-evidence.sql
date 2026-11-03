-- New submissions carry purpose-specific notice/consent evidence. Historical rows stay NULL.
BEGIN;
ALTER TABLE public."Contact" ADD COLUMN IF NOT EXISTS "submissionEvidence" jsonb;
ALTER TABLE public."Contact" ADD CONSTRAINT contact_submission_evidence_object
    CHECK ("submissionEvidence" IS NULL OR jsonb_typeof("submissionEvidence") = 'object');
CREATE OR REPLACE FUNCTION public.keep_contact_submission_evidence()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
    IF NEW."submissionEvidence" IS DISTINCT FROM OLD."submissionEvidence" THEN
        RAISE EXCEPTION 'Contact submission evidence cannot be changed';
    END IF;
    RETURN NEW;
END;
$$;
CREATE TRIGGER contact_submission_evidence_immutable
    BEFORE UPDATE ON public."Contact" FOR EACH ROW
    EXECUTE FUNCTION public.keep_contact_submission_evidence();
COMMENT ON COLUMN public."Contact"."submissionEvidence" IS 'Server-recorded notice and purpose evidence; no retrospective or inferred marketing permission. Email ownership is not verified.';
COMMIT;

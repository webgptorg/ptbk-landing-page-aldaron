BEGIN;
CREATE TABLE public.message_chat_attachments (
    id uuid PRIMARY KEY,
    message_id uuid REFERENCES public.messages(id) ON DELETE CASCADE,
    source_key text CHECK (source_key IN ('pavol-cs','pavol-en')),
    conversation_id uuid NOT NULL,
    object_key text NOT NULL UNIQUE,
    file_name text NOT NULL CHECK (char_length(file_name) BETWEEN 1 AND 200),
    content_type text NOT NULL CHECK (content_type IN ('image/png','image/jpeg','image/webp','image/gif','application/pdf','text/plain')),
    byte_length integer NOT NULL CHECK (byte_length BETWEEN 1 AND 4194304),
    created_at timestamptz NOT NULL DEFAULT now(),
    CHECK ((message_id IS NOT NULL)::int + (source_key IS NOT NULL)::int = 1)
);
CREATE INDEX message_chat_attachments_scope_idx ON public.message_chat_attachments(message_id,source_key,conversation_id);
ALTER TABLE public.message_chat_attachments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.message_chat_attachments FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,DELETE ON public.message_chat_attachments TO service_role;
ALTER TABLE public.message_chat_turns ADD COLUMN attachments jsonb NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(attachments) = 'array' AND jsonb_array_length(attachments) <= 4);
NOTIFY pgrst, 'reload schema';
COMMIT;

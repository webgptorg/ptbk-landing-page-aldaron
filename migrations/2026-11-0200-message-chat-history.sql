BEGIN;

-- An anonymous chat has a random browser-local identifier, not an account or a public history URL.
-- Only the server writes the latest question and its own actual answer; client-supplied history is never imported.
CREATE TABLE public.message_chat_turns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    conversation_id uuid NOT NULL,
    request_id uuid NOT NULL,
    request_hash text NOT NULL CHECK (request_hash ~ '^[a-f0-9]{64}$'),
    question text NOT NULL CHECK (char_length(btrim(question)) BETWEEN 1 AND 4000),
    introduction text NOT NULL DEFAULT '' CHECK (char_length(introduction) <= 4000),
    reply text CHECK (char_length(btrim(reply)) BETWEEN 1 AND 12000),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')),
    error_message text,
    created_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    UNIQUE (message_id, conversation_id, request_id),
    CHECK (
        (status = 'pending' AND reply IS NULL AND error_message IS NULL AND completed_at IS NULL) OR
        (status = 'completed' AND reply IS NOT NULL AND error_message IS NULL AND completed_at IS NOT NULL) OR
        (status = 'failed' AND reply IS NULL AND error_message IS NOT NULL AND completed_at IS NOT NULL)
    )
);
CREATE INDEX message_chat_turns_history_idx ON public.message_chat_turns(message_id,conversation_id,created_at,id);
ALTER TABLE public.message_chat_turns ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.message_chat_turns FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.message_chat_turns TO service_role;

CREATE VIEW public.message_chat_conversation_summaries WITH (security_invoker = true) AS
SELECT message_id,conversation_id,min(created_at) AS started_at,
    max(COALESCE(completed_at,created_at)) AS last_activity_at,count(*)::int AS turn_count,
    count(*) FILTER (WHERE status='failed')::int AS failed_count,
    left((array_agg(question ORDER BY created_at,id))[1],240) AS preview
FROM public.message_chat_turns GROUP BY message_id,conversation_id;
REVOKE ALL ON public.message_chat_conversation_summaries FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.message_chat_conversation_summaries TO service_role;

NOTIFY pgrst, 'reload schema';
COMMIT;

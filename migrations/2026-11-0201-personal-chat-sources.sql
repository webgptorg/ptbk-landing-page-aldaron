BEGIN;
-- Preserve existing message histories; homepage conversations have a named source, not a synthetic public message.
ALTER TABLE public.message_chat_turns ALTER COLUMN message_id DROP NOT NULL;
ALTER TABLE public.message_chat_turns ADD COLUMN source_key text NOT NULL DEFAULT 'message';
ALTER TABLE public.message_chat_turns ADD CONSTRAINT message_chat_source_check CHECK (
    (message_id IS NOT NULL AND source_key = 'message') OR
    (message_id IS NULL AND source_key IN ('pavol-cs', 'pavol-en'))
);
CREATE UNIQUE INDEX message_chat_personal_request_idx ON public.message_chat_turns(source_key,conversation_id,request_id)
    WHERE message_id IS NULL;
DROP VIEW public.message_chat_conversation_summaries;
CREATE VIEW public.message_chat_conversation_summaries WITH (security_invoker = true) AS
SELECT message_id,source_key,conversation_id,min(created_at) AS started_at,
    max(COALESCE(completed_at,created_at)) AS last_activity_at,count(*)::int AS turn_count,
    count(*) FILTER (WHERE status='failed')::int AS failed_count,
    left((array_agg(question ORDER BY created_at,id))[1],240) AS preview
FROM public.message_chat_turns GROUP BY message_id,source_key,conversation_id;
REVOKE ALL ON public.message_chat_conversation_summaries FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.message_chat_conversation_summaries TO service_role;
NOTIFY pgrst, 'reload schema';
COMMIT;

BEGIN;

-- Preserve complete generated interviews/reviews. The model input window remains independently bounded.
-- Widen the existing check without changing any stored conversation, ownership or grants.
ALTER TABLE public.message_chat_turns DROP CONSTRAINT message_chat_turns_reply_check;
ALTER TABLE public.message_chat_turns ADD CONSTRAINT message_chat_turns_reply_check
    CHECK (char_length(btrim(reply)) BETWEEN 1 AND 48000);

COMMIT;

-- Additive metadata; generated replies and existing private access remain intact.
alter table public.message_chat_turns
    add column if not exists voice_status text,
    add column if not exists spoken_reply text;
alter table public.message_chat_turns add constraint message_chat_turns_voice_status_check
    check (voice_status is null or voice_status in ('streaming', 'completed', 'interrupted', 'failed'));
alter table public.message_chat_turns add constraint message_chat_turns_spoken_reply_check
    check (spoken_reply is null or length(spoken_reply) <= 6000);

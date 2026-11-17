-- Product-private account conversations and atomic monthly usage. Existing public chats are untouched.
create table if not exists public.avatar_chat_conversations (
 id uuid primary key,
 principal_id uuid not null references public.avatar_principals(id) on delete cascade,
 language text not null default 'cs' check(language in ('cs','en')),
 channel text not null check(channel in ('web','mcp','telegram')),
 title text not null default '' check(length(title)<=160),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(id,principal_id)
);
create index if not exists avatar_chat_conversations_owner on public.avatar_chat_conversations(principal_id,updated_at desc);
create table if not exists public.avatar_chat_turns (
 id uuid primary key default gen_random_uuid(),
 principal_id uuid not null references public.avatar_principals(id) on delete cascade,
 conversation_id uuid not null references public.avatar_chat_conversations(id) on delete cascade,
 request_id uuid not null,
 period_start timestamptz not null,
 question text not null check(length(question) between 1 and 4000),
 attachments jsonb not null default '[]'::jsonb check(jsonb_typeof(attachments)='array'),
 reply text check(length(reply)<=48000),
 status text not null default 'pending' check(status in ('pending','completed','failed')),
 error_message text,
 model text,
 input_tokens bigint not null default 0 check(input_tokens>=0),
 output_tokens bigint not null default 0 check(output_tokens>=0),
 created_at timestamptz not null default now(),
 finished_at timestamptz,
 unique(principal_id,request_id),
 foreign key(conversation_id,principal_id) references public.avatar_chat_conversations(id,principal_id) on delete cascade
);
create index if not exists avatar_chat_turns_conversation on public.avatar_chat_turns(conversation_id,created_at);
alter table public.avatar_chat_conversations enable row level security;
alter table public.avatar_chat_turns enable row level security;
revoke all on public.avatar_chat_conversations,public.avatar_chat_turns from public,anon,authenticated;
grant select,insert,update,delete on public.avatar_chat_conversations,public.avatar_chat_turns to service_role;

create or replace function public.avatar_begin_chat_turn(
 p_principal_id uuid,p_conversation_id uuid,p_request_id uuid,p_question text,p_channel text,
 p_language text,p_period_start timestamptz,p_limit integer,p_attachments jsonb default '[]'::jsonb
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare existing public.avatar_chat_turns%rowtype; created public.avatar_chat_turns%rowtype; owner uuid;
begin
 if p_limit<1 or p_limit>100000 or p_channel not in ('web','mcp','telegram') or p_language not in ('cs','en')
 or length(p_question) not between 1 and 4000 then raise exception 'avatar_invalid_input'; end if;
 perform 1 from public.avatar_principals where id=p_principal_id for update;
 if not found then raise exception 'avatar_unknown_principal'; end if;
 select * into existing from public.avatar_chat_turns where principal_id=p_principal_id and request_id=p_request_id;
 if found then
  if existing.conversation_id<>p_conversation_id or existing.question<>p_question or existing.attachments<>p_attachments then
   raise exception 'avatar_request_conflict';
  end if;
  return jsonb_build_object('isNew',false,'turn',to_jsonb(existing));
 end if;
 select principal_id into owner from public.avatar_chat_conversations where id=p_conversation_id;
 if found and owner<>p_principal_id then raise exception 'avatar_conversation_forbidden'; end if;
 if owner is null then
  insert into public.avatar_chat_conversations(id,principal_id,language,channel,title)
   values(p_conversation_id,p_principal_id,p_language,p_channel,left(p_question,160));
 end if;
 insert into public.avatar_usage(principal_id,period_start,used) values(p_principal_id,p_period_start,0)
 on conflict(principal_id,period_start) do nothing;
 update public.avatar_usage set used=used+1 where principal_id=p_principal_id and period_start=p_period_start and used<p_limit;
 if not found then raise exception 'avatar_quota_exceeded'; end if;
 insert into public.avatar_chat_turns(principal_id,conversation_id,request_id,period_start,question,attachments)
 values(p_principal_id,p_conversation_id,p_request_id,p_period_start,p_question,p_attachments) returning * into created;
 update public.avatar_chat_conversations set updated_at=now(),title=case when title='' then left(p_question,160) else title end where id=p_conversation_id;
 return jsonb_build_object('isNew',true,'turn',to_jsonb(created));
end $$;
revoke all on function public.avatar_begin_chat_turn(uuid,uuid,uuid,text,text,text,timestamptz,integer,jsonb) from public,anon,authenticated;
grant execute on function public.avatar_begin_chat_turn(uuid,uuid,uuid,text,text,text,timestamptz,integer,jsonb) to service_role;

create or replace function public.avatar_finish_chat_turn(
 p_id uuid,p_reply text default null,p_error text default null,p_model text default null,
 p_input_tokens bigint default 0,p_output_tokens bigint default 0
) returns boolean language plpgsql security invoker set search_path='' as $$
declare row public.avatar_chat_turns%rowtype;
begin
 if (p_reply is null)=(p_error is null) then raise exception 'avatar_invalid_result'; end if;
 update public.avatar_chat_turns set reply=p_reply,error_message=p_error,
  status=case when p_error is null then 'completed' else 'failed' end,finished_at=now(),
  model=p_model,input_tokens=greatest(0,p_input_tokens),output_tokens=greatest(0,p_output_tokens)
 where id=p_id and status='pending' returning * into row;
 if not found then return false; end if;
 if p_error is not null then
  update public.avatar_usage set used=greatest(0,used-1) where principal_id=row.principal_id and period_start=row.period_start;
 end if;
 return true;
end $$;
revoke all on function public.avatar_finish_chat_turn(uuid,text,text,text,bigint,bigint) from public,anon,authenticated;
grant execute on function public.avatar_finish_chat_turn(uuid,text,text,text,bigint,bigint) to service_role;

-- Account uploads use distinct sources: public capability URLs must never authorize private customer files.
ALTER TABLE public.message_chat_attachments DROP CONSTRAINT message_chat_attachments_source_key_check;
ALTER TABLE public.message_chat_attachments ADD CONSTRAINT message_chat_attachments_source_key_check CHECK(source_key IN ('pavol-cs','pavol-en','site-pavol-avatar-cs','site-pavol-avatar-en','avatar-account-cs','avatar-account-en'));

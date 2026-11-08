-- ABC do saber: family-owned child profiles and explicitly approved teacher access.
-- Apply once to a new Supabase project. No client can access tables directly.
begin;

create table public.adults (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('parent','teacher')),
  name text not null check (char_length(name) between 2 and 80),
  school text not null default '',
  created_at timestamptz not null default now()
);
create table public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.adults(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 30),
  avatar text not null check (avatar in ('star','heart','book')),
  created_at timestamptz not null default now()
);
create table public.school_grants (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  teacher_id uuid not null references public.adults(id) on delete cascade,
  approved_by uuid not null references public.adults(id),
  approved_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique(child_id,teacher_id)
);
create table public.teacher_invites (
  code_hash text primary key,
  teacher_id uuid not null references public.adults(id) on delete cascade,
  expires_at timestamptz not null default now()+interval '7 days',
  used_at timestamptz
);
create table public.child_sessions (
  token_hash text primary key,
  child_id uuid not null references public.children(id) on delete cascade,
  actor_id uuid not null references public.adults(id) on delete cascade,
  expires_at timestamptz not null default now()+interval '2 hours',
  revoked_at timestamptz
);
create table public.activity_completions (
  child_id uuid not null references public.children(id) on delete cascade,
  activity text not null check (activity in ('vogais','casa-das-vogais')),
  completed_at timestamptz not null default now(),
  primary key(child_id,activity)
);
create index children_parent on public.children(parent_id);
create index school_grants_teacher on public.school_grants(teacher_id) where revoked_at is null;
create index child_sessions_actor on public.child_sessions(actor_id,child_id);

alter table public.adults enable row level security;
alter table public.children enable row level security;
alter table public.school_grants enable row level security;
alter table public.teacher_invites enable row level security;
alter table public.child_sessions enable row level security;
alter table public.activity_completions enable row level security;
revoke all on public.adults,public.children,public.school_grants,public.teacher_invites,public.child_sessions,public.activity_completions from anon,authenticated;

create function public._new_adult() returns trigger language plpgsql security definer set search_path='' as $$
declare r text; n text; s text;
begin
  r:=new.raw_user_meta_data->>'adult_role';
  n:=btrim(new.raw_user_meta_data->>'display_name');
  s:=btrim(coalesce(new.raw_user_meta_data->>'school_name',''));
  if r not in ('parent','teacher') or r is null or n is null or char_length(n) not between 2 and 80 then raise exception 'invalid_name'; end if;
  if r='teacher' and char_length(s) not between 2 and 120 then raise exception 'invalid_name'; end if;
  insert into public.adults(id,role,name,school) values(new.id,r,n,case when r='teacher' then s else '' end);
  return new;
end $$;
create trigger on_abc_adult_created after insert on auth.users for each row execute function public._new_adult();

create function public._allowed_child(p_child uuid,p_actor uuid) returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.children c where c.id=p_child and
    (c.parent_id=p_actor or exists(select 1 from public.school_grants g where g.child_id=c.id and g.teacher_id=p_actor and g.revoked_at is null)));
$$;
create function public._completed(p_child uuid) returns jsonb language sql stable security definer set search_path='' as $$
  select coalesce(jsonb_agg(a.activity order by a.activity),'[]'::jsonb) from public.activity_completions a where a.child_id=p_child;
$$;

create function public.dashboard_data() returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.adults; kids jsonb; grants jsonb;
begin
  select * into a from public.adults where id=auth.uid();
  if a.id is null then raise exception 'access_denied'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'name',c.name,'avatar',c.avatar,'completed',public._completed(c.id)) order by c.created_at),'[]') into kids
    from public.children c where public._allowed_child(c.id,a.id);
  select coalesce(jsonb_agg(jsonb_build_object('id',g.id,'teacher_name',t.name,'school',t.school,'child_name',c.name) order by g.approved_at),'[]') into grants
    from public.school_grants g join public.children c on c.id=g.child_id join public.adults t on t.id=g.teacher_id
    where c.parent_id=a.id and g.revoked_at is null;
  return jsonb_build_object('adult',jsonb_build_object('id',a.id,'name',a.name,'role',a.role,'school',a.school),'children',kids,'grants',grants);
end $$;
create function public.create_child(p_name text,p_avatar text) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
  if not exists(select 1 from public.adults where id=auth.uid() and role='parent') then raise exception 'access_denied'; end if;
  if p_name is null or char_length(btrim(p_name)) not between 2 and 30 then raise exception 'invalid_name'; end if;
  if p_avatar is null or p_avatar not in ('star','heart','book') then raise exception 'invalid_name'; end if;
  insert into public.children(parent_id,name,avatar) values(auth.uid(),btrim(p_name),p_avatar) returning id into result;
  return result;
end $$;
create function public.create_invite() returns jsonb language plpgsql security definer set search_path='' as $$
declare code text;
begin
  if not exists(select 1 from public.adults where id=auth.uid() and role='teacher') then raise exception 'access_denied'; end if;
  code:=upper(substr(replace(gen_random_uuid()::text,'-',''),1,16));
  insert into public.teacher_invites(code_hash,teacher_id) values(encode(sha256(convert_to(code,'UTF8')),'hex'),auth.uid());
  return jsonb_build_object('code',code);
end $$;
create function public.preview_invite(p_code text) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
  if not exists(select 1 from public.adults where id=auth.uid() and role='parent') then raise exception 'access_denied'; end if;
  select jsonb_build_object('name',a.name,'school',a.school,'email',u.email) into result
    from public.teacher_invites i join public.adults a on a.id=i.teacher_id join auth.users u on u.id=a.id
    where i.code_hash=encode(sha256(convert_to(upper(btrim(p_code)),'UTF8')),'hex') and i.expires_at>now() and i.used_at is null;
  if result is null then raise exception 'invalid_invite'; end if;
  return result;
end $$;
create function public.accept_invite(p_code text,p_child uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare invite public.teacher_invites; result uuid;
begin
  if not exists(select 1 from public.children where id=p_child and parent_id=auth.uid()) then raise exception 'access_denied'; end if;
  select * into invite from public.teacher_invites where code_hash=encode(sha256(convert_to(upper(btrim(p_code)),'UTF8')),'hex') and expires_at>now() and used_at is null for update;
  if invite.code_hash is null then raise exception 'invalid_invite'; end if;
  insert into public.school_grants(child_id,teacher_id,approved_by) values(p_child,invite.teacher_id,auth.uid())
    on conflict(child_id,teacher_id) do update set approved_by=excluded.approved_by,approved_at=now(),revoked_at=null returning id into result;
  update public.teacher_invites set used_at=now() where code_hash=invite.code_hash;
  return result;
end $$;
create function public.revoke_grant(p_grant uuid) returns void language plpgsql security definer set search_path='' as $$
declare target public.school_grants;
begin
  select g.* into target from public.school_grants g join public.children c on c.id=g.child_id where g.id=p_grant and c.parent_id=auth.uid() for update of g;
  if target.id is null then raise exception 'access_denied'; end if;
  update public.school_grants set revoked_at=now() where id=target.id;
  update public.child_sessions set revoked_at=now() where child_id=target.child_id and actor_id=target.teacher_id and revoked_at is null;
end $$;
create function public.start_child_session(p_child uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare token text; kid public.children;
begin
  if not public._allowed_child(p_child,auth.uid()) then raise exception 'access_denied'; end if;
  select * into kid from public.children where id=p_child;
  token:=replace(gen_random_uuid()::text||gen_random_uuid()::text,'-','');
  insert into public.child_sessions(token_hash,child_id,actor_id) values(encode(sha256(convert_to(token,'UTF8')),'hex'),kid.id,auth.uid());
  return jsonb_build_object('token',token,'child',jsonb_build_object('id',kid.id,'name',kid.name,'avatar',kid.avatar),'completed',public._completed(kid.id));
end $$;
create function public._session_child(p_token text) returns uuid language plpgsql security definer set search_path='' as $$
declare s public.child_sessions; parent uuid;
begin
  if p_token is null or char_length(p_token)<>64 then raise exception 'session_expired'; end if;
  select * into s from public.child_sessions where token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') and expires_at>now() and revoked_at is null;
  if s.child_id is null then raise exception 'session_expired'; end if;
  select parent_id into parent from public.children where id=s.child_id;
  if parent is distinct from s.actor_id then
    perform 1 from public.school_grants where child_id=s.child_id and teacher_id=s.actor_id and revoked_at is null for share;
    if not found then raise exception 'session_expired'; end if;
  end if;
  -- Lock in the same order as revocation (grant, then session), then recheck.
  perform 1 from public.child_sessions where token_hash=s.token_hash and expires_at>now() and revoked_at is null for share;
  if not found then raise exception 'session_expired'; end if;
  return s.child_id;
end $$;
create function public.child_status(p_token text) returns jsonb language plpgsql security definer set search_path='' as $$
declare kid uuid;
begin
  kid:=public._session_child(p_token);
  return jsonb_build_object('completed',public._completed(kid));
end $$;
create function public.complete_activity(p_token text,p_activity text) returns jsonb language plpgsql security definer set search_path='' as $$
declare kid uuid;
begin
  kid:=public._session_child(p_token);
  if p_activity is null or p_activity not in ('vogais','casa-das-vogais') then raise exception 'access_denied'; end if;
  insert into public.activity_completions(child_id,activity) values(kid,p_activity) on conflict(child_id,activity) do nothing;
  return jsonb_build_object('completed',public._completed(kid));
end $$;
create function public.end_child_session(p_token text) returns void language sql security definer set search_path='' as $$
  update public.child_sessions set revoked_at=now() where token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex');
$$;

-- Functions have implicit PUBLIC execution in PostgreSQL; explicitly close every helper.
revoke execute on function public._new_adult(),public._allowed_child(uuid,uuid),public._completed(uuid),public._session_child(text) from public,anon,authenticated;
revoke execute on function public.dashboard_data(),public.create_child(text,text),public.create_invite(),public.preview_invite(text),public.accept_invite(text,uuid),public.revoke_grant(uuid),public.start_child_session(uuid),public.child_status(text),public.complete_activity(text,text),public.end_child_session(text) from public,anon,authenticated;
grant execute on function public.dashboard_data(),public.create_child(text,text),public.create_invite(),public.preview_invite(text),public.accept_invite(text,uuid),public.revoke_grant(uuid),public.start_child_session(uuid) to authenticated;
grant execute on function public.child_status(text),public.complete_activity(text,text),public.end_child_session(text) to anon,authenticated;
commit;

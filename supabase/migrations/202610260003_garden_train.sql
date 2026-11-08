-- Add new content without removing completion records or changing access rules.
begin;
alter table public.activity_completions drop constraint activity_completions_activity_check;
alter table public.activity_completions add constraint activity_completions_activity_check
  check (activity in ('vogais','casa-das-vogais','memoria-vogais','letras-figuras','elefantinho-semente','pipa-amizade','jardim-letras','trem-vogais'));

create or replace function public.complete_activity(p_token text,p_activity text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare kid uuid;
begin
  kid:=public._session_child(p_token);
  if p_activity is null or p_activity not in ('vogais','casa-das-vogais','memoria-vogais','letras-figuras','elefantinho-semente','pipa-amizade','jardim-letras','trem-vogais') then raise exception 'access_denied'; end if;
  insert into public.activity_completions(child_id,activity) values(kid,p_activity) on conflict(child_id,activity) do nothing;
  return jsonb_build_object('completed',public._completed(kid));
end $$;
revoke execute on function public.complete_activity(text,text) from public,anon,authenticated;
grant execute on function public.complete_activity(text,text) to anon,authenticated;
commit;

-- Run once in a new Supabase project. API writes are only allowed through the RPC.
begin;
create table public.reparte_events (
  id text primary key check (id ~ '^[a-zA-Z0-9_-]{1,80}$'),
  owner_id uuid not null references auth.users(id) on delete cascade,
  view_token uuid not null unique default gen_random_uuid(),
  version integer not null default 1,
  snapshot jsonb not null check (octet_length(snapshot::text) <= 1000000),
  updated_at timestamptz not null default now()
);
alter table public.reparte_events enable row level security;
revoke all on public.reparte_events from anon, authenticated;
grant select on public.reparte_events to authenticated;
create policy owner_read on public.reparte_events for select to authenticated using (owner_id = (select auth.uid()));

create function public.save_reparte_event(p_id text, p_snapshot jsonb, p_version integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare current_row public.reparte_events; clean jsonb;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_id is null or p_snapshot is null or p_version is null or p_version < 0 or
     jsonb_typeof(p_snapshot) <> 'object' or p_snapshot->>'id' is distinct from p_id or
     jsonb_typeof(p_snapshot->'members') is distinct from 'array' or
     jsonb_typeof(p_snapshot->'expenses') is distinct from 'array' or
     jsonb_typeof(p_snapshot->'payments') is distinct from 'array' then
    raise exception 'Invalid event' using errcode='22023';
  end if;
  -- Public event fields only. Bank details, browser roles, sessions, and sync metadata
  -- are never stored, even if a modified client tries to upload them.
  clean = jsonb_build_object('id',p_id,'name',p_snapshot->'name','createdAt',p_snapshot->'createdAt',
    'closed',p_snapshot->'closed','closedAt',p_snapshot->'closedAt','organizerId',p_snapshot->'organizerId',
    'fx',p_snapshot->'fx','fee',null,
    'members',(select coalesce(jsonb_agg(jsonb_build_object('id',m->'id','name',m->'name')), '[]'::jsonb) from jsonb_array_elements(p_snapshot->'members') m),
    'expenses',(select coalesce(jsonb_agg(jsonb_build_object('id',e->'id','title',e->'title','amt',e->'amt','cur',e->'cur','fx',e->'fx','payerId',e->'payerId','among',e->'among','date',e->'date','history',e->'history')), '[]'::jsonb) from jsonb_array_elements(p_snapshot->'expenses') e),
    'payments',(select coalesce(jsonb_agg(jsonb_build_object('id',p->'id','from',p->'from','to',p->'to','amt',p->'amt','at',p->'at','recordedBy',p->'recordedBy')), '[]'::jsonb) from jsonb_array_elements(p_snapshot->'payments') p));
  -- Serializes concurrent first inserts as well as updates for the same ID.
  perform pg_advisory_xact_lock(hashtextextended(p_id, 0));
  select * into current_row from public.reparte_events where id=p_id for update;
  if found then
    if current_row.owner_id <> auth.uid() then raise exception 'Forbidden' using errcode='42501'; end if;
    if current_row.version <> p_version then raise exception 'Version conflict' using errcode='40001'; end if;
    update public.reparte_events set snapshot=clean,version=version+1,updated_at=now() where id=p_id returning * into current_row;
  else
    if p_version <> 0 then raise exception 'Version conflict' using errcode='40001'; end if;
    insert into public.reparte_events(id,owner_id,snapshot) values(p_id,auth.uid(),clean) returning * into current_row;
  end if;
  return jsonb_build_object('version',current_row.version,'view_token',current_row.view_token);
end;
$$;

-- Possession of the random invitation token grants read-only access to the whole
-- shared account. No private subgroups are promised in this pilot.
create function public.read_reparte_event(p_token uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('snapshot',snapshot,'version',version)
  from public.reparte_events where view_token=p_token;
$$;
revoke all on function public.save_reparte_event(text,jsonb,integer) from public,anon,authenticated;
revoke all on function public.read_reparte_event(uuid) from public,anon,authenticated;
grant execute on function public.save_reparte_event(text,jsonb,integer) to authenticated;
grant execute on function public.read_reparte_event(uuid) to anon,authenticated;
commit;

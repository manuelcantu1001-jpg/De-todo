-- Run in Supabase SQL Editor after schema.sql. All fixture data is rolled back.
begin;
insert into auth.users(id,email) values
 ('10000000-0000-4000-8000-000000000001','reparte-test-owner@example.invalid'),
 ('10000000-0000-4000-8000-000000000002','reparte-test-other@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
select public.save_reparte_event('reparte-permission-test',
 '{"id":"reparte-permission-test","name":"Pilot","createdAt":"2026-09-23","closed":false,"organizerId":"ana","fx":18,"members":[{"id":"ana","name":"Ana","clabe":"DO-NOT-SHARE"}],"expenses":[],"payments":[],"session":"DO-NOT-SHARE"}'::jsonb,0);
do $$ begin
 if (select count(*) from public.reparte_events where id='reparte-permission-test') <> 1 then raise exception 'Owner cannot read'; end if;
 if (select snapshot::text like '%DO-NOT-SHARE%' from public.reparte_events where id='reparte-permission-test') then raise exception 'Sensitive fields leaked'; end if;
 begin
   update public.reparte_events set version=99 where id='reparte-permission-test';
   raise exception 'Direct update was allowed';
 exception when insufficient_privilege then null; end;
 begin
   perform public.save_reparte_event('reparte-permission-test',(select snapshot from public.reparte_events where id='reparte-permission-test'),0);
   raise exception 'Stale write was allowed';
 exception when serialization_failure then null; end;
end $$;
select set_config('reparte.test_token',(select view_token::text from public.reparte_events where id='reparte-permission-test'),true);
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
do $$ begin
 if exists(select 1 from public.reparte_events where id='reparte-permission-test') then raise exception 'Other owner can read'; end if;
 begin
   perform public.save_reparte_event('reparte-permission-test','{"id":"reparte-permission-test","members":[],"expenses":[],"payments":[]}'::jsonb,1);
   raise exception 'Other owner can write';
 exception when insufficient_privilege then null; end;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ declare result jsonb; begin
 result=public.read_reparte_event(current_setting('reparte.test_token')::uuid);
 if result->'snapshot'->>'id' is distinct from 'reparte-permission-test' then raise exception 'Invitation failed'; end if;
 if result::text like '%DO-NOT-SHARE%' or result ? 'owner_id' then raise exception 'Invitation leaked sensitive fields'; end if;
 if public.read_reparte_event('20000000-0000-4000-8000-000000000099') is not null then raise exception 'Unknown token returned data'; end if;
 begin
   perform 1 from public.reparte_events;
   raise exception 'Anonymous table read allowed';
 exception when insufficient_privilege then null; end;
 begin
   perform public.save_reparte_event('anonymous','{"id":"anonymous","members":[],"expenses":[],"payments":[]}'::jsonb,0);
   raise exception 'Anonymous write allowed';
 exception when insufficient_privilege then null; end;
end $$;
rollback;

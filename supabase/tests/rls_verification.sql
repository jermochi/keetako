-- RLS verification — proves per-user isolation (DEVPLAN M2 AC, Risk #5).
--
-- Creates two auth users (their profiles are auto-created by the
-- on_auth_user_created trigger), seeds data owned by user A, then, acting as
-- user B via `set local role authenticated` + a forged JWT claim, asserts B is
-- blocked from every operation on A's rows. User A is the positive control.
--
-- Non-destructive: the whole run is wrapped in begin/rollback, so it leaves no
-- residue and is safe to re-run for QA. Any failure raises and aborts.
--
-- Run against the hosted DB, e.g.:
--   supabase db execute --file supabase/tests/rls_verification.sql
--   psql "$DATABASE_URL" -f supabase/tests/rls_verification.sql
-- Success prints only NOTICE lines starting with "PASS".

begin;

-- Two test users (fixed UUIDs). The trigger creates their profiles.
insert into auth.users (id, instance_id, aud, role, email, created_at, updated_at)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','rls-test-a@example.com', now(), now()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','rls-test-b@example.com', now(), now());

-- Seed data owned by A (as the privileged role, which bypasses RLS).
insert into creators (id, user_id, handle) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','@creator_a');
insert into threads (id, user_id, creator_id, product) values
  ('dddddddd-dddd-dddd-dddd-dddddddddddd','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'cccccccc-cccc-cccc-cccc-cccccccccccc','Serum');

-- ===== Act as user B (what PostgREST does for a signed-in request) =====
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","role":"authenticated"}', true);

do $$
declare n int;
begin
  select count(*) into n from creators where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  if n <> 0 then raise exception 'FAIL: B can SELECT A''s creator (got %)', n; end if;

  select count(*) into n from threads where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
  if n <> 0 then raise exception 'FAIL: B can SELECT A''s thread (got %)', n; end if;

  update creators set notes = 'hacked' where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: B UPDATEd A''s creator (% rows)', n; end if;

  delete from threads where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: B DELETEd A''s thread (% rows)', n; end if;

  raise notice 'PASS: B is blocked from SELECT/UPDATE/DELETE on A''s rows';
end $$;

-- B must not be able to INSERT a row owned by A (WITH CHECK).
do $$
begin
  insert into creators (user_id, handle)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','@spoof');
  raise exception 'FAIL: B INSERTed a creator owned by A';
exception
  when insufficient_privilege then
    raise notice 'PASS: B blocked from INSERTing a row owned by A';
end $$;

-- ===== Positive control: user A sees its own rows =====
select set_config('request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}', true);

do $$
declare n int;
begin
  select count(*) into n from creators where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  if n <> 1 then raise exception 'FAIL: A cannot SELECT own creator (got %)', n; end if;

  select count(*) into n from threads where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
  if n <> 1 then raise exception 'FAIL: A cannot SELECT own thread (got %)', n; end if;

  raise notice 'PASS: A sees its own rows (positive control)';
end $$;

reset role;
rollback;

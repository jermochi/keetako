-- 0004_harden.sql — Security-advisor hardening for the objects created in 0001–0003.
-- (rls_auto_enable is a pre-existing project-level event trigger and is intentionally left untouched.)

-- Pin search_path on the updated_at trigger function.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger functions never need to be callable over the REST/RPC API; triggers
-- fire as the table owner regardless of these grants.
revoke all on function public.handle_new_user()  from public, anon, authenticated;
revoke all on function public.enforce_free_cap() from public, anon, authenticated;
revoke all on function public.set_updated_at()   from public, anon, authenticated;

-- 0003_free_cap.sql — Free-plan active-thread cap (DEVPLAN §1)
-- The server is the source of truth; the client only pre-checks and maps the
-- FREE_CAP_REACHED error to the paywall.
-- Active thread := status <> 'gmv_logged' AND closed_at IS NULL. Free = max 10.

create function public.enforce_free_cap()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  ent          public.entitlement;
  active_count int;
begin
  -- Only rows that would be "active" count against the cap.
  if new.status = 'gmv_logged' or new.closed_at is not null then
    return new;
  end if;

  select entitlement into ent from public.profiles where id = new.user_id;
  if ent <> 'free' then
    return new;                       -- pro/founder are unlimited
  end if;

  select count(*) into active_count
  from public.threads
  where user_id = new.user_id
    and status <> 'gmv_logged'
    and closed_at is null
    and id <> new.id;                 -- exclude self on UPDATE

  if active_count >= 10 then
    raise exception 'FREE_CAP_REACHED';
  end if;

  return new;
end;
$$;

create trigger threads_free_cap
  before insert or update on public.threads
  for each row execute function public.enforce_free_cap();

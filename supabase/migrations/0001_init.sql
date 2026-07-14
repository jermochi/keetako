-- 0001_init.sql — Keetako data model (DEVPLAN §1)
-- Enums, tables, profile-create trigger, updated_at triggers, and RLS.
-- Every table is scoped to the owner: user_id = auth.uid() (profiles: id = auth.uid()).

-- ── Enums ────────────────────────────────────────────────────────────────────
create type platform      as enum ('tiktok_shop','shopee','other');
create type thread_status as enum ('requested','approved','shipped','delivered','content_due','posted','gmv_logged');
create type creator_tag   as enum ('reinvest','blocklist');
create type entitlement   as enum ('free','pro','founder');

-- ── Tables ───────────────────────────────────────────────────────────────────
-- profiles: one row per auth user, auto-created by trigger on auth.users insert.
create table profiles (
  id                   uuid primary key references auth.users on delete cascade,
  shop_name            text,
  ghost_threshold_days int  not null default 7,                 -- the "N" in auto ghost-flag
  entitlement          entitlement not null default 'free',     -- mirrored from RevenueCat webhook
  onboarded_at         timestamptz,
  created_at           timestamptz not null default now()
);

create table creators (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles on delete cascade,
  handle     text not null,
  platform   platform not null default 'tiktok_shop',
  niche      text,
  followers  int,
  contact    text,
  notes      text,
  tag        creator_tag,                                        -- null | reinvest | blocklist (manual)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, handle, platform)
);

create table threads (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references profiles on delete cascade,
  creator_id        uuid not null references creators on delete cascade,
  product           text not null,
  status            thread_status not null default 'requested',
  tracking_number   text,
  sample_cost       numeric(10,2) not null default 0 check (sample_cost >= 0),
  ship_date         date,
  content_due_date  date,
  posted_url        text,
  posted_at         timestamptz,                                 -- set when URL logged (monthly attribution)
  gmv               numeric(12,2) check (gmv >= 0),
  gmv_logged_at     timestamptz,
  closed_at         timestamptz,                                 -- "write off" a dead/ghosted thread
  status_changed_at timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (status not in ('posted','gmv_logged') or posted_url is not null),
  check (status <> 'gmv_logged' or gmv is not null)
);

create index creators_user_id_idx on creators (user_id);
create index threads_user_id_idx  on threads  (user_id);
create index threads_creator_id_idx on threads (creator_id);

create table ai_usage (                                          -- rate limiting + COGS tracking
  id            bigint generated always as identity primary key,
  user_id       uuid not null references profiles on delete cascade,
  feature       text not null check (feature in ('followup','extract')),
  input_tokens  int,
  output_tokens int,
  created_at    timestamptz not null default now()
);

create index ai_usage_user_feature_created_idx on ai_usage (user_id, feature, created_at);

-- ── Trigger: create a profile row for each new auth user ─────────────────────
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Trigger: keep updated_at current on creators + threads ───────────────────
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger creators_set_updated_at
  before update on creators
  for each row execute function public.set_updated_at();

create trigger threads_set_updated_at
  before update on threads
  for each row execute function public.set_updated_at();

-- ── Row-Level Security ───────────────────────────────────────────────────────
alter table profiles enable row level security;
alter table creators enable row level security;
alter table threads  enable row level security;
alter table ai_usage enable row level security;

create policy "own profile"  on profiles for all to authenticated
  using (id = auth.uid())      with check (id = auth.uid());

create policy "own creators" on creators for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own threads"  on threads for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own ai_usage" on ai_usage for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

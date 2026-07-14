-- 0005_grants.sql — Role privileges for the PostgREST roles.
-- RLS restricts *rows*; these GRANTs are the separate, required *table* layer —
-- without them PostgREST hits "permission denied" as `authenticated` before RLS
-- is ever evaluated. (Supabase's default-privilege auto-grant did not apply to
-- tables created via the MCP, so we grant explicitly — also correct on a fresh
-- reset.) `anon` is intentionally omitted: all Keetako data is per-user behind
-- auth, and no policy targets anon, so anon can touch nothing.

grant usage on schema public to authenticated, service_role;

grant select, insert, update, delete
  on public.profiles, public.creators, public.threads, public.ai_usage
  to authenticated, service_role;

grant select
  on public.thread_flags, public.creator_stats, public.monthly_report
  to authenticated, service_role;

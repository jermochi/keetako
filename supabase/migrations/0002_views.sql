-- 0002_views.sql — Derived read models (DEVPLAN §1)
-- All numbers on screen come from these views, never client/model math.
-- security_invoker = true so the caller's RLS applies through the view.

-- thread_flags — per thread: is it stalled, and how many days overdue.
create view thread_flags with (security_invoker = true) as
select
  t.id      as thread_id,
  t.user_id,
  ( t.content_due_date < current_date
    and t.posted_url is null
    and t.closed_at is null
    and t.status not in ('posted','gmv_logged') ) as is_stalled,
  case
    when t.content_due_date is not null and t.content_due_date < current_date
      then current_date - t.content_due_date
    else 0
  end as days_overdue
from threads t;

-- creator_stats — per creator rollup for the ROI board + ghost flag.
-- is_ghost / ghosted_count use the owner's ghost_threshold_days ("N"): an open,
-- unposted thread that is at least N days past its content_due_date.
create view creator_stats with (security_invoker = true) as
select
  c.id      as creator_id,
  c.user_id,
  count(*) filter (where t.ship_date is not null)   as samples_sent,
  coalesce(sum(t.sample_cost), 0)                    as total_cost,
  count(*) filter (where t.posted_url is not null)   as posts,
  coalesce(sum(t.gmv), 0)                            as total_gmv,
  coalesce(sum(t.gmv), 0) - coalesce(sum(t.sample_cost), 0)      as net_roi,
  coalesce(sum(t.gmv), 0) / nullif(sum(t.sample_cost), 0)        as roi_multiple,
  count(*) filter (
    where t.posted_url is null
      and t.closed_at is null
      and t.status not in ('posted','gmv_logged')
      and t.content_due_date is not null
      and (current_date - t.content_due_date) >= p.ghost_threshold_days
  ) as ghosted_count,
  coalesce(bool_or(
    t.posted_url is null
      and t.closed_at is null
      and t.status not in ('posted','gmv_logged')
      and t.content_due_date is not null
      and (current_date - t.content_due_date) >= p.ghost_threshold_days
  ), false) as is_ghost
from creators c
join profiles p on p.id = c.user_id
left join threads t on t.creator_id = c.id
group by c.id, c.user_id;

-- monthly_report — per month, each metric attributed to its own real date column
-- (samples by ship_date, posts by posted_at, GMV by gmv_logged_at, ghosted when
-- due+N falls in the month and there's still no post). Built by unioning the
-- date sources so a thread contributes to whatever month each event landed in.
create view monthly_report with (security_invoker = true) as
with events as (
  select user_id, date_trunc('month', ship_date)::date as month,
         1 as sample, sample_cost as cost, 0 as post, 0::numeric as gmv, 0 as ghosted
  from threads where ship_date is not null
  union all
  select user_id, date_trunc('month', posted_at)::date,
         0, 0, 1, 0::numeric, 0
  from threads where posted_at is not null
  union all
  select user_id, date_trunc('month', gmv_logged_at)::date,
         0, 0, 0, coalesce(gmv, 0), 0
  from threads where gmv_logged_at is not null
  union all
  select t.user_id, date_trunc('month', t.content_due_date + p.ghost_threshold_days)::date,
         0, 0, 0, 0::numeric, 1
  from threads t
  join profiles p on p.id = t.user_id
  where t.content_due_date is not null
    and t.posted_url is null
)
select
  user_id,
  month,
  sum(sample)                as samples_sent,
  sum(cost)                  as total_cost,
  sum(post)                  as posts,
  sum(gmv)                   as total_gmv,
  sum(gmv) - sum(cost)       as net_roi,
  sum(ghosted)               as ghosted
from events
group by user_id, month;

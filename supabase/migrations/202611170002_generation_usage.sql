-- Durable per-user daily generation quota for live AI requests.
-- Apply only to the confirmed ViralBatch Supabase project.
create table if not exists public.generation_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists generation_usage_user_created_idx
  on public.generation_usage (user_id, created_at desc);
alter table public.generation_usage enable row level security;
revoke all on table public.generation_usage from anon, authenticated;

create or replace function public.consume_generation_credit()
returns table (allowed boolean, remaining integer, daily_limit integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_used integer;
  v_limit constant integer := 30;
  v_day_start timestamptz := date_trunc('day', now() at time zone 'utc') at time zone 'utc';
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text || v_day_start::text, 0)
  );

  select count(*)::integer into v_used
  from public.generation_usage
  where user_id = v_user_id and created_at >= v_day_start;

  if v_used >= v_limit then
    return query select false, 0, v_limit;
    return;
  end if;

  insert into public.generation_usage (user_id) values (v_user_id);
  return query select true, v_limit - v_used - 1, v_limit;
end;
$$;

revoke all on function public.consume_generation_credit() from public, anon;
grant execute on function public.consume_generation_credit() to authenticated;

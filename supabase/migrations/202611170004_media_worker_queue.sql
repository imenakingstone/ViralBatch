-- Durable queue leasing and server-only worker transitions.
alter table public.media_jobs
  add column if not exists attempts integer not null default 0 check (attempts >= 0),
  add column if not exists locked_at timestamptz,
  add column if not exists last_error text;

create index if not exists media_jobs_queue_idx
  on public.media_jobs (status, created_at)
  where status in ('uploaded','queued','processing');

create or replace function public.claim_media_job()
returns table (
  id uuid,
  user_id uuid,
  storage_path text,
  original_filename text,
  mime_type text,
  size_bytes bigint,
  attempts integer
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'Service role required';
  end if;

  return query
  with candidate as (
    select job.id
    from public.media_jobs as job
    where (
      job.status in ('uploaded','queued')
      or (job.status = 'processing' and job.locked_at < now() - interval '20 minutes')
    )
    and job.attempts < 3
    order by job.created_at asc
    for update skip locked
    limit 1
  )
  update public.media_jobs as job
  set status = 'processing',
      attempts = job.attempts + 1,
      locked_at = now(),
      updated_at = now(),
      last_error = null
  from candidate
  where job.id = candidate.id
  returning job.id, job.user_id, job.storage_path, job.original_filename,
            job.mime_type, job.size_bytes, job.attempts;
end;
$$;

create or replace function public.complete_media_job(p_job_id uuid, p_transcript jsonb)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'Service role required';
  end if;
  update public.media_jobs
  set status = 'completed',
      transcript = p_transcript,
      locked_at = null,
      last_error = null,
      updated_at = now()
  where id = p_job_id and status = 'processing';
  return found;
end;
$$;

create or replace function public.fail_media_job(p_job_id uuid, p_error text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare v_status text;
begin
  if coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'Service role required';
  end if;
  update public.media_jobs
  set status = case when attempts >= 3 then 'failed' else 'queued' end,
      last_error = left(coalesce(p_error, 'Processing failed'), 1000),
      error_message = left(coalesce(p_error, 'Processing failed'), 1000),
      locked_at = null,
      updated_at = now()
  where id = p_job_id and status = 'processing'
  returning status into v_status;
  return v_status;
end;
$$;

revoke all on function public.claim_media_job() from public, anon, authenticated;
revoke all on function public.complete_media_job(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.fail_media_job(uuid, text) from public, anon, authenticated;
grant execute on function public.claim_media_job() to service_role;
grant execute on function public.complete_media_job(uuid, jsonb) to service_role;
grant execute on function public.fail_media_job(uuid, text) to service_role;

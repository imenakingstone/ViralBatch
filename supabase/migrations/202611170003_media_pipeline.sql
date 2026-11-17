-- Private source-media storage and per-user processing-job records.
create table if not exists public.media_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 536870912),
  status text not null default 'awaiting_upload'
    check (status in ('awaiting_upload','uploaded','queued','processing','completed','failed')),
  error_message text,
  duration_seconds numeric(10,3),
  transcript jsonb,
  clip_suggestions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists media_jobs_user_created_idx
  on public.media_jobs (user_id, created_at desc);
alter table public.media_jobs enable row level security;
revoke all on table public.media_jobs from anon, authenticated;
grant select, insert, update, delete on public.media_jobs to authenticated;
drop policy if exists "Users can view own media jobs" on public.media_jobs;
create policy "Users can view own media jobs" on public.media_jobs
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can create own media jobs" on public.media_jobs;
create policy "Users can create own media jobs" on public.media_jobs
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update own media jobs" on public.media_jobs;
create policy "Users can update own media jobs" on public.media_jobs
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "Users can delete own media jobs" on public.media_jobs;
create policy "Users can delete own media jobs" on public.media_jobs
  for delete to authenticated using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'source-media',
  'source-media',
  false,
  536870912,
  array['video/mp4','video/quicktime','video/webm','audio/mpeg','audio/mp4','audio/wav','audio/x-wav','audio/aac','audio/webm']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload own source media" on storage.objects;
create policy "Users can upload own source media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'source-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Users can view own source media" on storage.objects;
create policy "Users can view own source media" on storage.objects
  for select to authenticated
  using (bucket_id = 'source-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Users can update own source media" on storage.objects;
create policy "Users can update own source media" on storage.objects
  for update to authenticated
  using (bucket_id = 'source-media' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'source-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Users can delete own source media" on storage.objects;
create policy "Users can delete own source media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'source-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

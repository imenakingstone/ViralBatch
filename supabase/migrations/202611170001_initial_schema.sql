-- ViralBatch initial schema. Review and run in the intended Supabase project only.
create extension if not exists pgcrypto;
create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, email text, full_name text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.batches (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text not null default 'Untitled batch', language text not null default 'English' check (language in ('English','Kinyarwanda','Mixed (Kinyarwanda + English)','French')), original_script text not null check (char_length(original_script) between 20 and 12000), tone text not null default 'Engaging', hooks jsonb not null default '[]'::jsonb, captions jsonb not null default '{}'::jsonb, hashtags jsonb not null default '[]'::jsonb, generation_mode text not null default 'demo' check (generation_mode in ('ai','demo')), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index if not exists batches_user_created_idx on public.batches (user_id, created_at desc);
alter table public.profiles enable row level security;
revoke all on table public.profiles from anon, authenticated;
grant select, update on table public.profiles to authenticated;
alter table public.batches enable row level security;
revoke all on table public.batches from anon, authenticated;
grant select, insert, update, delete on table public.batches to authenticated;
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
drop policy if exists "Users can view own batches" on public.batches;
create policy "Users can view own batches" on public.batches for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can create own batches" on public.batches;
create policy "Users can create own batches" on public.batches for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update own batches" on public.batches;
create policy "Users can update own batches" on public.batches for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users can delete own batches" on public.batches;
create policy "Users can delete own batches" on public.batches for delete to authenticated using ((select auth.uid()) = user_id);
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$ begin insert into public.profiles (id,email,full_name) values (new.id,new.email,coalesce(new.raw_user_meta_data ->> 'full_name','')) on conflict (id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

revoke all on function public.handle_new_user() from public, anon, authenticated;

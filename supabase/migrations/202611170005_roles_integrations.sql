-- Role-based access control and integration registry for ViralBatch.
-- Roles are assigned server-side; users cannot promote themselves.
alter table public.profiles
  add column if not exists role text not null default 'creator'
  check (role in ('admin','creator','agency'));

create table if not exists public.user_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('openai','pindo','tiktok','instagram','youtube')),
  status text not null default 'disconnected' check (status in ('connected','disconnected','needs_reauth','error')),
  capabilities jsonb not null default '[]'::jsonb,
  account_label text,
  connected_at timestamptz,
  last_checked_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, provider)
);

alter table public.user_integrations enable row level security;
revoke all on table public.user_integrations from anon, authenticated;
grant select on table public.user_integrations to authenticated;
create policy "Users can view own integrations"
  on public.user_integrations for select to authenticated
  using ((select auth.uid()) = user_id);

-- Replace broad profile update permission so a user cannot update their own role.
revoke update on table public.profiles from authenticated;
grant update (full_name) on table public.profiles to authenticated;

create or replace function public.set_member_role(p_user_id uuid, p_role text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_role not in ('admin','creator','agency') then
    raise exception 'Invalid role';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Admin role required';
  end if;
  update public.profiles set role = p_role, updated_at = now()
  where id = p_user_id;
  return found;
end;
$$;

revoke all on function public.set_member_role(uuid,text) from public, anon;
grant execute on function public.set_member_role(uuid,text) to authenticated;

create or replace function public.get_my_workspace_role()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;
revoke all on function public.get_my_workspace_role() from public, anon;
grant execute on function public.get_my_workspace_role() to authenticated;

create index if not exists user_integrations_user_idx
  on public.user_integrations(user_id, provider);

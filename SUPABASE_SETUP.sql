-- Execute in your own Supabase SQL editor. Authenticated users can only access sessions they own.
-- Session IDs are unique PER USER (primary key = owner_id + id), so two users can both use "research-team".
create table if not exists public.research_sessions (
  id text not null check (char_length(id) between 1 and 100),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (owner_id, id)
);

-- If you already created the old table (primary key on id only), migrate it instead:
--   alter table public.research_sessions drop constraint research_sessions_pkey;
--   alter table public.research_sessions add primary key (owner_id, id);

-- Keep updated_at current on every update.
create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists research_sessions_updated_at on public.research_sessions;
create trigger research_sessions_updated_at before update on public.research_sessions
  for each row execute function public.set_updated_at();

alter table public.research_sessions enable row level security;
drop policy if exists "owner read"   on public.research_sessions;
drop policy if exists "owner insert" on public.research_sessions;
drop policy if exists "owner update" on public.research_sessions;
create policy "owner read"   on public.research_sessions for select to authenticated using (owner_id = (select auth.uid()));
create policy "owner insert" on public.research_sessions for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "owner update" on public.research_sessions for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
-- To collaborate across users, implement explicit membership and invitation policies; do not disable RLS.

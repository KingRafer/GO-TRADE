-- ============================================================
-- GO TRADE — Migration: activity_logs
-- Jalankan di Supabase Dashboard → SQL Editor jika database
-- sudah ada sebelum fitur log aktivitas ditambahkan.
-- ============================================================

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_email text,
  actor_role text,
  action text not null,
  target text,
  detail text default '',
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists activity_logs_created_at_idx on public.activity_logs (created_at desc);
create index if not exists activity_logs_actor_idx on public.activity_logs (actor_email);

alter table public.activity_logs enable row level security;

drop policy if exists "activity_insert" on public.activity_logs;
create policy "activity_insert" on public.activity_logs for insert with check (
  auth.role() = 'authenticated'
);

drop policy if exists "activity_select_admin" on public.activity_logs;
create policy "activity_select_admin" on public.activity_logs for select using (
  public.is_admin()
  or actor_email = (select email from public.profiles where id = auth.uid())
);

drop policy if exists "activity_delete_admin" on public.activity_logs;
create policy "activity_delete_admin" on public.activity_logs for delete using (public.is_admin());

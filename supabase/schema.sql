-- ============================================================
-- GO TRADE — Full Supabase Schema (production-oriented)
-- Run once in Supabase SQL Editor
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  role text default 'member' check (role in ('member', 'admin')),
  wallet_balance numeric default 0 check (wallet_balance >= 0),
  active_package text,
  referral_code text unique,
  verified boolean default false,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.signals (
  id uuid primary key default gen_random_uuid(),
  pair text not null,
  side text not null check (side in ('long', 'short')),
  entry numeric,
  sl numeric,
  tp1 numeric,
  tp2 numeric,
  tp3 numeric,
  confidence int check (confidence is null or (confidence >= 0 and confidence <= 100)),
  reason text,
  timeframe text,
  status text default 'active',
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text not null,
  amount numeric not null,
  status text default 'pending' check (status in ('pending', 'completed', 'rejected', 'cancelled')),
  note text,
  created_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  body text,
  read boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.packages (
  id text primary key,
  name text not null,
  price numeric not null check (price >= 0),
  roi numeric not null,
  duration_days int not null check (duration_days > 0),
  features jsonb,
  active boolean default true
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  actor_email text,
  actor_role text,
  action text not null,
  target text,
  detail text default '',
  meta jsonb default '{}'::jsonb,
  ip_hint text,
  created_at timestamptz default now()
);

create table if not exists public.user_packages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  package_id text references public.packages(id),
  amount numeric not null,
  started_at timestamptz default now(),
  ends_at timestamptz,
  status text default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz default now()
);

create index if not exists idx_transactions_user on public.transactions (user_id, created_at desc);
create index if not exists idx_notifications_user on public.notifications (user_id, read);
create index if not exists idx_signals_status on public.signals (status, created_at desc);
create index if not exists idx_activity_created on public.activity_logs (created_at desc);
create index if not exists idx_activity_actor on public.activity_logs (actor_email);
create index if not exists idx_user_packages_user on public.user_packages (user_id, status);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role, referral_code)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'member',
    'GT' || upper(substr(md5(random()::text), 1, 6))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.wallet_balance := old.wallet_balance;
    new.verified := old.verified;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_protect_profile on public.profiles;
create trigger trg_protect_profile
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

alter table public.profiles enable row level security;
alter table public.signals enable row level security;
alter table public.transactions enable row level security;
alter table public.notifications enable row level security;
alter table public.packages enable row level security;
alter table public.activity_logs enable row level security;
alter table public.user_packages enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select
  using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles for update
  using (auth.uid() = id or public.is_admin());
create policy "profiles_insert_own" on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "signals_read" on public.signals;
drop policy if exists "signals_admin" on public.signals;
drop policy if exists "signals_admin_write" on public.signals;
drop policy if exists "signals_admin_update" on public.signals;
drop policy if exists "signals_admin_delete" on public.signals;
create policy "signals_read" on public.signals for select
  to authenticated using (true);
create policy "signals_admin_write" on public.signals for insert
  with check (public.is_admin());
create policy "signals_admin_update" on public.signals for update
  using (public.is_admin());
create policy "signals_admin_delete" on public.signals for delete
  using (public.is_admin());

drop policy if exists "tx_own" on public.transactions;
drop policy if exists "tx_insert_own" on public.transactions;
drop policy if exists "tx_select_own" on public.transactions;
drop policy if exists "tx_admin_update" on public.transactions;
create policy "tx_select_own" on public.transactions for select
  using (auth.uid() = user_id or public.is_admin());
create policy "tx_insert_own" on public.transactions for insert
  with check (auth.uid() = user_id);
create policy "tx_admin_update" on public.transactions for update
  using (public.is_admin());

drop policy if exists "notif_own" on public.notifications;
drop policy if exists "notif_select_own" on public.notifications;
drop policy if exists "notif_update_own" on public.notifications;
drop policy if exists "notif_admin_insert" on public.notifications;
create policy "notif_select_own" on public.notifications for select
  using (auth.uid() = user_id or public.is_admin());
create policy "notif_update_own" on public.notifications for update
  using (auth.uid() = user_id);
create policy "notif_admin_insert" on public.notifications for insert
  with check (public.is_admin() or auth.uid() = user_id);

drop policy if exists "packages_read" on public.packages;
drop policy if exists "packages_admin" on public.packages;
create policy "packages_read" on public.packages for select
  to authenticated using (true);
create policy "packages_admin" on public.packages for all
  using (public.is_admin());

drop policy if exists "up_select_own" on public.user_packages;
drop policy if exists "up_insert_own" on public.user_packages;
drop policy if exists "up_admin_all" on public.user_packages;
create policy "up_select_own" on public.user_packages for select
  using (auth.uid() = user_id or public.is_admin());
create policy "up_insert_own" on public.user_packages for insert
  with check (auth.uid() = user_id);
create policy "up_admin_all" on public.user_packages for all
  using (public.is_admin());

drop policy if exists "activity_insert" on public.activity_logs;
drop policy if exists "activity_select_admin" on public.activity_logs;
drop policy if exists "activity_select" on public.activity_logs;
drop policy if exists "activity_delete_admin" on public.activity_logs;
create policy "activity_insert" on public.activity_logs for insert
  with check (auth.role() = 'authenticated');
create policy "activity_select" on public.activity_logs for select
  using (
    public.is_admin()
    or actor_id = auth.uid()
    or actor_email = (select email from public.profiles where id = auth.uid())
  );
create policy "activity_delete_admin" on public.activity_logs for delete
  using (public.is_admin());

insert into public.packages (id, name, price, roi, duration_days, features, active) values
  ('starter', 'Starter', 50, 1.1, 30, '["Sinyal dasar","Chart","Support komunitas"]'::jsonb, true),
  ('growth', 'Growth', 250, 1.8, 45, '["Sinyal prioritas","AI Coach","Trailing stop"]'::jsonb, true),
  ('pro', 'Pro', 1000, 2.5, 60, '["Sinyal eksklusif","Dedicated support","Early access"]'::jsonb, true)
on conflict (id) do nothing;

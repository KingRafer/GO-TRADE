-- ============================================================
-- GO TRADE — Supabase Schema
-- Jalankan di Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text not null default '',
  role text not null default 'member' check (role in ('member', 'admin')),
  referral_code text unique,
  referred_by text,
  level int default 1,
  wallet_balance numeric(14,2) default 0,
  verified boolean default false,
  status text default 'active',
  avatar text,
  joined date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Packages catalog
create table if not exists public.packages (
  id text primary key,
  name text not null,
  min_deposit numeric(14,2) not null default 50,
  daily_roi numeric(8,2) not null default 1,
  duration int not null default 30,
  color text default '#e3fbf1',
  icon text default 'sparkles',
  description text default '',
  created_at timestamptz default now()
);

-- User activated packages
create table if not exists public.user_packages (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  package_id text references public.packages(id),
  package_name text,
  amount numeric(14,2) not null,
  daily_roi numeric(8,2),
  start_date date default current_date,
  status text default 'active',
  created_at timestamptz default now()
);

-- Deposits
create table if not exists public.deposits (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  amount numeric(14,2) not null,
  method text default 'USDT (BEP20)',
  note text default '',
  status text default 'pending' check (status in ('pending','approved','rejected')),
  date date default current_date,
  created_at timestamptz default now()
);

-- Withdrawals
create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  amount numeric(14,2) not null,
  address text not null,
  note text default '',
  status text default 'pending' check (status in ('pending','approved','rejected')),
  date date default current_date,
  created_at timestamptz default now()
);

-- Bonuses
create table if not exists public.bonuses (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  type text not null,
  amount numeric(14,2) not null,
  note text default '',
  date date default current_date,
  created_at timestamptz default now()
);

-- Trades
create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  pair text not null,
  type text default 'Long',
  amount numeric(14,2),
  pnl text default '—',
  status text default 'Open',
  date date default current_date,
  created_at timestamptz default now()
);

-- Signals
create table if not exists public.signals (
  id uuid primary key default gen_random_uuid(),
  pair text not null,
  type text not null check (type in ('Buy','Sell')),
  timeframe text default 'H4',
  entry text,
  target text,
  stop_loss text,
  note text default '',
  status text default 'active' check (status in ('active','closed')),
  created_by text,
  date date default current_date,
  created_at timestamptz default now()
);

-- News
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  image text,
  date date default current_date,
  created_at timestamptz default now()
);

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  audience text not null, -- 'all' or specific email
  title text not null,
  body text not null,
  image text,
  date date default current_date,
  read boolean default false,
  created_at timestamptz default now()
);

-- System settings (single row)
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  deposit_address text default '0xDEMO000000000000000000000000000000GO1',
  min_deposit numeric(14,2) default 50,
  min_withdrawal numeric(14,2) default 10,
  updated_at timestamptz default now()
);

insert into public.settings (id) values (1) on conflict (id) do nothing;

-- Default packages
insert into public.packages (id, name, min_deposit, daily_roi, duration, color, icon, description) values
  ('starter', 'Starter Signal', 50, 0.8, 30, '#dff0ff', 'sparkles', 'Cocok untuk member baru yang ingin mencoba sinyal AI dasar.'),
  ('growth', 'Growth Auto-Trade', 250, 1.3, 45, '#e3fbf1', 'trendUp', 'Auto-trading harian dengan alokasi risiko menengah.'),
  ('pro', 'Pro Arbitrage', 1000, 1.9, 60, '#e5f7ec', 'package', 'Untuk member berpengalaman yang mengejar hasil maksimal.')
on conflict (id) do nothing;

-- ============================================================
-- RLS
-- ============================================================
alter table public.profiles enable row level security;
alter table public.deposits enable row level security;
alter table public.withdrawals enable row level security;
alter table public.packages enable row level security;
alter table public.user_packages enable row level security;
alter table public.bonuses enable row level security;
alter table public.trades enable row level security;
alter table public.signals enable row level security;
alter table public.news enable row level security;
alter table public.notifications enable row level security;
alter table public.settings enable row level security;

-- Helper: is admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Profiles policies
create policy "profiles_select" on public.profiles for select using (
  auth.uid() = id or public.is_admin()
);
create policy "profiles_update_own" on public.profiles for update using (
  auth.uid() = id or public.is_admin()
);
create policy "profiles_insert" on public.profiles for insert with check (
  auth.uid() = id or public.is_admin()
);
create policy "profiles_delete_admin" on public.profiles for delete using (public.is_admin());

-- Packages: everyone reads, admin writes
create policy "packages_select" on public.packages for select using (true);
create policy "packages_admin" on public.packages for all using (public.is_admin());

-- Deposits
create policy "deposits_select" on public.deposits for select using (
  email = (select email from public.profiles where id = auth.uid()) or public.is_admin()
);
create policy "deposits_insert" on public.deposits for insert with check (
  email = (select email from public.profiles where id = auth.uid()) or public.is_admin()
);
create policy "deposits_update" on public.deposits for update using (public.is_admin());
create policy "deposits_delete" on public.deposits for delete using (public.is_admin());

-- Withdrawals
create policy "withdrawals_select" on public.withdrawals for select using (
  email = (select email from public.profiles where id = auth.uid()) or public.is_admin()
);
create policy "withdrawals_insert" on public.withdrawals for insert with check (
  email = (select email from public.profiles where id = auth.uid()) or public.is_admin()
);
create policy "withdrawals_update" on public.withdrawals for update using (public.is_admin());
create policy "withdrawals_delete" on public.withdrawals for delete using (public.is_admin());

-- User packages
create policy "up_select" on public.user_packages for select using (
  email = (select email from public.profiles where id = auth.uid()) or public.is_admin()
);
create policy "up_insert" on public.user_packages for insert with check (
  email = (select email from public.profiles where id = auth.uid()) or public.is_admin()
);
create policy "up_admin" on public.user_packages for all using (public.is_admin());

-- Bonuses
create policy "bonus_select" on public.bonuses for select using (
  email = (select email from public.profiles where id = auth.uid()) or public.is_admin()
);
create policy "bonus_admin" on public.bonuses for all using (public.is_admin());

-- Trades
create policy "trades_select" on public.trades for select using (
  email = (select email from public.profiles where id = auth.uid()) or public.is_admin()
);
create policy "trades_admin" on public.trades for all using (public.is_admin());

-- Signals: all members read, admin write
create policy "signals_select" on public.signals for select using (auth.role() = 'authenticated');
create policy "signals_admin" on public.signals for all using (public.is_admin());

-- News: all authenticated read, admin write
create policy "news_select" on public.news for select using (auth.role() = 'authenticated');
create policy "news_admin" on public.news for all using (public.is_admin());

-- Notifications
create policy "notif_select" on public.notifications for select using (
  audience = 'all'
  or audience = (select email from public.profiles where id = auth.uid())
  or public.is_admin()
);
create policy "notif_update_own" on public.notifications for update using (
  audience = (select email from public.profiles where id = auth.uid()) or public.is_admin()
);
create policy "notif_admin" on public.notifications for all using (public.is_admin());

-- Settings: all read, admin write
create policy "settings_select" on public.settings for select using (auth.role() = 'authenticated');
create policy "settings_admin" on public.settings for update using (public.is_admin());

-- Auto-create profile on signup
-- SECURITY: role is ALWAYS forced to 'member' — never trust client metadata
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, role, referral_code, referred_by)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'member',
    'GT-' || upper(substr(md5(random()::text), 1, 6)),
    nullif(trim(coalesce(new.raw_user_meta_data->>'referred_by', '')), '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Protect sensitive profile fields from non-admin self-updates
-- Prevents users from setting their own wallet_balance, role, status, etc.
create or replace function public.protect_profile_fields()
returns trigger language plpgsql as $$
begin
  -- Service role (auth.uid() is null) may change anything (Table Editor / backend).
  -- Authenticated non-admins cannot change sensitive fields.
  if auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
    new.wallet_balance := old.wallet_balance;
    new.verified := old.verified;
    new.status := old.status;
    new.level := old.level;
    new.referral_code := old.referral_code;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_protect_profile on public.profiles;
create trigger trg_protect_profile
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

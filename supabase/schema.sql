-- GO TRADE Supabase Schema
-- Run this in Supabase SQL Editor

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  role text default 'member' check (role in ('member', 'admin')),
  wallet_balance numeric default 0,
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
  confidence int,
  reason text,
  timeframe text,
  status text default 'active',
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  type text not null,
  amount numeric not null,
  status text default 'pending',
  note text,
  created_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  title text,
  body text,
  read boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.packages (
  id text primary key,
  name text not null,
  price numeric not null,
  roi numeric not null,
  duration_days int not null,
  features jsonb,
  active boolean default true
);

alter table public.profiles enable row level security;
alter table public.signals enable row level security;
alter table public.transactions enable row level security;
alter table public.notifications enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "signals_read" on public.signals for select to authenticated using (true);
create policy "signals_admin" on public.signals for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "tx_own" on public.transactions for select using (auth.uid() = user_id);
create policy "tx_insert_own" on public.transactions for insert with check (auth.uid() = user_id);
create policy "notif_own" on public.notifications for select using (auth.uid() = user_id);
create policy "notif_update_own" on public.notifications for update using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role, referral_code)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'member'),
    'GT' || upper(substr(md5(random()::text), 1, 6))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

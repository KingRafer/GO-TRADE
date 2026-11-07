-- GO TRADE — authenticated browser push device registry
-- Run this migration in Supabase SQL Editor before enabling FCM token registration.
begin;

create table if not exists public.push_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  platform text not null default 'web' check (platform in ('web')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_devices_user_id_idx
  on public.push_devices(user_id);

alter table public.push_devices enable row level security;

drop policy if exists "push_devices_owner_all" on public.push_devices;
create policy "push_devices_owner_all"
  on public.push_devices
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_push_device_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_push_device_updated_at on public.push_devices;
create trigger trg_push_device_updated_at
  before update on public.push_devices
  for each row execute function public.set_push_device_updated_at();

commit;

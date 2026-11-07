-- GO TRADE — per-user notification read receipts
-- Run this before deploying the updated store.js.
begin;

create table if not exists public.notification_reads (
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_id uuid not null references public.notifications(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (user_id, notification_id)
);

create index if not exists notification_reads_notification_idx
  on public.notification_reads(notification_id);

alter table public.notification_reads enable row level security;

drop policy if exists "notification_reads_owner_all" on public.notification_reads;
create policy "notification_reads_owner_all"
  on public.notification_reads
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

commit;

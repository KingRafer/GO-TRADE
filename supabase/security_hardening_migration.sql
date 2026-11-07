-- GO TRADE security hardening migration
-- Review first, then run in Supabase SQL Editor with a database owner account.
-- This migration tightens authorization only; it does not implement payment or trading logic.

begin;

-- The signup trigger creates profiles with role='member'. Clients must never
-- be allowed to insert their own profile row (including a forged admin role).
drop policy if exists "profiles_insert" on public.profiles;

-- Keep member profile edits limited to public profile fields.
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.id := old.id;
    new.email := old.email;
    new.role := old.role;
    new.wallet_balance := old.wallet_balance;
    new.verified := old.verified;
    new.status := old.status;
    new.level := old.level;
    new.referral_code := old.referral_code;
    new.referred_by := old.referred_by;
    new.joined := old.joined;
    new.created_at := old.created_at;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- Use the authenticated JWT email for row ownership, not a client-supplied
-- email or a mutable profile field. Inserts from members must start pending.
drop policy if exists "deposits_select" on public.deposits;
drop policy if exists "deposits_insert" on public.deposits;
drop policy if exists "deposits_update" on public.deposits;
drop policy if exists "deposits_delete" on public.deposits;
create policy "deposits_select" on public.deposits
  for select using ((email = (auth.jwt() ->> 'email')) or public.is_admin());
create policy "deposits_insert" on public.deposits
  for insert with check (
    public.is_admin()
    or (
      email = (auth.jwt() ->> 'email')
      and amount > 0
      and status = 'pending'
    )
  );
create policy "deposits_update" on public.deposits
  for update using (public.is_admin()) with check (public.is_admin());
create policy "deposits_delete" on public.deposits
  for delete using (public.is_admin());

drop policy if exists "withdrawals_select" on public.withdrawals;
drop policy if exists "withdrawals_insert" on public.withdrawals;
drop policy if exists "withdrawals_update" on public.withdrawals;
drop policy if exists "withdrawals_delete" on public.withdrawals;
create policy "withdrawals_select" on public.withdrawals
  for select using ((email = (auth.jwt() ->> 'email')) or public.is_admin());
create policy "withdrawals_insert" on public.withdrawals
  for insert with check (
    public.is_admin()
    or (
      email = (auth.jwt() ->> 'email')
      and amount > 0
      and status = 'pending'
      and length(trim(address)) > 0
    )
  );
create policy "withdrawals_update" on public.withdrawals
  for update using (public.is_admin()) with check (public.is_admin());
create policy "withdrawals_delete" on public.withdrawals
  for delete using (public.is_admin());

-- Package activations, bonuses, and trade records are server/admin controlled.
-- Members may read only their own rows; they cannot mint or alter records.
drop policy if exists "up_insert" on public.user_packages;
drop policy if exists "up_admin" on public.user_packages;
create policy "up_admin_all" on public.user_packages
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "bonus_admin" on public.bonuses;
create policy "bonus_admin_all" on public.bonuses
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "trades_admin" on public.trades;
create policy "trades_admin_all" on public.trades
  for all using (public.is_admin()) with check (public.is_admin());

-- Notifications: members can only mark their own targeted notifications read.
drop policy if exists "notif_update_own" on public.notifications;
drop policy if exists "notif_admin" on public.notifications;
create policy "notif_update_read_own" on public.notifications
  for update
  using (audience = (auth.jwt() ->> 'email'))
  with check (audience = (auth.jwt() ->> 'email'));
create policy "notif_admin_all" on public.notifications
  for all using (public.is_admin()) with check (public.is_admin());

-- Prevent members from editing notification content or routing fields; only
-- the read flag is mutable by the notification recipient.
create or replace function public.protect_notification_fields()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $
begin
  if auth.uid() is not null and not public.is_admin() then
    new.id := old.id;
    new.audience := old.audience;
    new.title := old.title;
    new.body := old.body;
    new.image := old.image;
    new.date := old.date;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$;

drop trigger if exists trg_protect_notification on public.notifications;
create trigger trg_protect_notification
  before update on public.notifications
  for each row execute function public.protect_notification_fields();

-- Activity log inserts must identify the authenticated actor accurately.
drop policy if exists "activity_insert" on public.activity_logs;
create policy "activity_insert_own" on public.activity_logs
  for insert with check (
    actor_email = (auth.jwt() ->> 'email')
    and actor_role = case when public.is_admin() then 'admin' else 'member' end
  );

commit;

-- After applying:
-- 1. Run Supabase Database -> Advisors and resolve any remaining errors.
-- 2. Test with separate member and admin accounts.
-- 3. Never expose the service_role key in browser config.js or client bundles.

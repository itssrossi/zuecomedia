-- =====================================================================
-- ZUE Comedia — Full Database Rebuild
-- Run this ENTIRE script in the Supabase SQL Editor:
--   https://supabase.com/dashboard/project/prztjpkuzhpovrpawwcu/sql/new
-- Safe to re-run.
-- =====================================================================

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ---------- profiles ------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- user_onboarding ----------------------------------------
create table if not exists public.user_onboarding (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  onboarding_data jsonb default '[]'::jsonb,
  completed boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.user_onboarding to authenticated;
grant all on public.user_onboarding to service_role;
alter table public.user_onboarding enable row level security;
drop policy if exists "onboarding_select_own" on public.user_onboarding;
create policy "onboarding_select_own" on public.user_onboarding for select using (auth.uid() = user_id);
drop policy if exists "onboarding_insert_own" on public.user_onboarding;
create policy "onboarding_insert_own" on public.user_onboarding for insert with check (auth.uid() = user_id);
drop policy if exists "onboarding_update_own" on public.user_onboarding;
create policy "onboarding_update_own" on public.user_onboarding for update using (auth.uid() = user_id);

-- ---------- Facebook Ads -------------------------------------------
create table if not exists public.fb_ad_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id text not null,
  account_name text not null,
  access_token text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, account_id)
);
create table if not exists public.fb_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  fb_campaign_id text not null,
  campaign_name text not null,
  campaign_status text,
  start_time timestamptz,
  stop_time timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, fb_campaign_id)
);
create table if not exists public.fb_ad_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid not null references public.fb_campaigns(id) on delete cascade,
  date date not null,
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  spend numeric not null default 0,
  conversions bigint not null default 0,
  revenue numeric not null default 0,
  ctr numeric not null default 0,
  cpc numeric not null default 0,
  roas numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, campaign_id, date)
);
create table if not exists public.fb_sync_status (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  last_sync_at timestamptz not null default now(),
  sync_status text not null default 'idle',
  unique (user_id)
);

grant select, insert, update, delete on public.fb_ad_accounts to authenticated;
grant select, insert, update, delete on public.fb_campaigns to authenticated;
grant select, insert, update, delete on public.fb_ad_metrics to authenticated;
grant select, insert, update, delete on public.fb_sync_status to authenticated;
grant all on public.fb_ad_accounts to service_role;
grant all on public.fb_campaigns to service_role;
grant all on public.fb_ad_metrics to service_role;
grant all on public.fb_sync_status to service_role;

alter table public.fb_ad_accounts enable row level security;
alter table public.fb_campaigns  enable row level security;
alter table public.fb_ad_metrics enable row level security;
alter table public.fb_sync_status enable row level security;

do $$
declare t text;
begin
  foreach t in array array['fb_ad_accounts','fb_campaigns','fb_ad_metrics','fb_sync_status']
  loop
    execute format('drop policy if exists "%1$s_all_own" on public.%1$s', t);
    execute format('create policy "%1$s_all_own" on public.%1$s for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
  end loop;
end $$;

-- ---------- Lead Nurturing -----------------------------------------
create table if not exists public.nurture_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  resend_api_key text,
  resend_email_from text,
  twilio_account_sid text,
  twilio_auth_token text,
  twilio_phone_number text,
  google_sheets_api_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.nurture_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'custom',
  description text,
  email_enabled boolean not null default true,
  sms_enabled boolean not null default false,
  status text not null default 'draft',
  google_sheet_url text,
  google_sheet_id text,
  sheet_column_mappings jsonb,
  auto_sync_enabled boolean not null default false,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.nurture_messages (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.nurture_campaigns(id) on delete cascade,
  message_type text not null,
  sequence_order integer not null default 0,
  subject text,
  content text not null,
  timing_type text not null default 'immediate',
  delay_value integer,
  delay_unit text,
  schedule_day text,
  schedule_time text,
  created_at timestamptz not null default now()
);
create table if not exists public.nurture_contacts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.nurture_campaigns(id) on delete cascade,
  email text,
  phone text,
  first_name text,
  last_name text,
  company text,
  status text not null default 'active',
  imported_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create table if not exists public.nurture_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.nurture_campaigns(id) on delete cascade,
  contact_id uuid not null references public.nurture_contacts(id) on delete cascade,
  message_id uuid not null references public.nurture_messages(id) on delete cascade,
  delivery_type text not null,
  status text not null default 'pending',
  scheduled_for timestamptz not null default now(),
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  unique (campaign_id, contact_id, message_id)
);

grant select, insert, update, delete on public.nurture_credentials to authenticated;
grant select, insert, update, delete on public.nurture_campaigns to authenticated;
grant select, insert, update, delete on public.nurture_messages to authenticated;
grant select, insert, update, delete on public.nurture_contacts to authenticated;
grant select, insert, update, delete on public.nurture_deliveries to authenticated;
grant all on public.nurture_credentials to service_role;
grant all on public.nurture_campaigns to service_role;
grant all on public.nurture_messages to service_role;
grant all on public.nurture_contacts to service_role;
grant all on public.nurture_deliveries to service_role;

alter table public.nurture_credentials enable row level security;
alter table public.nurture_campaigns   enable row level security;
alter table public.nurture_messages    enable row level security;
alter table public.nurture_contacts    enable row level security;
alter table public.nurture_deliveries  enable row level security;

do $$
declare t text;
begin
  foreach t in array array['nurture_credentials','nurture_campaigns']
  loop
    execute format('drop policy if exists "%1$s_all_own" on public.%1$s', t);
    execute format('create policy "%1$s_all_own" on public.%1$s for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
  end loop;
end $$;

drop policy if exists "nurture_messages_all_own" on public.nurture_messages;
create policy "nurture_messages_all_own" on public.nurture_messages for all
  using (exists (select 1 from public.nurture_campaigns c where c.id = campaign_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.nurture_campaigns c where c.id = campaign_id and c.user_id = auth.uid()));

drop policy if exists "nurture_contacts_all_own" on public.nurture_contacts;
create policy "nurture_contacts_all_own" on public.nurture_contacts for all
  using (exists (select 1 from public.nurture_campaigns c where c.id = campaign_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.nurture_campaigns c where c.id = campaign_id and c.user_id = auth.uid()));

drop policy if exists "nurture_deliveries_all_own" on public.nurture_deliveries;
create policy "nurture_deliveries_all_own" on public.nurture_deliveries for all
  using (exists (select 1 from public.nurture_campaigns c where c.id = campaign_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.nurture_campaigns c where c.id = campaign_id and c.user_id = auth.uid()));

-- Backfill profiles for existing users
insert into public.profiles (id, email, full_name)
select u.id, u.email, coalesce(u.raw_user_meta_data->>'full_name', '')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

select 'Rebuild complete' as status;

-- ========================================================
-- Dashboard Layouts + Weekly Report
-- ========================================================
create table if not exists public.dashboard_layouts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tiles jsonb not null default '[]'::jsonb,
  report_email text,
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.dashboard_layouts to authenticated;
grant all on public.dashboard_layouts to service_role;

alter table public.dashboard_layouts enable row level security;

drop policy if exists "dashboard_layouts_all_own" on public.dashboard_layouts;
create policy "dashboard_layouts_all_own" on public.dashboard_layouts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Weekly cron: Monday 07:00 UTC — invoke send-weekly-report with x-cron-key
-- Requires: pg_cron + pg_net extensions, and secrets `app.settings.supabase_url`,
-- `app.settings.service_role_key`, `app.settings.cron_secret` configured, OR replace
-- the placeholders below with your project URL / anon+service key / chosen CRON_SECRET.
--
-- Example (fill in <PROJECT_REF> and <CRON_SECRET>):
--
-- select cron.schedule(
--   'weekly-ad-report',
--   '0 7 * * 1',
--   $$
--   select net.http_post(
--     url:='https://<PROJECT_REF>.supabase.co/functions/v1/send-weekly-report',
--     headers:=jsonb_build_object('Content-Type','application/json','x-cron-key','<CRON_SECRET>'),
--     body:='{}'::jsonb
--   );
--   $$
-- );

select 'Dashboard layouts + weekly report setup complete' as status;
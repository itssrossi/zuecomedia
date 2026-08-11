-- Run this in the Supabase SQL editor.
-- Adds WhatsApp (messaging conversations started) tracking + ad-level creative data.

alter table public.fb_ad_metrics
  add column if not exists messaging_conversations bigint not null default 0;

create table if not exists public.fb_ads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid references public.fb_campaigns(id) on delete cascade,
  fb_ad_id text not null,
  ad_name text,
  ad_status text,
  campaign_name text,
  image_url text,
  thumbnail_url text,
  body_copy text,
  title text,
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  spend numeric not null default 0,
  ctr numeric not null default 0,
  messaging_conversations bigint not null default 0,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, fb_ad_id)
);

grant select, insert, update, delete on public.fb_ads to authenticated;
grant all on public.fb_ads to service_role;

alter table public.fb_ads enable row level security;
drop policy if exists "fb_ads_all_own" on public.fb_ads;
create policy "fb_ads_all_own" on public.fb_ads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

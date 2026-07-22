-- ─── Open Wine Society — Migration 002: Multi-user + WSET + v4.1 features ────
-- Run in Supabase SQL Editor AFTER 001_initial_schema.sql

-- ── Profiles table (extends Supabase auth.users) ─────────────────────────────
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  display_name text,
  is_admin     boolean default false,
  budget_per_bottle numeric(10,2) default 75,
  created_at   timestamptz default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Add user_id to existing tables ────────────────────────────────────────────
alter table wines             add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table tasting_events    add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table storage_locations add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists wines_user_id_idx             on wines(user_id);
create index if not exists tasting_events_user_id_idx    on tasting_events(user_id);
create index if not exists storage_locations_user_id_idx on storage_locations(user_id);

-- ── New wine fields: ABV, WSET scales (replace 0-100 sliders) ────────────────
alter table wines add column if not exists abv numeric(4,1);           -- e.g. 13.5
alter table wines add column if not exists intensity_wset text;        -- Low..High
alter table wines add column if not exists tannin_wset    text;
alter table wines add column if not exists acid_wset      text;
alter table wines add column if not exists body_wset      text;        -- Light..Full
alter table wines add column if not exists sweetness_wset text;        -- Dry..Luscious

-- Best-effort backfill of WSET text scales from old 0-100 numeric columns
update wines set intensity_wset = case
  when intensity < 20 then 'Low' when intensity < 40 then 'Medium-'
  when intensity < 60 then 'Medium' when intensity < 80 then 'Medium+' else 'High' end
where intensity_wset is null and intensity is not null;

update wines set tannin_wset = case
  when tannin < 20 then 'Low' when tannin < 40 then 'Medium-'
  when tannin < 60 then 'Medium' when tannin < 80 then 'Medium+' else 'High' end
where tannin_wset is null and tannin is not null;

update wines set acid_wset = case
  when acid < 20 then 'Low' when acid < 40 then 'Medium-'
  when acid < 60 then 'Medium' when acid < 80 then 'Medium+' else 'High' end
where acid_wset is null and acid is not null;

update wines set body_wset = case
  when body < 20 then 'Light' when body < 40 then 'Medium-'
  when body < 60 then 'Medium' when body < 80 then 'Medium+' else 'Full' end
where body_wset is null and body is not null;

update wines set sweetness_wset = case
  when sweetness < 10 then 'Dry' when sweetness < 25 then 'Off Dry'
  when sweetness < 45 then 'Medium Dry' when sweetness < 65 then 'Medium Sweet'
  when sweetness < 85 then 'Sweet' else 'Luscious' end
where sweetness_wset is null and sweetness is not null;

-- Rating moves from "wines" (set at add-time) to being tasting-event-only.
-- Keep the wines.rating column for backward compatibility/display of last rating,
-- but the Add Wine form will no longer write to it.

-- ── Tasting events: capture WSET scales at time of consumption too ───────────
alter table tasting_events add column if not exists intensity_wset text;
alter table tasting_events add column if not exists tannin_wset    text;
alter table tasting_events add column if not exists acid_wset      text;
alter table tasting_events add column if not exists body_wset      text;
alter table tasting_events add column if not exists sweetness_wset text;

-- ── RLS: scope every row to its owner ─────────────────────────────────────────
alter table profiles enable row level security;

drop policy if exists "allow all" on wines;
drop policy if exists "allow all" on tasting_events;
drop policy if exists "allow all" on storage_locations;

create policy "own profile"   on profiles           for all using (id = auth.uid())      with check (id = auth.uid());
create policy "own wines"     on wines               for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own events"    on tasting_events      for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own locations" on storage_locations   for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── Site settings (admin-editable homepage hero image, etc.) ─────────────────
create table if not exists site_settings (
  key   text primary key,
  value text
);
alter table site_settings enable row level security;
create policy "public read" on site_settings for select using (true);
create policy "admin write" on site_settings for insert with check (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);
create policy "admin update" on site_settings for update using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

insert into site_settings (key, value) values
  ('hero_image_url', ''),
  ('hero_headline', 'A Society for the Serious and the Curious'),
  ('hero_body', 'Open Wine Society is a home for people who take their cellar seriously — track every bottle, understand your own palate, and let AI point you toward what to open next.')
on conflict (key) do nothing;

-- ── Storage bucket for hero image (run once; safe to ignore error if exists) ─
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

create policy "public read site-assets" on storage.objects for select
  using (bucket_id = 'site-assets');
create policy "admin write site-assets" on storage.objects for insert
  with check (bucket_id = 'site-assets' and exists (select 1 from profiles where id = auth.uid() and is_admin = true));
create policy "admin update site-assets" on storage.objects for update
  using (bucket_id = 'site-assets' and exists (select 1 from profiles where id = auth.uid() and is_admin = true));

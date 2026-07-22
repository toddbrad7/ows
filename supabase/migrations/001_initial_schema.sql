-- ─── Open Wine Society — Initial Schema ──────────────────────────────────────
-- Run this in Supabase: Dashboard → SQL Editor → New Query → paste & run

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Storage Locations ────────────────────────────────────────────────────────
create table if not exists storage_locations (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  icon        text default '📦',
  type        text default 'other',
  notes       text,
  created_at  timestamptz default now()
);

-- ── Wines ─────────────────────────────────────────────────────────────────────
create table if not exists wines (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  producer            text,
  winemaker           text,
  vintage             text,
  region              text,
  subregion           text,
  varietal            text,
  color               text,
  style               text,
  grapes              text,
  qty                 integer default 0,
  price               numeric(10,2) default 0,
  rating              numeric(3,1) default 0,
  sweetness           integer default 0,
  intensity           integer default 0,
  body                integer default 0,
  acid                integer default 0,
  tannin              integer default 0,
  drink_start         integer,
  drink_end           integer,
  drink_peak          integer,
  notes               text,
  food                text,
  team_bio            text,
  storage_location_id uuid references storage_locations(id) on delete set null,
  storage_location    text,
  lat                 numeric(9,6),
  lng                 numeric(9,6),
  status              text default 'active',
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ── Tasting Events ────────────────────────────────────────────────────────────
create table if not exists tasting_events (
  id                    uuid primary key default uuid_generate_v4(),
  wine_id               uuid references wines(id) on delete set null,
  wine_name             text,
  wine_vintage          text,
  wine_region           text,
  wine_color            text,
  tasted_at             date default current_date,
  rating                integer,
  sweetness_perceived   integer,
  intensity_perceived   integer,
  notes                 text,
  food_pairing          text,
  occasion              text,
  created_at            timestamptz default now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists wines_color_idx       on wines(color);
create index if not exists wines_region_idx      on wines(region);
create index if not exists wines_drink_start_idx on wines(drink_start);
create index if not exists wines_status_idx      on wines(status);
create index if not exists tasting_events_tasted_at_idx on tasting_events(tasted_at desc);

-- ── Auto-update updated_at ────────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger wines_updated_at
  before update on wines
  for each row execute function update_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Single-user app: allow all operations via anon key
alter table storage_locations enable row level security;
alter table wines             enable row level security;
alter table tasting_events    enable row level security;

create policy "allow all" on storage_locations for all using (true) with check (true);
create policy "allow all" on wines             for all using (true) with check (true);
create policy "allow all" on tasting_events    for all using (true) with check (true);

-- ── Seed default storage locations ───────────────────────────────────────────
insert into storage_locations (name, icon, type) values
  ('Home Cellar',    '🏠', 'cellar'),
  ('Wine Fridge',    '❄️', 'fridge'),
  ('Offsite Locker', '🏢', 'offsite')
on conflict do nothing;

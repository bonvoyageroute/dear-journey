-- Dear Journey · run this once in Supabase → SQL editor → New query → Run
create extension if not exists pgcrypto;

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null default 'My trip',
  subtitle text,
  start_date date,
  end_date date,
  home_currency text not null default 'AUD',
  budget numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists travellers (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  name text not null,
  initial text
);

create table if not exists stops (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  day int not null default 1,
  time text,
  duration text,
  title text not null,
  note text,
  category text default 'other',
  planned numeric not null default 0,
  travel text,
  photo_url text,
  maps_query text,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  stop_id uuid references stops(id) on delete set null,
  day int,
  title text not null,
  category text not null default 'other',
  amount numeric not null default 0,
  currency text not null default 'AUD',
  rate numeric not null default 1,
  paid_by uuid references travellers(id) on delete set null,
  split text not null default 'even',
  method text,
  occurred_at timestamptz not null default now()
);

create index if not exists stops_trip_idx on stops(trip_id, day, sort);
create index if not exists expenses_trip_idx on expenses(trip_id, occurred_at desc);

-- row level security: you only ever see your own book
alter table trips enable row level security;
alter table travellers enable row level security;
alter table stops enable row level security;
alter table expenses enable row level security;

drop policy if exists "own trips" on trips;
create policy "own trips" on trips for all using (owner = auth.uid()) with check (owner = auth.uid());

drop policy if exists "own travellers" on travellers;
create policy "own travellers" on travellers for all
  using (exists (select 1 from trips t where t.id = travellers.trip_id and t.owner = auth.uid()))
  with check (exists (select 1 from trips t where t.id = travellers.trip_id and t.owner = auth.uid()));

drop policy if exists "own stops" on stops;
create policy "own stops" on stops for all
  using (exists (select 1 from trips t where t.id = stops.trip_id and t.owner = auth.uid()))
  with check (exists (select 1 from trips t where t.id = stops.trip_id and t.owner = auth.uid()));

drop policy if exists "own expenses" on expenses;
create policy "own expenses" on expenses for all
  using (exists (select 1 from trips t where t.id = expenses.trip_id and t.owner = auth.uid()))
  with check (exists (select 1 from trips t where t.id = expenses.trip_id and t.owner = auth.uid()));

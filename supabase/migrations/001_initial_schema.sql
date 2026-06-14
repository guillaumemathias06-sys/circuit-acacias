-- Circuit Acacias — Schéma initial

-- Seasons
create table seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  active boolean default false,
  created_at timestamptz default now()
);

-- Categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  gender text check (gender in ('M', 'F', 'mixed', 'junior')),
  age_min int,
  age_max int,
  min_ranking text,
  max_ranking text,
  active boolean default true,
  sort_order int default 0
);

-- Points scales
create table points_scales (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  competition_size int not null,
  active boolean default true,
  created_at timestamptz default now()
);

create table points_scale_rows (
  id uuid primary key default gen_random_uuid(),
  points_scale_id uuid references points_scales(id) on delete cascade,
  position_min int not null,
  position_max int not null,
  points int not null
);

-- Users
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text,
  birth_date date,
  gender text check (gender in ('M', 'F')),
  fft_license_number text unique,
  fft_ranking text,
  fft_club text,
  category_id uuid references categories(id),
  role text default 'player' check (role in ('player', 'admin', 'referee')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Competitions
create table competitions (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id),
  name text not null,
  date date not null,
  start_time time,
  end_time time,
  category_id uuid references categories(id),
  format text default 'TMC',
  max_players int default 8,
  min_ranking text,
  max_ranking text,
  fft_approved boolean default true,
  tenup_url text,
  moja_reference text,
  referee_name text,
  status text default 'draft' check (status in ('draft','published','open','full','finished','cancelled')),
  points_enabled boolean default true,
  points_scale_id uuid references points_scales(id),
  retained_results int default 6,
  entry_fee numeric(6,2),
  description text,
  rules text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Registrations
create table registrations (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid references competitions(id) on delete cascade,
  user_id uuid references users(id),
  source text default 'manual' check (source in ('tenup_csv','moja_csv','manual','paste')),
  status text default 'registered' check (status in ('registered','confirmed','withdrawn','wo','absent')),
  imported_at timestamptz default now(),
  -- Données brutes importées si le joueur n'a pas de compte
  raw_first_name text,
  raw_last_name text,
  raw_fft_license text,
  raw_fft_ranking text,
  raw_club text
);

-- Results
create table results (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid references competitions(id) on delete cascade,
  user_id uuid references users(id),
  final_position int,
  points_awarded int default 0,
  wo boolean default false,
  forfait boolean default false,
  notes text,
  created_at timestamptz default now()
);

-- Rankings
create table rankings (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id),
  category_id uuid references categories(id),
  user_id uuid references users(id),
  total_points int default 0,
  retained_points int default 0,
  competitions_played int default 0,
  rank int,
  masters_status text default 'none' check (masters_status in ('none','qualified','substitute','wildcard')),
  updated_at timestamptz default now(),
  unique(season_id, category_id, user_id)
);

-- Masters
create table masters (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id),
  category_id uuid references categories(id),
  date date,
  max_players int default 8,
  status text default 'upcoming' check (status in ('upcoming','open','finished')),
  published boolean default false,
  created_at timestamptz default now()
);

-- RLS
alter table users enable row level security;
alter table competitions enable row level security;
alter table registrations enable row level security;
alter table results enable row level security;
alter table rankings enable row level security;

-- Public read on competitions, categories, rankings, masters
create policy "Public competitions" on competitions for select using (status != 'draft');
create policy "Public categories" on categories for select using (active = true);
create policy "Public rankings" on rankings for select using (true);
create policy "Public results" on results for select using (true);
create policy "Public masters" on masters for select using (published = true);
create policy "Public points_scales" on points_scales for select using (active = true);
create policy "Public points_scale_rows" on points_scale_rows for select using (true);
create policy "Public seasons" on seasons for select using (true);

-- Users can read/update their own profile
create policy "User own profile read" on users for select using (auth.uid() = id);
create policy "User own profile update" on users for update using (auth.uid() = id);
create policy "User own registrations" on registrations for select using (auth.uid() = user_id);

-- Admin full access (role-based via function)
create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (select 1 from users where id = auth.uid() and role = 'admin')
$$;

create policy "Admin all competitions" on competitions for all using (is_admin());
create policy "Admin all registrations" on registrations for all using (is_admin());
create policy "Admin all results" on results for all using (is_admin());
create policy "Admin all rankings" on rankings for all using (is_admin());
create policy "Admin all users" on users for all using (is_admin());
create policy "Admin all masters" on masters for all using (is_admin());

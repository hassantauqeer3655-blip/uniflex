-- UNIFLEX SUPABASE SCHEMA SETUP
-- Role: Principal Full-Stack Engineer / Database Administrator
-- Task: Resolve PGRST205, 42703 errors and restore core tables

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. PROFILES TABLE (FIXES user_id missing error)
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  avatar_url text,
  email text,
  role text default 'user',
  settings jsonb default '{}'::jsonb,
  watch_history jsonb default '[]'::jsonb,
  watchlist jsonb default '[]'::jsonb,
  downloads jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Users can view their own profiles" on public.profiles
  for select using (auth.uid() = user_id);

create policy "Users can insert their own profiles" on public.profiles
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own profiles" on public.profiles
  for update using (auth.uid() = user_id);

create policy "Users can delete their own profiles" on public.profiles
  for delete using (auth.uid() = user_id);

-- 3. SITE SETTINGS TABLE (FIXES missing table error)
create table if not exists public.site_settings (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  value text,
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.site_settings enable row level security;

-- Policies for site_settings
create policy "Allow public read access to site_settings" on public.site_settings
  for select using (true);

create policy "Allow admins to modify site_settings" on public.site_settings
  for all using (
    auth.jwt() ->> 'email' in ('hassantauqeer3655@gmail.com', 'bss25000392@ue.edu.pk', 'bss25000380@ue.edu.pk')
  );

-- 4. MY LIST TABLE (FIXES missing table error)
create table if not exists public.my_list (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  movie_id text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.my_list enable row level security;

-- Policies for my_list
create policy "Users can manage their own list" on public.my_list
  for all using (auth.uid() = user_id);

-- 5. CREATORS TABLE (FIXES missing table error)
create table if not exists public.creators (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique,
  role text,
  bio text,
  image_url text,
  github text,
  linkedin text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.creators enable row level security;

-- Policies for creators
create policy "Allow public read access to creators" on public.creators
  for select using (true);

-- Initial Creators Data
insert into public.creators (name, email, role, github, linkedin)
values 
('Muhammad Tauqeer Hassan', 'hassantauqeer3655@gmail.com', 'CEO & Founder', 'https://github.com', 'https://linkedin.com'),
('Faizan Hassan', 'bss25000392@ue.edu.pk', 'Chief Technology Officer', 'https://github.com', 'https://linkedin.com'),
('Abdul Waheed', 'bss25000380@ue.edu.pk', 'Lead Creative Director', 'https://github.com', 'https://linkedin.com')
on conflict (email) do nothing;

-- 6. CONTENT TABLE (Ensure it exists for rows)
create table if not exists public.content (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  poster_path text,
  backdrop_path text,
  video_url text,
  category text,
  region text,
  is_anime boolean default false,
  status text check (status in ('upcoming', 'ongoing', 'finished')),
  vote_average float default 0,
  release_date text,
  created_at timestamptz default now()
);

-- Policies for content
alter table public.content enable row level security;
create policy "Allow public read access to content" on public.content for select using (true);
create policy "Allow admins to manage content" on public.content for all using (
  auth.jwt() ->> 'email' in ('hassantauqeer3655@gmail.com', 'bss25000392@ue.edu.pk', 'bss25000380@ue.edu.pk')
);

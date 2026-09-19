-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  bio text default '',
  avatar_url text default '',
  created_at timestamptz default now()
);

-- ถ้าตารางนี้มีอยู่แล้วจากก่อนหน้านี้ ให้รันบรรทัดนี้เพิ่มเพื่อเติมคอลัมน์ avatar_url:
-- alter table profiles add column if not exists avatar_url text default '';

create table if not exists links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  label text not null,
  url text not null,
  position int default 0
);

alter table profiles enable row level security;
alter table links enable row level security;

-- Anyone can read profiles/links (public bio pages)
create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Public links are viewable by everyone"
  on links for select using (true);

-- Only the owner can manage their own profile
create policy "Users can upsert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Only the owner can manage their own links
create policy "Users can insert their own links"
  on links for insert with check (
    auth.uid() = (select id from profiles where id = profile_id)
  );

create policy "Users can delete their own links"
  on links for delete using (
    auth.uid() = (select id from profiles where id = profile_id)
  );

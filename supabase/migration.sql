-- ============================================================
-- Cyber Briefing Agent — Supabase Migration
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- Settings table (key-value store for all config)
create table if not exists settings (
  id uuid default gen_random_uuid() primary key,
  key text unique not null,
  value text,
  updated_at timestamptz default now()
);

-- Articles table (deduplication + history)
create table if not exists articles (
  id uuid default gen_random_uuid() primary key,
  url text unique not null,
  title text,
  category text,
  summary text,
  relevance_score integer,
  source_name text,
  source_url text,
  sent_at timestamptz,
  created_at timestamptz default now()
);

-- Briefing run log
create table if not exists briefing_runs (
  id uuid default gen_random_uuid() primary key,
  articles_sent integer default 0,
  articles_fetched integer default 0,
  status text default 'success',
  error_message text,
  ran_at timestamptz default now()
);

-- Sources table
create table if not exists sources (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  url text not null,
  type text not null default 'rss',
  is_active boolean default true,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table settings enable row level security;
alter table articles enable row level security;
alter table briefing_runs enable row level security;
alter table sources enable row level security;

-- RLS Policies — authenticated users only
create policy "Authenticated users only" on settings
  for all using (auth.role() = 'authenticated');

create policy "Authenticated users only" on articles
  for all using (auth.role() = 'authenticated');

create policy "Authenticated users only" on briefing_runs
  for all using (auth.role() = 'authenticated');

create policy "Authenticated users only" on sources
  for all using (auth.role() = 'authenticated');

-- Service role bypass for the cron API (no user session)
create policy "Service role bypass" on settings
  for all using (auth.role() = 'service_role');

create policy "Service role bypass" on articles
  for all using (auth.role() = 'service_role');

create policy "Service role bypass" on briefing_runs
  for all using (auth.role() = 'service_role');

create policy "Service role bypass" on sources
  for all using (auth.role() = 'service_role');

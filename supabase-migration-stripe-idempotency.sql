-- Migration: Add stripe_events table for webhook idempotency
-- Prevents duplicate processing when Stripe retries webhook delivery
-- Run this in the Supabase SQL editor against the live database

create table if not exists public.stripe_events (
  id uuid default gen_random_uuid() primary key,
  event_id text unique not null,
  type text not null,
  processed_at timestamptz default now()
);

alter table public.stripe_events enable row level security;

create policy "Service role manages stripe events" on public.stripe_events
  for all
  using (auth.role() = 'service_role');

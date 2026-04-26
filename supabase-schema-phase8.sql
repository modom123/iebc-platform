-- Phase 8: Advisor Workspace — messages and document exchange

-- Per-advisor message threads
create table if not exists advisor_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  order_id text not null,
  advisor_id text not null,
  advisor_name text not null,
  sender_role text not null check (sender_role in ('client', 'advisor')),
  content text not null,
  created_at timestamptz default now()
);

alter table advisor_messages enable row level security;

create policy "Users can view own advisor messages"
  on advisor_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert own advisor messages"
  on advisor_messages for insert
  with check (auth.uid() = user_id);

-- Workspace document exchange (client uploads + advisor deliverables)
create table if not exists workspace_documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  order_id text not null,
  advisor_id text,
  advisor_name text,
  uploader_role text not null check (uploader_role in ('client', 'advisor')),
  file_name text not null,
  file_path text not null,
  file_size bigint default 0,
  file_type text,
  category text default 'general',
  description text,
  created_at timestamptz default now()
);

alter table workspace_documents enable row level security;

create policy "Users can view own workspace documents"
  on workspace_documents for select
  using (auth.uid() = user_id);

create policy "Users can insert own workspace documents"
  on workspace_documents for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own workspace documents"
  on workspace_documents for delete
  using (auth.uid() = user_id);

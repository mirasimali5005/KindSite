-- Create chat history table for storing user conversations
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.chat_messages enable row level security;

-- Create policies for CRUD operations
create policy "users_can_view_own_messages"
  on public.chat_messages for select
  using (auth.uid() = user_id);

create policy "users_can_insert_own_messages"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

create policy "users_can_delete_own_messages"
  on public.chat_messages for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists chat_messages_user_id_idx on public.chat_messages(user_id);
create index if not exists chat_messages_created_at_idx on public.chat_messages(created_at desc);

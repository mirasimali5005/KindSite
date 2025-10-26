-- Create user preferences table
create table if not exists public.user_preferences (
  id uuid primary key references auth.users(id) on delete cascade,
  dyslexia boolean default false,
  cognitive_impairment boolean default false,
  visual_impairment boolean default false,
  adhd boolean default false,
  esl_simple_english boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.user_preferences enable row level security;

-- Create policies for CRUD operations
create policy "users_can_view_own_preferences"
  on public.user_preferences for select
  using (auth.uid() = id);

create policy "users_can_insert_own_preferences"
  on public.user_preferences for insert
  with check (auth.uid() = id);

create policy "users_can_update_own_preferences"
  on public.user_preferences for update
  using (auth.uid() = id);

create policy "users_can_delete_own_preferences"
  on public.user_preferences for delete
  using (auth.uid() = id);

-- Create a function to update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create trigger to automatically update updated_at
create trigger on_user_preferences_updated
  before update on public.user_preferences
  for each row
  execute function public.handle_updated_at();

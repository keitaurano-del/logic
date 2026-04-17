create table if not exists public.admin_overrides (
  user_id uuid references public.profiles on delete cascade primary key,
  plan text default 'premium',
  granted_by text,
  note text,
  created_at timestamptz default now()
);
alter table public.admin_overrides enable row level security;
create policy "Users read own override" on public.admin_overrides for select using (auth.uid() = user_id);

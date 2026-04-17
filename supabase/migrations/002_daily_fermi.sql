create table if not exists public.daily_fermi_problems (
  id uuid default gen_random_uuid() primary key,
  date text not null unique,
  question text not null,
  hint text,
  locale text default 'ja',
  created_at timestamptz default now()
);
alter table public.daily_fermi_problems enable row level security;
create policy "Anyone can read daily fermi" on public.daily_fermi_problems for select using (true);
create policy "Service role can insert" on public.daily_fermi_problems for insert with check (true);

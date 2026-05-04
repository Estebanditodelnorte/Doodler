create table if not exists public.poll_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  organization text not null,
  role text not null,
  email text,
  shared_by text,
  comments text,
  date_2026_05_20 text not null check (date_2026_05_20 in ('Disponible', 'Possible', 'Indisponible')),
  date_2026_05_27 text not null check (date_2026_05_27 in ('Disponible', 'Possible', 'Indisponible')),
  date_2026_06_10 text not null check (date_2026_06_10 in ('Disponible', 'Possible', 'Indisponible')),
  date_2026_06_11 text not null check (date_2026_06_11 in ('Disponible', 'Possible', 'Indisponible'))
);

alter table public.poll_responses enable row level security;

drop policy if exists "public can insert poll responses" on public.poll_responses;
create policy "public can insert poll responses"
on public.poll_responses
for insert
to anon, authenticated
with check (true);

drop policy if exists "public can read poll responses" on public.poll_responses;
create policy "public can read poll responses"
on public.poll_responses
for select
to anon, authenticated
using (true);

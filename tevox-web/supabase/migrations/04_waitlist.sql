create table waitlist (
  id         uuid primary key default gen_random_uuid(),
  car_model  text not null,
  line_id    text not null,
  name       text,
  created_at timestamptz default now()
);

alter table waitlist enable row level security;
create policy "insert only" on waitlist for insert with check (true);

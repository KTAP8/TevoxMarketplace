create table leads (
  id        uuid primary key default gen_random_uuid(),
  name      text,
  line_id   text,
  car_model text,
  interest  text,
  source    text,
  created_at timestamptz default now()
);

alter table leads enable row level security;
create policy "insert only" on leads for insert with check (true);

create table installs (
  id             uuid primary key default gen_random_uuid(),
  customer_name  text not null,
  car_model      text not null,
  product_id     uuid references products(id),
  image_key      text,
  caption_th     text,
  is_approved    boolean default false,
  submitted_at   timestamptz default now()
);

alter table installs enable row level security;
create policy "public read approved installs" on installs for select using (is_approved = true);
create policy "anyone can submit install"     on installs for insert with check (true);

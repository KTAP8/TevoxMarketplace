create table products (
  id                  uuid primary key default gen_random_uuid(),
  sku                 text not null unique,
  name_th             text not null,
  name_en             text,
  description_th      text,
  car_model           text not null,
  category            text not null,
  price_thb           numeric(10,2) not null,
  status              text not null default 'preorder',
  preorder_closes_at  timestamptz,
  image_keys          text[],
  fitment_notes_th    text,
  install_notes_th    text,
  specs               jsonb,
  sort_order          int default 0,
  created_at          timestamptz default now()
);

alter table products enable row level security;
create policy "public read products" on products for select using (true);

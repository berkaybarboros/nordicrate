-- D1 pilot: scraped_rates tablosu
-- Supabase SQL Editor'da bir kez çalıştır.
--
-- Tasarım: insert-only tarih serisi (her scrape yeni satır) → trend analizi bedava.
-- Güncel değerler latest_scraped_rates view'ından okunur.
-- Yazma: SADECE service role (RLS'i bypass eder). Anon sadece okur.

create table if not exists scraped_rates (
  id            uuid primary key default gen_random_uuid(),
  bank_id       text not null,                 -- 'lhv'
  product_type  text not null,                 -- 'personal' | 'mortgage' | 'auto' | ...
  rate_min      numeric,                       -- "from X%" değeri
  aprc          numeric,                       -- krediidi kulukuse määr / APRC
  currency      text not null default 'EUR',
  source_url    text not null,
  raw_snippet   text,                          -- parse edilen metnin ±120 karakteri — manuel doğrulama için
  parse_ok      boolean not null default true, -- false = sayfa açıldı ama oran bulunamadı (selector drift alarmı)
  scraped_at    timestamptz not null default now()
);

create index if not exists scraped_rates_lookup
  on scraped_rates (bank_id, product_type, scraped_at desc);

-- Güncel oranlar: banka+ürün başına en son başarılı kayıt
create or replace view latest_scraped_rates as
  select distinct on (bank_id, product_type) *
  from scraped_rates
  where parse_ok
  order by bank_id, product_type, scraped_at desc;

alter table scraped_rates enable row level security;

-- Herkes okuyabilir (oranlar zaten halka açık veri); yazma sadece service role
drop policy if exists "scraped_rates_public_read" on scraped_rates;
create policy "scraped_rates_public_read" on scraped_rates
  for select using (true);

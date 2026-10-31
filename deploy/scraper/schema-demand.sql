-- demand_signals: "aradı, bulamadı" kaydı. Supabase SQL Editor'da bir kez çalıştır.
--
-- Neden ayrı tablo, user_feedback yetmiyor mu: yetmiyor. user_feedback 2026-09-15'te
-- açıldı ve 31 Ekim 2026 itibarıyla içinde TEK satır var — sayfa altındaki "Did you
-- find what you were looking for?" kimsenin cevaplamadığı bir soru. Aynı dönemde
-- 493 oturum, 741 ürün görüntüleme, 219 bankaya tıklama oldu. Yani talep var,
-- anketi dolduran yok.
--
-- Buradaki kayıt kullanıcıdan bir şey YAZMASINI beklemiyor: filtre bir sonuç
-- döndürmediğinde ya da yalnız indicative sonuç döndürdüğünde, ne arandığı
-- yazılır. Boş kalan arama doğrudan ürün backlog'u: "Finlandiya konut kredisi
-- 47 kez arandı, 47 kez boş döndü" hem ne ekleyeceğimizi söyler hem de bir
-- bankaya gösterilecek en ikna edici tek şeydir.
--
-- `note` ve `email` opsiyonel — kullanıcı isterse yazar. Zorunlu alan yok;
-- bir alan zorunlu olsaydı elimizde yine tek satır olurdu.
--
-- Yazma: yalnız service role (/api/demand). Okuma: /admin.

create table if not exists demand_signals (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  -- Ne arandı. Hepsi opsiyonel: her sayfa hepsini bilmiyor.
  product_type  text,                      -- personal | car | mortgage | deposit | insurance | business
  country       text,                      -- ISO-2, filtre varsa
  amount        integer,
  term_months   integer,

  -- Ne döndü. result_count = 0 → karşılanmamış talep; live_count = 0 → kapsam var
  -- ama canlı oran yok, bu da ayrı bir eksik.
  result_count  integer not null,
  live_count    integer,

  -- Kullanıcı yazdıysa. Zorunlu değil.
  note          text,
  email         text,

  page          text not null,
  session_id    text,
  source        text                       -- organic | direct | referral … (tracker attribution)
);

-- "Son 30 günde en çok hangi boş arama" sorgusu bu iki indeksle çalışır.
create index if not exists demand_signals_created_at on demand_signals (created_at desc);
create index if not exists demand_signals_unmet on demand_signals (product_type, country)
  where result_count = 0;

alter table demand_signals enable row level security;

-- user_feedback ve source_audits ile aynı kural: policy eklense bile anon okuyamaz.
-- Satırlar e-posta içerebilir.
revoke all on table demand_signals from anon, authenticated;

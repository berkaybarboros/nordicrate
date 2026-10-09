-- source_audits: haftalık kaynak denetimi raporları (deploy/scraper/source-audit.mjs)
-- Supabase SQL Editor'da bir kez çalıştır (ya da Supabase MCP apply_migration).
--
-- Neden tablo: denetim sunucuda koşar (banka siteleri ve fi.ee yalnız oradan erişilebilir),
-- ama raporu okuyan cloud oturumunun sunucuya SSH'ı yok. Rapor buraya yazılır, oturum
-- salt-okunur sorguyla okur. Ürün verisi değil — yalnız inceleme girdisi.
--
-- Yazma ve okuma: SADECE service role (RLS açık, policy yok → anon/authenticated erişemez).
-- Rapor banka sayfalarından alıntı içerir; site ziyaretçisine açılacak bir şey değil.

create table if not exists source_audits (
  id               uuid primary key default gen_random_uuid(),
  run_at           timestamptz not null default now(),
  scope            text not null,          -- '.ee' | 'all'
  claims_total     integer not null,
  pages_total      integer not null,
  pages_failed     integer not null,        -- okunamayan sayfa (403/timeout) — "kanıt yok" değil
  register_entries integer,                 -- fi.ee'den alınan satır sayısı; null = sicil atlandı
  report_md        text not null
);

create index if not exists source_audits_run_at on source_audits (run_at desc);

alter table source_audits enable row level security;

-- RLS'e ek olarak istemci rollerinin tablo yetkisi de kaldırılır (company_profile,
-- affiliate_links gibi diğer iç tablolarla aynı): policy eklense bile anon okuyamasın.
revoke all on table source_audits from anon, authenticated;

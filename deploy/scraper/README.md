# D1 Pilot — LHV Rate Scraper

Günde 1 kez LHV'nin halka açık kredi sayfalarından faiz oranı çeker, Supabase
`scraped_rates` tablosuna tarih serisi olarak yazar. Next app'ten tamamen bağımsız —
VPS cron çalıştırır.

## Neden LHV ve neden legal olarak rahatız
- `lhv.ee/robots.txt` loan sayfalarına **tüm** user-agent'lara izin veriyor (2026-07-02'de doğrulandı)
- Faiz oranı halka açık **faktüel veri** — telif konusu değil; tekil değerler EU sui generis database hakkını ihlal etmez
- Politeness: günde 1 çalıştırma, sayfalar arası 3 sn bekleme → ölçülü kullanım
- D3'te zaten LHV partnerliği hedefleniyor — resmi feed alınca scraper emekli olur

## Kurulum (VPS — bir kez)
```bash
# 1. Supabase'de tabloyu oluştur: schema.sql içeriğini SQL Editor'da çalıştır

# 2. Bağımlılıklar
cd /var/www/nordicrate/deploy/scraper
npm install
npx playwright install --with-deps chromium   # ~300MB, sistem bağımlılıklarıyla

# 3. İlk test (manuel)
node --env-file=/var/www/nordicrate/.env.local scrape-lhv.mjs
# Çıktıda "OK — rate X%" ve raw snippet görmelisin.
# "PARSE FAILED" görürsen: sayfayı tarayıcıda aç, oran metnini bul,
# scrape-lhv.mjs'teki RATE_PATTERNS'e uygun deseni ekle.

# 4. Cron (günlük 06:30 — rates cache cron'undan sonra)
crontab -e
# 30 6 * * * cd /var/www/nordicrate/deploy/scraper && node --env-file=/var/www/nordicrate/.env.local scrape-lhv.mjs >> /var/log/nordicrate-scraper.log 2>&1
```

## Gereken env (server .env.local'da zaten olmalı)
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Veri akışı ve genişletme
1. Pilot: scrape → `scraped_rates` → `/admin` panelinde izle (parse_ok + snippet doğrula)
2. 1-2 hafta stabil veri sonrası: `lib/data.ts` override katmanı devreye alınır
   (CLAUDE.md kuralı: doğrulanmamış veriyle ürün datası güncellenmez)
3. Yeni banka eklerken: önce robots.txt + ToS kontrol et, TARGETS formatında yeni
   script (`scrape-<bank>.mjs`) oluştur. Coop Pank bir sonraki en güvenli aday.

## İzleme
- `parse_ok=false` satırlar = sayfa yapısı değişti (selector drift) → pattern güncelle
- Tüm hedefler patlarsa script exit 1 döner → cron MAILTO ile haber verir

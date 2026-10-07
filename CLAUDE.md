# NordicRate — Claude Code Context

## Sen Kimsin
Senior fullstack engineer + founding engineer rolündesin. Hem kodu yazıyorsun hem ürün kararlarını birlikte alıyoruz. Kısa, direkt, aksiyonable konuş. "Disclaimer: ben bir AI'yım" yazma. "Şunu da düşünebilirsin" yerine direkt öner ya da yapmanın neden kötü olduğunu söyle. Her zaman kalıcı çözüm üret, geçici fix değil.

## Proje Ne
NordicRate, 8 ülkede (5 Nordic + 3 Baltic) faaliyet gösteren banka, sigorta ve fintech kurumlarının kredi/mortgage/iş kredisi oranlarını karşılaştıran bir platform. Hedef kitle: expat, digital nomad, e-resident ve bölgede yaşayan bireyler + startup/KOBİ'ler. Ana gelir modeli: affiliate (banka yönlendirme) + lead generation. Canlı: nordicrate.com (2026-07-04 subdomain'den taşındı).

## Stack
- **Framework**: Next.js 16.1.6 App Router, TypeScript strict
- **Styling**: Tailwind CSS v4
- **AI**: Groq API (llama-3.3-70b-versatile) — streaming SSE
- **Live Data**: ECB SDMX API (EURIBOR), Norges Bank API
- **Process Manager**: PM2 (cluster mode, port 3001)
- **Reverse Proxy**: Nginx Proxy Manager (Docker) + Let's Encrypt SSL
- **CDN/Security**: Cloudflare (Full Strict SSL, Proxied)
- **Hosting**: Hetzner VPS — `root@46.62.166.105`
- **Repo**: https://github.com/berkaybarboros/nordicrate
- **Deploy**: `git push origin main` → sunucudaki cron `deploy/release.sh` (health check + rollback)

## Klasör Yapısı
```
/app
  /api/chat        → Groq streaming AI endpoint
  /api/rates       → ECB + Norges Bank live rates
  /api/profile     → Groq ile konuşmadan profil çıkarımı
  /loans /mortgage /business /countries /programs → Sayfa routes
/components
  AIAssistant.tsx  → Floating chat widget (Personal + Corporate mode)
  RateCard.tsx     → Ürün kartı (APR, limit, term, badges)
  ProductListPage.tsx → Filter + sort + list view
  DataFreshnessBadge.tsx → Live rates "updated X ago" badge
  Header.tsx       → Nav + dil seçici (EN/FI/ET)
/lib
  data.ts          → COUNTRIES, INSTITUTIONS, PRODUCTS (static seed data)
  programs-data.ts → 30+ government/EU programs
  types.ts         → Tüm TypeScript interface'ler
  ai-context.ts    → buildSystemPrompt() — live rates + tüm ürün kataloğu inject
  profile.ts       → UserProfile tipi + calculateEligibility() — DTI, risk skoru
  rates.ts         → fetchAllRates() — ECB + Norges Bank SDMX parse
  utils.ts         → formatAmount, calculateMonthlyPayment, buildUTMLink, vb.
/locales
  en.ts / fi.ts / et.ts → i18n çeviriler
/contexts
  LanguageContext.tsx → useTranslation() hook
/deploy
  redeploy.sh      → git pull + npm install + build + pm2 restart
```

## Terminoloji
| Terim | Açıklama |
|-------|----------|
| APR | Annual Percentage Rate — yıllık faiz oranı |
| DTI | Debt-to-Income ratio — aylık borç / aylık net gelir % |
| LTV | Loan-to-Value — kredi / mülk değeri % (mortgage) |
| EURIBOR | Euro Interbank Offered Rate — değişken faiz referans oranı |
| e-Resident | Estonya dijital rezidans programı — fiziksel varlık gerektirmiyor |
| isPromoted | `LoanProduct.isPromoted` — öne çıkan teklif (featured banner) |
| isDigitalFriendly | Kurumun %100 online başvuru kabul ettiğini işaret eder |
| isEResidentFriendly | e-Resident başvurularını kabul eden kurumlar |
| Nordic | DK, FI, IS, NO, SE |
| Baltic | EE, LV, LT |
| AssistantMode | `'personal'` (bireysel) veya `'corporate'` (kurumsal) AI modu |
| EligibilityScore | `'excellent' / 'good' / 'fair' / 'poor' / 'insufficient_data'` |

## Çalıştırma
```bash
npm run dev        # localhost:3000
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
npm test           # vitest run
npm run build      # Production build

# Deploy — push yeterli. Sunucudaki cron 5,15,25,… dakikalarda deploy/release.sh
# calistirir: pull + install + build + pm2 reload + saglik kontrolu, hata varsa rollback.
git push origin main

# Beklemek istemiyorsan (sadece Windows'tan, SSH gerekiyor):
ssh -i ~/.ssh/id_deploy root@46.62.166.105 /var/www/nordicrate/deploy/redeploy.sh
```

## Environment Variables
```bash
# .env.local (local)
NEXT_PUBLIC_BASE_URL=http://localhost:3001

# Server (/var/www/nordicrate/.env.local)
NEXT_PUBLIC_BASE_URL=https://nordicrate.com
GROQ_API_KEY=gsk_...
ANTHROPIC_API_KEY=sk-ant-...  # Yedek — şu an kullanılmıyor
NEXT_PUBLIC_SUPABASE_URL=https://sdbwlyncpjssxxcuxbhp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  # /admin dashboard (RLS bypass) — SADECE server-side
CRON_SECRET=...                # /api/cron/* endpoint'leri
ADMIN_TOKEN=...                # /admin login — güçlü random string üret
```

## Kurallar — Her Zaman
- `'use client'` sadece state/effect/event gereken component'larda
- Yeni npm paketi önermeden önce "native browser API / mevcut utility ile yapılabilir mi?" sor
- TypeScript `any` yasak — type unknown + guard kullan
- Tailwind dışında inline style yazma (`style={{ height: '520px' }}` gibi sabit değerler hariç)
- Veri değişikliği → `lib/data.ts` veya `lib/programs-data.ts` — başka yer yok
- AI context değişikliği → `lib/ai-context.ts` `buildSystemPrompt()` — başka yer yok
- Push öncesi dördünü de çalıştır: `npm run typecheck && npm run lint && npm test && npm run build`
  — push'tan 10 dakika sonra cron canlıya alır, CI raporundan önce

## Kurallar — Asla
- ECB/Norges Bank API URL'lerini değiştirme (kırılgan — test et önce)
- NPM proxy host config'i (`/root/nginx-proxy-manager/data/nginx/proxy_host/`) elle düzenleme — NPM UI kullan
- `GROQ_API_KEY`'i kod içine yazma
- `lib/data.ts`'deki ürün verilerini gerçek banka sitesi doğrulaması yapmadan güncelleme
- AI'ya "sen bir AI'sın, sınırların var" tarzı disclaimer ekleme

## Deploy Flagleri — Söylenmesi Gerekenler
- Yeni env variable ekleniyorsa → server `.env.local`'ı da güncelle
- `lib/data.ts` değişiyorsa → `lib/ai-context.ts` context'i otomatik güncellenir, kontrol et
- NPM proxy config değişiyorsa → `docker exec nginx-proxy-manager-app-1 nginx -s reload`
- PM2 `ecosystem.config.js` değişiyorsa → `pm2 delete nordicrate && pm2 start ecosystem.config.js`

## Ton ve Format
- Kısa, madde madde yaz
- Kod bloğu varsa file path + satır numarası ver
- "Şöyle yapabilirsin" değil "Şunu yap" — imperative
- Hata bulunca: neden oldu → nasıl düzelir → başka nereyi etkiler
- Türkçe konuş (teknik terimler İngilizce kalabilir)

## Güvenlik Katmanı (V3)
- `lib/security.ts` — sliding-window rate limiter (in-memory, PM2 cluster'da worker başına ayrı sayaç) + input validators
- Rate limitler (IP başına/dk): chat 20, compare-chat 15, profile 15, recommend 15, find-rate 10, alerts 5, admin-login 5; katalog GET'leri (loans/insurance/deposits/rates) 60
- Cron secret'ları timing-safe compare ile (`safeCompareSecret`); `/.well-known/security.txt` mevcut
- Security headers → `next.config.ts` `headers()`: CSP, HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy
- `/admin` — ADMIN_TOKEN korumalı lead funnel dashboard; cookie'de token'ın SHA-256 hash'i, timing-safe compare
- `lib/supabase-admin.ts` — service-role client; ASLA client component'a import etme
- Chat live rates module-level cache (1 saat TTL) — "her mesajda HTTP round-trip" issue kapandı

## Aktif Bağlam
**Son güncelleme**: 2026-09-25
**Mevcut durum**: nordicrate.com canlı. Oranlar günlük olarak bankaların kendi sayfalarından
okunuyor; gösterilen her rakam ya "checked X ago · kaynak" damgası taşıyor ya da "indicative /
example" olarak etiketli.

**Canlı veri (31 feed, 2026-09-25)**
- Estonya: LHV (personal, mortgage, auto), Coop (personal, mortgage, auto), SEB (personal,
  mortgage, auto), Swedbank (personal, auto), Inbank (personal, auto), Bigbank (personal, auto,
  mortgage), Citadele EE (personal, auto, mortgage) + 6 banka vadeli mevduat
- Letonya: Citadele LV (personal, mortgage), Swedbank LV (personal)
- İsveç: SBAB, Nordea, Swedbank, Länsförsäkringar — konut kredisi *listränta* (snittränta değil)
- İzlanda: Landsbankinn, Íslandsbanki — PDF faiz tablosundan endekssiz (óverðtryggt) sabit oran
- Cron: `30 6 * * *` (deploy/scraper/scrape-rates.mjs) · sağlık paneli `/admin` → Rate Feed Health

**2026-09'da tamamlananlar**
- Dürüstlük katmanı: kanıtsız "Best Rate/Most Popular" rozetleri veri kaynağından silindi,
  sigorta primleri "Example premium — not a quote", sahte tazelik iddiaları kaldırıldı
- Sayfa içi feedback (`components/PageFeedback.tsx` + `/api/feedback` + `user_feedback` tablosu)
- Onboarding kayıt duvarı kalktı; residency sorusu eklendi; header CTA `/onboarding`
- Kurumlar için: `/listing-policy`, `/partner-terms`, `/corrections`; Cookie Policy gerçek
  depolamayla eşlendi ("Decline" first-party ölçümü de kapatır)
- Affiliate: `/go` artık `affiliate_links` tablosundan takip linki sarmalıyor (deploy gerekmez)
- Başvuru otomasyonu: `startup_applications` + `company_profile` + `/api/cron/applications`
  (+ n8n "Application Autopilot" — Gmail taslağı üretir, gönderim insanda)
- `/api/cron/founder-facts`: pitch/başvuru rakamlarının tek kaynağı

**Sıradaki**
- İlk ödeme yapan partner: Adtraction/Awin ağlarında banka programlarına katılım (hesaplar onaylı,
  program başvuruları bekliyor) → onaylanan programın satırı `affiliate_links`'e eklenir
- Canlı kapsam: LV/LT (Bigbank engelliyor), Finlandiya (bankalar oran yayınlamıyor → ECB MIR
  ortalaması), Estonya'da banka dışı sağlayıcılar ve sigorta
- Test kapsamı: API route'larının iş mantığı (find-rate, recommend, /go) ve component'lar

**Bilinen Issues**
- Test kapsamı: cron auth, eligibility, veri dürüstlüğü, tazelik etiketleri ve parser'lar
  test ediliyor; API route'larının iş mantığı ve component'lar henüz değil
- Sigortada gerçek fiyat yok — tüm primler örnek profil (sigortacı fiyat feed'i gerekiyor)
- Swedbank EE konut kredisi ve Luminor EE oran yayınlamıyor → indicative kalıyor
- Bigbank LV/LT ve Skandia SE sunucunun IP'sini 403'lüyor (scraper'a eklenmedi)
- İşletme kredisi ve devlet programları statik veri
- Imprint'te işyeri adresi yok (AB'ye hizmet eden site için beklenen bilgi)
- Sunucu: 3.8 GB RAM'de 7 pm2 uygulaması, disk %82 dolu — build'ler bu kutuda yapılıyor

## Cloud sessions

Claude Code on the web runs this repository in a fresh Linux container. What is true there:

- **Setup:** `.claude/hooks/session-start.sh` runs `npm install --prefer-offline` when a cloud
  session starts (`CLAUDE_CODE_REMOTE=true` only; local checkouts skip it) and sets
  `NEXT_TELEMETRY_DISABLED=1`. It is registered in `.claude/settings.json`. `.gitignore`
  ignores `.claude/*` except `settings.json`, `hooks/` and `launch.json`, so personal
  `settings.local.json` stays out of this public repo while the shared setup is tracked.
- **Checks that work in the cloud:** `npm run typecheck`, `npm run lint`, `npm test` and
  `npm run build` — all four pass with no secrets set; pages that call external APIs fall
  back to the static catalogue. `.github/workflows/ci.yml` runs the same four on every push
  and pull request, so a cloud session gets a green/red signal without a server. Run them
  locally before pushing anyway: the release cron ships `main` within ten minutes, well
  before CI reports.
- **Tests:** `tests/` (vitest, node environment, `@/` alias as in tsconfig). Each file pins a
  failure that reached users or could: the PostgREST 1000-row cap (`data-layer`), the
  bank-page parsers (`scraper-parsers`: Swedish *listränta* vs *snittränta*, Icelandic
  indexed vs non-indexed), no unsourced ranking claims in loan/insurance data (`trust`,
  `insurance-data`), fallback rates never claiming a fetch time (`trust`), the claims list
  in sync with the catalogue (`claims`), every `/api/cron/*` handler returning 401 without
  the secret (`cron-auth` — imports each route, so new routes are covered automatically),
  and no eligibility score without income and amount (`eligibility`). The parsers are
  split out of `scrape-rates.mjs` precisely so they can be imported without Playwright —
  when adding a bank, put the text→number rule in `parsers.mjs` and pin it with a test.
- **`.env.example`** lists every variable name with what breaks without it. Names only —
  never a value, not even an expired one.
- **Deploy:** `git push origin main` — that is all. A cron on the server runs
  `deploy/release.sh` at minutes 5,15,25,… : it pulls main, installs, builds, reloads pm2 and
  curls the site, and restores the previous commit and build if anything fails. So **a cloud
  session can ship**; it just cannot watch the server. `deploy/redeploy.sh` forces a release
  immediately over SSH. Details and the firewall it lives behind: `deploy/SERVER.md`.
- **Not available in the cloud:** `.env.local` values — `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`,
  `CRON_SECRET`, `ADMIN_TOKEN`, `NEXT_PUBLIC_BASE_URL`. Without them: the AI assistant and
  `/api/chat` return errors, `/admin` cannot read the database, every `/api/cron/*` endpoint
  refuses (401), and live rates fall back to the static catalogue. Also missing: SSH to the
  server (so no scraper run, no pm2, no logs), a logged-in browser, and the Playwright scraper
  (it reads bank sites from the server's IP; some banks 403 other IPs).
- **Supabase MCP (when connected):** project `sdbwlyncpjssxxcuxbhp` ("HangiKredi Clone -
  NordicRate"). Read-only queries need no approval and replace the missing SSH for checks:
  scraper health (`scraped_rates` by `scraped_at`), and `source_audits`. Migrations and any
  insert/update are production writes — `uygula:` first.
- **Source audit without SSH:** `deploy/scraper/scrape-rates.mjs` (daily cron) runs
  `source-audit.mjs` for `.ee` sources weekly and stores the report in `source_audits`
  (`schema-source-audit.sql`). Read it with
  `select run_at, pages_failed, report_md from source_audits order by run_at desc limit 1`.
  Snippets are evidence, not verdicts: product data still changes only after reading them.
- **Rules:** `git push` and any write to production need an explicit `uygula:` with a target.
  No secrets in the repository or in the shared cloud environment. Do not add a second deploy
  path.

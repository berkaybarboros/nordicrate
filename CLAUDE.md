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
- **Deploy**: git push → SSH manuel pull+build+pm2 restart

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
npm run dev     # localhost:3000
npm run build   # Production build — her deploy öncesi çalıştır
npm run lint    # ESLint

# Deploy (server)
git push origin main
ssh -i ~/.ssh/id_deploy root@46.62.166.105 \
  "cd /var/www/nordicrate && git pull && npm install && npm run build && pm2 restart nordicrate --update-env"
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
- Deploy öncesi `npm run build` çalıştır, hata yoksa push et

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
- Deploy modeli kararı (aşağıdaki "Cloud sessions" bölümüne bak)

**Bilinen Issues**
- **Deploy yalnızca Windows'tan**: SSH + `deploy/redeploy.sh`. Cloud oturumundan deploy edilemez.
- Test yok, CI workflow yok; `npm run lint` için ESLint config kontrol edilmeli
- Sigortada gerçek fiyat yok — tüm primler örnek profil (sigortacı fiyat feed'i gerekiyor)
- Swedbank EE konut kredisi ve Luminor EE oran yayınlamıyor → indicative kalıyor
- Bigbank LV/LT ve Skandia SE sunucunun IP'sini 403'lüyor (scraper'a eklenmedi)
- İşletme kredisi ve devlet programları statik veri
- Imprint'te işyeri adresi yok (AB'ye hizmet eden site için beklenen bilgi)
- Sunucu: 3.8 GB RAM'de 7 pm2 uygulaması, disk %82 dolu — build'ler bu kutuda yapılıyor

## Cloud sessions

Claude Code on the web runs this repository in a fresh Linux container. What is true there:

- **Setup:** `.claude/hooks/session-start.sh` runs `npm install` when a cloud session starts
  (`CLAUDE_CODE_REMOTE=true` only; local checkouts skip it). The hook and its
  `.claude/settings.json` registration live on branch `claude/cloud-onboard` — merge that PR
  first, and keep the `.gitignore` exception that lets `.claude/hooks/*` be tracked
  (`.gitignore` excludes all of `.claude/`).
- **Checks that work in the cloud:** `npx tsc --noEmit` and `npm run build` (build needs no
  secrets; pages that call external APIs fall back). `npm run lint` is `eslint` with no config
  committed — verify before relying on it. There are no tests and no CI workflow.
- **Deploy:** `git push origin main` → SSH to the server → `bash /var/www/nordicrate/deploy/redeploy.sh`
  (git pull, npm install, npm run build, `pm2 restart nordicrate`). The SSH step needs the
  `id_deploy` key that only exists on the Windows machine, so **a cloud session cannot deploy**;
  it can prepare and push, then ask for the redeploy to be run from Windows.
- **Not available in the cloud:** `.env.local` values — `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`,
  `CRON_SECRET`, `ADMIN_TOKEN`, `NEXT_PUBLIC_BASE_URL`. Without them: the AI assistant and
  `/api/chat` return errors, `/admin` cannot read the database, every `/api/cron/*` endpoint
  refuses (401), and live rates fall back to the static catalogue. Also missing: SSH to the
  server (so no scraper run, no pm2, no logs), a logged-in browser, and the Playwright scraper
  (it reads bank sites from the server's IP; some banks 403 other IPs).
- **Rules:** `git push` and any write to production need an explicit `uygula:` with a target.
  No secrets in the repository or in the shared cloud environment. Do not add a second deploy
  path.

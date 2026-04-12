# NordicRate — Claude Code Context

## Sen Kimsin
Senior fullstack engineer + founding engineer rolündesin. Hem kodu yazıyorsun hem ürün kararlarını birlikte alıyoruz. Kısa, direkt, aksiyonable konuş. "Disclaimer: ben bir AI'yım" yazma. "Şunu da düşünebilirsin" yerine direkt öner ya da yapmanın neden kötü olduğunu söyle. Her zaman kalıcı çözüm üret, geçici fix değil.

## Proje Ne
NordicRate, 8 ülkede (5 Nordic + 3 Baltic) faaliyet gösteren banka, sigorta ve fintech kurumlarının kredi/mortgage/iş kredisi oranlarını karşılaştıran bir platform. Hedef kitle: expat, digital nomad, e-resident ve bölgede yaşayan bireyler + startup/KOBİ'ler. Ana gelir modeli: affiliate (banka yönlendirme) + lead generation. Şu an subdomain'de test aşamasında, yakında nordicrate.com'a taşınacak.

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
NEXT_PUBLIC_BASE_URL=https://nordicrate.berkaybarboros.com
GROQ_API_KEY=gsk_...
ANTHROPIC_API_KEY=sk-ant-...  # Yedek — şu an kullanılmıyor
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

## Aktif Bağlam
**Son güncelleme**: 2026-04-12
**Mevcut durum**: nordicrate.berkaybarboros.com canlıda, HTTPS çalışıyor
**Bu sprint odağı**: AI Katman 2 — kullanıcı profil çıkarımı + DTI hesabı + EligibilityPanel UI
**Tamamlananlar**:
- ✅ ECB EURIBOR canlı veri (RT series key düzeltildi)
- ✅ sitemap.ts + robots.ts
- ✅ Let's Encrypt SSL (NPM üzerinden)
- ✅ Groq AI asistan (streaming, personal + corporate mode)
- ✅ AI context'e live rates + tüm ürün kataloğu inject
- ✅ DataFreshnessBadge + RateCard badge'leri
- ✅ Günlük cron job (06:00 rates cache)
- ✅ `lib/profile.ts` — UserProfile + calculateEligibility()
- ✅ `app/api/profile/route.ts` — konuşmadan profil çıkarımı

**Devam Eden**:
- 🔄 Katman 2: EligibilityPanel UI component'ı (henüz yazılmadı)
- 🔄 AIAssistant.tsx'e profil tracking + panel entegrasyonu

**Sıradaki Katmanlar**:
- Katman 3: Kurumsal mod derinleştirme (program matching logic)
- Katman 4: Oturum hafızası + lead form (email capture)
- Katman 5: Supabase lead DB + analytics

**Bilinen Issues**:
- `app/api/chat/route.ts`'de `fetchLiveRates()` her mesajda HTTP round-trip yapıyor — caching eklenecek
- Ürün verileri statik (data.ts) — gerçek banka feed entegrasyonu yok
- Norges Bank API bazen timeout → fallback devreye giriyor

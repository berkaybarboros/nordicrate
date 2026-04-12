# PROJECT BRIEF: NordicRate

## 1. Ne Bu?
NordicRate, Nordic ve Baltic bölgesindeki 8 ülkede (Danimarka, Finlandiya, İzlanda, Norveç, İsveç, Estonya, Letonya, Litvanya) faaliyet gösteren 50+ bankanın kredi, mortgage ve iş kredisi oranlarını karşılaştıran bir fintech platform. Expat, digital nomad, e-resident ve girişimcilerin doğru ülkede doğru bankayı seçmesine yardımcı oluyor. Rakiplerden farkı: AI destekli kişisel uygunluk analizi (DTI, risk skoru), kurumsal mod (startup/KOBİ programları), ve e-Residency/dijital göçmen rehberliği.

## 2. Stack
- **Frontend**: Next.js 16.1.6 App Router, TypeScript strict, Tailwind CSS v4
- **AI**: Groq API — llama-3.3-70b-versatile (streaming SSE, ücretsiz)
- **Live Data**: ECB SDMX API (EURIBOR 3M/6M/12M), Norges Bank API
- **Backend**: Next.js API Routes (server-side, Node.js runtime)
- **Database**: Statik seed data (lib/data.ts) — Supabase lead DB planlanıyor
- **Auth**: Yok (gelecekte lead form için minimal auth)
- **Hosting**: Hetzner VPS `46.62.166.105` — Ubuntu 22.04, PM2 cluster, port 3001
- **Reverse Proxy**: Nginx Proxy Manager (Docker) + Let's Encrypt SSL
- **CDN/DDoS**: Cloudflare (Full Strict, Proxied A record)
- **Repo**: https://github.com/berkaybarboros/nordicrate
- **Live URL**: https://nordicrate.berkaybarboros.com (test subdomain)
- **Target domain**: nordicrate.com (domain taşıması planlanıyor)

## 3. Klasör Yapısı
```
/app
  /api/chat          → Groq AI streaming endpoint
  /api/rates         → ECB + Norges Bank live rates
  /api/profile       → Konuşmadan kullanıcı profili çıkarma (Groq)
  /loans             → Personal loan listing
  /mortgage          → Mortgage listing
  /business          → Business loan listing
  /countries         → Ülke karşılaştırma sayfası
  /programs          → Hükümet programları ve EU fonları
  layout.tsx         → Global layout (Header, Footer, AIAssistant)
  page.tsx           → Homepage

/components
  AIAssistant.tsx    → Floating AI chat widget
  RateCard.tsx       → Ürün kartı
  ProductListPage.tsx → Filter/sort/list wrapper
  DataFreshnessBadge.tsx → "Live rates · updated X ago" badge
  Header.tsx         → Nav + EN/FI/ET dil seçici
  FilterSidebar.tsx  → Ülke/tür/tutar filtresi

/lib
  data.ts            → Static seed: COUNTRIES, INSTITUTIONS, PRODUCTS
  programs-data.ts   → 30+ government/EU programs
  types.ts           → TypeScript interfaces
  ai-context.ts      → buildSystemPrompt() — live data + katalog inject
  profile.ts         → UserProfile + calculateEligibility() (DTI, risk)
  rates.ts           → fetchAllRates() — ECB/Norges SDMX parser
  utils.ts           → formatAmount, buildUTMLink, calculateMonthlyPayment

/locales
  en.ts / fi.ts / et.ts → i18n (EN/FI/ET aktif)

/deploy
  redeploy.sh        → git pull + build + pm2 restart
  setup.sh           → Fresh server kurulum scripti
```

## 4. Environment Variables
```bash
# .env.local (local dev)
NEXT_PUBLIC_BASE_URL=http://localhost:3001

# Server: /var/www/nordicrate/.env.local
NEXT_PUBLIC_BASE_URL=https://nordicrate.berkaybarboros.com
GROQ_API_KEY=gsk_...
ANTHROPIC_API_KEY=sk-ant-...   # Yedek, şu an kullanılmıyor
```

## 5. Dev Workflow
```bash
npm run dev       # localhost:3000
npm run build     # Production build — hata yoksa push et
npm run lint      # ESLint

# Deploy
git push origin main
ssh -i ~/.ssh/id_deploy root@46.62.166.105 \
  "cd /var/www/nordicrate && git pull && npm install && npm run build && pm2 restart nordicrate --update-env"
```

## 6. Mevcut Durum

### Yapılanlar ✅
- ECB EURIBOR canlı veri (RT series key, 3M/6M/12M)
- Norges Bank canlı faiz oranı
- 50+ kurum, 100+ ürün statik veri (data.ts)
- 30+ hükümet/EU programı (programs-data.ts)
- Groq AI asistan — streaming, personal + corporate mod
- AI context: live rates + tüm ürün kataloğu her konuşmada inject
- DataFreshnessBadge (live/cache durumu göstergesi)
- RateCard badge'leri (tarih, 📱 Online, 🌐 e-Resident OK)
- Günlük cron job (06:00, rates cache warm-up)
- Let's Encrypt SSL (NPM + Cloudflare Full Strict)
- EN/FI/ET dil desteği
- `lib/profile.ts` — DTI hesabı + EligibilityScore + ürün eşleştirme
- `app/api/profile/route.ts` — Groq ile konuşmadan profil çıkarımı
- sitemap.xml + robots.txt

### Devam Eden 🔄
- Katman 2: `EligibilityPanel` UI component'ı
- Katman 2: `AIAssistant.tsx`'e profil tracking + panel entegrasyonu

### Planlanmış 📋
- Katman 3: Kurumsal program matching derinleştirme
- Katman 4: Oturum hafızası (localStorage) + lead form
- Katman 5: Supabase lead DB + email capture
- Domain taşıması: nordicrate.com
- GitHub Actions CI/CD (otomatik deploy)

### Bilinen Issues / Tech Debt 🔴
- `app/api/chat/route.ts`: fetchLiveRates() her mesajda HTTP round-trip — Next.js cache eklenecek
- Ürün verileri statik — gerçek banka feed/scraping entegrasyonu yok
- Norges Bank API intermittent timeout → fallback devreye giriyor
- `app/api/chat/route.ts`'de model `localhost:3001` URL — server dışında çağrılırsa kırılır

## 7. Business Context
- **Hedef kullanıcı**: Nordic/Baltic'e taşınan expat, digital nomad, e-resident, startup kurucusu
- **Gelir modeli**: Affiliate (banka tıklama başı komisyon) + lead satışı (form doldurma başı)
- **Başarı metrikleri**: Aylık unique visitor, "Apply Now" tıklama oranı, AI konuşma başına lead dönüşümü
- **Rekabet**: Compricer (SE), Lendo (SE/NO/FI), Finance.dk — hiçbiri 8 ülke kapsıyor veya AI uygunluk analizi sunmuyor

## 8. Design System
- **Primary**: Sky-600 (#0284c7) — butonlar, aktif state
- **Background**: Slate-50 (#f8fafc) — sayfa zemini
- **Card**: White + slate-200 border + shadow-sm
- **Promoted card**: sky-300 border + ring-2 ring-sky-100
- **Font**: Geist Sans (next/font/google)
- **Border radius**: rounded-xl (12px) cards, rounded-2xl chat
- **Dark mode**: Yok
- **Badge system**: rounded-full, color-coded (emerald=live, amber=cache, sky=online, violet=e-resident)

## 9. Claude'a Özel Talimatlar

### Asla:
- "Ben bir AI'yım, finansal tavsiye veremem" tarzı disclaimer yazma — kullanıcı bunu biliyor
- Yeni npm paketi ekleme (lucide-react, tailwind, next zaten var — yeterli)
- `lib/data.ts`'deki oranları doğrulamadan değiştirme
- `.env.local` dosyasına gerçek değer yazma — sadece KEY_NAME=

### Roller:
- **Kod yazarken**: Senior fullstack engineer — minimal diff, TypeScript strict
- **Mimari kararında**: Tech lead — tradeoff'ları açıkla, karar ver
- **Deployment'ta**: DevOps — her adımı sırala, rollback planı ver
- **Ürün kararında**: Founding engineer — kullanıcı değeri + gelir modeli odağında

## 10. Aktif Bağlam
**Son güncelleme**: 2026-04-12
**Bu hafta odak**: AI Katman 2 tamamlama — EligibilityPanel + profil tracking
**Blocker'lar**: Yok
**Son kararlar**:
- Anthropic → Groq geçişi (ücretsiz, llama-3.3-70b)
- Port çakışması: nordicrate=3001, nutriscan=3000
- SSL: Cloudflare origin cert yerine Let's Encrypt (NPM üzerinden)
**Sonraki milestone**: Katman 2 canlıda → lead form → Katman 4

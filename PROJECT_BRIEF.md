# PROJECT BRIEF: NordicRate

> Claude Project / yeni oturum için bağlam dosyası. Kod tarafındaki kurallar ve cloud oturumu
> ayrıntıları `CLAUDE.md`'de; bu dosya ürünü, durumu ve çalışma şeklini özetler.
> Rakamlar 2026-10-07'de kodla ve canlı veritabanıyla kontrol edildi — elle güncelleme yerine
> `/api/cron/founder-facts` ve `lib/company-profile.ts` tek kaynak.

## 1. Ne Bu?
NordicRate (nordicrate.com) — Nordic ve Baltic bölgesinde (EE, LV, LT, FI, SE, NO, DK, IS) kredi,
konut kredisi, vadeli mevduat ve sigorta tekliflerini karşılaştıran bir **fintech — finansal
ürün karşılaştırma** platformu. Hedef: bölgeye taşınan expat, digital nomad, e-resident ve
startup/KOBİ'ler — İngilizce, yerel kredi geçmişi olmayan kullanıcıya uygun kurumlara yönlendirme.

**Fark:** oranlar bankaların kendi sayfalarından günlük okunuyor ve her rakam ya "checked X ago ·
kaynak" damgası taşıyor ya da "indicative / example" diye etiketli; ikamet durumuna göre uygunluk
eşleştirme; AI asistan; kurumsal mod (devlet/EU programları).

**Ne değil:** lisanslı kredi aracısı değil, kredi değerliliği puanlamıyor (karar bankada) — bu
yüzden EU AI Act yüksek-risk kategorisinin dışında. Sigortada gerçek fiyat yok; primler örnek profil.

## 2. Stack
- **Frontend/Backend**: Next.js 16.1.6 App Router, TypeScript strict, Tailwind CSS v4
- **DB**: Supabase (`sdbwlyncpjssxxcuxbhp`) — scraped_rates, scraped_deposit_rates, events, leads,
  user_profiles, affiliate_links, blog_posts, user_feedback, company_profile, startup_applications
- **Canlı veri**: Playwright scraper (`deploy/scraper/scrape-rates.mjs`, cron 06:30) + ECB SDMX
  (EURIBOR) + Norges Bank API
- **AI**: Groq — llama-3.3-70b-versatile (streaming SSE)
- **Hosting**: Hetzner VPS `46.62.166.105`, PM2 cluster (port 3001), Nginx Proxy Manager + Let's
  Encrypt, Cloudflare (Full Strict)
- **Test/CI**: vitest (`tests/`), GitHub Actions `ci.yml` — typecheck, lint, test, build
- **Repo**: https://github.com/berkaybarboros/nordicrate (public)

## 3. Klasör Yapısı (özet)
```
/app            sayfalar + /api (chat, rates, loans, insurance, deposits, find-rate, recommend,
                go, cron/*, feedback, alerts) · /admin (ADMIN_TOKEN) · /fi /et yerel ana sayfalar
/components     RateCard, ProductListPage, RateFreshness, AffiliateDisclosure, insurance/*, …
/data           loans.ts (Estonya ağırlıklı canlı katalog), insurance.ts (örnek primler)
/lib            data.ts (8 ülke kataloğu), live-rates.ts (canlı oran okuma + tazelik eşikleri),
                rates.ts (ECB/Norges), claims.ts (doğrulanacak iddialar), company-profile.ts,
                ai-context.ts, security.ts, use-fetch-json.ts, use-client-store.ts
/deploy         release.sh (cron deploy + rollback), scraper/ (scrape-rates, parsers, source-audit)
/tests          data-layer, scraper-parsers, insurance-data, trust, claims
```

## 4. Environment Variables
İsimler ve eksik olunca ne bozulduğu: `.env.example`. Sunucuda `/var/www/nordicrate/.env.local`.
Değer asla repoya ya da cloud ortamına yazılmaz.

## 5. Dev Workflow
```bash
npm run typecheck && npm run lint && npm test && npm run build   # push öncesi dördü de

# Deploy: main'e push yeterli — sunucu cron'u 5,15,25… dakikalarda deploy/release.sh çalıştırır
# (pull, install, build, pm2 reload, sağlık kontrolü, hata varsa rollback). SSH gerekmez.
git push origin main
```
- **Cloud oturumu** deploy edebilir (push), sunucuyu izleyemez. Supabase MCP bağlıysa salt-okunur
  sorgular SSH'ın yerini tutar: scraper sağlığı, `source_audits` raporu.
- **Komut protokolü**: "hazırla:" üret · "doğrula:" yalnız oku · "uygula:" yalnız hedef ve kapsam
  söylenmişse. Push, merge, migration ve canlı veritabanı yazımı her biri ayrı `uygula:` ister.
- **Windows makinesi** (tek SSH anahtarı) Kasım 2026'ya kadar erişilemez → her şey cloud + cron.

## 6. Mevcut Durum (2026-10-07)

### Rakamlar (kod + canlı DB)
- Katalog: 8 ülke, 58 kurum, 110 ürün (`lib/data.ts`) + Estonya canlı katalogu 37 kredi teklifi
  (`data/loans.ts`); 12 sigortacı / 37 örnek prim; 30+ devlet/EU programı
- Canlı feed: 27 kredi feed'i son 48 saatte başarılı + 6 bankanın vadeli mevduatı; scraper
  2026-07-03'ten beri çalışıyor
- 71 yayınlanmış blog yazısı · `affiliate_links` boş → henüz affiliate geliri yok

### 2026-09 / 10'da tamamlananlar ✅
- Dürüstlük katmanı: kanıtsız rozetler, sahte tazelik ("updated just now"), "No middleman",
  "Editor's Picks", uydurma hesaplayıcı ve sigorta formları kaldırıldı; affiliate açıklaması
  başvuru butonlarının yanında; ana sayfa ve FI/ET "live" etiketleri 48 sa tazelik kuralına bağlı
- Sigorta: kimlik çakışmaları düzeltildi, `verifiedAt`/`sourceUrl` alanları, hub rakamları veriden
- Build env'siz geçiyor (lazy Supabase client), React 19 lint hataları 0, CI + 5 test dosyası
- Kaynak denetimi: 116 hız/ücret iddiası `claims-to-verify.json`'da; `source-audit.mjs` haftalık
  scraper cron'unda çalışıp raporu `source_audits`'e yazar (tablo migration'ı onay bekliyor)
- Sunucu deploy'u cron + rollback ile otomatik (`deploy/release.sh`)

### Sıradaki 📋
1. PR #2 merge → canlı; `source_audits` migration'ı; ilk denetim raporu → hız/ücret iddialarında
   tut/düzelt/sil, fi.ee sicilinden eksik Estonya bankaları (TBB, Holm, Luminor adayları — doğrulanmadı)
2. İlk gelir: Adtraction/Awin banka programları → onaylanınca `affiliate_links` satırı
3. Canlı kapsam: LV/LT, Finlandiya (ECB MIR ortalaması), Estonya'da banka dışı sağlayıcılar
4. Sigorta: kapsam karşılaştırması (prim yok) + sigortacı fiyat feed'i görüşmeleri
5. Test: `/api/cron/*` auth, `calculateEligibility()`

### Bilinen Issues 🔴
- **Bigbank EE konut kredisi**: 2026-10-06'dan beri parse edilemiyor (sayfa yapısı değişti) →
  48 sa sonra otomatik "indicative"e düştü; parser güncellemesi sayfayı görmeyi gerektiriyor
- Cloud ortamının ağ politikası `.ee` alan adlarını ve fi.ee'yi engelliyor (allowlist uygulanmadı)
- 116 hız/ücret iddiası ("Instant decision", "No fees"…) banka sayfasında doğrulanmadı
- "Editor's pick" bandı 13 üründe — yazılı editoryal ölçütü yok (karar bekliyor)
- Swedbank EE konut kredisi ve Luminor EE oran yayınlamıyor; Bigbank LV/LT, Skandia SE sunucu IP'sini 403'lüyor
- İşletme kredisi ve devlet programları statik; Imprint'te işyeri adresi yok
- Sunucu: 3.8 GB RAM'de 7 pm2 uygulaması, disk %82 — build'ler bu kutuda

## 7. Business Context
- **Sektör** (başvuru formları için): Fintech — financial product comparison. Alt etiket gerekiyorsa:
  consumer finance marketplace / comparison. "Lending" seçme: kredi vermiyoruz, aracı lisansımız yok.
- **Şirket**: NordicRate, şahıs şirketi (Türkiye), kuruluş 2026-02-26 — ayrıntılar `company_profile`
- **Pazar**: EE, LV, LT, FI, SE, NO, DK, IS — İngilizce konuşan göçmen/e-resident kitlesi
- **Gelir modeli**: affiliate (bankaya yönlendirme) + lead generation; ücret ne oranı ne varsayılan
  sıralamayı değiştirir (Listing Policy)
- **Metrikler**: oturum → teklif görüntüleme → bankaya tıklama hunisi (`/admin`, `founder-facts`)
- **Rekabet**: Compricer (SE), Lendo (SE/NO/FI — Clar 2026'da satın aldı), Finance.dk — yerel dilde,
  tek ülke; İngilizce ve 8 ülkeyi birlikte sunan yok

## 8. Design System
- Primary sky-600 (#0284c7), zemin slate-50, kart beyaz + slate-200 border + shadow-sm
- Font Geist Sans; rounded-xl kart, rounded-full rozet; dark mode yok
- Rozet renkleri: emerald = bankadan okunmuş oran (damgalı), amber = örnek / indicative / statik,
  sky = online başvuru, violet = e-resident

## 9. Claude'a Özel Talimatlar

### Her zaman
- Kısa, madde madde, Türkçe; teknik terimler İngilizce kalabilir. Hata: neden → nasıl düzelir → başka nereyi etkiler
- Kalıcı çözüm; push öncesi dört kontrol; ürün verisi yalnız banka sitesi doğrulamasıyla değişir
- Gösterilen her rakam ya kaynak + kontrol zamanı taşır ya da "indicative / example" etiketi
- Rakamı elle yazma — veriden türet (hub fiyatları, kurum/ürün sayıları, founder-facts)

### Asla
- Kaynaksız sıralama/üstünlük iddiası ("best", "largest", "market leader"), sahte tazelik, uydurma sosyal kanıt
- "Ben bir AI'yım" disclaimer'ı
- Gerekçesiz yeni npm paketi; ECB/Norges Bank URL'lerini değiştirmek
- Secret'ı repoya, cloud ortamına ya da `.env.example`'a yazmak
- `uygula:` olmadan push, merge, migration veya canlı DB yazımı

### Roller
- Kod: senior fullstack — minimal diff, TypeScript strict, test ile sabitle
- Mimari: tech lead — tradeoff'u söyle, karar ver
- Deploy: DevOps — cron/rollback yolunu kullan, ikinci deploy yolu ekleme
- Ürün: founding engineer — kullanıcı güveni + gelir modeli

## 10. Aktif Bağlam
**Son güncelleme**: 2026-10-07
**Odak**: güven/dürüstlük katmanını kaynak doğrulamasıyla kapatmak; ilk affiliate geliri
**Açık PR**: #2 (`claude/festive-davinci-149bqn`) — build/lint düzeltmeleri, sigorta ve site
dürüstlük turu, kaynak denetimi; CI yeşil, merge bekliyor
**Blocker'lar**: cloud ağ allowlist'i; SSH Kasım'a kadar yok; affiliate programı onayları
**Son kararlar**:
- Deploy yalnız `main` → cron `release.sh` (rollback'li); SSH gerekmez
- Kaynak denetimi sunucuda cron ile, rapor Supabase'de; karar insanda
- Sigortada prim gösterilecekse kaynak (`verifiedAt` + `sourceUrl`) şart

# NordicRate UTM Rule Set (v1 — 2026-07-29)

Tüm outbound Apply Now / Get Quote / Open Deposit linkleri `/go` gateway'inden
geçer ve UTM'ler **tek noktada** (app/go/route.ts) eklenir. Yüzeyler UTM yazmaz —
sadece meta parametreleri geçer. Bu dosya kanonik şemadır; yeni yüzey eklerken buradan bak.

## Şema

| Parametre | Değer | Kaynak | Örnek |
|---|---|---|---|
| `utm_source` | `nordicrate` (sabit) | /go | nordicrate |
| `utm_medium` | `referral` (sabit) | /go | referral |
| `utm_campaign` | Ürün tipi — kanonik set | `pt` param | personal, mortgage, auto, business, deposit, insurance-motor, insurance-casco, insurance-home, insurance-health, insurance-travel, insurance-life |
| `utm_content` | Yerleşim (placement) — hangi yüzeyden tıklandı | `pl` param | ratecard, loan-card, insurance-card, find-rate, personalized, compare, deposits |
| `utm_term` | Ürün ID (granüler analiz) | `pid` param | lhv-personal, seb-ee-m1 |

## Kanonik placement (`pl`) değerleri

| pl | Yüzey |
|---|---|
| `ratecard` | RateCard (katalog kartları — /loans, /mortgage, /business, ülke sayfaları, homepage featured) |
| `loan-card` | LoanOfferCard (Estonya SEO sayfaları: /loans/personal|mortgage|car) |
| `insurance-card` | InsuranceOfferCard (/insurance/*) |
| `find-rate` | FindBestRateModal AI önerileri |
| `personalized` | PersonalizedRecs blokları |
| `compare` | /compare — NOT: compare linkleri kaynağındaki kartın placement değerini taşır (CompareContext hazır linki saklar); ayrı compare placement gelecekte |
| `deposits` | /deposits tablosu |

## Kurallar

1. **UTM yalnız /go'da yazılır.** Yüzeyler ve API'ler applyUrl'e ASLA utm_* eklemez
   (2026-07-29'da find-rate'teki çifte sarma kaldırıldı).
2. `pt` kanonik ürün tipi setinden gelir — rank/yüzey bilgisi pt'ye SIKIŞTIRILMAZ
   (rank zaten GA4 `nr_recommendation_click` event'inde var).
3. Yeni yüzey eklerken: `buildGoLink(url, { inst, pid, pt, pl: '<yeni-placement>' })`
   ve bu tabloya satır ekle.
4. Awin/Adtraction onayı gelince ağ parametreleri (awc vb.) yine /go'da, UTM'lerin
   yanına eklenir — yüzeylerde değişiklik gerekmez.
5. Banka tarafı analitiği bu UTM'leri okur; kendi attribution'ımız /go'nun
   server-side event logu + GA4 `nr_apply_click` ile yürür (UTM'e bağımlı değil).

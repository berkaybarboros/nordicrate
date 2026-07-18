# Affiliate Başvuru Paketi v2 — Awin + Adtraction (2026-07-18)

Strateji notu: Trafik düşük — bunu gizlemiyoruz, **altyapı ve niş kalitesiyle** konumlanıyoruz.
Ağların gelir modeli komisyon paylaşımı: onlar "bu site dönüşüm üretir mi?" diye bakar.
Cevabımız: niş kitle (expat/e-resident), günlük canlı veri, AI ön-eleme = az ama nitelikli tık.

---

## 1. AWIN — Publisher Başvurusu

**Flow:** Affiliate partner → Comparison site. Account: Individual (Berkay Barboros, TR tax residency). Market: Sweden/Nordics.

**Promotional space name:** NordicRate
**URL:** https://nordicrate.com
**Type:** Price/Product Comparison

**Description (yapıştır):**

> NordicRate is an independent loan, mortgage and insurance comparison platform
> purpose-built for the Nordic and Baltic region (DK, FI, IS, NO, SE, EE, LV, LT).
>
> What makes us different from generic comparison sites:
> • **Live data infrastructure** — daily ECB EURIBOR and central-bank feeds plus an
> automated bank-rate monitoring pipeline; displayed rates are refreshed daily, not
> copied once and forgotten.
> • **AI-qualified intent** — an integrated AI advisor pre-qualifies visitors
> (income, debt-to-income, residency, loan size) before they click through to a
> lender, so outbound clicks represent applicants, not curiosity.
> • **An underserved niche** — English-speaking expats, digital nomads and Estonian
> e-residents comparing credit across borders. Domestic comparison sites don't serve
> this audience; search competition in English is minimal.
> • **Multilingual content engine** — automated SEO publishing in English, Finnish
> and Estonian (3 articles/week per language) plus dedicated country landing pages
> for all 8 markets.
>
> We are early-stage and growing organically. We're looking to establish tracking
> partnerships now so that our traffic converts from day one as it scales. All
> listings are objective; promoted placements are clearly labelled, and we comply
> with EU consumer-protection (UCPD) requirements — no fabricated ratings or claims.

**Traffic sources:** SEO (structured data, country pages, multilingual blog), AI comparison tools, rate-drop email alerts.
**Hedef advertiser'lar (onay sonrası join):** Bank Norwegian, TF Bank, Instabank, Svea, Resurs Bank, Ferratum/Multitude, Bondora, Fellow Finance, Sambla, Zmarta, Advisa, Lendo.

---

## 2. ADTRACTION — Publisher Başvurusu (adtraction.com → Partners → Sign up)

Adtraction Nordics/Baltics finans programlarının ana ağı — bizim için Awin'den daha kritik.
**Channel type:** Website / Comparison. **Market:** birden çok seçilebiliyorsa SE+FI+NO+DK; tek ise Sweden.

**Channel description (yapıştır):**

> NordicRate (nordicrate.com) is an independent comparison platform for consumer
> loans, mortgages and insurance across all eight Nordic and Baltic countries.
>
> Audience: English-speaking expats, relocated professionals, digital nomads and
> Estonian e-residents — a high-intent segment that domestic-language comparison
> sites structurally cannot reach. Content is published in English, Finnish and
> Estonian.
>
> Technical foundation: daily ECB/central-bank rate feeds, automated bank-rate
> monitoring, an AI eligibility advisor that pre-qualifies users (income, DTI,
> residency) before referral, and server-side click tracking with full UTM/subid
> support — technically ready for Adtraction tracking links from day one.
>
> We are an early-stage site building traffic organically through programmatic SEO
> and a 9-articles-per-week multilingual content engine. We prioritise honest,
> compliant presentation: objective listings, labelled placements, EU UCPD-clean
> copy. We're seeking loan and consumer-finance programs in FI, SE, NO, DK and the
> Baltics on CPL or CPA terms.

**Promotion method:** Comparison/price site + content (blog). **PPC on brand terms:** No.

---

## 3. Gelir Modeli — ağların modeline göre kurgu

| Model | Kimde | Bizim kullanım |
|---|---|---|
| **CPL** (lead başına, €15-60) | Adtraction'da yaygın (özellikle FI/SE kredi) | ÖNCELİK 1 — AI ön-eleme lead kalitemizi kanıtlar, düşük trafikte bile gelir üretir |
| **CPA** (onaylı kredi başına, %/sabit) | Her iki ağ | ÖNCELİK 2 — funnel olgunlaşınca CPL'den yüksek kazanç; karışık portföy tut |
| **Rev-share** (sigorta yenilemeleri) | Sigorta programları | Sigorta sayfaları için uzun vadeli pasif katman |
| **Direkt anlaşma** | LHV (mail gönderildi), Baltık bankaları | Ağ komisyonu yok = en yüksek marj; ağ verisi pazarlık kozu |

**Akış:** `/go` gateway → Awin/Adtraction tracking link (subid=ürün+sayfa) → GA4 `affiliate_click`
conversion ile funnel ölçümü → aylık ağ raporu + kendi tıklama verimiz → düşük performanslı
programı değiştir, yükseğe içerik yatır. Ödeme: ağlar öder (fatura derdi yok — Paddle sadece
direkt B2B anlaşmalar için gerekecek).

**Red gelirse:** sorun değil (kullanıcı onayladı) — 30 gün organik büyüme + GSC verisi sonrası
tekrar başvur; Adtraction/Awin reddi direkt anlaşmaları (LHV yolu) etkilemez.

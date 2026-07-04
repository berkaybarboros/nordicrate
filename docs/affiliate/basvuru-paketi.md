# Affiliate Başvuru Paketi (D2/D3)

Hazırlanma: 2026-07-03. Kullanım: Awin publisher formuna kopyala-yapıştır + LHV'ye e-posta.
**Öneri: başvuruları nordicrate.com canlıya alındıktan SONRA yap** — subdomain'li başvuru zayıf görünür.

---

## 1. Awin Publisher Başvurusu (awin.com → Sign up as Publisher)

**Website URL**: https://nordicrate.com *(domain geçişi sonrası)*

**Promotional space name**: NordicRate

**Promotional type**: Comparison / Price Comparison Website

**Site description (EN — forma yapıştır):**

> NordicRate is an independent loan, mortgage and insurance comparison platform
> covering all 8 Nordic and Baltic markets (Denmark, Finland, Iceland, Norway,
> Sweden, Estonia, Latvia, Lithuania). We compare 100+ credit products from 60+
> banks, insurers and fintechs, enriched with live ECB EURIBOR and Norges Bank
> policy-rate data updated daily. Our audience is English-speaking expats,
> digital nomads, e-residents and SMEs seeking financing across the region —
> a high-intent, underserved niche with no dominant English-language comparison
> player. Users reach lenders via clearly labelled outbound referral links with
> full UTM tracking. The platform features an AI-assisted eligibility advisor
> that qualifies users (income, DTI, residency) before referring them, producing
> higher-quality clicks than generic listing sites.

**Traffic / promotion methods**: SEO (structured data, country landing pages), AI-assisted comparison tools, rate-drop email alerts.

**İlgili advertiser'lar (Awin'de aranacak)**: Ferratum/Multitude, Bondora, Fellow Finance, Sambla, Lendo (Schibsted), Zmarta, Advisa, Bank Norwegian, Instabank, TF Bank, Svea, Resurs Bank.

---

## 2. LHV Partnerlik E-postası (D3)

**Kime**: partner@lhv.ee (veya info@lhv.ee üzerinden yönlendirme iste)
**Konu**: Partnership inquiry — NordicRate loan comparison platform (Baltic & Nordic markets)

> Dear LHV Partnerships Team,
>
> I run NordicRate (https://nordicrate.com), an independent English-language
> comparison platform for loans, mortgages and insurance across the Nordic and
> Baltic markets. Our audience is primarily expats, e-residents and
> internationally mobile professionals in Estonia and the wider region —
> a segment where LHV is consistently the strongest banking option we list.
>
> LHV products already appear prominently in our comparisons (currently sourced
> from your public rate pages, refreshed daily). We would like to make this
> relationship official in one of two ways:
>
> 1. **Referral partnership** — tracked outbound referrals to LHV loan
>    applications, on a CPA or CPL basis;
> 2. **Product data feed** — an official source for your current rates so our
>    listings always match your latest offers exactly.
>
> We qualify users before referral (income, residency, loan size) via an
> AI-assisted eligibility check, so the traffic we send is high-intent.
>
> Could you point me to the right person to discuss this?
>
> Best regards,
> Berkay Barboros
> Founder, NordicRate
> berkaybarboros13@gmail.com

---

## 3. Başvuru sırası önerisi

1. nordicrate.com go-live (task #7) → site kendi domain'inde
2. Awin başvurusu (onay 1-2 hafta sürebilir, erken başlat)
3. LHV e-postası — Awin'den bağımsız, direkt ilişki
4. Awin onayı gelince: ilgili advertiser programlarına join isteği + `buildUTMLink()`
   çıktılarını Awin tracking linkleriyle değiştir (kod değişikliği: `lib/utils.ts`)

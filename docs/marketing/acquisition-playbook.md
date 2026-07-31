# NordicRate Acquisition Playbook v1 (P1-3 — 2026-07-31)

Amaç: SEO beklerken ilk gerçek kullanıcıları topluluklardan getirmek, e-postaya
çevirmek (newsletter + rate report), döngüyü ölçmek. Kural: **value-first** —
her post önce soruyu cevaplar, NordicRate'i dipnot olarak verir. Spam yok,
kendi postumuza fake soru yok, her toplulukta kural okunur.

## 1) Kanal listesi (öncelik sırasıyla)

| Kanal | Kitle | Format | Sıklık |
|---|---|---|---|
| r/eupersonalfinance | AB geneli, faiz/mortgage soruları yoğun | Soru cevaplama + ayda 1 veri postu | haftalık 3-5 yorum |
| r/Estonia + r/eesti | Expat/e-resident, "hangi banka" soruları | Yorum + AMA-tarzı veri postu | haftalık 2-3 yorum |
| e-Residency topluluğu (resmi FB grubu + forum) | e-resident girişimciler | Business loan / banka erişimi cevapları | haftalık 1-2 |
| r/TallinnExpats, Expats in Estonia/Helsinki FB grupları | Yeni taşınanlar | "Banka/kredi nasıl açılır" cevapları | haftalık 1-2 |
| r/digitalnomad | Nomad, banka erişim sorunları | Yorum, ayda 1 | aylık |
| Hacker News (Show HN) | Teknik kitle, launch anı | 1 kez: "Show HN: Live rate comparison for Nordics" | tek seferlik |
| Indie Hackers | Founder kitle, build-in-public | Aylık milestone postu | aylık |
| LinkedIn (kişisel profil) | B2B/partner görünürlüğü | Rate Report alıntıları, ayda 2 | 2 hafta |

## 2) Inbound UTM konvansiyonu

Topluluğa bırakılan HER nordicrate.com linki:

```
https://nordicrate.com/<sayfa>?utm_source=<kanal>&utm_medium=community&utm_campaign=<konu>
```

- `utm_source`: reddit, facebook, eresidency-forum, hn, indiehackers, linkedin
- `utm_medium`: her zaman `community` (newsletter linklerinde `email`)
- `utm_campaign`: konu slug'ı (örn. `ee-personal-loans`, `q3-rate-report`)

NOT: Bu INBOUND konvansiyonu — docs/marketing/utm-ruleset.md'deki OUTBOUND
(/go) şemasından ayrıdır, karıştırma. GA4'te Traffic acquisition →
session source/medium ile izlenir.

## 3) Hazır şablonlar

### Yorum şablonu (soru cevaplama — ana format)
> Kısa cevap: [gerçek cevap, 2-4 cümle, rakamlarla — örn. "EE'de şu an
> personal loan temsili oranlar %9.9 (LHV) ile %14+ arasında; Swedbank
> müşterisiysen X, değilsen Inbank hızlı onay veriyor."]
> [1 pratik uyarı — ücret/EURIBOR/DTI]
> Full comparison: nordicrate.com/loans/personal?utm_source=reddit&utm_medium=community&utm_campaign=<konu>
> (disclosure: I run this site — free, affiliate-funded)

**Disclosure her zaman.** Reddit'te açık olmayan self-promo shadowban yer.

### Veri postu şablonu (ayda 1, r/eupersonalfinance veya r/Estonia)
Başlık: "I compared personal loan rates at all [8] Estonian banks (July 2026) — here's the table"
Gövde: tablo (banka / temsili oran / ücret / karar süresi) + 3 bulgu + kaynak
metodolojisi + en sonda tek link (report veya ilgili sayfa). Tablo POSTA gömülür,
link tıklamadan da değer verir.

### Show HN taslağı
Başlık: "Show HN: Live loan-rate comparison for 8 Nordic/Baltic countries"
İlk yorum: neden yaptım (expat banka karmaşası), stack (Next.js + günlük
scraper + ECB SDMX), veri dürüstlüğü (bank-verified, UCPD), ne öğrendim.

### LinkedIn Rate Report postu (2 haftada 1)
Rapordan tek grafik/rakam + 3 cümle yorum + "full report free: nordicrate.com/report?utm_source=linkedin..."

## 4) Dönüşüm döngüsü

```
Topluluk cevabı → sayfa (utm_source=community)
  → NewsletterCTA (blog/guides) veya /report gate → leads (source=newsletter|rate-report)
  → [#33 Gmail send-as açılınca] aylık Nordic Rate Digest → siteye geri → apply
```

Digest gönderimi HOLD'da (#33). Liste şimdiden birikiyor; ilk digest için
şablon: EURIBOR yönü + 3 oran değişimi + 1 guide linki.

## 5) KPI'lar (haftalık, /admin + GA4)

- GA4: session source=community → oturum, /report dönüşümü
- /admin: leads source=newsletter + rate-report sayısı (haftalık yeni)
- Hedef (ilk 4 hafta): 8-10 kaliteli yorum/hafta → 100+ community oturumu/ay,
  25+ e-posta
- Kural: 1 ay sonra kanal başına oturum/lead bak → en iyi 2 kanala yoğunlaş

## 6) Yapma listesi

- Aynı linki birden çok subreddit'e aynı gün atma (spam filtresi)
- Disclosure'suz self-promo yok
- Rakip kötüleme yok; banka önerirken "bize göre" değil "veriye göre" dili
- Toplulukta cevaplanan her soru → blog/guide içeriği fikri olarak not al

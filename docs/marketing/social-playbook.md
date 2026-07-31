# NordicRate Sosyal Medya Playbook v1 (P2-1 — 2026-07-31)

Amaç: LinkedIn + X'te düzenli, veri-öncelikli varlık — sıfır elle yazım maliyetiyle.
Motor: n8n **Social Repurposer v1** (`wXNQn5V7WIevAjWQ`, AKTİF).

## Otomasyon nasıl çalışıyor

```
Salı 09:00 → son 8 günün en yeni EN blog yazısı (Supabase)
  → Gemini: LinkedIn postu (120-180 kelime, hook + 3 içgörü + UTM linki)
           + X thread (3-5 tweet, ≤270 karakter, son tweet CTA)
  → Gmail TASLAĞI: "[NordicRate Social] <yazı başlığı>"
```

- **Otomatik paylaşım YOK** — taslağı sen kopyalayıp kendi profilinden atıyorsun.
- Kurallar Gemini prompt'unda sabit: yalnız yazıdaki rakamlar (istatistik uydurma
  yasak), hype kelime yok, finansal tavsiye dili yok, ≤3 hashtag.
- Linkler UTM'li: `utm_source=linkedin|x & utm_medium=social & utm_campaign=<slug>`
  → GA4 Traffic acquisition'da kanal bazlı görünür.
- Yazı 8 günden eskiyse o hafta taslak üretilmez (duplicate önlemi).
- n8n'de LinkedIn + X OAuth credential'ları mevcut — ileride "onayla → otomatik
  paylaş" adımına geçilebilir; bilinçli olarak draft-only bırakıldı.

## Haftalık ritim (toplam ~20 dk/hafta)

| Gün | İş | Kaynak |
|---|---|---|
| Salı | Gmail taslağından LinkedIn postunu at (09:00-11:00 arası en iyi) | Social Repurposer taslağı |
| Salı | Aynı taslaktan X thread'ini at | aynı taslak |
| Perşembe | Rate Report'tan tek rakam + 2 cümle yorum (LinkedIn) | /report + acquisition-playbook şablonu |
| Cuma | Topluluk turu (Reddit yorumları) | acquisition-playbook.md |

## Profil kurulumu (tek seferlik — KULLANICI)

- [ ] LinkedIn: kişisel profil başlığına "Founder, NordicRate — loan & rate
      comparison for the Nordics & Baltics" + öne çıkanlara nordicrate.com/report
- [ ] X: bio'ya aynı tek cümle + site linki; sabit tweet = Rate Report
- [ ] Her iki profilde de banner: rate tablosu görseli (istenirse üretirim)
- Şirket sayfası ŞİMDİLİK gerekmez — kişisel profil erişimi organikte 5-10x

## İçerik sütunları (Gemini zaten bunlara hizalı)

1. **Veri** — oran değişimleri, ülke karşılaştırmaları (ana sütun, otomatik)
2. **Rehber** — "expat olarak Estonya'da kredi" tipi pratik bilgi (blog'dan)
3. **Build-in-public** — ürün milestone'ları (elle, ayda 1, IndieHackers'a da)

## KPI (aylık)

- GA4: source=linkedin / source=x oturumları
- LinkedIn: takipçi + post görüntülenme trendi (elle not)
- Kural: 8 hafta sonra hangi format tutuyorsa (veri vs rehber) ona ağırlık ver

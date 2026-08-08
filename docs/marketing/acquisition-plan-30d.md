# NordicRate — 30 Günlük User Acquisition Planı (2026-08-08)

Baz durum (trafik denetimi 2026-08-08): gerçek ziyaretçi ~0-5/gün, organik
~1 tık/gün. Teknik altyapı sağlam (indeks ✓, CWV ✓, GTM/GA4 uçtan uca test
edildi ✓, first-party page_view kaydı ✓). Sorun dağıtım — bu plan onu çözer.

Hedef (30 gün sonu): **50+ gerçek oturum/gün, 100+ e-posta listesi, 3+ backlink,
ilk 10 organik tıklama/gün.**

## Kanal öncelik matrisi

| # | Kanal | Neden şimdi | Efor | Beklenen etki (30g) |
|---|---|---|---|---|
| 1 | Reddit/topluluk | Thread'ler SERP'te sıralanıyor; anında görünürlük | 2-3 sa/hafta (SEN) | 300-800 oturum |
| 2 | E-posta döngüsü | Liste birikiyor ama gönderim kapalı (#33) | 1 saat kurulum (SEN) + otomasyon (BEN) | dönen ziyaretçi tabanı |
| 3 | LinkedIn/X | Taslaklar otomatik geliyor (Salı 09:00) | 20 dk/hafta (SEN) | 100-200 oturum + B2B görünürlük |
| 4 | Dijital PR / backlink | Rate Report = hazır PR varlığı | 2 saat (BEN taslak, SEN gönderim) | 3-5 backlink → SEO çarpanı |
| 5 | SEO içerik | Zaten otomatik (Blog Autopilot 3x/hafta) | 0 | bileşik, 60-90 günde |
| 6 | Ücretsiz dizinler | e-Residency marketplace, startup dizinleri | 1-2 saat (SEN) | az ama kalıcı referral |
| 7 | (Opsiyonel) Micro paid test | Funnel'ı gerçek kullanıcıyla valide etmek | €50-100 tek seferlik | veri, gelir değil |

## Hafta hafta

### Hafta 1 — Fitili ateşle (en kritik hafta)
- [ ] **SEN**: r/Eesti veri postunu at (taslak hazır: reddit-post-draft-2026-08.md).
      İlk 24 saat yorumlara cevap ver. GA4'te utm_source=reddit izlenir.
- [ ] **SEN**: Gmail send-as kurulumu (#33 — 15 dk). Bu, e-posta kanalının kilidi.
- [ ] **SEN**: Salı sosyal taslağını LinkedIn + X'e at (Gmail'de hazır bekliyor).
- [ ] **BEN** (send-as sonrası): rate-alert digest cron'u + newsletter hoş geldin
      e-postası. İlk Nordic Rate Digest taslağı (insan onaylı gönderim).
- [ ] **SEN**: e-Residency Marketplace başvurusu (marketplace.e-resident.gov.ee —
      finans kategorisi; ücretsiz listing + otoriter backlink).

### Hafta 2 — Genişlet
- [ ] **SEN**: r/eupersonalfinance versiyonu (post tutarsa; AB karşılaştırmalı açı).
- [ ] **SEN**: 3-5 soru cevapla (r/Estonia, r/eesti, expat FB grupları) — yorum
      şablonu taslakta hazır.
- [ ] **BEN**: Rate Report'un "journalist pitch" e-postası — ERR News, Postimees EN,
      LSM.lv, Delfi EN + fintech newsletter'ları için taslaklar (Gmail draft,
      partners@ imzalı). Açı: "Baltık'ta kredi faizleri AB'nin en yükseği —
      banka banka canlı veri".
- [ ] **SEN**: Startup dizinleri: Indie Hackers ürün sayfası, BetaList,
      EU-Startups dizini, Startup Estonia ekosistemi listesi.

### Hafta 3 — Derinleştir
- [ ] **SEN**: Show HN postu ("Show HN: Live loan-rate comparison for 8 Nordic/
      Baltic countries" — taslağı acquisition-playbook'ta). Salı-Perşembe,
      15:00-17:00 EET en iyi pencere.
- [ ] **BEN**: HN/IndieHackers trafiği için homepage'e geçici "how it works"
      teknik notu gerekirse; ilk digest gönderimi (liste >20 ise).
- [ ] **SEN**: LinkedIn'de Rate Report rakam postu (şablon social-playbook'ta).
- [ ] **BEN**: GSC verisi kontrolü — Reddit/HN sonrası crawl + sıralama değişimi;
      pozisyon 8-20'ye giren sorgular için on-page tur.

### Hafta 4 — Ölç ve iki katına çık
- [ ] **BEN**: Kanal raporu — GA4 source/medium + /admin funnel + leads source
      dağılımı. Hangi kanal oturum/e-posta getirdi → en iyi 2 kanala yoğunlaşma
      kararı.
- [ ] **SEN**: En iyi çalışan format neyse onu tekrarla (veri postu tuttuysa
      "mortgage margins" versiyonu; LinkedIn tuttuysa haftalık seri).
- [ ] **Opsiyonel**: €50-100 Google Ads testi — "personal loan estonia" exact,
      EN, EE hedef. Amaç gelir DEĞİL: gerçek kullanıcıyla onboarding + apply
      funnel'ının dönüşümünü ölçmek (Awin onayı öncesi CPA fikri verir).

## Haftalık ritim (plan sonrası kalıcı)

| Gün | İş | Süre |
|---|---|---|
| Pzt | Outreach taslaklarını gözden geçir + gönder (otomatik hazır) | 10 dk |
| Salı | Sosyal taslakları paylaş (otomatik hazır) | 10 dk |
| Çar | Topluluk turu: 2-3 soru cevapla | 30 dk |
| Cum | Digest onayı (otomatik taslak) + haftalık KPI bakışı (/admin) | 15 dk |

## KPI panosu (haftalık bakılacak)

- GA4: oturum (source/medium kırılımı) — hedef eğrisi: 5 → 15 → 30 → 50+/gün
- /admin: leads (newsletter + rate-report + find-rate) — hedef: 100+ toplam
- GSC: tıklama/gösterim — hedef: 10+ tık/gün (30. gün)
- events: page_view + apply_click (client, bot'suz) — funnel dönüşümü
- Backlink: e-Residency marketplace + dizinler + PR → 3-5 adet

## İlkeler

- Her dış link UTM taşır (inbound konvansiyon: acquisition-playbook.md §2)
- Disclosure her zaman; otomatik paylaşım asla (draft-only otomasyonlar)
- 30. günde acımasız budama: oturum getirmeyen kanala hafta ayırma

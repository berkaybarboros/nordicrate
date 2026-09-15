# Gerçek kullanıcı, feedback ve tanıtım planı — Eylül–Ekim 2026

Tarih: 2026-09-15 · Sahip: Berkay (dağıtım/gönderim) + Claude (içerik, veri, ürün)

## 1. Nerede duruyoruz (veri, son 60 gün)

| Metrik | Değer | Yorum |
|---|---|---|
| Oturum (page_view) | 182 | %96 organik — dağıtım kanalı yok denecek kadar az |
| Ürün kartı gören oturum | 20 (%11) | Anasayfaya gelenlerin çoğu listeye inmiyor |
| Bankaya tıklayan oturum | 15 (%8) | Listeye inen neredeyse herkes tıklıyor → ürün değil, trafik sorunu |
| Onboarding | 0 | Kayıt duvarı arkasındaydı → 15 Eylül'de açıldı |
| /register ziyareti | 11 oturum, 0 gerçek kayıt | Header "Get started" kayıt formuna gidiyordu → düzeltildi |
| Lead | 3 (toplam), son 25 Temmuz | |
| Feedback | yoktu | 15 Eylül'de her sayfaya eklendi |

En çok görülen iniş sayfaları: `/`, `/loans`, `/deposits`, `/loans/iceland`, blog "home insurance Finland foreign residents", `/loans/sweden`.

**Sonuç:** Listeye ulaşan ziyaretçi tıklıyor. Darboğaz (1) kimseye ulaşmıyoruz, (2) kimin geldiğini bilmiyoruz. Bu yüzden sıra: önce **kim olduğunu öğren**, sonra **o kitlenin toplandığı yere git**.

## 2. Feedback sistemi (kuruldu + insan tarafı)

Kuruldu (15 Eylül, canlı):
- Her içerik sayfasının altında tek soru: *Did you find what you were looking for?* → "No" ise *What was missing?* + isteğe bağlı e-posta. `/admin` → User Feedback.
- Onboarding'de "Which describes you best?" (yerel / expat / e-resident / taşınmayı planlıyor). Hedef kitle tezimizi ölçen tek veri.
- Onboarding sonuç ekranı: "Were these matches useful?"

İnsan tarafı (SEN):
1. **Haftada 1 saat feedback okuma.** E-posta bırakan her "No" yanıtına 48 saat içinde kişisel cevap (info@). Bu kişiler ilk görüşme adaylarıdır.
2. **5 kullanıcı görüşmesi (15 dk, Ekim sonuna kadar).** Aday kaynağı: e-posta bırakan feedback'çiler, 3 mevcut lead, Reddit/FB yorumlarında soru soranlar. Teklif: "15 dakikalık görüşme → yeni özelliklere erken erişim". Sorular: (a) En son ne zaman kredi/mevduat/sigorta aradın, nasıl aradın? (b) Yabancı olarak en çok nerede takıldın? (c) Bizde neyi aradın, bulamadın? (d) Bir bankaya başvurmadan önce neyi bilmek isterdin? (e) Kime önerirdin?
3. **Görüşme notları** tek dosyada: `docs/research/interviews-2026.md` (ben şablonu açarım).

## 3. Kullanıcıya nasıl ulaşırız — kanal sırası

Seçim ölçütü: kitle zaten "yabancıyım, hangi banka bana kredi verir / hesap açar" sorusunu soruyor mu? Maliyet sıfır mı?

| # | Kanal | Neden | İlk adım | Kim |
|---|---|---|---|---|
| 1 | **Reddit** r/Eesti, r/Tallinn, r/Finland, r/TillSverige, r/Iceland | Expat bankacılık soruları haftalık geliyor; veri postu hazır | #34 r/Eesti veri postu. Sonra haftada 2-3 soruya disclosure'lı gerçek cevap (link zorunlu değil) | SEN |
| 2 | **Facebook / Telegram expat grupları** (Expats in Estonia, Expats in Finland, Internations Tallinn) | Yüksek niyetli, reklam dışı | Grup kurallarına uyan tek bilgi postu: "Estonya'da 6 bankanın mevduat faizleri — her gün bankanın kendi sitesinden" | SEN |
| 3 | **e-Residency Marketplace + e-resident forumu** | Tam hedef kitle, .gov.ee backlink | #37 başvurusu | SEN |
| 4 | **Relocation ajansları + expat işe alan şirketlerin HR'ı** (B2B2C) | Bir anlaşma = her ay yeni gelen onlarca expat. "New-hire banking & loans guide" | 10 hedef listesi + taslak mail (Gmail taslağı, gönderim sende) | BEN taslak / SEN gönderim |
| 5 | **Veri PR'ı** — aylık "Nordic-Baltic Rate Index" | Elimizde başka kimsede olmayan günlük banka verisi var; gazeteci bunu alıntılar | Ekim başı ilk sayı (mevduat 6 banka + kredi) → ERR News, Postimees EN, LSM, Delfi EN pitch (#39) | BEN içerik / SEN gönderim |
| 6 | **Show HN / IndieHackers / BetaList** | Tek seferlik trafik + geri bildirim | Reddit postundan sonra (#40, #41) | SEN |
| 7 | **SEO** (zaten çalışıyor) | Tek büyüyen kanal | GSC verisiyle pozisyon 8–20 sayfaları güçlendir (#GSC) | BEN |

**Yapmayacaklarımız:** ücretli reklam (dönüşüm verisi yok, bütçe yakar), soğuk DM spam, sahte yorum/oy, "en iyi" iddiası.

## 4. Ürünü nasıl anlatıyoruz (mesaj)

Tek cümle: **"Nordic & Baltic bankalarının faizleri, her gün bankanın kendi sitesinden — yabancılar için, kayıtsız."**

Kanıtlar (hepsi sitede görülebilir): banka bazlı "Checked 3h ago · kaynak link", canlı olmayan her rakamda "Indicative / Example premium" etiketi, 2 iş günü düzeltme taahhüdü, komisyonun sıralamayı değiştirmediği. Rakip kıyaslama sitelerinin yapmadığı bu şeffaflık bizim konumumuz; pazarlama metinlerinde bu öne çıkar, "AI" ikinci plandadır.

## 5. Kıyaslama sitesi olarak konum — kapatılanlar ve açık kalanlar

Kapatıldı (15 Eylül):
- Canlı olmayan veri her yerde etiketli (sigorta primi, gösterge oranlar, EURIBOR referansı)
- Kanıtsız "Best Price / Most Popular / Best Rate" rozetleri veri kaynağından silindi; uydurma kampanya verisi (promos) silindi
- Sahte tazelik iddiaları kaldırıldı ("Updated today", compare "Live rates")
- Kurumlar için: Listing & Data Policy, Partner Terms, Corrections sayfaları; /partners metni dürüstleştirildi
- Cookie Policy gerçek depolamayla eşlendi; "Decline" first-party ölçümü de kapatıyor
- Onboarding kayıtsız; header CTA onboarding'e gidiyor; ülke/blog sayfalarında "Match me in 30 seconds"

Açık (öncelik sırasıyla):
1. **Sigortada gerçek fiyat yok** — tüm primler örnek. Çözüm: sigortacıdan fiyat feed'i ya da affiliate ağı üzerinden teklif linki. Partner görüşmelerinde ilk istek bu olmalı.
2. **Canlı kapsam dar** — kişisel 7/19, taşıt 3/7, konut 4/11, mevduat 6 banka (hepsi EE ağırlıklı). LV/LT/FI scraper hedefleri sırada.
3. **İşletme kredisi ve programlar** tamamen statik — "typical range" olarak etiketli ama canlı kaynak yok.
4. **İşyeri adresi** Imprint'te yok (AB'ye hizmet veren site için beklenen bilgi) — #LEG.
5. **Hukuk gözden geçirmesi** — Partner Terms ve Terms'teki Türk hukuku seçimi bir avukata 1 saat gösterilmeli.

## 6. Haftalık ölçüm (her Pazartesi, /admin)

| KPI | Şimdi | 30 gün hedef |
|---|---|---|
| Oturum / hafta | ~21 | 75 |
| Organik dışı oturum payı | %4 | %30 |
| Ürün kartı gören oturum | %11 | %25 |
| Bankaya tıklayan oturum | %8 | %10 |
| Onboarding tamamlama / hafta | 0 | 10 |
| Feedback yanıtı / hafta | 0 | 15 |
| Kullanıcı görüşmesi (toplam) | 0 | 5 |
| Residency dağılımı | bilinmiyor | ≥30 yanıt ile ilk okuma |

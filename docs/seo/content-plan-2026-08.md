# NordicRate İçerik Planı (2026-08-16)

## Araştırma yöntemi

Firecrawl ile 8 long-tail kredi sorgusu, EE lokasyonlu, ilk 8 organik sonuç
tarandı. Her sorgu için "forum/istatistik hakimiyeti" ölçüldü — Reddit,
Facebook, tradingeconomics, expatfocus gibi kaynakların sayısı. Yüksek skor =
otoriter içerik yok = bizim için boşluk.

## Bulgu: expat/foreigner açısı tamamen boş

| Sorgu | Forum/istatistik | Banka | Durum |
|---|---|---|---|
| mortgage down payment estonia foreigner | **4/8** | 2/8 | En büyük boşluk |
| can foreigners get a loan in estonia | **3/8** | 2/8 | Reddit 1. sırada |
| loan without permanent residency estonia | **3/8** | 1/8 | Hiç banka içeriği yok |
| how much loan can i get estonia | **3/8** | 3/8 | Karışık |
| car loan or leasing estonia | 1/8 | 3/8 | Orta rekabet |
| refinance consumer loan estonia | 1/8 | 2/8 | Affiliate'ler var |
| self employed loan estonia | 1/8 | 2/8 | Uzman siteler var |
| credit score estonia | 1/8 | 1/8 | creditinfo.ee resmi kaynak |

**Sonuç:** Bankalar ürün sayfası yazıyor, forumlarda dağınık ve eski cevaplar
var. "Yabancı olarak Estonya'da kredi" sorusunun otoriter, güncel, veri
destekli cevabı hiçbir yerde yok. Bizim iki ayrıcalığımız tam buraya oturuyor:
8 bankadan günlük canlı oran + expat/e-resident perspektifi.

## Konu havuzu (12 yazı ≈ 1 ay, haftada 3 post)

Havuz kodda: `lib/blog-topics.ts`. Her konuda hedef sorgu, açı, iç link hedefi,
cevaplanması zorunlu sorular ve SERP zayıflık skoru tanımlı.

**Öncelik 1 — expat boşluğu (ilk hafta):**
1. Mortgage Down Payment in Estonia for Foreigners → `/loans/mortgage`
2. Can Foreigners Get a Loan in Estonia? Requirements by Residency Status → `/loans/personal`

**Öncelik 2:**
3. Loan Without Permanent Residency → `/loans/personal`
4. How Much Can You Borrow in Estonia? DTI Limits → `/loan-calculator`
5. Car Loan vs Leasing in Estonia → `/loans/car`

**Öncelik 3:**
6. Refinancing a Consumer Loan → `/loan-calculator`
7. Credit Score in Estonia Explained → `/loans/personal`
8. Loans for the Self-Employed (FIE / OÜ) → `/loans/business`

**Öncelik 4-5:**
9. EURIBOR Outlook and Estonian Mortgages → `/guides/euribor`
10. Borrowing in Estonia vs Finland → `/countries`
11. Financing an Estonian Company as an e-Resident → `/programs`
12. Where to Park Savings: Deposit Rates → `/deposits`

## Kalite mekanizması (kodda, otomatik)

**1. Konu artık rastgele değil** — `/api/cron/blog-topics` sıradaki
yayınlanmamış konuyu öncelik sırasıyla verir. Yayınlanan slug havuzdan düşer.

**2. LLM'e brief gider, serbest yazım yok:** hedef sorgu, başlık, açı,
cevaplanması zorunlu sorular, yapı kuralları (40-60 kelimelik snippet açılışı,
en az bir karşılaştırma tablosu, bağlam içinde tek iç link, sonda FAQ bölümü).

**3. Uydurma rakam önlemi:** brief'e o günkü GERÇEK oranlar gömülüyor
(8 banka, 20 hedef) + "bunların dışında rakam uydurma" kuralı. Mortgage
satırlarında "bu bir marj, müşteri oranı = marj + 6M EURIBOR" notu var.

**4. FAQ → rich result:** `extractFaqs()` markdown'daki `## FAQ` bölümünü
parse edip FAQPage schema üretiyor. Canlıda doğrulandı (deposit-insurance
yazısında 2 soru schema'ya döndü). Google'da açılır soru kutuları = CTR artışı.

**5. Article schema zenginleşti:** dateModified, inLanguage, publisher logo.

## n8n Blog Autopilot'ta yapılacak değişiklik

Mevcut akış: `published-topics` → Gemini (konuyu kendi seçer + yazar) →
`publish-post`

Yeni akış: **`blog-topics`** → Gemini (hazır brief ile yazar) → `publish-post`

Adımlar (n8n UI ya da MCP bağlanınca ben):
1. "Fetch Published Topics" HTTP node → URL'yi
   `https://nordicrate.com/api/cron/blog-topics` yap (header aynı: x-cron-secret)
2. Gemini node → user message: `={{ $json.brief }}`
3. Gemini system message'ı sadeleştir: "Follow the brief exactly. Respond with
   only the JSON described in it." (Konu seçme talimatları artık gereksiz.)
4. `exhausted: true` dönerse akış durmalı — havuz bitmiş demektir, genişletilir.

## Ölçüm

- 2 hafta sonra GSC'de bu 12 slug'ın gösterim/pozisyonuna bak
- Pozisyon 8-20 aralığına girenler → on-page güçlendirme turu
- 30 gün sonra: hangi açı tuttu (expat mı, karşılaştırma mı) → havuzu o yöne genişlet

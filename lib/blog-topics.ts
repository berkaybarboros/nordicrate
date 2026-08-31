/**
 * lib/blog-topics.ts — SEO içerik planı (stratejik konu havuzu).
 *
 * Neden var: Blog Autopilot'un konuyu serbest seçmesi rastgele trafik demekti.
 * Bu havuz SERP denetimine dayanır (2026-08-16, Firecrawl, EE lokasyonlu):
 * bankaların ürün sayfaları + Reddit/Facebook thread'leri + jenerik istatistik
 * siteleri sıralanıyor; "expat/foreigner açısıyla yazılmış otoriter içerik" YOK.
 * Bizim ayrıcalığımız tam bu: 8 bankadan günlük canlı veri + expat perspektifi.
 *
 * serpWeakness: ilk 8 sonuçta forum/istatistik sitesi sayısı (yüksek = fırsat).
 * internalLink: yazının SONUNDA değil, İÇİNDE bağlam içinde verilecek para sayfası.
 *
 * n8n bu havuzdan /api/cron/blog-topics ile sıradaki konuyu çeker; yayınlanmış
 * slug'lar filtrelenir, priority sırasıyla ilerlenir.
 */

export interface BlogTopic {
  /** Yayınlanacak slug — published-topics ile eşleşme buradan yapılır */
  slug: string;
  /** Hedef arama sorgusu (primary keyword) — başlıkta birebir geçmeli */
  targetQuery: string;
  /** Önerilen H1/başlık — LLM bunu aynen ya da çok yakın kullanır */
  title: string;
  /** Yazının açısı: neyi farklı söylüyoruz (LLM'e brief) */
  angle: string;
  /** Yazı içinde bağlam içinde verilecek NordicRate sayfası */
  internalLink: string;
  /** İçerikte MUTLAKA cevaplanacak sorular (FAQ bölümünün tohumu) */
  mustAnswer: string[];
  /** 1 = en yüksek öncelik */
  priority: number;
  /** SERP'te forum/istatistik hakimiyeti (0-8). Yüksek = boşluk büyük */
  serpWeakness: number;
}

export const BLOG_TOPICS: BlogTopic[] = [
  // ─── Tur 1: expat/foreigner boşluğu (SERP'te otoriter içerik YOK) ───
  {
    slug: 'mortgage-down-payment-estonia-foreigner',
    targetQuery: 'mortgage down payment estonia foreigner',
    title: 'Mortgage Down Payment in Estonia for Foreigners: How Much You Actually Need',
    angle:
      'SERP bu sorguda Reddit + Facebook + emlak blogları dolu, banka sayfaları rakam vermiyor. Biz LTV oranlarını banka banka veririz (canlı marj verimizle), residency durumuna göre farkı açıklarız (EU vatandaşı / oturma izinli / e-resident), ve "self-financing" teriminin ne demek olduğunu netleştiririz.',
    internalLink: '/loans/mortgage',
    mustAnswer: [
      'What is the minimum down payment for a mortgage in Estonia?',
      'Can a foreigner get a mortgage in Estonia without permanent residency?',
      'Does KredEx/EIS guarantee apply to non-citizens?',
      'How does the bank calculate the loan-to-value ratio?',
    ],
    priority: 1,
    serpWeakness: 4,
  },
  {
    slug: 'can-foreigners-get-loan-estonia',
    targetQuery: 'can foreigners get a loan in estonia',
    title: 'Can Foreigners Get a Loan in Estonia? Requirements by Residency Status',
    angle:
      'Tek cümlelik cevap yok — durum bazlı tablo lazım: EU vatandaşı, oturma izinli çalışan, e-resident, dijital göçebe. Her biri için hangi bankalar bakar, hangi belgeler istenir, hangi oran bandı geçerli. Reddit cevapları eski ve çelişkili; biz güncel banka gerekliliklerini tabloya döküyoruz.',
    internalLink: '/loans/personal',
    mustAnswer: [
      'Which Estonian banks lend to non-citizens?',
      'Do I need an Estonian ID code (isikukood) to apply?',
      'Is an e-Residency card enough to get a personal loan?',
      'What income documents do banks ask from foreigners?',
    ],
    // 2026-08-31: bu konu Gemini'yi 5 sutunlu tablo uretirken tekrar dongusune
    // sokuyordu (once yuzlerce '-', sonra 170k bosluk) ve 12 gun boyunca TUM
    // yayin hattini tikadi — nextTopic her calismada ayni konuyu donduruyor.
    // Priority dusuruldu: once sorunsuz konular yayinlansin, bu en sonda denensin.
    priority: 9,
    serpWeakness: 3,
  },
  {
    slug: 'loan-without-permanent-residency-estonia',
    targetQuery: 'loan without permanent residency estonia',
    title: 'Getting a Loan in Estonia Without Permanent Residency: What Banks Actually Require',
    angle:
      'Temporary residence permit ile kredi almak mümkün ama vade sınırı ve ek teminat devreye giriyor. Bu nüansı hiçbir sayfa yazmıyor. Oturma izni süresi ile kredi vadesi ilişkisini açıklayacağız.',
    internalLink: '/loans/personal',
    mustAnswer: [
      'Can I borrow with a temporary residence permit?',
      'Does the loan term have to fit inside my permit validity?',
      'Which banks are most flexible with non-permanent residents?',
    ],
    priority: 2,
    serpWeakness: 3,
  },
  {
    slug: 'how-much-loan-can-i-get-estonia',
    targetQuery: 'how much loan can i get estonia',
    title: 'How Much Can You Borrow in Estonia? DTI Limits and Real Examples',
    angle:
      'Eesti Pank\'ın sorumlu kredilendirme kuralları (DSTI %50 tavanı, %30 tipik) + banka pratiği. Gelir bandına göre somut örnek tablosu. Kendi hesaplayıcımıza bağlam içinde link.',
    internalLink: '/loan-calculator',
    mustAnswer: [
      'What is the maximum debt-service-to-income ratio in Estonia?',
      'How do banks treat existing loans and credit cards?',
      'Does a co-borrower increase the amount?',
    ],
    priority: 2,
    serpWeakness: 3,
  },

  // ─── Tur 2: karar anı sorguları (yüksek niyet) ───
  {
    slug: 'car-loan-vs-leasing-estonia',
    targetQuery: 'car loan or leasing estonia which is better',
    title: 'Car Loan vs Leasing in Estonia: Which Costs Less in 2026?',
    angle:
      'Gerçek rakamlarla karşılaştırma: aynı araç için kredi toplam maliyeti vs kapalı uçlu leasing. Sahiplik, CASCO zorunluluğu, kalan değer farkı. Canlı auto loan oranlarımızı kullan.',
    internalLink: '/loans/car',
    mustAnswer: [
      'Is leasing cheaper than a car loan in Estonia?',
      'Do I need CASCO insurance for both?',
      'Who owns the car during a lease?',
    ],
    priority: 2,
    serpWeakness: 1,
  },
  {
    slug: 'refinance-consumer-loan-estonia',
    targetQuery: 'refinance consumer loan estonia',
    title: 'Refinancing a Consumer Loan in Estonia: When It Saves Money (and When It Does Not)',
    angle:
      'Refinansman her zaman kazandırmaz. Sözleşme ücreti + erken kapama bedeli, kalan vade ile birlikte hesaplanmalı. Break-even formülünü ver, hesaplayıcıya bağla. Rakipler sadece "başvur" diyor.',
    internalLink: '/loan-calculator',
    mustAnswer: [
      'What fees apply when refinancing in Estonia?',
      'Is there an early repayment penalty?',
      'How do I calculate whether refinancing is worth it?',
    ],
    priority: 3,
    serpWeakness: 1,
  },
  {
    slug: 'credit-score-estonia-explained',
    targetQuery: 'credit score estonia how to check',
    title: 'Credit Score in Estonia: How It Works, How to Check It, How to Fix It',
    angle:
      'Creditinfo/Krediidiskoor resmi kaynak ama İngilizce açıklama zayıf ve expat perspektifi yok. Yurt dışından gelen birinin sıfır geçmişle ne yapacağını anlat — bu boşluk.',
    internalLink: '/loans/personal',
    mustAnswer: [
      'Where can I check my credit score in Estonia for free?',
      'Do foreigners start with no credit history?',
      'How long do payment defaults stay on record?',
    ],
    priority: 3,
    serpWeakness: 1,
  },
  {
    slug: 'self-employed-loan-estonia',
    targetQuery: 'self employed loan estonia',
    title: 'Loans for the Self-Employed in Estonia: FIE, OÜ Owners and Freelancers',
    angle:
      'FIE / OÜ sahibi / serbest çalışan farkı bankalar için kritik ama hiçbir sayfa ayrımı yazmıyor. Hangi gelir belgesi, kaç aylık geçmiş, temettü geliri sayılır mı.',
    internalLink: '/loans/business',
    mustAnswer: [
      'How do Estonian banks verify self-employed income?',
      'Does dividend income from my OÜ count?',
      'How many months of business history do banks want?',
    ],
    priority: 3,
    serpWeakness: 1,
  },

  // ─── Tur 3: karşılaştırma + mevsimsel ───
  {
    slug: 'euribor-forecast-impact-estonian-mortgages',
    targetQuery: 'euribor forecast estonia mortgage',
    title: 'What the EURIBOR Outlook Means for Estonian Mortgage Payments',
    angle:
      'Canlı EURIBOR verimizle: 6M oranın bugünkü değeri, son 12 ay trendi ve tipik bir 100.000 EUR kredide her 0,5 puanın aylık ödemeye etkisi. Tahmin yapmıyoruz — mekanizmayı ve senaryoyu gösteriyoruz.',
    internalLink: '/guides/euribor',
    mustAnswer: [
      'How often does my mortgage rate reset?',
      'What happens to my payment if EURIBOR rises 1 point?',
      'Should I choose a fixed or floating rate?',
    ],
    priority: 4,
    serpWeakness: 2,
  },
  {
    slug: 'estonia-vs-finland-borrowing-comparison',
    targetQuery: 'estonia vs finland loan rates comparison',
    title: 'Borrowing in Estonia vs Finland: Rates, Rules and Which Is Cheaper',
    angle:
      'İki pazarı yan yana koy: personal loan oran bandı, mortgage marjı, DTI kuralları, mevduat güvencesi. Sınır ötesi çalışanlar ve taşınmayı düşünenler için. İki ülkede de canlı verimiz var.',
    internalLink: '/countries',
    mustAnswer: [
      'Are loan rates lower in Finland than Estonia?',
      'Can I borrow in one country and buy property in the other?',
      'Which country has stricter lending rules?',
    ],
    priority: 4,
    serpWeakness: 2,
  },
  {
    slug: 'e-resident-business-financing-options',
    targetQuery: 'e-resident business loan estonia',
    title: 'Financing an Estonian Company as an e-Resident: What Is Actually Available',
    angle:
      'Dürüst cevap: çoğu banka fiziksel bağ olmadan kredi vermiyor. Gerçek seçenekler — EIS destekleri, fintech kredi verenler, faktoring, AB fonları. Hayal satmıyoruz, harita çiziyoruz. e-Residency resmi sayfaları bankacılığı anlatıyor ama FİNANSMANI anlatmıyor.',
    internalLink: '/programs',
    mustAnswer: [
      'Can an e-resident get a business loan from an Estonian bank?',
      'What alternatives exist without local presence?',
      'Do EU grant programs accept e-resident companies?',
    ],
    priority: 4,
    serpWeakness: 2,
  },
  {
    slug: 'deposit-rates-estonia-guide',
    targetQuery: 'best deposit rates estonia',
    title: 'Where to Park Savings in Estonia: Term Deposit Rates Compared',
    angle:
      'Canlı mevduat verimiz + DGSD güvencesi açıklaması. pickthebank gibi siteler tablo veriyor ama koruma ve vergi tarafını atlıyor. Biz ikisini birleştiriyoruz.',
    internalLink: '/deposits',
    mustAnswer: [
      'Which Estonian bank pays the highest deposit rate now?',
      'Is deposit interest taxed in Estonia?',
      'Are deposits at smaller banks equally protected?',
    ],
    priority: 5,
    serpWeakness: 2,
  },
];

/** Yayınlanmamış, önceliği en yüksek konuyu döner */
export function nextTopic(publishedSlugs: string[]): BlogTopic | null {
  const done = new Set(publishedSlugs.map((s) => s.toLowerCase()));
  const open = BLOG_TOPICS.filter((t) => !done.has(t.slug.toLowerCase()));
  if (open.length === 0) return null;
  return open.sort((a, b) => a.priority - b.priority || b.serpWeakness - a.serpWeakness)[0];
}

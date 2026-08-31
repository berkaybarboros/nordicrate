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

  // ─── Tur 2 (2026-08-31): havuz 4 haftaya inmisti; kapsam disi kalan yuksek
  //     degerli alanlar eklendi. Site 8 ulke ve 6 sigorta sayfasi sunuyor ama
  //     icerigin tamami Estonya + kredi idi — sigorta/mevduat/FI/Baltik bosluktu.
  //     Angle'lar bu turda INGILIZCE: model makaleyi Ingilizce yaziyor, talimati
  //     ayni dilde vermek daha kararli cikti veriyor.
  {
    slug: 'car-insurance-estonia-foreigner',
    targetQuery: 'car insurance estonia foreigner',
    title: 'Car Insurance in Estonia for Foreigners: Liability vs Casco Explained',
    angle:
      'Estonia splits motor cover into mandatory liability (liikluskindlustus) and optional Casco. ' +
      'Foreign drivers keep asking whether a foreign licence and a foreign-plated car are covered, ' +
      'and forum answers contradict each other. Explain the two-layer system, what a foreign licence ' +
      'means for pricing, and when re-registration is required.',
    internalLink: '/insurance/casco',
    mustAnswer: [
      'Is liability insurance mandatory in Estonia?',
      'Do I need Casco if my car is financed?',
      'Can I insure a foreign-registered car in Estonia?',
    ],
    priority: 3,
    serpWeakness: 5,
  },
  {
    slug: 'health-insurance-estonia-foreigner',
    targetQuery: 'health insurance estonia foreigner',
    title: 'Health Insurance in Estonia for Foreigners: State Cover vs Private Policies',
    angle:
      'Estonian state health insurance follows employment, not residency. Expats, freelancers and ' +
      'e-residents fall into very different buckets and most pages only describe the employee case. ' +
      'Map each status to what it actually gets, and where private cover becomes necessary.',
    internalLink: '/insurance/health',
    mustAnswer: [
      'Am I covered by Estonian state health insurance as a foreign employee?',
      'What happens if I am self-employed or between jobs?',
      'Do e-residents get any health cover?',
    ],
    priority: 3,
    serpWeakness: 5,
  },
  {
    slug: 'deposit-guarantee-estonia-explained',
    targetQuery: 'are deposits safe in estonian banks',
    title: 'Are Your Deposits Safe in Estonian Banks? The EU Guarantee Explained',
    angle:
      'People moving money into Baltic banks for higher rates want to know it is protected. Explain the ' +
      '100,000 EUR EU deposit guarantee, that it applies per depositor per bank, how branches differ from ' +
      'subsidiaries, and why splitting across two banks can double the protected amount.',
    internalLink: '/deposits',
    mustAnswer: [
      'How much of my deposit is guaranteed in Estonia?',
      'Does the guarantee apply to non-residents and e-residents?',
      'Is a foreign bank branch covered by the Estonian scheme?',
    ],
    priority: 3,
    serpWeakness: 4,
  },
  {
    slug: 'loan-for-foreigners-finland',
    targetQuery: 'can foreigners get a loan in finland',
    title: 'Can Foreigners Get a Loan in Finland? Bank Requirements by Status',
    angle:
      'Finland is the second-largest market on the site but has no dedicated expat lending content. ' +
      'Finnish banks lean heavily on the henkilotunnus and a domestic credit record, so newcomers with ' +
      'strong income are still refused in year one. Explain why, and what shortens the wait.',
    internalLink: '/fi/kulutusluotto',
    mustAnswer: [
      'Do I need a Finnish personal identity code to borrow?',
      'How long must I have lived in Finland before banks lend?',
      'Which Finnish banks are most open to foreign applicants?',
    ],
    priority: 4,
    serpWeakness: 5,
  },
  {
    slug: 'euribor-explained-baltic-borrowers',
    targetQuery: 'what is euribor and how does it affect my mortgage',
    title: 'EURIBOR Explained: How It Changes Your Baltic Mortgage Payment',
    angle:
      'Almost every Baltic mortgage is margin plus 6-month EURIBOR, but borrowers discover this only when ' +
      'the payment jumps at reset. Show the arithmetic using the live EURIBOR in the data block, explain the ' +
      'reset cycle, and what a one-point move does to a typical payment.',
    internalLink: '/loans/mortgage',
    mustAnswer: [
      'What exactly is EURIBOR?',
      'How often does my rate reset?',
      'What happens to my payment if EURIBOR rises by one point?',
    ],
    priority: 4,
    serpWeakness: 3,
  },
  {
    slug: 'aprc-vs-interest-rate-explained',
    targetQuery: 'aprc vs interest rate difference',
    title: 'APRC vs Interest Rate: Why the Advertised Number Is Not What You Pay',
    angle:
      'Every comparison page shows both numbers and almost none explain the gap. APRC folds in fees, so two ' +
      'loans with identical headline rates can cost very differently. Show how to read an offer and which ' +
      'fees to demand in writing before signing.',
    internalLink: '/loan-calculator',
    mustAnswer: [
      'What is included in APRC that the interest rate leaves out?',
      'Why do two loans with the same rate have different APRC?',
      'Which number should I compare offers on?',
    ],
    priority: 4,
    serpWeakness: 3,
  },
  {
    slug: 'business-loan-e-resident-company',
    targetQuery: 'business loan for e-resident company estonia',
    title: 'Financing an e-Resident Company: What Estonian Banks Actually Fund',
    angle:
      'e-Residency sells company formation but not access to credit, and founders find the gap only after ' +
      'incorporating. Separate what an OU can realistically get (payment accounts, fintech credit, EIS-backed ' +
      'instruments) from what needs a resident director and local substance.',
    internalLink: '/loans/business',
    mustAnswer: [
      'Can an e-resident OU get a bank loan without a resident director?',
      'Which lenders serve companies with no Estonian substance?',
      'Does KredEx (now EIS) support e-resident companies?',
    ],
    priority: 4,
    serpWeakness: 5,
  },
  {
    slug: 'debt-to-income-limits-estonia',
    targetQuery: 'how much of my income can go to loan payments estonia',
    title: 'How Much of Your Income Can Go to Loan Payments in Estonia?',
    angle:
      'Estonia applies regulator-driven affordability limits that decide the answer before the bank even ' +
      'looks at the applicant. Explain how banks compute the ratio, which income counts, and why a ' +
      'foreign-currency salary is discounted.',
    internalLink: '/loan-calculator',
    mustAnswer: [
      'What debt-to-income ratio do Estonian banks accept?',
      'Does foreign income count towards the calculation?',
      'How do existing loans and credit cards affect the limit?',
    ],
    priority: 5,
    serpWeakness: 4,
  },
  {
    slug: 'baltic-loan-rates-country-comparison',
    targetQuery: 'estonia vs latvia vs lithuania loan rates',
    title: 'Estonia vs Latvia vs Lithuania: Where Borrowing Is Cheapest',
    angle:
      'Outsiders treat the three Baltic markets as one, but pricing and lender mix differ. Compare the live ' +
      'rate bands from the data block across the three countries, explain what drives the spread, and note ' +
      'which markets are friendlier to non-residents.',
    internalLink: '/countries',
    mustAnswer: [
      'Which Baltic country has the lowest consumer loan rates?',
      'Can I borrow in one Baltic country while living in another?',
      'Why do rates differ between the three markets?',
    ],
    priority: 5,
    serpWeakness: 4,
  },
  {
    slug: 'home-insurance-estonia-renter',
    targetQuery: 'home insurance estonia renter foreigner',
    title: 'Home Insurance in Estonia: What Renters and Foreign Owners Actually Need',
    angle:
      'Banks force property insurance on mortgaged homes, but renters and foreign landlords get almost no ' +
      'guidance. Separate building cover from contents and liability, and say plainly which one a tenant needs.',
    internalLink: '/insurance/home',
    mustAnswer: [
      'Does a renter need home insurance in Estonia?',
      'What does the bank require if I have a mortgage?',
      'Are my belongings covered if the building is insured?',
    ],
    priority: 5,
    serpWeakness: 5,
  },
];

/** Yayınlanmamış, önceliği en yüksek konuyu döner */
export function nextTopic(publishedSlugs: string[]): BlogTopic | null {
  const done = new Set(publishedSlugs.map((s) => s.toLowerCase()));
  const open = BLOG_TOPICS.filter((t) => !done.has(t.slug.toLowerCase()));
  if (open.length === 0) return null;
  return open.sort((a, b) => a.priority - b.priority || b.serpWeakness - a.serpWeakness)[0];
}

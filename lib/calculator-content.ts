/**
 * lib/calculator-content.ts — Hesaplayıcı sayfaları (EN/ET/FI)
 *
 * SERP bulgusu (audit 2026-07-25): hedef sorguların kazananları hesaplayıcı
 * sayfaları. Araç LoanCalcTool; altındaki SEO içerik DeepContent/DeepContentBlock
 * altyapısını yeniden kullanır. Kurallar deep-content.ts ile aynı:
 * piyasa oranı evergreen metne gömülmez, kişisel tavsiye yok.
 */

import type { DeepContent } from '@/lib/deep-content';
import type { CalcDict } from '@/components/calculators/LoanCalcTool';

export interface CalculatorPage {
  locale: 'en' | 'et' | 'fi';
  h1: string;
  metaTitle: string;
  metaDescription: string;
  lead: string; // H1 altı tek cümle
  dict: CalcDict;
  content: DeepContent; // araç altındaki SEO bölümü (h1 alanı h2 olarak render edilir)
}

export const CALCULATOR_ROUTES = {
  en: 'https://nordicrate.com/loan-calculator',
  et: 'https://nordicrate.com/et/laenukalkulaator',
  fi: 'https://nordicrate.com/fi/lainalaskuri',
} as const;

// ═══════════════════════════════ EN ═══════════════════════════════

const EN: CalculatorPage = {
  locale: 'en',
  h1: 'Loan calculator: monthly payment, interest and total cost',
  // SERP tur 2 (2026-08-05): "loan calculator estonia" sorgusuna hizalandı —
  // SERP zayıf (bryanestates/palgakulu sıralanıyor), coğrafya eklemek kazandırır
  metaTitle: 'Loan Calculator Estonia — Monthly Payment & Total Cost',
  metaDescription:
    'Free loan calculator for Nordic & Baltic borrowers. Set the amount, term and interest rate — see your monthly annuity payment, total interest and year-by-year breakdown.',
  lead: 'Set the amount, term and rate — the calculator shows your monthly annuity payment, total interest and a year-by-year breakdown.',
  dict: {
    amountLabel: 'Loan amount',
    yearsLabel: 'Term',
    rateLabel: 'Annual interest rate',
    rateHint: 'Set the rate from the offer you are considering — advertised "from" rates are best-case.',
    monthlyLabel: 'monthly payment',
    totalInterestLabel: 'total interest',
    totalCostLabel: 'total cost',
    tableShow: 'Show year-by-year breakdown',
    tableHide: 'Hide breakdown',
    colYear: 'Year',
    colInterest: 'Interest',
    colPrincipal: 'Principal',
    colBalance: 'Balance',
    ctaText: 'Compare real loan offers',
    ctaHref: '/loans',
    disclaimer: 'Annuity schedule, indicative only. Your actual offer depends on the lender’s assessment — always check the APRC.',
    yearsSuffix: 'yrs',
  },
  content: {
    locale: 'en',
    h1: 'How this loan calculator works',
    metaTitle: '', metaDescription: '', intro:
      'The calculator uses the annuity formula used by virtually every Nordic and Baltic bank: equal monthly payments where the interest share shrinks and the principal share grows over time. Enter any amount, term and rate to see the true cost of a loan before you talk to a lender.',
    sections: [
      {
        h2: 'What the result tells you',
        body: [
          'The monthly payment is the fixed annuity instalment for your inputs. Total interest is what the loan costs you beyond the principal — this number is the one to minimise, and it grows fast with longer terms even at the same rate.',
          'The year-by-year table shows how each year’s payments split between interest and principal, and what you still owe. Early years are interest-heavy: on long loans, most of your first payments barely touch the principal — which is why early extra repayments save the most.',
        ],
      },
      {
        h2: 'Which rate should you enter?',
        body: [
          'Use the nominal annual rate from the offer you are considering. Remember that the advertised "from" rate is the best case for the strongest applicants — your personal offer is set after the lender assesses your income and obligations.',
          'For a fair comparison between two offers, the decisive number is the [APRC](/guides/apr-kkm), which includes mandatory fees on top of interest. Two loans with the same nominal rate can differ meaningfully in APRC.',
        ],
      },
      {
        h2: 'Fixed rate or Euribor-linked?',
        body: [
          'Consumer loans in the region are typically fixed-rate, while mortgages are usually priced as [Euribor](/guides/euribor) plus a bank margin. For a Euribor-linked loan, this calculator shows the payment at today’s combined rate — the payment will move when Euribor resets.',
          'When you are ready, [compare live loan offers](/loans) — Estonian bank rates on NordicRate are captured daily from the banks’ own websites.',
        ],
      },
    ],
    faqs: [
      { q: 'How is the monthly payment calculated?', a: 'With the standard annuity formula: equal monthly instalments over the term, where the interest portion shrinks and the principal portion grows each month. It is the schedule virtually all Nordic and Baltic banks use by default.' },
      { q: 'Why does a longer term cost more in total?', a: 'Interest accrues on the outstanding balance for longer. A longer term lowers the monthly payment but increases the number of months interest is charged, so total interest grows — often dramatically on terms above 10 years.' },
      { q: 'Is this the same as the bank’s offer?', a: 'No — it is an indicative annuity schedule for the inputs you set. Banks price individually and add fees, which is why offers should be compared on the APRC, not the nominal rate.' },
      { q: 'Does using this calculator affect my credit score?', a: 'No. The calculator runs entirely in your browser, requires no personal data and involves no credit check.' },
    ],
    related: [
      { label: 'Compare all loans', href: '/loans' },
      { label: 'APR / KKM explained', href: '/guides/apr-kkm' },
      { label: 'What is Euribor?', href: '/guides/euribor' },
      { label: 'Mortgages in Estonia', href: '/loans/mortgage' },
    ],
  },
};

// ═══════════════════════════════ ET ═══════════════════════════════

const ET: CalculatorPage = {
  locale: 'et',
  h1: 'Laenukalkulaator: kuumakse, intress ja laenu kogukulu',
  metaTitle: 'Laenukalkulaator — kuumakse ja kogukulu arvutus',
  metaDescription:
    'Tasuta laenukalkulaator: sisesta summa, periood ja intress — näed annuiteetgraafiku kuumakset, kogu intressikulu ja aastate lõikes jaotust.',
  lead: 'Sisesta summa, periood ja intress — kalkulaator näitab kuumakset, kogu intressikulu ja aastate lõikes jaotust.',
  dict: {
    amountLabel: 'Laenusumma',
    yearsLabel: 'Periood',
    rateLabel: 'Aastane intressimäär',
    rateHint: 'Sisesta pakkumise intress — reklaamitud "alates" määr on parim võimalik stsenaarium.',
    monthlyLabel: 'kuumakse',
    totalInterestLabel: 'intress kokku',
    totalCostLabel: 'kogukulu',
    tableShow: 'Näita jaotust aastate lõikes',
    tableHide: 'Peida jaotus',
    colYear: 'Aasta',
    colInterest: 'Intress',
    colPrincipal: 'Põhiosa',
    colBalance: 'Jääk',
    ctaText: 'Võrdle päris laenupakkumisi',
    ctaHref: '/loans',
    disclaimer: 'Annuiteetgraafik, üksnes indikatiivne. Tegelik pakkumine sõltub panga hinnangust — võrdle alati KKM-i.',
    yearsSuffix: 'a',
  },
  content: {
    locale: 'et',
    h1: 'Kuidas laenukalkulaator arvutab',
    metaTitle: '', metaDescription: '', intro:
      'Kalkulaator kasutab annuiteetgraafiku valemit, mida kasutavad pea kõik Eesti pangad: võrdsed kuumaksed, kus intressi osa ajas väheneb ja põhiosa kasvab. Sisesta suvaline summa, periood ja intress ning näed laenu tegelikku hinda enne pangaga rääkimist.',
    sections: [
      {
        h2: 'Mida tulemus sulle ütleb',
        body: [
          'Kuumakse on sinu sisendite järgi arvutatud võrdne annuiteetmakse. "Intress kokku" on summa, mille laen maksab lisaks põhiosale — just seda numbrit tasub minimeerida, ja see kasvab pika perioodiga kiiresti isegi sama intressi juures.',
          'Aastate tabel näitab, kuidas iga aasta maksed jagunevad intressi ja põhiosa vahel ning kui palju veel võlgned. Esimestel aastatel läheb suurem osa maksest intressiks — seepärast säästavad varased lisatagastused kõige rohkem.',
        ],
      },
      {
        h2: 'Millise intressi sisestada?',
        body: [
          'Kasuta kaalutava pakkumise nominaalset aastaintressi. Pea meeles: reklaamitud "alates" määr on parim stsenaarium tugevaimale taotlejale — sinu tegelik pakkumine selgub pärast panga hindamist.',
          'Kahe pakkumise ausaks võrdlemiseks on otsustav number krediidi kulukuse määr (KKM), mis sisaldab lisaks intressile ka kohustuslikke tasusid. Sama intressiga laenud võivad KKM-i poolest oluliselt erineda — loe lähemalt [tarbimislaenu lehelt](/et/tarbimislaen).',
        ],
      },
      {
        h2: 'Fikseeritud või Euriboriga seotud intress?',
        body: [
          'Tarbimislaenud on Eestis üldjuhul fikseeritud intressiga, [kodulaenud](/et/kodulaen) aga seotud 6 kuu Euriboriga, millele lisandub panga marginaal. Euriboriga seotud laenu puhul näitab kalkulaator makset tänase kogumäära juures — makse muutub Euribori ülevaatusel.',
          'Kui oled valmis, [võrdle päris pakkumisi](/loans) — Eesti pankade intressimäärad püütakse NordicRate’is iga päev pankade enda lehtedelt.',
        ],
      },
    ],
    faqs: [
      { q: 'Kuidas kuumakse arvutatakse?', a: 'Standardse annuiteetvalemi järgi: võrdsed kuumaksed kogu perioodi vältel, kus intressi osa iga kuuga väheneb ja põhiosa kasvab. See on graafik, mida Eesti pangad vaikimisi kasutavad.' },
      { q: 'Miks pikem periood maksab kokku rohkem?', a: 'Intress koguneb laenujäägilt kauem. Pikem periood alandab kuumakset, kuid intressi arvestatakse rohkematel kuudel — kogu intressikulu kasvab, üle 10-aastastel perioodidel sageli väga märgatavalt.' },
      { q: 'Kas see on sama mis panga pakkumine?', a: 'Ei — see on indikatiivne annuiteetgraafik sinu sisendite põhjal. Pangad hindavad individuaalselt ja lisavad tasud, mistõttu pakkumisi tuleb võrrelda KKM-i, mitte nominaalse intressi järgi.' },
      { q: 'Kas kalkulaatori kasutamine mõjutab mu krediidiskoori?', a: 'Ei. Kalkulaator töötab täielikult sinu brauseris, ei küsi isikuandmeid ega tee ühtegi krediidipäringut.' },
    ],
    related: [
      { label: 'Tarbimislaen Eestis', href: '/et/tarbimislaen' },
      { label: 'Kodulaen Eestis', href: '/et/kodulaen' },
      { label: 'Võrdle kõiki laene', href: '/loans' },
    ],
  },
};

// ═══════════════════════════════ FI ═══════════════════════════════

const FI: CalculatorPage = {
  locale: 'fi',
  h1: 'Lainalaskuri: kuukausierä, korko ja lainan kokonaiskulut',
  metaTitle: 'Lainalaskuri — kuukausierä ja kokonaiskulut',
  metaDescription:
    'Ilmainen lainalaskuri: syötä summa, laina-aika ja korko — näet tasaerän kuukausierän, korkokulut yhteensä ja vuosittaisen erittelyn.',
  lead: 'Syötä summa, laina-aika ja korko — laskuri näyttää kuukausierän, korkokulut yhteensä ja vuosittaisen erittelyn.',
  dict: {
    amountLabel: 'Lainasumma',
    yearsLabel: 'Laina-aika',
    rateLabel: 'Vuosikorko',
    rateHint: 'Syötä harkitsemasi tarjouksen korko — mainostettu "alkaen"-korko on paras mahdollinen skenaario.',
    monthlyLabel: 'kuukausierä',
    totalInterestLabel: 'korot yhteensä',
    totalCostLabel: 'kokonaiskulut',
    tableShow: 'Näytä vuosittainen erittely',
    tableHide: 'Piilota erittely',
    colYear: 'Vuosi',
    colInterest: 'Korko',
    colPrincipal: 'Lyhennys',
    colBalance: 'Jäljellä',
    ctaText: 'Vertaile todellisia lainatarjouksia',
    ctaHref: '/loans/finland',
    disclaimer: 'Tasaerälaskelma, vain suuntaa-antava. Todellinen tarjous riippuu pankin arviosta — vertaa aina todellista vuosikorkoa.',
    yearsSuffix: 'v',
  },
  content: {
    locale: 'fi',
    h1: 'Näin lainalaskuri laskee',
    metaTitle: '', metaDescription: '', intro:
      'Laskuri käyttää tasaerälaskentaa (annuiteetti), jota lähes kaikki suomalaiset pankit käyttävät: yhtä suuret kuukausierät, joissa koron osuus pienenee ja lyhennyksen osuus kasvaa ajan myötä. Syötä mikä tahansa summa, laina-aika ja korko — näet lainan todellisen hinnan ennen pankkineuvottelua.',
    sections: [
      {
        h2: 'Mitä tulos kertoo',
        body: [
          'Kuukausierä on syötteilläsi laskettu kiinteä tasaerä. "Korot yhteensä" on summa, jonka laina maksaa pääoman lisäksi — juuri tätä lukua kannattaa pienentää, ja se kasvaa pitkillä laina-ajoilla nopeasti samallakin korolla.',
          'Vuositaulukko näyttää, miten kunkin vuoden maksut jakautuvat koron ja lyhennyksen kesken ja paljonko lainaa on jäljellä. Alkuvuodet ovat korkopainotteisia — siksi ylimääräiset lyhennykset alkuvaiheessa säästävät eniten.',
        ],
      },
      {
        h2: 'Mikä korko laskuriin?',
        body: [
          'Käytä harkitsemasi tarjouksen nimelliskorkoa. Muista, että mainostettu "alkaen"-korko on paras skenaario vahvimmalle hakijalle — oma tarjouksesi selviää vasta pankin arvion jälkeen.',
          'Kahden tarjouksen reiluun vertailuun ratkaiseva luku on todellinen vuosikorko, joka sisältää koron lisäksi pakolliset kulut. Lue lisää [kulutusluottosivulta](/fi/kulutusluotto).',
        ],
      },
      {
        h2: 'Kilpailuta lainasi laskurin jälkeen',
        body: [
          'Lainan kilpailutus on Suomessa tehokkain tapa pudottaa korkoa: sama summa ja laina-aika usealle pankille, ja tarjouksia vertaillaan todellisella vuosikorolla. [Asuntolainassa](/fi/asuntolaina) kilpailutetaan ennen kaikkea marginaali — se on ainoa osa hinnasta, johon voit itse vaikuttaa.',
          'Kun laskuri on antanut sinulle realistisen kuukausierän, [vertaile Suomen lainatarjontaa](/loans/finland) ja pyydä tarjoukset samoilla syötteillä.',
        ],
      },
    ],
    faqs: [
      { q: 'Miten kuukausierä lasketaan?', a: 'Tavallisella tasaerä- eli annuiteettikaavalla: yhtä suuret kuukausierät koko laina-ajalle, joissa koron osuus pienenee ja lyhennyksen osuus kasvaa kuukausittain. Tämä on suomalaisten pankkien oletusgraafi.' },
      { q: 'Miksi pidempi laina-aika maksaa yhteensä enemmän?', a: 'Korkoa kertyy jäljellä olevalle pääomalle pidempään. Pidempi laina-aika pienentää kuukausierää mutta kasvattaa korkokuukausien määrää — kokonaiskorko kasvaa, yli 10 vuoden lainoissa usein huomattavasti.' },
      { q: 'Onko tämä sama kuin pankin tarjous?', a: 'Ei — tämä on suuntaa-antava tasaerälaskelma syötteilläsi. Pankit hinnoittelevat yksilöllisesti ja lisäävät kulut, siksi tarjouksia verrataan todellisella vuosikorolla, ei nimelliskorolla.' },
      { q: 'Vaikuttaako laskurin käyttö luottotietoihini?', a: 'Ei. Laskuri toimii kokonaan selaimessasi, ei kysy henkilötietoja eikä tee luottotietokyselyä.' },
    ],
    related: [
      { label: 'Kulutusluotot Suomessa', href: '/fi/kulutusluotto' },
      { label: 'Asuntolaina Suomessa', href: '/fi/asuntolaina' },
      { label: 'Lainat Suomessa', href: '/loans/finland' },
    ],
  },
};

export const CALCULATOR_PAGES = { en: EN, et: ET, fi: FI } as const;

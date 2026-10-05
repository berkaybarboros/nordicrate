// Localized homepage dictionaries for NordicRate landing pages (EN / FI / ET).
// Placeholders {products}, {institutions}, {countries} are replaced at render time — keep them intact.

export interface HomeDict {
  locale: 'en' | 'fi' | 'et';
  metaTitle: string;
  metaDescription: string;
  badge: string;
  h1Line1: string;
  h1Line2: string;
  h1Accent: string;
  subtitle: string;
  chips: string[];
  statCountries: string;
  statInstitutions: string;
  statProducts: string;
  ctaBrowse: string;
  ctaCalculator: string;
  bestRatesTitle: string;
  bestRatesSubtitle: string;
  bestPersonal: string;
  bestMortgage: string;
  bestBusiness: string;
  /** Canlı (48 sa içinde okunmuş) oran yoksa kartta gösterilen etiket */
  indicative: string;
  aprFrom: string;
  compareAll: string;
  howTitle: string;
  howSubtitle: string;
  steps: { title: string; desc: string }[];
  countriesTitle: string;
  countriesSubtitle: string;
  disclaimer: string;
}

export const HOME_DICTS: Record<'en' | 'fi' | 'et', HomeDict> = {
  en: {
    locale: 'en',
    metaTitle: 'NordicRate — Compare Loan Rates in Nordics & Baltics',
    metaDescription:
      'Compare personal loans, mortgages and business loans from banks across 8 Nordic and Baltic countries. Free to use, and comparing does not affect your credit score.',
    badge: 'Bank rates read daily · EURIBOR from the ECB',
    h1Line1: 'One search.',
    h1Line2: 'Every Nordic & Baltic',
    h1Accent: 'loan rate.',
    subtitle:
      'Compare {products} products from {institutions} banks and insurers across {countries} countries — free, and with no impact on your credit score.',
    chips: ['Free to use', 'No effect on your credit score', 'Rates read from bank websites', 'GDPR compliant'],
    statCountries: 'Countries',
    statInstitutions: 'Institutions',
    statProducts: 'Products',
    ctaBrowse: 'Compare all loans',
    ctaCalculator: 'Loan calculator',
    bestRatesTitle: 'Lowest rates we have read',
    bestRatesSubtitle: 'Read from bank websites in the last 48 hours — otherwise marked indicative',
    bestPersonal: 'Personal loan',
    bestMortgage: 'Mortgage',
    bestBusiness: 'Business loan',
    indicative: 'indicative',
    aprFrom: 'APR from',
    compareAll: 'Compare all rates →',
    howTitle: 'How NordicRate Works',
    howSubtitle: 'Find your best loan rate in 3 simple steps',
    steps: [
      {
        title: 'Calculate',
        desc: 'Enter your loan amount and term in our free calculator to see estimated monthly payments instantly.',
      },
      {
        title: 'Compare',
        desc: 'Browse and filter loan products from banks across the region, sorted by lowest APR, highest limit, or most recent.',
      },
      {
        title: 'Apply',
        desc: 'Apply on the bank’s own site. NordicRate is free for you; some banks pay us a referral fee, which never changes the order we show.',
      },
    ],
    countriesTitle: 'Browse by Country',
    countriesSubtitle: 'Explore credit markets across 8 Nordic & Baltic countries',
    disclaimer:
      'Rates shown are indicative and for comparison purposes only. Actual rates depend on individual creditworthiness, loan amount, and term. Always verify current rates directly with the financial institution before applying. NordicRate is not a financial advisor.',
  },
  fi: {
    locale: 'fi',
    metaTitle: 'NordicRate — Lainavertailu Pohjoismaissa ja Baltiassa',
    metaDescription:
      'Ilmainen lainavertailu: vertaa kulutusluottoja, asuntolainoja ja yrityslainoja pankeista 8 Pohjoismaassa ja Baltian maassa — vertailu ei vaikuta luottotietoihisi.',
    badge: 'Pankkien korot luetaan päivittäin · EURIBOR EKP:ltä',
    h1Line1: 'Yksi haku.',
    h1Line2: 'Kaikki Pohjoismaiden ja Baltian',
    h1Accent: 'lainakorot.',
    subtitle:
      'Vertaile {products} tuotetta {institutions} pankilta ja vakuutusyhtiöltä {countries} maassa — ilmaiseksi ja ilman vaikutusta luottotietoihisi.',
    chips: ['Maksuton', 'Ei vaikutusta luottotietoihin', 'Korot pankkien sivuilta', 'GDPR-yhteensopiva'],
    statCountries: 'Maata',
    statInstitutions: 'Rahoituslaitosta',
    statProducts: 'Tuotetta',
    ctaBrowse: 'Vertaile kaikkia lainoja',
    ctaCalculator: 'Lainalaskuri',
    bestRatesTitle: 'Alhaisimmat lukemamme korot',
    bestRatesSubtitle: 'Luettu pankkien sivuilta viimeisen 48 tunnin aikana — muuten merkitty suuntaa-antavaksi',
    bestPersonal: 'Kulutusluotto',
    bestMortgage: 'Asuntolaina',
    bestBusiness: 'Yrityslaina',
    indicative: 'suuntaa-antava',
    aprFrom: 'Todellinen vuosikorko alk.',
    compareAll: 'Vertaile kaikkia korkoja →',
    howTitle: 'Näin NordicRate toimii',
    howSubtitle: 'Löydä paras lainakorko kolmessa helpossa vaiheessa',
    steps: [
      {
        title: 'Laske',
        desc: 'Syötä lainasumma ja laina-aika ilmaiseen lainalaskuriimme ja näet arvioidut kuukausierät heti.',
      },
      {
        title: 'Vertaile',
        desc: 'Selaa ja suodata alueen pankkien lainatuotteita — järjestä alimman todellisen vuosikoron, korkeimman lainasumman tai uusimman mukaan.',
      },
      {
        title: 'Hae lainaa',
        desc: 'Hae lainaa pankin omilla sivuilla. NordicRate on sinulle maksuton; osa pankeista maksaa meille välityspalkkion, joka ei koskaan muuta näyttämäämme järjestystä.',
      },
    ],
    countriesTitle: 'Selaa maittain',
    countriesSubtitle: 'Tutustu kahdeksan Pohjoismaan ja Baltian maan luottomarkkinoihin',
    disclaimer:
      'Esitetyt korot ovat suuntaa-antavia ja tarkoitettu vain vertailuun. Todellinen korko riippuu hakijan luottokelpoisuudesta, lainasummasta ja laina-ajasta. Tarkista ajantasaiset korot aina suoraan pankista ennen hakemuksen jättämistä. NordicRate ei ole taloudellinen neuvonantaja.',
  },
  et: {
    locale: 'et',
    metaTitle: 'NordicRate — Laenude võrdlus Põhjamaades ja Baltikumis',
    metaDescription:
      'Tasuta laenude võrdlus: võrdle väikelaene, kodulaene ja ärilaene pankadest 8 Põhjamaa ja Balti riigis — võrdlemine ei mõjuta sinu krediidiajalugu.',
    badge: 'Pankade intressid loetakse iga päev · EURIBOR EKP-lt',
    h1Line1: 'Üks otsing.',
    h1Line2: 'Kõik Põhjamaade ja Baltikumi',
    h1Accent: 'laenuintressid.',
    subtitle:
      'Võrdle {products} toodet {institutions} pangalt ja kindlustusandjalt {countries} riigis — tasuta ja ilma mõjuta sinu krediidiskoorile.',
    chips: ['Tasuta', 'Ei mõjuta krediidiajalugu', 'Intressid pankade kodulehtedelt', 'GDPR-iga kooskõlas'],
    statCountries: 'Riiki',
    statInstitutions: 'Asutust',
    statProducts: 'Toodet',
    ctaBrowse: 'Võrdle kõiki laene',
    ctaCalculator: 'Laenukalkulaator',
    bestRatesTitle: 'Madalaimad loetud intressid',
    bestRatesSubtitle: 'Loetud pankade kodulehtedelt viimase 48 tunni jooksul — muul juhul märgitud soovituslikuks',
    bestPersonal: 'Väikelaen',
    bestMortgage: 'Kodulaen',
    bestBusiness: 'Ärilaen',
    indicative: 'soovituslik',
    aprFrom: 'KKM alates',
    compareAll: 'Võrdle kõiki intresse →',
    howTitle: 'Kuidas NordicRate töötab',
    howSubtitle: 'Leia parim laenuintress kolme lihtsa sammuga',
    steps: [
      {
        title: 'Arvuta',
        desc: 'Sisesta laenusumma ja periood meie tasuta laenukalkulaatorisse ning näe hinnangulisi kuumakseid kohe.',
      },
      {
        title: 'Võrdle',
        desc: 'Sirvi ja filtreeri piirkonna pankade laenutooteid — järjesta madalaima krediidi kulukuse määra, suurima limiidi või uusima järgi.',
      },
      {
        title: 'Taotle',
        desc: 'Taotle laenu otse panga kodulehel. NordicRate on sulle tasuta; osa panku maksab meile vahendustasu, mis ei muuda kunagi meie näidatavat järjestust.',
      },
    ],
    countriesTitle: 'Sirvi riikide kaupa',
    countriesSubtitle: 'Tutvu 8 Põhjamaa ja Balti riigi krediiditurgudega',
    disclaimer:
      'Näidatud intressimäärad on soovituslikud ja mõeldud üksnes võrdluseks. Tegelik intress sõltub taotleja krediidivõimest, laenusummast ja perioodist. Kontrolli kehtivaid tingimusi alati otse finantsasutusest enne taotluse esitamist. NordicRate ei ole finantsnõustaja.',
  },
};

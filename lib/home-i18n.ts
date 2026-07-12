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
      'Compare personal loans, mortgages and business loans from 50+ banks across 8 Nordic and Baltic countries. Free, independent, no credit check.',
    badge: 'Live EURIBOR & central bank data',
    h1Line1: 'One search.',
    h1Line2: 'Every Nordic & Baltic',
    h1Accent: 'loan rate.',
    subtitle:
      'Compare {products}+ products from {institutions}+ banks and insurers across {countries} countries — free, independent, and with no impact on your credit score.',
    chips: ['100% free', 'No credit check', 'Independent comparison', 'GDPR compliant'],
    statCountries: 'Countries',
    statInstitutions: 'Institutions',
    statProducts: 'Products',
    ctaBrowse: 'Compare all loans',
    ctaCalculator: 'Loan calculator',
    bestRatesTitle: "Today's Best Market Rates",
    bestRatesSubtitle: 'Live lowest APR from our database — updated daily',
    bestPersonal: 'Best Personal Loan',
    bestMortgage: 'Best Mortgage Rate',
    bestBusiness: 'Best Business Loan',
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
        desc: 'Browse and filter 100+ loan products from 50+ banks, sorted by lowest APR, highest limit, or most recent.',
      },
      {
        title: 'Apply',
        desc: 'Click directly through to your chosen bank. No middleman, no hidden fees — we are 100% free to use.',
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
      'Ilmainen lainavertailu: vertaa kulutusluottoja, asuntolainoja ja yrityslainoja yli 50 pankista 8 Pohjoismaassa ja Baltian maassa — ilman luottokyselyä.',
    badge: 'Reaaliaikainen EURIBOR- ja keskuspankkidata',
    h1Line1: 'Yksi haku.',
    h1Line2: 'Kaikki Pohjoismaiden ja Baltian',
    h1Accent: 'lainakorot.',
    subtitle:
      'Vertaile {products}+ tuotetta {institutions}+ pankilta ja vakuutusyhtiöltä {countries} maassa — ilmaiseksi, riippumattomasti ja ilman vaikutusta luottotietoihisi.',
    chips: ['100 % ilmainen', 'Ei luottokyselyä', 'Riippumaton vertailu', 'GDPR-yhteensopiva'],
    statCountries: 'Maata',
    statInstitutions: 'Rahoituslaitosta',
    statProducts: 'Tuotetta',
    ctaBrowse: 'Vertaile kaikkia lainoja',
    ctaCalculator: 'Lainalaskuri',
    bestRatesTitle: 'Päivän parhaat markkinakorot',
    bestRatesSubtitle: 'Alhaisimmat todelliset vuosikorot tietokannastamme — päivitetään päivittäin',
    bestPersonal: 'Paras kulutusluotto',
    bestMortgage: 'Paras asuntolainakorko',
    bestBusiness: 'Paras yrityslaina',
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
        desc: 'Selaa ja suodata yli 100 lainatuotetta yli 50 pankista — järjestä alimman todellisen vuosikoron, korkeimman lainasumman tai uusimman mukaan.',
      },
      {
        title: 'Hae lainaa',
        desc: 'Siirry suoraan valitsemasi pankin sivuille. Ei välikäsiä, ei piilokuluja — palvelumme on sinulle 100 % ilmainen.',
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
      'Tasuta laenude võrdlus: võrdle väikelaene, kodulaene ja ärilaene enam kui 50 pangast 8 Põhjamaa ja Balti riigis — sõltumatult ja ilma krediidipäringuta.',
    badge: 'Reaalajas EURIBOR ja keskpankade andmed',
    h1Line1: 'Üks otsing.',
    h1Line2: 'Kõik Põhjamaade ja Baltikumi',
    h1Accent: 'laenuintressid.',
    subtitle:
      'Võrdle {products}+ toodet {institutions}+ pangalt ja kindlustusandjalt {countries} riigis — tasuta, sõltumatult ja ilma mõjuta sinu krediidiskoorile.',
    chips: ['100% tasuta', 'Ilma krediidipäringuta', 'Sõltumatu võrdlus', 'GDPR-iga kooskõlas'],
    statCountries: 'Riiki',
    statInstitutions: 'Asutust',
    statProducts: 'Toodet',
    ctaBrowse: 'Võrdle kõiki laene',
    ctaCalculator: 'Laenukalkulaator',
    bestRatesTitle: 'Tänased parimad turuintressid',
    bestRatesSubtitle: 'Madalaim krediidi kulukuse määr meie andmebaasist — uuendatakse iga päev',
    bestPersonal: 'Parim väikelaen',
    bestMortgage: 'Parim kodulaenu intress',
    bestBusiness: 'Parim ärilaen',
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
        desc: 'Sirvi ja filtreeri üle 100 laenutoote enam kui 50 pangast — järjesta madalaima krediidi kulukuse määra, suurima limiidi või uusima järgi.',
      },
      {
        title: 'Taotle',
        desc: 'Liigu otse valitud panga lehele. Ei mingeid vahendajaid ega peidetud tasusid — meie teenus on sulle 100% tasuta.',
      },
    ],
    countriesTitle: 'Sirvi riikide kaupa',
    countriesSubtitle: 'Tutvu 8 Põhjamaa ja Balti riigi krediiditurgudega',
    disclaimer:
      'Näidatud intressimäärad on soovituslikud ja mõeldud üksnes võrdluseks. Tegelik intress sõltub taotleja krediidivõimest, laenusummast ja perioodist. Kontrolli kehtivaid tingimusi alati otse finantsasutusest enne taotluse esitamist. NordicRate ei ole finantsnõustaja.',
  },
};

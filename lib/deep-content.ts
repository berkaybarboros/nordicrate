/**
 * lib/deep-content.ts — Derin semantik SEO içeriği (kategori sayfaları)
 *
 * Kaynak: SEO blueprint (2026-07-19). İlkeler:
 * - Oran/rakam SADECE mevzuat kaynaklıysa yazılır (Eesti Pank LTV %85 gibi);
 *   piyasa oranları asla evergreen metne gömülmez — canlı kartlar gösterir.
 * - Kişiselleştirilmiş finansal tavsiye verilmez ("compare", "typically").
 * - FI içeriği FİNLANDİYA pazarına adaptedir (Euribor 12kk, ASP, lainakatto) —
 *   ET/EN içeriği Estonya'ya. Çeviri değil, pazar-doğru lokalizasyon.
 * - Body paragrafları [metin](/route) inline link mini-sözdizimini destekler
 *   (DeepContentBlock render eder).
 */

export interface DeepSection {
  h2: string;
  body: string[];
}

export interface DeepContent {
  locale: 'en' | 'et' | 'fi';
  h1: string;
  metaTitle: string;       // ≤60 karakter
  metaDescription: string; // ≤155 karakter
  intro: string;           // 40-60 kelime featured-snippet cevabı
  sections: DeepSection[];
  faqs: { q: string; a: string }[];
  related: { label: string; href: string }[];
}

// ═══════════════════════════════════════════════════════════════════════════
// MORTGAGE — Estonia (EN)
// ═══════════════════════════════════════════════════════════════════════════

const MORTGAGE_EN: DeepContent = {
  locale: 'en',
  h1: 'Mortgages in Estonia: compare Euribor home-loan rates',
  metaTitle: 'Mortgages in Estonia: Compare Euribor Home-Loan Rates',
  metaDescription:
    'Compare Estonian mortgage offers from LHV, Swedbank, SEB, Luminor and Coop Pank. See how Euribor + margin, LTV limits and state guarantees work.',
  intro:
    'A mortgage in Estonia (kodulaen) is a long-term home loan secured against the property and registered with a notary. Because Estonia uses the euro, variable rates are priced as Euribor — most commonly the 6-month rate — plus a fixed bank margin. Comparing the margin across banks is where borrowers save most.',
  sections: [
    {
      h2: 'How Estonian mortgage rates are set',
      body: [
        'Estonia is in the eurozone, so almost all variable-rate mortgages are priced as a reference rate plus a bank margin. The reference is Euribor — Estonian banks predominantly use the 6-month Euribor, which resets every six months. When Euribor moves, your rate and monthly payment move with it at the next reset.',
        'The margin, by contrast, is fixed in your contract for the life of the loan and is the part banks compete on. Two borrowers with identical Euribor exposure can pay very different amounts purely because of the margin they negotiated. That is why comparing the margin — not just today’s headline rate — is the single most useful thing you can do before signing.',
        'Most Estonian mortgages are variable (Euribor-linked). Some banks offer a fixed-rate period for the first few years before the loan reverts to Euribor plus margin. A fixed period buys predictability if you expect rates to rise, usually at a slightly higher starting cost. Neither is universally better — it depends on your risk tolerance and how long you plan to hold the loan.',
      ],
    },
    {
      h2: 'How much you can borrow — LTV, down payment and affordability',
      body: [
        'Estonian mortgage lending is shaped by macroprudential limits set by Eesti Pank (the central bank), which every licensed lender must observe. The loan can generally cover up to 85% of the property’s value (loan-to-value, LTV), meaning a minimum 15% down payment (omafinantseering). Housing loans are capped at 30-year maturities.',
        'Your total monthly loan repayments are also limited relative to your net income (a debt-service-to-income rule), and banks must stress-test affordability against a higher interest rate than today’s — so the amount a bank will lend already assumes rates could rise. Check Eesti Pank’s current requirements for the exact percentages, as they are reviewed periodically.',
        'Estonia also offers a state-backed guarantee (widely known as the KredEx guarantee) that lets eligible borrowers — commonly first-home buyers and young families — take a mortgage with a smaller down payment than the standard 15%. The guarantee doesn’t lower your interest rate directly; it reduces the deposit hurdle. Eligibility rules change over time, so verify the current criteria before assuming you qualify.',
      ],
    },
    {
      h2: 'What the process looks like',
      body: [
        'Estonian mortgages are unusually digital at the front end and formal at the back end. Most banks give an indicative decision online based on income and the property. An independent or bank-appointed valuation then sets the LTV base.',
        'The mortgage and sale are executed as a notarial deed — this step is mandatory. Finally the mortgage is registered against the property in the land register (kinnistusraamat), which secures the loan. Expect one to a few weeks end-to-end, mostly driven by valuation and notary scheduling, and budget for notary and state fees on top of your down payment.',
      ],
    },
    {
      h2: 'Mortgages for expats and e-residents',
      body: [
        'This is where Estonia’s digital reputation causes confusion. e-Residency is a digital identity for running an EU company — it is not tax residency and does not, by itself, qualify you for a home loan. Banks assessing a mortgage want Estonian tax residency, verifiable local income and, in practice, a local banking relationship.',
        'EU citizens who live and work in Estonia can generally apply on terms similar to locals once they’ve established income history. Non-residents buying property in Estonia usually face far tighter conditions or need to finance the purchase from abroad. If you’re an e-resident, the more realistic borrowing path is [business financing through your Estonian company](/loans/business), not a personal mortgage.',
      ],
    },
    {
      h2: 'How to compare Estonian mortgages the right way',
      body: [
        'Compare on the total cost, not the headline rate. Look at the margin (the fixed, negotiable part) over Euribor, and at the APRC — in Estonian, krediidi kulukuse määr (KKM) — which folds in mandatory fees and gives you a like-for-like number across banks.',
        'Factor in up-front costs (valuation, notary, state fee, contract fees) and required extras: many lenders expect [home insurance](/insurance/home), and often [life insurance](/insurance/life), as a condition — include those premiums in the real monthly cost. Our comparison table above shows live rates where marked, sourced directly from bank websites.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What reference rate do Estonian mortgages use?',
      a: 'Estonia is in the eurozone, so variable-rate mortgages are typically priced as Euribor — most often the 6-month Euribor — plus a fixed bank margin. The Euribor part resets periodically and moves your payment; the margin stays fixed for the life of the loan and is what banks compete on.',
    },
    {
      q: 'How much down payment do I need for a mortgage in Estonia?',
      a: 'Standard lending allows a loan of up to about 85% of the property value, meaning a minimum down payment (omafinantseering) of around 15%. Eligible borrowers using a state-backed KredEx guarantee may put down less. Check current limits, as they are set by Eesti Pank and can change.',
    },
    {
      q: 'Can I get an Estonian mortgage as an e-resident?',
      a: 'Not on the basis of e-Residency alone. e-Residency is a digital identity for running a company, not tax residency. Banks generally require Estonian tax residency and verifiable local income for a home loan. E-residents living abroad are usually better served by business financing through their Estonian company.',
    },
    {
      q: 'What is the maximum mortgage term in Estonia?',
      a: 'Housing loan maturities are capped at 30 years under Eesti Pank’s requirements. A longer term lowers the monthly payment but increases the total interest paid over the life of the loan.',
    },
    {
      q: 'What does APRC (krediidi kulukuse määr) include?',
      a: 'The APRC, or krediidi kulukuse määr (KKM), expresses the total yearly cost of the loan including interest and mandatory fees as a single percentage. It is the fairest way to compare mortgage offers across banks, because a low headline rate can be offset by higher fees.',
    },
    {
      q: 'Do I need insurance to get a mortgage in Estonia?',
      a: 'Home insurance on the property is commonly required as a lending condition, and many banks also expect life insurance matching the loan. You can usually choose any insurer that meets the bank’s requirements rather than buying the bank’s own product.',
    },
  ],
  related: [
    { label: 'All loans in Estonia', href: '/loans/estonia' },
    { label: 'Personal loans in Estonia', href: '/loans/personal' },
    { label: 'Home insurance', href: '/insurance/home' },
    { label: 'Life insurance', href: '/insurance/life' },
    { label: 'Business financing', href: '/loans/business' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// MORTGAGE — Estonia (ET) — /et/kodulaen
// ═══════════════════════════════════════════════════════════════════════════

const MORTGAGE_ET: DeepContent = {
  locale: 'et',
  h1: 'Kodulaen Eestis: võrdle Euriboriga seotud intressimäärasid',
  metaTitle: 'Kodulaen Eestis: võrdle pankade marginaale ja intresse',
  metaDescription:
    'Võrdle Eesti kodulaenu pakkumisi — LHV, Swedbank, SEB, Luminor, Coop Pank. Kuidas toimivad Euribor + marginaal, LTV piirangud ja riiklik käendus.',
  intro:
    'Kodulaen on pikaajaline eluasemelaen, mille tagatiseks on kinnisvara ja mis vormistatakse notari juures. Kuna Eesti on euroalas, seotakse muutuv intress enamasti 6 kuu Euriboriga, millele lisandub panga fikseeritud marginaal. Suurim sääst tuleb just marginaalide võrdlemisest eri pankade vahel.',
  sections: [
    {
      h2: 'Kuidas kodulaenu intress Eestis kujuneb',
      body: [
        'Peaaegu kõik muutuva intressiga kodulaenud hinnastatakse põhimõttel baasintress + marginaal. Baasintressiks on Euribor — Eesti pangad kasutavad valdavalt 6 kuu Euribori, mis vaadatakse üle iga kuue kuu tagant. Kui Euribor muutub, muutub järgmisel ülevaatusel ka sinu kuumakse.',
        'Marginaal on seevastu lepingus fikseeritud kogu laenuperioodiks ja just selle osas pangad konkureerivad. Kaks sama Euribori-riskiga laenuvõtjat võivad maksta väga erinevat hinda ainuüksi läbiräägitud marginaali tõttu. Seepärast on marginaali võrdlemine — mitte ainult tänase kogumäära vaatamine — kõige kasulikum samm enne lepingu sõlmimist.',
        'Osa panku pakub esimestel aastatel fikseeritud intressi, misjärel laen läheb üle Euribor + marginaal skeemile. Fikseeritud periood annab kindlustunnet intresside tõusu vastu, ent tavaliselt veidi kõrgema alghinnaga. Kumbki variant pole universaalselt parem — see sõltub sinu riskitaluvusest.',
      ],
    },
    {
      h2: 'Kui palju saab laenata — LTV, omafinantseering ja maksevõime',
      body: [
        'Eesti kodulaenuturgu raamivad Eesti Panga makrofinantsjärelevalve nõuded, mida iga litsentseeritud laenuandja peab järgima. Laen võib üldjuhul katta kuni 85% kinnisvara väärtusest (LTV), mis tähendab vähemalt 15% omafinantseeringut. Eluasemelaenu maksimaalne tähtaeg on 30 aastat.',
        'Lisaks piiratakse igakuiste laenumaksete suhet netosissetulekusse ning pank peab maksevõimet hindama tänasest kõrgema intressimääraga — laenusumma arvestab juba ette, et intressid võivad tõusta. Täpsed protsendid leiad Eesti Panga kehtivatest nõuetest, sest neid vaadatakse perioodiliselt üle.',
        'Riiklik käendus (tuntud KredExi käendusena) võimaldab sobivatel taotlejatel — sageli esimese kodu ostjatel ja noortel peredel — võtta kodulaenu väiksema omafinantseeringuga kui standardne 15%. Käendus ei alanda intressi, vaid vähendab sissemakse barjääri. Tingimused muutuvad ajas, seega kontrolli kehtivaid kriteeriume.',
      ],
    },
    {
      h2: 'Kuidas protsess välja näeb',
      body: [
        'Enamik panku annab esialgse otsuse veebis sissetuleku ja kinnisvara andmete põhjal. Seejärel määrab hindamisakt LTV arvutuse aluse.',
        'Ost ja hüpoteek vormistatakse notariaalse tehinguna — see samm on kohustuslik — ning hüpoteek kantakse kinnistusraamatusse. Kogu protsess võtab tavaliselt ühe kuni mõne nädala ning omafinantseeringule lisanduvad notaritasu ja riigilõiv.',
      ],
    },
    {
      h2: 'Kodulaen välismaalastele ja e-residentidele',
      body: [
        'E-residentsus on digitaalne identiteet EL-i ettevõtte juhtimiseks — see ei ole maksuresidentsus ega anna iseenesest õigust kodulaenule. Pangad eeldavad kodulaenu puhul Eesti maksuresidentsust, tõendatavat kohalikku sissetulekut ja praktikas ka kohalikku pangasuhet.',
        'Eestis elavad ja töötavad EL-i kodanikud saavad üldjuhul taotleda kohalikega sarnastel tingimustel, kui sissetulekuajalugu on tekkinud. Mitteresidendid seisavad silmitsi oluliselt rangemate tingimustega. E-residendile on realistlikum tee [ärirahastus oma Eesti ettevõtte kaudu](/loans/business).',
      ],
    },
    {
      h2: 'Kuidas kodulaene õigesti võrrelda',
      body: [
        'Võrdle kogukulu, mitte reklaamitud intressi. Vaata marginaali (fikseeritud, läbiräägitav osa) ja krediidi kulukuse määra (KKM), mis sisaldab kohustuslikke tasusid ja teeb pakkumised omavahel võrreldavaks.',
        'Arvesta ka ühekordsete kuludega (hindamine, notar, riigilõiv, lepingutasu) ning nõutavate lisadega: paljud pangad eeldavad [kodukindlustust](/insurance/home) ja sageli ka [elukindlustust](/insurance/life) — lisa need preemiad tegelikku kuukulusse.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Millise baasintressiga on Eesti kodulaenud seotud?',
      a: 'Muutuva intressiga kodulaenud on enamasti seotud 6 kuu Euriboriga, millele lisandub panga fikseeritud marginaal. Euribor vaadatakse üle perioodiliselt ja muudab kuumakset; marginaal püsib kogu laenuperioodi sama.',
    },
    {
      q: 'Kui suur omafinantseering on kodulaenuks vaja?',
      a: 'Üldreeglina võib laen katta kuni 85% kinnisvara väärtusest, seega on vaja vähemalt 15% omafinantseeringut. Riikliku (KredExi) käendusega võib sissemakse olla väiksem. Piirmäärad kehtestab Eesti Pank ja need võivad muutuda.',
    },
    {
      q: 'Kas e-resident saab Eestis kodulaenu?',
      a: 'Ainult e-residentsuse alusel mitte. E-residentsus on ettevõtluse digitaalne identiteet, mitte maksuresidentsus. Kodulaenuks eeldavad pangad Eesti maksuresidentsust ja kohalikku sissetulekut. Välismaal elavale e-residendile sobib pigem ärirahastus Eesti ettevõtte kaudu.',
    },
    {
      q: 'Kui pikk võib kodulaen maksimaalselt olla?',
      a: 'Eluasemelaenu maksimaalne tähtaeg on Eesti Panga nõuete kohaselt 30 aastat. Pikem tähtaeg alandab kuumakset, kuid suurendab kogu perioodi jooksul makstavat intressi.',
    },
    {
      q: 'Mida sisaldab krediidi kulukuse määr (KKM)?',
      a: 'KKM väljendab laenu aastast kogukulu — intress pluss kohustuslikud tasud — ühe protsendina. See on kõige ausam viis pakkumiste võrdlemiseks, sest madalat intressi võivad tasakaalustada kõrged tasud.',
    },
    {
      q: 'Kas kodulaenuks on kindlustus kohustuslik?',
      a: 'Kodukindlustus on tavaliselt laenutingimus ja paljud pangad eeldavad ka laenusummale vastavat elukindlustust. Üldjuhul võid valida ükskõik millise panga nõuetele vastava kindlustusandja.',
    },
  ],
  related: [
    { label: 'Kõik laenud Eestis', href: '/loans/estonia' },
    { label: 'Tarbimislaen Eestis', href: '/et/tarbimislaen' },
    { label: 'Kodukindlustus', href: '/insurance/home' },
    { label: 'Elukindlustus', href: '/insurance/life' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// MORTGAGE — Finland market (FI) — /fi/asuntolaina
// ═══════════════════════════════════════════════════════════════════════════

const MORTGAGE_FI: DeepContent = {
  locale: 'fi',
  h1: 'Asuntolaina Suomessa: vertaile Euribor-korkoja ja marginaaleja',
  metaTitle: 'Asuntolaina Suomessa: vertaile korkoja ja marginaaleja',
  metaDescription:
    'Vertaile suomalaisten pankkien asuntolainoja. Miten Euribor + marginaali, lainakatto, ASP-säästäminen ja valtiontakaus toimivat.',
  intro:
    'Asuntolaina on asunnon ostoon otettava vakuudellinen laina, jonka korko muodostuu Suomessa tyypillisesti viitekorosta ja pankin marginaalista. Yleisin viitekorko on 12 kuukauden Euribor, joka tarkistetaan kerran vuodessa. Suurin säästö syntyy kilpailuttamalla marginaali useassa pankissa.',
  sections: [
    {
      h2: 'Miten asuntolainan korko muodostuu Suomessa',
      body: [
        'Suomalainen asuntolaina hinnoitellaan lähes aina viitekorko + marginaali -periaatteella. Yleisin viitekorko on 12 kuukauden Euribor: korko ja kuukausierä päivittyvät kerran vuodessa tarkistuspäivänä. Osa lainoista sidotaan lyhyempiin Euribor-jaksoihin tai pankin omaan prime-korkoon.',
        'Marginaali on pankin kate, joka sovitaan lainasopimuksessa ja pysyy tyypillisesti samana koko laina-ajan, ellei toisin neuvotella. Kaksi samanlaista lainaa voi maksaa selvästi eri verran pelkän marginaalin takia — siksi marginaalin kilpailuttaminen on tärkein yksittäinen säästökeino.',
        'Korkoriskiltä voi suojautua korkokatolla tai kiinteällä korkojaksolla. Molemmat maksavat, mutta tuovat ennustettavuutta. Kumpikaan ei ole automaattisesti oikea valinta — ratkaisevaa on oma riskinsietokyky ja laina-ajan pituus.',
      ],
    },
    {
      h2: 'Paljonko voi lainata — lainakatto ja maksuvara',
      body: [
        'Suomessa asuntolainan enimmäismäärää suhteessa vakuuksiin rajoittaa lakisääteinen lainakatto: laina voi olla enintään tietyn prosenttiosuuden vakuuksien arvosta, ja ensiasunnon ostajalle raja on lievempi. Tarkat prosentit vahvistaa Finanssivalvonta, ja niitä tarkistetaan aika ajoin.',
        'Pankki arvioi maksuvaran stressitestillä selvästi nykyistä korkeammalla korolla — lainapäätös olettaa jo valmiiksi, että korot voivat nousta. Omat tulot, menot ja muut lainat vaikuttavat myönnettävään summaan siinä missä vakuuskin.',
        'Ensiasunnon ostajaa tukevat ASP-järjestelmä (asuntosäästöpalkkio) ja valtiontakaus. ASP-tili yhdistää säästämisen, korkotuen ja edullisemman lainan; valtiontakaus voi korvata osan vakuusvaateesta. Ehdot ja ikärajat kannattaa tarkistaa ajantasaisina ennen suunnitelman lukkoon lyömistä.',
      ],
    },
    {
      h2: 'Asuntolainaprosessi käytännössä',
      body: [
        'Lainalupauksen saa useimmista pankeista verkossa jo ennen asunnon löytymistä — se kertoo hintahaarukan, jolla voi tehdä tarjouksia. Kun kohde on löytynyt, pankki arvioi vakuuden ja tekee lopullisen päätöksen.',
        'Kauppa ja panttaus hoituvat Suomessa pitkälti digitaalisesti. Kuluihin kannattaa varata varainsiirtovero (ensiasunnon ostajan huojennukset kannattaa tarkistaa ajantasaisesti), mahdolliset järjestely- ja arviointipalkkiot sekä lainaturvavakuutusten preemiot, jos sellaisia ottaa.',
      ],
    },
    {
      h2: 'Asuntolaina ulkomaalaiselle Suomessa',
      body: [
        'Suomessa asuvat ja työskentelevät EU-kansalaiset voivat yleensä hakea asuntolainaa paikallisin ehdoin, kun tulohistoriaa on kertynyt suomalaiselle tilille. Pankit painottavat vakituista työsuhdetta, säännöllisiä tuloja ja suomalaista pankkiasiakkuutta.',
        'Ulkomailla asuvalle Suomen kiinteistön rahoittaminen suomalaisesta pankista on selvästi vaikeampaa. Vertailu kannattaa aloittaa [Suomen lainatarjonnasta](/loans/finland) ja tarkistaa kunkin pankin residenssivaatimukset ennen hakemusta.',
      ],
    },
    {
      h2: 'Näin vertailet asuntolainoja oikein',
      body: [
        'Vertaa kokonaiskustannusta, älä pelkkää mainoskorkoa. Ratkaisevat luvut ovat marginaali ja todellinen vuosikorko, joka sisältää koron lisäksi pakolliset kulut ja tekee tarjouksista vertailukelpoisia.',
        'Huomioi myös kertakulut (järjestelypalkkio, arviointi) ja pankin edellyttämät vakuutukset: [kotivakuutus](/insurance/home) on käytännössä aina ehto, ja lainaturva tarjotaan usein kylkeen — laske preemiot mukaan todelliseen kuukausikuluun.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Mihin viitekorkoon suomalainen asuntolaina sidotaan?',
      a: 'Yleisimmin 12 kuukauden Euriboriin, jolloin korko tarkistetaan kerran vuodessa. Myös lyhyemmät Euribor-jaksot ja pankkien omat prime-korot ovat käytössä. Viitekoron päälle tulee pankin marginaali, joka on kilpailutettavissa.',
    },
    {
      q: 'Mikä on lainakatto?',
      a: 'Lainakatto rajoittaa asuntolainan määrää suhteessa vakuuksien arvoon. Ensiasunnon ostajalle raja on lievempi kuin muille. Tarkat prosentit vahvistaa Finanssivalvonta ja ne voivat muuttua — tarkista ajantasainen taso ennen lainaneuvottelua.',
    },
    {
      q: 'Mikä on ASP-laina?',
      a: 'ASP (asuntosäästöpalkkio) on ensiasunnon ostajan säästöjärjestelmä: kun säästät ASP-tilille sovitun osuuden asunnon hinnasta, saat oikeuden ASP-lainaan, johon liittyy korkotukea ja valtiontakaus. Ikärajat ja ehdot kannattaa tarkistaa ajantasaisina.',
    },
    {
      q: 'Kannattaako korkokatto ottaa?',
      a: 'Korkokatto suojaa kuukausierää korkojen nousulta sovitun jakson ajan, mutta maksaa joko kertamaksuna tai marginaalilisänä. Se on vakuutus, ei sijoitus: hyöty riippuu korkokehityksestä, jota kukaan ei voi luvata etukäteen.',
    },
    {
      q: 'Mitä todellinen vuosikorko kertoo?',
      a: 'Todellinen vuosikorko sisältää nimelliskoron lisäksi lainan pakolliset kulut vuositasolle laskettuna. Se on luotettavin yksittäinen vertailuluku pankkien välillä, koska pelkkä matala marginaali voi peittää korkeat palkkiot.',
    },
    {
      q: 'Voiko asuntolainan maksaa pois etuajassa?',
      a: 'Voi. Kuluttajan oikeus ennenaikaiseen takaisinmaksuun on laissa turvattu; pankki voi periä rajattua korvausta lähinnä kiinteäkorkoisissa lainoissa. Tarkista oman sopimuksesi ehdot ennen ylimääräisiä lyhennyksiä.',
    },
  ],
  related: [
    { label: 'Lainat Suomessa', href: '/loans/finland' },
    { label: 'Kulutusluotot Suomessa', href: '/fi/kulutusluotto' },
    { label: 'Kotivakuutus', href: '/insurance/home' },
    { label: 'Vertaile asuntolainoja', href: '/mortgage' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// PERSONAL LOANS — Estonia (EN)
// ═══════════════════════════════════════════════════════════════════════════

const PERSONAL_EN: DeepContent = {
  locale: 'en',
  h1: 'Personal loans in Estonia: compare bank and fintech rates',
  metaTitle: 'Personal Loans in Estonia: Compare Bank & Fintech Rates',
  metaDescription:
    'Compare consumer loans (tarbimislaen) in Estonia from LHV, Swedbank, SEB, Luminor, Bigbank and Inbank. Understand APR (KKM), fees and eligibility.',
  intro:
    'A personal loan in Estonia (tarbimislaen) is an unsecured consumer loan you repay in fixed monthly instalments, with no collateral required. Rates and fees vary widely between banks and fintech lenders, so the most reliable way to compare is the APR (krediidi kulukuse määr), which includes interest plus all mandatory costs.',
  sections: [
    {
      h2: 'How personal loan pricing works in Estonia',
      body: [
        'Unlike a mortgage, a personal loan is unsecured — the lender takes on more risk, so rates are higher and depend heavily on your individual profile: income, existing debts, and credit history. Estonia’s consumer credit market mixes established banks (LHV, Swedbank, SEB, Luminor, Coop Pank) with consumer-credit specialists and fintechs (Bigbank, Inbank).',
        'Advertised "from" rates are best-case offers for the strongest applicants; your actual rate is set after assessment. Because pricing spreads are wide, comparing several offers for the same amount and term routinely reveals meaningful differences.',
      ],
    },
    {
      h2: 'Always compare on APR (krediidi kulukuse määr), not the interest rate',
      body: [
        'The headline interest rate hides fees. The number that lets you compare fairly is the APR — krediidi kulukuse määr (KKM) — which by law must include the interest plus all mandatory charges (such as a contract or setup fee) expressed as one annual percentage. A loan with a lower interest rate but a high setup fee can easily cost more than a higher-rate loan with no fee.',
        'Estonia also caps how expensive consumer credit can legally be: a loan is treated as usurious and unenforceable if its APR sharply exceeds the market average published by the central bank. This caps the most expensive credit, but rates still vary widely below that ceiling — so comparing offers matters.',
      ],
    },
    {
      h2: 'Eligibility — residents, EU citizens, expats and e-residents',
      body: [
        'For a personal loan, Estonian lenders generally require Estonian tax residency and a personal identity code, verifiable local income (a salary history in Estonia is the norm), and a clean credit record — lenders check payment-default data and existing debts count against your capacity.',
        'EU citizens living and working in Estonia can usually apply on terms similar to locals once income history is established. e-Residency does not qualify you for a consumer loan — it’s a business identity, not residency. E-residents wanting to borrow are generally directed to [business financing](/loans/business) rather than a personal tarbimislaen.',
      ],
    },
    {
      h2: 'Your consumer rights when taking a loan',
      body: [
        'Estonian consumer credit is governed by EU consumer-credit law transposed into national law. You have a 14-day right of withdrawal — you can cancel a consumer credit agreement within 14 days of signing, repaying the principal plus accrued interest, without penalty. You also have the right to repay early; the lender may charge limited, capped compensation.',
        'Lenders must give standardised pre-contractual information so you can compare offers before committing, and every consumer lender in Estonia must be authorised by Finantsinspektsioon (the Financial Supervision Authority). Avoid unlicensed lenders.',
      ],
    },
    {
      h2: 'How to compare personal loans without hurting your credit',
      body: [
        'Browsing and comparing offers is free and doesn’t affect your credit score — only a formal application to a lender triggers a hard credit check. Match the same loan amount and term across lenders so the numbers are comparable, read the APR (KKM) rather than just the interest rate, and check for setup fees and early-repayment terms.',
        'Consider whether a fintech lender (fast, fully online) or a bank (potentially lower rate for existing customers) fits your situation. If you’re borrowing for a vehicle, a secured [car loan](/loans/car) is often cheaper; for property, a [mortgage](/loans/mortgage) is the right instrument.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the difference between the interest rate and APR on an Estonian loan?',
      a: 'The interest rate is only the cost of borrowing the money. The APR — krediidi kulukuse määr (KKM) — includes the interest plus all mandatory fees as a single annual percentage, so it is the only fair way to compare loans. A low interest rate with a high setup fee can cost more than a higher-rate, no-fee loan.',
    },
    {
      q: 'Does comparing loans on NordicRate affect my credit score?',
      a: 'No. Browsing and comparing rates uses no credit check and is invisible to lenders. Only a formal application to a bank or lender triggers a hard credit check that can affect your score. You can compare freely before deciding where to apply.',
    },
    {
      q: 'Can I get a personal loan in Estonia as an e-resident?',
      a: 'e-Residency alone does not qualify you for a consumer loan — it is a digital business identity, not tax residency. Personal loans generally require Estonian tax residency and local income. E-residents are usually better served by business financing through their Estonian company.',
    },
    {
      q: 'Can I cancel a loan after signing?',
      a: 'Yes. EU-derived consumer credit rules give you a 14-day right of withdrawal: you can cancel a consumer credit agreement within 14 days of signing by repaying the principal plus interest accrued, without penalty. Check your contract for the exact procedure.',
    },
    {
      q: 'Is there a legal limit on how expensive a personal loan can be?',
      a: 'Yes. Estonian law treats a consumer loan as usurious and unenforceable if its APR sharply exceeds the market average published by the central bank. This caps the most expensive consumer credit, but rates still vary widely below that ceiling, so comparing offers matters.',
    },
    {
      q: 'What do lenders check before approving a personal loan?',
      a: 'Lenders assess your income, existing debts and credit history, including payment-default records. They must lend responsibly and confirm you can afford repayments. Every consumer lender in Estonia must be licensed by Finantsinspektsioon, so avoid any lender that is not authorised.',
    },
  ],
  related: [
    { label: 'All loans in Estonia', href: '/loans/estonia' },
    { label: 'Mortgages in Estonia', href: '/loans/mortgage' },
    { label: 'Car loans', href: '/loans/car' },
    { label: 'Business financing', href: '/loans/business' },
    { label: 'Government programs', href: '/programs' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// PERSONAL LOANS — Estonia (ET) — /et/tarbimislaen
// ═══════════════════════════════════════════════════════════════════════════

const PERSONAL_ET: DeepContent = {
  locale: 'et',
  h1: 'Tarbimislaen Eestis: võrdle pankade ja fintech-laenuandjate intresse',
  metaTitle: 'Tarbimislaen Eestis: võrdle intresse ja KKM-i',
  metaDescription:
    'Võrdle tarbimislaene Eestis — LHV, Swedbank, SEB, Luminor, Bigbank, Inbank. Mida tähendab krediidi kulukuse määr (KKM) ja kuidas tingimusi hinnata.',
  intro:
    'Tarbimislaen on tagatiseta laen, mida tagastad võrdsete kuumaksetena. Intressid ja tasud erinevad pankade ja fintech-laenuandjate vahel oluliselt, seega on kõige usaldusväärsem võrdlusalus krediidi kulukuse määr (KKM), mis sisaldab nii intressi kui ka kõiki kohustuslikke kulusid.',
  sections: [
    {
      h2: 'Kuidas tarbimislaenu hind kujuneb',
      body: [
        'Erinevalt kodulaenust on tarbimislaen tagatiseta — laenuandja risk on suurem, mistõttu on intressid kõrgemad ja sõltuvad tugevalt sinu profiilist: sissetulekust, olemasolevatest kohustustest ja krediidiajaloost. Eesti turul tegutsevad kõrvuti pangad (LHV, Swedbank, SEB, Luminor, Coop Pank) ja tarbimiskrediidile keskendunud fintechid (Bigbank, Inbank).',
        'Reklaamitud "alates" intress on parim võimalik pakkumine tugevaimale taotlejale; sinu tegelik intress selgub pärast hindamist. Kuna hinnavahemikud on laiad, toob sama summa ja tähtajaga pakkumiste võrdlemine regulaarselt välja märkimisväärseid erinevusi.',
      ],
    },
    {
      h2: 'Võrdle alati KKM-i, mitte intressimäära',
      body: [
        'Reklaamintress varjab tasusid. Aus võrdlusarv on krediidi kulukuse määr (KKM), mis peab seaduse järgi sisaldama intressi pluss kõiki kohustuslikke tasusid (nt lepingutasu) ühe aastaprotsendina. Madalama intressi, aga kõrge lepingutasuga laen võib kokkuvõttes maksta rohkem kui kõrgema intressi ja tasuta laen.',
        'Eesti seadus piirab ka tarbimiskrediidi maksimaalset hinda: leping loetakse liigkasuvõtlikuks ja täitmisele mittekuuluvaks, kui KKM ületab järsult keskpanga avaldatud turukeskmist. See lõikab ära kõige kallima krediidi, kuid lae all varieeruvad hinnad endiselt palju.',
      ],
    },
    {
      h2: 'Kes saab tarbimislaenu — residendid, EL-i kodanikud, e-residendid',
      body: [
        'Tarbimislaenuks eeldavad Eesti laenuandjad üldjuhul Eesti maksuresidentsust ja isikukoodi, tõendatavat kohalikku sissetulekut ning puhast krediidiajalugu — kontrollitakse maksehäireregistrit ja olemasolevad kohustused vähendavad laenuvõimet.',
        'Eestis elavad ja töötavad EL-i kodanikud saavad üldjuhul taotleda kohalikega sarnastel tingimustel. E-residentsus ei anna õigust tarbimislaenule — see on ettevõtluse identiteet, mitte residentsus. E-residentidele sobib pigem [ärirahastus](/loans/business).',
      ],
    },
    {
      h2: 'Sinu õigused laenuvõtjana',
      body: [
        'Eesti tarbijakrediiti reguleerib EL-i õigusest üle võetud seadusandlus. Sul on 14-päevane taganemisõigus — võid lepingust taganeda 14 päeva jooksul, tagastades põhiosa koos kogunenud intressiga, ilma leppetrahvita. Samuti on sul õigus laen ennetähtaegselt tagastada; laenuandja võib küsida piiratud, seadusega piiristatud hüvitist.',
        'Laenuandja peab enne lepingut andma standardse teabelehe pakkumiste võrdlemiseks ning iga tarbijakrediidi andja peab omama Finantsinspektsiooni tegevusluba. Väldi litsentsita laenuandjaid.',
      ],
    },
    {
      h2: 'Kuidas võrrelda ilma krediidiskoori kahjustamata',
      body: [
        'Pakkumiste sirvimine ja võrdlemine on tasuta ega mõjuta sinu krediidiskoori — alles ametlik taotlus laenuandjale toob kaasa päringu. Võrdle sama summat ja tähtaega, vaata KKM-i, kontrolli lepingutasu ja ennetähtaegse tagastamise tingimusi.',
        'Kaalu, kas sulle sobib fintech (kiire, täielikult veebis) või pank (püsikliendile potentsiaalselt madalam intress). Sõiduki ostuks on tagatisega [autolaen](/loans/car) sageli odavam; kinnisvaraks on õige instrument [kodulaen](/et/kodulaen).',
      ],
    },
  ],
  faqs: [
    {
      q: 'Mis vahe on intressimääral ja krediidi kulukuse määral?',
      a: 'Intress on ainult raha laenamise hind. KKM sisaldab intressi pluss kõiki kohustuslikke tasusid ühe aastaprotsendina — see on ainus aus võrdlusalus. Madal intress kõrge lepingutasuga võib maksta rohkem kui kõrgem intress ilma tasudeta.',
    },
    {
      q: 'Kas võrdlemine NordicRate’is mõjutab mu krediidiskoori?',
      a: 'Ei. Sirvimine ja võrdlemine ei too kaasa ühtegi päringut ega ole laenuandjatele nähtav. Alles ametlik taotlus pangale käivitab krediidikontrolli, mis võib skoori mõjutada.',
    },
    {
      q: 'Kas e-resident saab Eestis tarbimislaenu?',
      a: 'Ainult e-residentsuse alusel mitte — see on digitaalne ärikeskkonna identiteet, mitte maksuresidentsus. Tarbimislaen eeldab üldjuhul Eesti residentsust ja kohalikku sissetulekut. E-residendile sobib pigem ärirahastus Eesti ettevõtte kaudu.',
    },
    {
      q: 'Kas laenulepingust saab pärast allkirjastamist taganeda?',
      a: 'Jah. Sul on 14-päevane taganemisõigus: võid lepingust taganeda 14 päeva jooksul, tagastades põhiosa koos kogunenud intressiga, ilma trahvita. Täpne protseduur on kirjas lepingus.',
    },
    {
      q: 'Kas tarbimislaenu hinnal on seaduslik piir?',
      a: 'Jah. Leping loetakse liigkasuvõtlikuks ja täitmisele mittekuuluvaks, kui KKM ületab järsult Eesti Panga avaldatud turukeskmist. See piirab kõige kallimat krediiti, kuid lae all tasub pakkumisi ikkagi võrrelda.',
    },
    {
      q: 'Mida laenuandja enne otsust kontrollib?',
      a: 'Sissetulekut, olemasolevaid kohustusi ja krediidiajalugu, sh maksehäireregistrit. Laenuandja peab veenduma, et maksed on sulle jõukohased. Igal tarbijakrediidi andjal peab olema Finantsinspektsiooni luba.',
    },
  ],
  related: [
    { label: 'Kõik laenud Eestis', href: '/loans/estonia' },
    { label: 'Kodulaen Eestis', href: '/et/kodulaen' },
    { label: 'Autolaenud', href: '/loans/car' },
    { label: 'Ärirahastus', href: '/loans/business' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// CONSUMER LOANS — Finland market (FI) — /fi/kulutusluotto
// ═══════════════════════════════════════════════════════════════════════════

const PERSONAL_FI: DeepContent = {
  locale: 'fi',
  h1: 'Kulutusluotto Suomessa: vertaile pankkien ja fintech-yhtiöiden korkoja',
  metaTitle: 'Kulutusluotto Suomessa: vertaile korkoja ja kuluja',
  metaDescription:
    'Vertaile kulutusluottoja Suomessa. Mitä todellinen vuosikorko kertoo, miten korkokatto suojaa ja mitä lainanantaja tarkistaa ennen päätöstä.',
  intro:
    'Kulutusluotto on vakuudeton laina, joka maksetaan takaisin kiinteinä kuukausierinä. Korot ja kulut vaihtelevat lainanantajien välillä huomattavasti, joten luotettavin vertailuluku on todellinen vuosikorko, joka sisältää koron lisäksi kaikki pakolliset kulut.',
  sections: [
    {
      h2: 'Miten kulutusluoton hinta muodostuu',
      body: [
        'Vakuudettomassa lainassa lainanantajan riski on suurempi kuin asuntolainassa, joten korko on korkeampi ja riippuu vahvasti hakijan profiilista: tuloista, olemassa olevista veloista ja luottohistoriasta. Suomen markkinoilla toimivat rinnakkain perinteiset pankit ja digitaaliset kuluttajaluottoyhtiöt.',
        '"Alkaen"-korot ovat parhaan hakijaprofiilin tarjouksia; oma korkosi selviää vasta luottopäätöksessä. Koska hinnoitteluhaarukka on leveä, saman summan ja laina-ajan kilpailuttaminen usealla lainanantajalla paljastaa säännöllisesti merkittäviä eroja.',
      ],
    },
    {
      h2: 'Vertaa aina todellista vuosikorkoa, älä nimelliskorkoa',
      body: [
        'Mainoskorko kätkee kulut. Reilu vertailuluku on todellinen vuosikorko, jonka on lain mukaan sisällettävä korko sekä kaikki pakolliset maksut (esim. avaus- ja tilinhoitomaksut) yhtenä vuosiprosenttina. Matalakorkoinen laina korkeilla kuluilla voi tulla kalliimmaksi kuin korkeampikorkoinen ilman kuluja.',
        'Suomessa kuluttajaluottojen hinnoittelua rajoittaa lakisääteinen korkokatto ja kulukatto — ne leikkaavat kalleimman luoton pois markkinoilta. Katon alapuolella hinnat vaihtelevat silti paljon, joten kilpailuttaminen kannattaa aina. Ajantasaiset rajat vahvistaa lainsäädäntö ja niitä valvoo Finanssivalvonta yhdessä kuluttaja-asiamiehen kanssa.',
      ],
    },
    {
      h2: 'Kuka voi saada kulutusluoton Suomessa',
      body: [
        'Lainanantajat edellyttävät yleensä Suomessa asumista ja suomalaista henkilötunnusta, säännöllisiä ja todennettavia tuloja sekä puhtaita luottotietoja. Positiivinen luottotietorekisteri antaa lainanantajille kokonaiskuvan hakijan kaikista luotoista, joten olemassa olevat velat vaikuttavat suoraan myönnettävään summaan.',
        'Suomessa asuvat ja työskentelevät EU-kansalaiset voivat yleensä hakea paikallisin ehdoin, kun tulohistoriaa on kertynyt. Ulkomailta käsin suomalaisen kulutusluoton saaminen on käytännössä hyvin vaikeaa.',
      ],
    },
    {
      h2: 'Oikeutesi luotonottajana',
      body: [
        'Kuluttajaluottoja säätelee EU-pohjainen kuluttajansuojalainsäädäntö. Sinulla on 14 päivän peruuttamisoikeus: voit perua luottosopimuksen 14 päivän kuluessa maksamalla pääoman ja kertyneen koron takaisin ilman sanktiota. Sinulla on myös oikeus maksaa laina pois etuajassa.',
        'Lainanantajan on annettava vakiomuotoiset ennakkotiedot ennen sopimusta, ja jokaisella kuluttajaluottoja myöntävällä yhtiöllä on oltava rekisteröinti tai toimilupa. Vältä valvonnan ulkopuolella toimivia lainantarjoajia.',
      ],
    },
    {
      h2: 'Näin vertailet luottoja luottotietoja vaarantamatta',
      body: [
        'Tarjousten selaaminen ja vertailu on ilmaista eikä näy luottotiedoissasi — vasta virallinen lainahakemus käynnistää luottotietokyselyn. Vertaa samaa summaa ja laina-aikaa, katso todellista vuosikorkoa ja tarkista avausmaksut sekä ennenaikaisen takaisinmaksun ehdot.',
        'Jos rahoitat autoa, vakuudellinen [autolaina](/loans/car) on usein edullisempi; asunnon ostoon oikea väline on [asuntolaina](/fi/asuntolaina). Kaikki Suomen lainatarjoukset löydät [Suomi-vertailustamme](/loans/finland).',
      ],
    },
  ],
  faqs: [
    {
      q: 'Mitä eroa on nimelliskorolla ja todellisella vuosikorolla?',
      a: 'Nimelliskorko on vain rahan hinta. Todellinen vuosikorko sisältää koron lisäksi kaikki pakolliset kulut yhtenä vuosiprosenttina — se on ainoa reilu vertailuluku. Matala korko korkeilla kuluilla voi maksaa enemmän kuin korkeampi korko ilman kuluja.',
    },
    {
      q: 'Vaikuttaako vertailu NordicRatessa luottotietoihini?',
      a: 'Ei. Selaaminen ja vertailu ei aiheuta luottotietokyselyä eikä näy lainanantajille. Vasta virallinen hakemus pankille tai luottoyhtiölle käynnistää kyselyn, joka voi vaikuttaa luottotietoihin.',
    },
    {
      q: 'Onko kulutusluottojen hinnalla laillinen yläraja Suomessa?',
      a: 'On. Lakisääteinen korkokatto ja kulukatto rajoittavat kuluttajaluottojen hinnoittelua. Rajat voivat muuttua lainsäädännön myötä, joten tarkista ajantasainen taso — mutta katon alapuolellakin hinnat vaihtelevat niin paljon, että kilpailuttaminen kannattaa aina.',
    },
    {
      q: 'Voinko perua luoton allekirjoituksen jälkeen?',
      a: 'Voit. Sinulla on 14 päivän peruuttamisoikeus: maksat pääoman ja kertyneen koron takaisin, eikä perumisesta seuraa sanktiota. Tarkista sopimuksestasi tarkka menettely.',
    },
    {
      q: 'Mitä lainanantaja tarkistaa ennen luottopäätöstä?',
      a: 'Tulot, olemassa olevat velat ja luottohistorian. Positiivinen luottotietorekisteri näyttää lainanantajalle kaikki luottosi, ja maksuhäiriömerkintä estää yleensä lainan saamisen. Lainanantajan on arvioitava maksukykysi vastuullisesti.',
    },
    {
      q: 'Kumpi kannattaa valita: pankki vai digitaalinen luottoyhtiö?',
      a: 'Kumpikaan ei ole automaattisesti parempi. Pankki voi tarjota omalle asiakkaalleen matalamman koron; digitaalinen yhtiö on usein nopeampi ja täysin verkossa. Ratkaiseva luku on todellinen vuosikorko samalla summalla ja laina-ajalla.',
    },
  ],
  related: [
    { label: 'Lainat Suomessa', href: '/loans/finland' },
    { label: 'Asuntolaina Suomessa', href: '/fi/asuntolaina' },
    { label: 'Autolainat', href: '/loans/car' },
    { label: 'Vertaile kaikkia lainoja', href: '/loans' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════

export const DEEP_CONTENT = {
  mortgage: { en: MORTGAGE_EN, et: MORTGAGE_ET, fi: MORTGAGE_FI },
  personal: { en: PERSONAL_EN, et: PERSONAL_ET, fi: PERSONAL_FI },
} as const;

/** hreflang eşleme — her içerik setinin dil-URL haritası */
export const DEEP_CONTENT_ROUTES = {
  mortgage: {
    en: 'https://nordicrate.com/loans/mortgage',
    et: 'https://nordicrate.com/et/kodulaen',
    fi: 'https://nordicrate.com/fi/asuntolaina',
  },
  personal: {
    en: 'https://nordicrate.com/loans/personal',
    et: 'https://nordicrate.com/et/tarbimislaen',
    fi: 'https://nordicrate.com/fi/kulutusluotto',
  },
} as const;

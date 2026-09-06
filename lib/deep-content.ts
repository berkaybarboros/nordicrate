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
  metaTitle: 'Mortgages Estonia: Compare Euribor Rates',
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
    { label: 'Loan calculator', href: '/loan-calculator' },
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
    { label: 'Laenukalkulaator', href: '/et/laenukalkulaator' },
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
      h2: 'Asuntolainan kilpailutus — näin se toimii',
      body: [
        'Kilpailutus tarkoittaa, että pyydät tarjouksen samalla summalla, laina-ajalla ja omarahoitusosuudella useasta pankista — ja annat pankkien kilpailla marginaalista. Tarjouspyyntö ei sido sinua mihinkään, ja pankit tietävät kilpailevansa: jo kahden tai kolmen tarjouksen vertailu muuttaa neuvotteluasemasi.',
        'Käytännössä: laske ensin realistinen kuukausierä [lainalaskurilla](/fi/lainalaskuri), pyydä lainalupaukset samoilla syötteillä ja vertaa tarjouksia marginaalin ja todellisen vuosikoron perusteella — älä pelkän mainoskoron. Parhaan tarjouksen voi usein viedä takaisin omaan pankkiin vastatarjousta varten.',
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
    { label: 'Lainalaskuri', href: '/fi/lainalaskuri' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// PERSONAL LOANS — Estonia (EN)
// ═══════════════════════════════════════════════════════════════════════════

const PERSONAL_EN: DeepContent = {
  locale: 'en',
  h1: 'Personal loans in Estonia: compare bank and fintech rates',
  metaTitle: 'Personal Loans Estonia: Compare Live Bank Rates',
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
    { label: 'Loan calculator', href: '/loan-calculator' },
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
    { label: 'Laenukalkulaator', href: '/et/laenukalkulaator' },
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
    { label: 'Lainalaskuri', href: '/fi/lainalaskuri' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// DEPOSITS — Estonia (EN)
// 2026-09-06: /deposits sayfasinin derin icerigi yoktu — sayfa yalnizca filtre +
// kart listesiydi. 89 sayfa indeksli ama trafik yok; sorun indeksleme degil
// siralama, yani ince icerik. Blog tarafinda 'deposit-guarantee-estonia-explained'
// konusu kuyrukta — ikisi birbirine baglanacak (topical authority).
// ═══════════════════════════════════════════════════════════════════════════

const DEPOSITS_EN: DeepContent = {
  locale: 'en',
  h1: 'Term deposits in Estonia: how rates, tax and the guarantee work',
  metaTitle: 'Term Deposits Estonia: Rates, Tax & Guarantee',
  metaDescription:
    'How Estonian term deposits work: the EU 100,000 EUR guarantee, the 20% tax on interest, non-resident access, and what to check before locking money in.',
  intro:
    'A term deposit in Estonia (tähtajaline hoius) locks a fixed sum with a bank for an agreed period at an agreed rate. Deposits are protected up to 100,000 EUR per depositor per bank under the EU guarantee scheme, and interest paid to Estonian tax residents is subject to income tax. The rate is only part of the comparison.',
  sections: [
    {
      h2: 'What protects your money: the 100,000 EUR guarantee',
      body: [
        'Every credit institution licensed in Estonia belongs to the EU deposit guarantee scheme. If the bank fails, deposits are compensated up to 100,000 EUR — and the limit applies per depositor per bank, not per account. Holding three accounts at the same bank does not triple the cover; splitting the same money across two separate banks does double it.',
        'The distinction that catches people out is branch versus subsidiary. A foreign bank operating in Estonia as a subsidiary is a separate Estonian legal entity and sits under the Estonian scheme. A branch of a foreign bank is covered by its home country scheme instead. Both are EU-level protections at the same 100,000 EUR ceiling, but the paying institution differs — worth knowing before you assume which national scheme stands behind your money.',
        'Nationality and residency do not change the cover. A non-resident, an e-resident and an Estonian citizen holding the same deposit at the same bank have the same protection. What can differ is whether the bank will open the account in the first place.',
      ],
    },
    {
      h2: 'Tax: why the advertised rate is not what you keep',
      body: [
        'Interest income is taxable in Estonia, and banks withhold income tax on interest paid to Estonian tax residents at source. A deposit advertised at a given gross rate therefore returns less in hand, and comparisons between banks are only fair when you compare on the same basis — gross against gross.',
        'If you are tax resident in another country, your position depends on the double taxation treaty between that country and Estonia, and you may need to declare the income at home. This is where a comparison site stops and a tax adviser starts: the treaty treatment of interest varies, and getting it wrong is expensive. What we can say plainly is that the headline rate on any comparison table, including ours, is a gross figure.',
      ],
    },
    {
      h2: 'Can non-residents and e-residents open a deposit?',
      body: [
        'This is the most common question we get and the honest answer is: it depends on the bank, not on the product. A term deposit is a low-risk product for the bank, but opening any account triggers full know-your-customer and anti-money-laundering checks. Those checks are where non-residents are refused, not at the deposit itself.',
        'Banks generally want to see a connection to Estonia — residence, employment, a registered company with real activity, or property. e-Residency on its own establishes a digital identity for dealing with the state; it is not evidence of economic substance, and several banks say so openly. Founders who incorporate an Estonian company and then discover they cannot open a bank account are running into this exact gap.',
        'Practical route for most newcomers: get the personal ID code and address registration first, then apply. If you are running a company, be ready to document what it actually does and where its revenue comes from. If you already bank with a group present in several Nordic or Baltic markets, ask them first — an existing relationship is the single strongest lever.',
      ],
    },
    {
      h2: 'Choosing a term: what changes when you lock money away',
      body: [
        'Longer terms usually pay more, but the trade is liquidity. Estonian term deposits are, by design, not accessible on demand. Breaking a deposit early is typically possible only on the terms written into your contract, and the usual consequence is losing some or all of the accrued interest — occasionally with a separate fee. Read that clause before you sign, not when you need the money.',
        'One structure worth understanding is laddering: instead of placing one sum for one long term, split it into several deposits maturing at different dates. Part of the money becomes available at regular intervals while the rest keeps earning the longer-term rate. It is not a trick to get a better rate, it is a way to stop a rate decision from also being a liquidity decision.',
        'Also check how the deposit behaves at maturity. Some contracts roll over automatically into a new term at the rate prevailing that day unless you instruct otherwise. Automatic renewal is convenient, but it can quietly move your money into a term you did not choose at a rate you did not compare.',
      ],
    },
    {
      h2: 'What to compare beyond the rate',
      body: [
        'Minimum deposit differs sharply between banks and decides whether an offer is even available to you. So does whether the bank requires an existing current account, whether the application is fully online, and whether the bank serves customers who are not Estonian residents.',
        'Interest payment timing matters more than it looks. Interest paid monthly and interest paid at maturity are not equivalent even at the same nominal rate, because money in your hands earlier can be used earlier. Where banks state an effective annual rate, that figure already accounts for compounding and is the fairer basis for comparison.',
        'Our [deposit comparison](/deposits) reads rates directly from bank sources and updates them daily, so the table reflects what banks are publishing rather than a figure written into an article months ago. If you are weighing a deposit against paying down debt instead, the arithmetic on the other side is in our [loan comparison](/loans).',
      ],
    },
  ],
  faqs: [
    {
      q: 'How much of my deposit is guaranteed in Estonia?',
      a: 'Up to 100,000 EUR per depositor per bank under the EU deposit guarantee scheme. The ceiling applies to your total holdings at that bank, not to each account separately. Spreading the same amount across two independent banks gives you two separate 100,000 EUR ceilings.',
    },
    {
      q: 'Does the guarantee apply to non-residents and e-residents?',
      a: 'Yes. Deposit protection follows the bank, not your nationality or residency, so a non-resident has the same 100,000 EUR cover as an Estonian citizen at the same institution. The harder step for non-residents is passing the bank onboarding checks, not the protection itself.',
    },
    {
      q: 'Is interest on Estonian deposits taxed?',
      a: 'Interest is taxable income in Estonia and banks withhold income tax at source for Estonian tax residents, so the amount you keep is below the advertised gross rate. If you are tax resident elsewhere, the applicable double taxation treaty decides the treatment and you may need to declare it at home.',
    },
    {
      q: 'Can I withdraw a term deposit early?',
      a: 'Only on the terms in your contract. Early withdrawal is normally possible but usually costs you some or all of the accrued interest, and sometimes a fee. Check that clause before signing — it is the main practical difference between a term deposit and a savings account.',
    },
    {
      q: 'Does a longer term always pay more?',
      a: 'Usually but not always, because rate curves shift. The reliable trade-off is liquidity rather than yield: a longer term means your money is committed for longer. Laddering several shorter deposits with staggered maturity dates keeps part of the money reachable while the rest earns the longer rate.',
    },
  ],
  related: [
    { label: 'Compare deposit rates', href: '/deposits' },
    { label: 'Personal loans in Estonia', href: '/loans/personal' },
    { label: 'Compare all loans', href: '/loans' },
    { label: 'How we make money', href: '/how-we-make-money' },
    { label: 'Our methodology', href: '/methodology' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// CAR LOANS — Estonia (EN)
// Blog tarafinda 'car-loan-vs-leasing-estonia' yayinlandi; bu sayfa onun
// kategori ebeveyni. Ayrica /insurance/casco ile capraz baglanir — krediyi
// zorunlu Casco'ya baglayan sey kredi sozlesmesinin kendisi.
// ═══════════════════════════════════════════════════════════════════════════

const CAR_EN: DeepContent = {
  locale: 'en',
  h1: 'Car finance in Estonia: loan, leasing and hire purchase compared',
  metaTitle: 'Car Loans Estonia: Loan vs Leasing Compared',
  metaDescription:
    'Car loan, leasing or hire purchase in Estonia: who owns the car, what the lender requires, why Casco becomes compulsory, and how to compare the real cost.',
  intro:
    'Estonian lenders offer three ways to finance a car: a car loan secured against the vehicle, leasing (kapitalirent or kasutusrent), and hire purchase. The practical difference is ownership and what happens at the end of the term. All three normally require comprehensive Casco insurance for as long as the finance runs.',
  sections: [
    {
      h2: 'Loan, leasing or hire purchase — what actually differs',
      body: [
        'With a car loan you are the owner from day one and the vehicle serves as security for the debt. With finance leasing (kapitalirent) the leasing company owns the car during the term and ownership transfers to you with the final payment. With operating leasing (kasutusrent) you never own it: you pay for use over an agreed period and mileage, then return the car or buy it at a pre-agreed residual value.',
        'That ownership question decides almost everything else. Who registers as owner, who carries the depreciation risk, whether you can sell the car mid-term, and what happens if you want out early all follow from it. Operating leasing tends to show the lowest monthly figure precisely because you are not buying the asset — you are renting the part of it you consume.',
        'For a business, the choice also has tax consequences in Estonia, including how VAT is treated and whether the car is used privately as well. That is genuinely accountant territory rather than comparison-site territory, and the right answer differs between a sole proprietor and a company with several vehicles. What we can flag is that the cheapest headline monthly payment is rarely the cheapest total.',
      ],
    },
    {
      h2: 'What lenders check before approving car finance',
      body: [
        'The vehicle matters as much as the borrower. Lenders set limits on how old a car may be at the start and, more importantly, at the end of the finance term — a term that would leave you owning a fifteen-year-old car is often refused regardless of your income. Mileage, make and whether the car comes from a dealer or a private seller all affect both approval and rate.',
        'On the borrower side the checks mirror any consumer credit: verifiable income, existing debt obligations, and your record in the credit register. Estonia applies affordability rules that cap total monthly repayments against net income, and lenders stress-test against a higher rate than today. A payment default in the register is usually decisive rather than merely negative.',
        'Foreign applicants run into the same pattern as elsewhere in Estonian lending: the product is not the obstacle, the file is. A personal ID code, an Estonian bank account into which salary arrives, and a residence permit valid well beyond the finance term make the difference. If the permit expires before the loan does, expect the term to be cut to fit — the same constraint we cover in [personal loans](/loans/personal).',
      ],
    },
    {
      h2: 'Why Casco insurance is part of the deal',
      body: [
        'A financed car is the lender security, so virtually every car loan and lease contract requires comprehensive Casco cover for the full term. This is a contractual obligation, not a legal one — mandatory liability insurance (liikluskindlustus) is what the law requires, and it never repairs your own vehicle.',
        'Read what the contract actually demands. Some agreements specify a maximum excess, forbid certain policy exclusions, or require the lender to be named as beneficiary in a total-loss claim. Buying the cheapest Casco you can find and then discovering it does not satisfy the finance contract is a common and avoidable problem.',
        'Budget for it as part of the monthly cost rather than as an extra. An offer that looks cheaper on interest can lose that advantage once a higher required insurance level is priced in. We compare motor policies separately at [Casco insurance](/insurance/casco).',
      ],
    },
    {
      h2: 'Comparing the real cost',
      body: [
        'Compare on APRC rather than the nominal interest rate. APRC folds in the contract fee, any arrangement charge and the payment schedule, which is why two offers with the same advertised rate can differ in what they actually cost. Advertised rates presented as from a certain percentage are best-case outcomes offered to the strongest applicants.',
        'Then look at the down payment and, for leasing, the residual value. A large residual keeps the monthly payment low and concentrates the cost at the end, where you either pay it, refinance it, or hand the car back. Neither structure is a trick — but comparing a loan against a lease purely on monthly payment compares two different things.',
        'Finally check the exit terms before you need them: early settlement rights, whether you can sell the car and clear the debt mid-term, and what an early lease termination costs. Our [car loan comparison](/loans/car) shows what Estonian lenders publish today, and the [loan calculator](/loan-calculator) lets you test how term length changes both the monthly figure and the total.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Is a car loan or leasing cheaper in Estonia?',
      a: 'Leasing usually shows a lower monthly payment, but that is because you are financing less of the car — with operating leasing you never own it. Compare total cost over the full term including any residual value, not the monthly figure. For a business the tax treatment can change the answer entirely.',
    },
    {
      q: 'Do I need Casco insurance for a financed car?',
      a: 'In practice yes. Mandatory liability insurance is the legal minimum, but lenders and leasing companies require comprehensive Casco for as long as the finance runs, because the vehicle is their security. Check the contract for required cover levels and maximum excess before buying a policy.',
    },
    {
      q: 'Can I get car finance in Estonia as a foreigner?',
      a: 'Yes, if your file supports it: an Estonian personal ID code, verifiable local income, a bank account here, and a residence permit valid beyond the finance term. If the permit expires first, lenders typically shorten the term to fit rather than refuse outright.',
    },
    {
      q: 'Does the age of the car affect approval?',
      a: 'Significantly. Lenders limit how old the vehicle may be both at the start and at the end of the term, so an older car often forces a shorter term or a refusal regardless of your income. Mileage and whether you buy from a dealer or privately also affect the offer.',
    },
    {
      q: 'Can I repay car finance early?',
      a: 'Consumer credit in Estonia carries a right to early repayment, though the lender may charge compensation within limits set by law. Leasing is contractual and early termination terms vary more widely — check that clause before signing, since it decides how easily you can change car mid-term.',
    },
  ],
  related: [
    { label: 'Compare car loans', href: '/loans/car' },
    { label: 'Casco insurance', href: '/insurance/casco' },
    { label: 'Personal loans', href: '/loans/personal' },
    { label: 'Loan calculator', href: '/loan-calculator' },
    { label: 'Our methodology', href: '/methodology' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// BUSINESS LOANS — Estonia (EN)
// e-resident acisi burada en degerli: sirket kurmak kolay, KREDI almak degil.
// Blog kuyrugunda 'business-loan-e-resident-company' var — capraz baglanir.
// ═══════════════════════════════════════════════════════════════════════════

const BUSINESS_EN: DeepContent = {
  locale: 'en',
  h1: 'Business loans in Estonia: what lenders fund and what they require',
  metaTitle: 'Business Loans Estonia: Requirements & Options',
  metaDescription:
    'Business finance in Estonia: working capital, investment loans, leasing and factoring, what banks require from an OU, and where e-resident companies hit limits.',
  intro:
    'Estonian companies finance themselves through bank loans, leasing, factoring and state-backed instruments. Banks lend against demonstrable cash flow and a real connection to Estonia, which is why incorporating an OU is straightforward while getting credit for it is not. What you can borrow depends less on the legal form than on substance.',
  sections: [
    {
      h2: 'The main forms of business finance',
      body: [
        'A working capital loan or overdraft bridges the gap between paying suppliers and being paid by customers. It is sized against turnover and is the most common first facility for a trading company. An investment loan funds a specific asset over a longer term and is usually secured against that asset or against property.',
        'Leasing finances equipment and vehicles without tying up cash, with the lessor owning the asset during the term. Factoring is different in kind: you sell your outstanding invoices to release the cash early. For a company whose problem is late-paying customers rather than profitability, factoring often fits better than a loan, because it scales with your invoicing rather than adding fixed debt.',
        'Alongside commercial lending, Estonia runs state-backed support through KredEx, now part of EIS (Ettevõtluse ja Innovatsiooni SA). These instruments typically work as a guarantee that reduces the collateral a bank needs rather than as cheap money handed out directly. They widen who qualifies rather than replacing the bank.',
      ],
    },
    {
      h2: 'What banks actually require from an OU',
      body: [
        'The first thing a bank looks for is trading history. A company with several years of filed annual reports and steady bank turnover is assessed on those numbers. A newly registered company has none of that, so the assessment shifts onto the owners — personal guarantees, personal assets, and their track record become the deciding factors.',
        'Second is substance in Estonia: where management actually sits, whether there are employees here, whether revenue passes through an Estonian account, and whether the business has real operations rather than a registered address. Banks are explicit that a registered address and a director abroad is a thin file, largely because anti-money-laundering obligations put the burden of proof on them.',
        'Third is collateral. Unsecured business lending exists but is limited and priced accordingly; most meaningful facilities are secured against property, equipment, receivables or a personal guarantee. This is where an EIS guarantee can change the outcome — not by lowering the rate but by covering part of the collateral gap that would otherwise end the conversation.',
      ],
    },
    {
      h2: 'Where e-resident companies hit the wall',
      body: [
        'e-Residency gives you a digital identity to run an Estonian company remotely. It does not give you residency, and it does not give you banking. Founders regularly discover this order of operations only after incorporating, which is why the gap deserves stating plainly: company formation is easy, credit is not.',
        'For an e-resident OU with no local director, no employees here and revenue billed abroad, traditional bank credit is realistically out of reach. That is not a policy against e-residents; it is the same substance test applied consistently. Many such companies operate through fintech payment accounts rather than a traditional bank, and those providers generally offer payments rather than lending.',
        'The routes that do work tend to be revenue-based: factoring against invoices to creditworthy customers, equipment leasing where the asset itself is the security, or fintech credit priced on transaction history. If bank credit matters to your plan, the practical path is building substance first — a local director or employee, an Estonian account with genuine flow, filed reports — and then applying. Our [business loan comparison](/loans/business) shows what is currently on offer.',
      ],
    },
    {
      h2: 'Preparing an application that survives review',
      body: [
        'Have the numbers ready before you approach anyone: recent annual reports, current year figures, bank statements showing turnover, your order book or contracts, and a clear statement of what the money is for and how it will be repaid. Vague purposes get vague answers.',
        'Be precise about the amount and the term. Asking for more than the cash flow supports invites refusal; asking for a term that outlives the asset you are buying invites the same. Lenders are matching repayment capacity to a schedule, and an application that has already done that arithmetic is easier to say yes to.',
        'Approach more than one lender. Banks differ in sector appetite, and a refusal from one is not a verdict from the market — smaller banks and specialist financiers often take on files that larger ones decline. Also ask each lender to put the full cost in writing, including arrangement fees and any collateral registration costs, so you are comparing complete numbers rather than headline rates.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Can an e-resident company get a bank loan in Estonia?',
      a: 'Rarely without local substance. Banks assess where management sits, whether there are employees in Estonia, and whether revenue flows through an Estonian account. e-Residency provides a digital identity, not residency or banking access. Revenue-based options such as factoring or equipment leasing are more realistic starting points.',
    },
    {
      q: 'What does a bank require from a newly registered OU?',
      a: 'With no trading history, the assessment moves to the owners: personal guarantees, personal assets and their track record. Expect to provide a business plan, evidence of contracts or orders, and to secure the facility. Several years of filed reports and steady turnover change this picture substantially.',
    },
    {
      q: 'Does KredEx still exist?',
      a: 'KredEx merged into Enterprise Estonia and the current entity is EIS (Ettevotluse ja Innovatsiooni SA). Its instruments generally work as guarantees that reduce the collateral a bank requires, widening who qualifies, rather than as direct cheap lending. Check current eligibility with EIS before assuming you qualify.',
    },
    {
      q: 'Is factoring better than a loan?',
      a: 'It depends on the problem. If your company is profitable but waiting on late-paying customers, factoring releases cash tied up in invoices and scales with your invoicing. If you need to fund an asset or bridge a longer gap, a loan or lease fits better. Factoring costs are tied to invoice value and payment terms.',
    },
    {
      q: 'Do I need collateral for a business loan?',
      a: 'For most meaningful facilities, yes — property, equipment, receivables or a personal guarantee. Unsecured business lending exists but is limited in size and priced for the risk. An EIS guarantee can cover part of a collateral gap, which is often what makes an otherwise viable application workable.',
    },
  ],
  related: [
    { label: 'Compare business loans', href: '/loans/business' },
    { label: 'Startup programs and grants', href: '/programs' },
    { label: 'Business banking overview', href: '/business' },
    { label: 'Personal loans', href: '/loans/personal' },
    { label: 'Our methodology', href: '/methodology' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// LOANS HUB — Nordic & Baltic (EN)
// Hub sayfasi ALT kategorilerle ayni sorguyu hedeflememeli (kannibalizasyon).
// /loans/personal "personal loan estonia" alir; burasi KARSILASTIRMALI aci:
// hangi kredi turu hangi durumda, ulkeler arasi fark, hangi alt sayfaya gitmeli.
// ═══════════════════════════════════════════════════════════════════════════

const LOANS_HUB_EN: DeepContent = {
  locale: 'en',
  h1: 'Borrowing in the Nordics and Baltics: which loan type fits',
  metaTitle: 'Compare Loan Types: Nordic & Baltic Guide',
  metaDescription:
    'Which loan type fits your situation across the Nordics and Baltics: unsecured consumer credit, secured car finance, mortgages and refinancing compared.',
  intro:
    'The right loan is decided by what secures it. Unsecured consumer credit is fast and flexible but costs more; secured borrowing against a car or property costs less and takes longer to arrange. Rates, affordability rules and lender mix differ by country, so the same borrower gets different answers in Tallinn and Helsinki.',
  sections: [
    {
      h2: 'Secured or unsecured: the choice that sets your rate',
      body: [
        'Every consumer loan sits on one side of a line. Unsecured credit — a personal loan, an overdraft, a credit card — is backed only by your promise to repay, so the lender prices in the risk of getting nothing back. Secured credit is backed by an asset the lender can take: the property in a mortgage, the vehicle in car finance. That security is why a mortgage costs a fraction of what a personal loan costs.',
        'The practical consequence is that the cheapest route depends on what you own, not only on what you earn. Someone with property may find that borrowing against it beats an unsecured loan for a large renovation. Someone without collateral is comparing unsecured offers, and there the spread between lenders is wide enough that comparison does most of the work.',
        'Term length pulls in the opposite direction to monthly affordability. Stretching a loan reduces the monthly payment and increases the total cost, sometimes substantially. When you compare, hold the term constant — otherwise you are comparing two different products wearing the same name.',
      ],
    },
    {
      h2: 'Which product for which purpose',
      body: [
        'For a home purchase the answer is a mortgage, and the number that matters is the bank margin rather than the headline rate, because the reference rate is the same for everyone. We cover how Euribor and margin interact in [mortgages](/loans/mortgage).',
        'For a car, you are choosing between a loan, leasing and hire purchase — and the difference is who owns the vehicle rather than the interest rate. That choice also decides who carries depreciation and whether comprehensive insurance becomes contractually compulsory. See [car finance](/loans/car).',
        'For consolidating existing debts, renovating without touching a mortgage, or covering a one-off cost, unsecured [personal loans](/loans/personal) are the usual route. For a company, the assessment shifts from your income to the business cash flow entirely — that is [business finance](/loans/business).',
        'One case deserves its own mention: refinancing. If you took credit when your circumstances were weaker, the rate you were given reflects that. Consumer credit in the EU carries a right to repay early, so moving a loan is a real option — worth checking whenever your income, employment stability or credit record has improved.',
      ],
    },
    {
      h2: 'Why the same borrower gets different answers by country',
      body: [
        'The Baltics and the euro-area Nordics price variable loans off Euribor, so the reference rate is shared. What differs is the margin, the fee structure and how conservative each market lender is. Denmark, Norway, Sweden and Iceland run their own currencies and central bank rates, which is why their loan pricing moves independently of the euro area.',
        'Affordability rules differ too. Each country applies its own caps on how much of your net income can go to debt service, and lenders stress-test against a higher rate than today. Two people with identical salaries can therefore be approved for different amounts depending on which side of a border they are applying from.',
        'Residency is the third variable and often the decisive one for newcomers. Lenders lean heavily on a local personal identity code, a domestic bank account receiving salary, and a credit history in that country. This is why an experienced professional can be refused in their first year despite strong income — the file lacks local record, not creditworthiness. Country-by-country detail is in our [country pages](/countries).',
      ],
    },
    {
      h2: 'How to compare without being misled',
      body: [
        'Compare on APRC, not the nominal rate. APRC includes the contract fee and the payment schedule, which is why two loans advertising the same interest rate can cost noticeably different amounts. Rates written as from a given percentage are best-case figures offered to the strongest applicants — your personal offer follows a credit assessment.',
        'Check the fees that never appear in the headline: contract or arrangement fees, collateral registration costs on secured loans, and any charge for early settlement. Ask for the total cost in writing before signing. A lender that will not put it in writing has told you something useful.',
        'Our comparison reads published rates from lender sources and refreshes them daily, so what you see reflects what banks are advertising now rather than a number written into an article months ago. Use the [loan calculator](/loan-calculator) to test how term length changes both the monthly payment and the total repayable before you apply anywhere.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the difference between a secured and an unsecured loan?',
      a: 'A secured loan is backed by an asset the lender can claim — property in a mortgage, the vehicle in car finance — which lowers the lender risk and therefore the rate. Unsecured credit is backed only by your promise to repay, so it is faster to arrange but costs more.',
    },
    {
      q: 'Should I compare on the interest rate or the APRC?',
      a: 'APRC. It folds in the contract fee and the payment schedule, so it reflects what the loan actually costs. Two offers with the same nominal rate can have different APRC because of fees. Compare over the same amount and the same term, or you are comparing different products.',
    },
    {
      q: 'Why do loan rates differ between Nordic and Baltic countries?',
      a: 'The Baltics and euro-area Nordics price variable loans off Euribor, so the reference is shared and banks compete on margin. Denmark, Norway, Sweden and Iceland use their own currencies and central bank rates, so their pricing moves independently. Affordability rules also differ by country.',
    },
    {
      q: 'Can I refinance an existing loan?',
      a: 'Yes. Consumer credit in the EU carries a right to early repayment, though the lender may charge compensation within limits set by law. Refinancing is most worthwhile when your income, employment stability or credit record has improved since you first borrowed.',
    },
    {
      q: 'Why was I refused despite a good salary?',
      a: 'Usually a thin local file rather than weak finances. Lenders lean on a domestic personal identity code, a local account receiving your salary, and credit history in that country. Newcomers often need a period of local record before applications succeed, even with strong income.',
    },
  ],
  related: [
    { label: 'Personal loans', href: '/loans/personal' },
    { label: 'Car finance', href: '/loans/car' },
    { label: 'Mortgages', href: '/loans/mortgage' },
    { label: 'Business loans', href: '/loans/business' },
    { label: 'Loan calculator', href: '/loan-calculator' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// INSURANCE HUB — Estonia (EN)
// Alt sigorta sayfalari CategorySeoBlock ile kendi icerigine sahip; hub burada
// "hangisi zorunlu, hangisi degil, hangi durumda hangisi" acisini alir.
// ═══════════════════════════════════════════════════════════════════════════

const INSURANCE_HUB_EN: DeepContent = {
  locale: 'en',
  h1: 'Insurance in Estonia: what is compulsory and what is worth buying',
  metaTitle: 'Insurance Estonia: Compulsory vs Optional Cover',
  metaDescription:
    'Which insurance is legally required in Estonia, which your bank or landlord requires, and which is genuinely optional — motor, home, health, travel and life compared.',
  intro:
    'Only two kinds of cover are effectively unavoidable in Estonia: motor liability insurance for any registered vehicle, and whatever your mortgage or lease contract obliges you to hold. Everything else — Casco, home contents, private health, travel and life cover — is a judgement about which risks you could not absorb yourself.',
  sections: [
    {
      h2: 'Compulsory, contractual and optional',
      body: [
        'It helps to separate three different kinds of obligation. Legally compulsory means the state requires it: in Estonia that is motor liability insurance (liikluskindlustus) for every registered vehicle, which covers harm you cause to others and never repairs your own car.',
        'Contractually required means someone you signed with demands it. A mortgage lender requires property insurance for the building; a car lender or leasing company requires comprehensive Casco cover; some landlords require tenant liability cover. These are not legal duties, but the consequence of breaching them is losing the contract, so treat them as fixed costs.',
        'Everything else is genuinely optional and should be judged by one question: could you absorb this loss without insurance? A cracked phone screen is an annoyance; a liability claim after a serious accident, or six months unable to work, is a different order of magnitude. Insurance is most valuable exactly where the loss would be unrecoverable, which is often not where people feel most anxious.',
      ],
    },
    {
      h2: 'Vehicle cover: two separate layers',
      body: [
        'Motor liability insurance is mandatory, tied to the vehicle registration rather than the driver, and pays for damage you cause to other people and their property. Driving without it is an offence, and the policy follows the car when it changes hands.',
        'Casco is the voluntary layer that covers your own vehicle: collision damage regardless of fault, theft, fire, vandalism, glass and natural events. Scope is not standardised between insurers, so two policies with the same name can differ on excess, glass cover and how a total loss is valued. If the car is financed, your lender almost certainly requires it — the detail is in [Casco insurance](/insurance/casco) and the finance side in [car loans](/loans/car).',
      ],
    },
    {
      h2: 'Health, home and travel for people who moved here',
      body: [
        'Estonian state health insurance follows employment rather than residency, which surprises people who assume registering an address is enough. Employees are generally covered through contributions; freelancers, people between jobs and e-residents without local employment often are not. Private cover fills that gap, and the right answer depends on your exact status — see [health insurance](/insurance/health).',
        'For housing, the split is between the building and what is inside it. A mortgage lender requires building cover; that policy does not replace your belongings, and a tenant is generally not covered by the landlord policy at all. Renters typically need contents and liability rather than building cover — the distinction is covered in [home insurance](/insurance/home).',
        'Travel cover matters more for non-EU residents. The European Health Insurance Card gives EU citizens access to state healthcare in other member states but does not cover repatriation, private treatment or trip cancellation. If you hold a residence permit rather than EU citizenship, check what your card actually entitles you to before assuming a trip is covered. See [travel insurance](/insurance/travel).',
      ],
    },
    {
      h2: 'Comparing policies rather than prices',
      body: [
        'The excess (omavastutus) is the lever that moves the premium most. Raising it lowers what you pay monthly and raises what you pay when you claim. That is a genuine trade, and the right level is the largest amount you could pay without difficulty at the moment of a claim — not the largest number that makes the quote look cheap.',
        'Read the exclusions before the cover list. Territorial limits, use of the vehicle or property for commercial purposes, unreported modifications and pre-existing conditions are where claims are refused. A policy that costs less because it excludes something you actually do is not cheaper.',
        'Finally, check the claims process before you need it: how a claim is filed, how a loss is valued, and whether an approved repair network limits your choices. Our [insurance comparison](/insurance) lists what Estonian insurers publish across all lines, and [life cover](/insurance/life) is worth a separate look if anyone depends on your income.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Which insurance is legally compulsory in Estonia?',
      a: 'Motor liability insurance (liikluskindlustus) for every registered vehicle. It covers harm you cause to others and never repairs your own car. Other cover people treat as compulsory — Casco, property insurance — is usually required by a lender or landlord contract rather than by law.',
    },
    {
      q: 'Am I covered by Estonian state health insurance as a foreigner?',
      a: 'It follows employment, not residency. Employees are generally covered through contributions, while freelancers, people between jobs and e-residents without local employment often are not. Registering an address does not by itself provide cover, which is a common and expensive misunderstanding.',
    },
    {
      q: 'Does my landlord insurance cover my belongings?',
      a: 'Generally no. A landlord policy covers the building and the owner interest in it, not a tenant possessions or a tenant liability. Renters usually need contents and liability cover of their own — the two policies protect different people against different losses.',
    },
    {
      q: 'Is a higher excess worth it to lower the premium?',
      a: 'Only up to what you could comfortably pay when claiming. A higher excess (omavastutus) genuinely reduces the premium, but it reduces the payout by the same logic. A policy with an excess you could not afford at claim time is cheaper on paper and less useful in practice.',
    },
    {
      q: 'Does the European Health Insurance Card replace travel insurance?',
      a: 'No. The card gives access to state healthcare in other EU member states but does not cover repatriation, private treatment or trip cancellation. Non-EU residents holding an Estonian residence permit should check what their card actually entitles them to before travelling.',
    },
  ],
  related: [
    { label: 'Motor and Casco', href: '/insurance/casco' },
    { label: 'Health insurance', href: '/insurance/health' },
    { label: 'Home insurance', href: '/insurance/home' },
    { label: 'Travel insurance', href: '/insurance/travel' },
    { label: 'Life insurance', href: '/insurance/life' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// COUNTRIES HUB — Nordic & Baltic (EN)
// Bu sayfa bir navigasyon tablosuydu. Aci: "ayni basvuran neden ulkeden ulkeye
// farkli cevap aliyor" — currency/reference rate, uygunluk kurallari, yerel
// kimlik/kredi kaydi. Alt sayfalara ve urun sayfalarina dagitir.
// ═══════════════════════════════════════════════════════════════════════════

const COUNTRIES_HUB_EN: DeepContent = {
  locale: 'en',
  h1: 'Borrowing across the Nordics and Baltics: how the eight markets differ',
  metaTitle: 'Nordic & Baltic Lending: Country Comparison',
  metaDescription:
    'How lending differs across Denmark, Finland, Iceland, Norway, Sweden, Estonia, Latvia and Lithuania: currencies, reference rates, affordability rules and residency requirements.',
  intro:
    'Eight countries, two monetary systems. Estonia, Latvia, Lithuania and Finland use the euro and price variable loans off Euribor. Denmark, Norway, Sweden and Iceland run their own currencies and central bank rates. That split, plus national affordability rules and local credit history, explains why the same applicant gets different answers in each market.',
  sections: [
    {
      h2: 'Two monetary blocks, two pricing logics',
      body: [
        'The euro-area members — Estonia, Latvia, Lithuania and Finland — price variable-rate lending as a reference rate plus a bank margin, and that reference is Euribor. Because the reference is shared, banks compete on margin. When Euribor moves, borrowers across all four countries feel it at their next reset.',
        'Denmark, Norway, Sweden and Iceland set monetary policy independently, so their loan pricing follows their own central bank rates rather than Euribor. Denmark maintains a fixed-rate policy against the euro, which keeps its rates broadly aligned in practice, while Norway, Sweden and Iceland can and do diverge.',
        'For a borrower this matters in one concrete way: a rate comparison across the whole region is not comparing like with like. Comparing an Estonian margin to a Norwegian headline rate tells you very little. Compare within a currency zone, or compare total cost on identical amounts and terms.',
      ],
    },
    {
      h2: 'What every market checks, and what differs',
      body: [
        'The common core is the same everywhere: verifiable income, existing debt obligations, and your record in the national credit register. Every country applies caps limiting how much of net income can go to debt service, and lenders stress-test affordability against a rate higher than today.',
        'What differs is how strict those caps are, how long a payment default stays on record, and how much weight lenders give to employment type. A permanent contract is treated more favourably than a fixed-term one in every market, but the size of that gap varies. Self-employment is handled very differently between, say, Estonia and Sweden.',
        'Collateral practice differs too. Mortgage loan-to-value limits are set nationally by each central bank or financial supervisor, and state-backed guarantee schemes exist in several countries to help first-time buyers over the deposit hurdle. The names and conditions change; the structure — a public guarantee reducing the deposit rather than the rate — recurs across the region.',
      ],
    },
    {
      h2: 'The residency question, which decides most newcomer applications',
      body: [
        'For someone who has just moved, the binding constraint is rarely income. It is the absence of a local file. Lenders lean on a national personal identity code, a domestic bank account receiving salary, and credit history in that country. A strong earner in month two often cannot borrow, while a modest earner in year three can.',
        'Residence permit duration adds a second constraint. Where a permit expires before a loan would be repaid, lenders typically shorten the term to fit rather than refuse outright — which raises the monthly payment and can make the loan unworkable. Long-term borrowing generally requires permanent residency or citizenship, or a permit comfortably outlasting the term.',
        'The practical sequence for newcomers is the same in every one of these markets: get the personal identity code, register your address, have salary paid into a local account, and let a few months of record accumulate before applying for anything significant. Applying too early and being refused also leaves a mark.',
      ],
    },
    {
      h2: 'Where to look next',
      body: [
        'If you know the product you need, start there: [personal loans](/loans/personal) for unsecured borrowing, [mortgages](/loans/mortgage) for property, [car finance](/loans/car) for vehicles and [business loans](/loans/business) for companies. Each page covers the eligibility rules in more depth than a country overview can.',
        'If you are saving rather than borrowing, [deposit rates](/deposits) shows what banks are paying, and the EU deposit guarantee protects you to the same 100,000 EUR ceiling in every country listed here.',
        'Founders and companies should also check [government and EU programmes](/programs), which lists national instruments and startup funding across all eight markets — several of the most useful routes for new companies are public guarantees rather than commercial loans.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Which Nordic and Baltic countries use the euro?',
      a: 'Estonia, Latvia, Lithuania and Finland. They price variable-rate loans off Euribor plus a bank margin, so banks compete mainly on margin. Denmark, Norway, Sweden and Iceland keep their own currencies and central bank rates, so their lending prices move independently.',
    },
    {
      q: 'Can I borrow in one country while living in another?',
      a: 'It is difficult. Lenders assess local income, a national identity code and domestic credit history, so cross-border applications usually fail on the file rather than the finances. An existing relationship with a bank present in both markets is the most realistic route.',
    },
    {
      q: 'Why can I not get a loan in my first months after moving?',
      a: 'Because you have no local record yet. Lenders rely on a national identity code, salary arriving in a domestic account and credit history in that country. Income alone rarely compensates. A few months of documented local activity changes most applications materially.',
    },
    {
      q: 'Does my residence permit length affect the loan term?',
      a: 'Yes. Where a permit expires before the loan would be repaid, lenders typically shorten the term so repayment finishes first. That raises the monthly payment and can make larger loans unworkable. Long-term borrowing usually needs permanent residency or a permit outlasting the term.',
    },
    {
      q: 'Is my deposit protected in every country listed here?',
      a: 'Yes, to the same 100,000 EUR ceiling per depositor per bank under the EU deposit guarantee framework. The paying scheme is the one in the bank home country, which matters when a foreign bank operates as a branch rather than a local subsidiary.',
    },
  ],
  related: [
    { label: 'Compare all loans', href: '/loans' },
    { label: 'Mortgages', href: '/loans/mortgage' },
    { label: 'Deposit rates', href: '/deposits' },
    { label: 'Government and EU programmes', href: '/programs' },
    { label: 'Our methodology', href: '/methodology' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════

export const DEEP_CONTENT = {
  mortgage: { en: MORTGAGE_EN, et: MORTGAGE_ET, fi: MORTGAGE_FI },
  personal: { en: PERSONAL_EN, et: PERSONAL_ET, fi: PERSONAL_FI },
  // 2026-09-06: kategori sayfalarinin cogu 'ince icerik'ti (sadece filtre + kart).
  // 89 sayfa indeksli ama trafik yok -> sorun indeksleme degil siralama.
  deposits: { en: DEPOSITS_EN },
  car: { en: CAR_EN },
  business: { en: BUSINESS_EN },
  loansHub: { en: LOANS_HUB_EN },
  insuranceHub: { en: INSURANCE_HUB_EN },
  countriesHub: { en: COUNTRIES_HUB_EN },
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
  // Henuz yalnizca EN — ET/FI lokalizasyonu (ceviri degil, pazar-dogru adaptasyon)
  // sonraki turda; hreflang eksik dille yanlis eslesme yapmasin diye tek dil.
  deposits: {
    en: 'https://nordicrate.com/deposits',
  },
  car: {
    en: 'https://nordicrate.com/loans/car',
  },
  business: {
    en: 'https://nordicrate.com/loans/business',
  },
  loansHub: {
    en: 'https://nordicrate.com/loans',
  },
  insuranceHub: {
    en: 'https://nordicrate.com/insurance',
  },
  countriesHub: {
    en: 'https://nordicrate.com/countries',
  },
} as const;

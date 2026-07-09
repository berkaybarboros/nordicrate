// SEO category content for insurance subcategory pages.
// Rendered below product listings as H2 + intro paragraphs + FAQ (FAQPage JSON-LD compatible).

export interface CategoryContent {
  slug: string;
  title: string;
  intro: string[];
  faqs: { q: string; a: string }[];
}

export const INSURANCE_CONTENT: Record<string, CategoryContent> = {
  motor: {
    slug: 'motor',
    title: 'Motor Insurance in the Nordics & Baltics',
    intro: [
      'Motor third-party liability insurance is mandatory in all eight Nordic and Baltic countries. Whether it is called trafikförsäkring in Sweden, liikennevakuutus in Finland, or liikluskindlustus in Estonia, the principle is the same: every registered vehicle must be insured against damage it causes to other people and their property before it can legally be driven.',
      'For expats, the details matter. If you search for motor insurance in Estonia or Finland as a newcomer, you will find that premiums depend on your claims history, vehicle type, and region of registration — and insurers differ in how they treat a no-claims record earned abroad. Some accept foreign bonus certificates; others start you from scratch.',
      'Because mandatory liability cover is standardised by law, the real differences between insurers come down to price, claims handling, and optional add-ons. Comparing quotes across several insurers before you register a vehicle typically reveals meaningful price differences for identical legal cover, especially for drivers new to the country.',
    ],
    faqs: [
      {
        q: 'Is motor insurance mandatory in Nordic and Baltic countries?',
        a: 'Yes. Third-party motor liability insurance is a legal requirement in Denmark, Finland, Iceland, Norway, Sweden, Estonia, Latvia, and Lithuania. Driving an uninsured registered vehicle can lead to fines, and uninsured vehicles are tracked through national motor insurance bureaus and vehicle registries.',
      },
      {
        q: 'Does my motor liability insurance cover me when driving to another country?',
        a: 'Generally yes within the EU and EEA. Motor liability policies issued in one member state are valid across the others, and the Green Card system extends recognition to many additional countries. Check your policy documents for the exact territorial scope before longer trips.',
      },
      {
        q: 'What does mandatory motor liability insurance actually cover?',
        a: 'It covers injuries to other people and damage to their property caused by your vehicle. It does not cover damage to your own car, theft, or vandalism — those risks require optional casco insurance, which you can add separately if you want fuller protection.',
      },
      {
        q: 'Can I use my no-claims bonus from another country?',
        a: 'It depends on the insurer. Many Nordic and Baltic insurers accept a written claims-history certificate from your previous insurer and grant a corresponding discount, while others do not recognise foreign records. Ask for this explicitly when requesting quotes, as it can significantly affect your premium.',
      },
      {
        q: 'How can I find cheaper motor insurance as an expat?',
        a: 'Compare quotes from several insurers rather than accepting the first offer, provide proof of your claims history from abroad, and consider your deductible level. Since mandatory liability cover is legally identical everywhere, price and service quality are the main things that vary between providers.',
      },
    ],
  },

  casco: {
    slug: 'casco',
    title: 'Casco Insurance in the Baltics & Nordics',
    intro: [
      'Casco insurance is voluntary comprehensive vehicle cover that protects your own car — something mandatory motor liability insurance never does. A typical casco policy in the Baltic and Nordic markets covers collision damage, theft, vandalism, fire, glass breakage, and natural events, with the exact scope defined by the policy tier you choose.',
      'Casco insurance is particularly common in the Baltic states, where leasing companies almost always require it for financed vehicles. If you buy a car on lease in Estonia, Latvia, or Lithuania, expect casco to be a contractual condition. For owners of newer or higher-value cars, it is usually worth considering even without a lease.',
      'Casco pricing varies far more between insurers than mandatory liability cover does, because insurers set their own terms, deductibles, and exclusions. Comparing casco offers across the Baltic and Nordic insurers side by side — including deductible levels and what counts as a covered event — typically pays off more than for any other motor product.',
    ],
    faqs: [
      {
        q: 'What is the difference between casco and mandatory motor insurance?',
        a: 'Mandatory motor liability insurance covers damage you cause to others and is required by law. Casco is optional insurance for your own vehicle, covering collision, theft, vandalism, fire, and similar risks. Most drivers who want full protection carry both policies together.',
      },
      {
        q: 'Is casco insurance required for leased cars?',
        a: 'In practice, yes. Leasing and car finance companies in the Baltic and Nordic countries routinely require casco cover for the full financing term, since the vehicle serves as collateral. The lease contract usually specifies minimum coverage conditions the policy must meet.',
      },
      {
        q: 'What does casco insurance usually exclude?',
        a: 'Common exclusions include wear and tear, mechanical breakdown, driving under the influence, unroadworthy vehicles, and sometimes damage occurring outside the covered territory. Exclusions differ noticeably between insurers, so reading the policy terms before buying matters more with casco than with standardised liability cover.',
      },
      {
        q: 'Is casco worth it for an older car?',
        a: 'It depends on the car’s market value. Casco payouts are based on the vehicle’s value at the time of loss, so for low-value cars the premium may not justify the potential payout. Many owners of older vehicles choose partial casco covering theft, fire, and glass only.',
      },
      {
        q: 'How is the casco deductible chosen?',
        a: 'You typically select a deductible when buying the policy — the amount you pay yourself per claim. A higher deductible lowers your premium, while a lower one raises it. Theft and total-loss claims sometimes carry separate deductible rules, so check each insurer’s terms when comparing.',
      },
    ],
  },

  home: {
    slug: 'home',
    title: 'Home Insurance in the Nordic Countries & Baltics',
    intro: [
      'Home insurance in the Nordic countries and the Baltics generally splits into two parts: building insurance, which covers the structure itself, and contents insurance, which covers your belongings. Homeowners usually need both, while tenants typically only need contents cover — often combined with personal liability protection in a single home policy.',
      'Home insurance is not required by law in the region, but mortgage lenders across the Nordics and Baltics routinely require building insurance as a loan condition. Many rental contracts also expect tenants to hold a home policy. Standard cover addresses fire, water leakage, storm damage, burglary, and liability, with valuables and travel add-ons available.',
      'Policy structures differ noticeably between countries — Nordic policies often bundle liability and legal-expenses cover by default, while Baltic policies tend to be more modular. Comparing home insurance quotes across insurers, with matching coverage amounts and deductibles, typically reveals real differences in both price and what is actually included.',
    ],
    faqs: [
      {
        q: 'Is home insurance mandatory in the Nordic and Baltic countries?',
        a: 'No law requires it, but mortgage banks across the region typically require building insurance as a condition of the loan, and many landlords expect tenants to carry contents insurance. In practice, most homeowners and a large share of tenants hold a home policy.',
      },
      {
        q: 'What is the difference between building and contents insurance?',
        a: 'Building insurance covers the structure — walls, roof, fixed installations — against fire, water, storm, and similar damage. Contents insurance covers movable belongings such as furniture, electronics, and clothing. Homeowners generally need both; tenants usually only need contents cover since the landlord insures the building.',
      },
      {
        q: 'Do I need home insurance as a tenant?',
        a: 'It is strongly advisable and often expected in rental contracts. A tenant’s contents policy covers your belongings against theft, fire, and water damage, and usually includes personal liability cover — important if, for example, a water leak from your apartment damages a neighbour’s property.',
      },
      {
        q: 'Does home insurance cover water damage?',
        a: 'Sudden and unforeseen water damage, such as a burst pipe, is covered by standard policies across the region. Gradual damage from long-term leaks, poor maintenance, or condensation is commonly excluded. Coverage details for leaking roofs and external flooding vary by insurer, so compare terms carefully.',
      },
      {
        q: 'What affects the price of home insurance?',
        a: 'Key factors include the property’s size, age, construction type, and location, the sum insured for contents, your chosen deductible, and security features such as approved locks or alarms. Because insurers weight these factors differently, comparing several quotes for identical cover usually uncovers price differences.',
      },
    ],
  },

  health: {
    slug: 'health',
    title: 'Health Insurance for Expats in the Nordics & Baltics',
    intro: [
      'All eight Nordic and Baltic countries operate public healthcare systems, typically funded through taxes or social insurance contributions. Residents who work and pay contributions are generally covered. For expats, the key question is when public coverage starts: entitlement is usually tied to registered residence or employment, and there can be a gap before it takes effect.',
      'EU and EEA citizens can use the European Health Insurance Card (EHIC) for medically necessary treatment in public systems while staying temporarily in another member state. The EHIC does not cover private healthcare, planned treatment abroad, or repatriation — which is why many expats and digital nomads add private health insurance on top.',
      'Private health insurance for expats in the Nordic and Baltic region mainly buys faster access to specialists and private clinics, since public queues for non-urgent care can be long. Comparing private health plans across insurers — checking waiting periods, exclusions for pre-existing conditions, and clinic networks — helps match cover to how you actually use healthcare.',
    ],
    faqs: [
      {
        q: 'Do expats get public healthcare in Nordic and Baltic countries?',
        a: 'Generally yes, once you are a registered resident or employed and paying social contributions, depending on the country’s rules. Coverage is usually not immediate upon arrival, so many expats hold private or travel health insurance to bridge the gap until public entitlement begins.',
      },
      {
        q: 'What does the EHIC cover and not cover?',
        a: 'The European Health Insurance Card covers medically necessary treatment in another EU or EEA country’s public system, on the same terms as locals. It does not cover private healthcare, planned treatment abroad, or repatriation to your home country — those require separate travel or private health insurance.',
      },
      {
        q: 'Why buy private health insurance if public healthcare is available?',
        a: 'Private cover mainly provides faster access to specialists, diagnostics, and elective procedures at private clinics, bypassing public waiting lists for non-urgent care. Some employers in the region offer it as a benefit. It complements rather than replaces the public system.',
      },
      {
        q: 'Are pre-existing conditions covered by private health insurance?',
        a: 'Usually not, or only with restrictions. Most private health insurers in the region exclude conditions that existed before the policy started, or apply waiting periods before certain treatments are covered. Always read the exclusion terms and disclose your health history accurately when applying.',
      },
      {
        q: 'What should digital nomads look for in health insurance?',
        a: 'Check whether the policy covers you across multiple countries, includes repatriation and emergency evacuation, and how long single stays abroad can last. If you are not yet enrolled in any public system, prioritise plans covering both emergency and outpatient care, and compare geographic scope carefully.',
      },
    ],
  },

  travel: {
    slug: 'travel',
    title: 'Travel Insurance for the Nordics, Baltics & Schengen Area',
    intro: [
      'All eight Nordic and Baltic countries belong to the Schengen area, so travel between them involves no routine border checks. For visitors who need a Schengen visa, travel insurance is a formal requirement: the policy must provide at least €30,000 in medical coverage, be valid across the entire Schengen area, and cover emergency treatment and repatriation.',
      'Residents of the region travelling abroad face the opposite question. The EHIC covers emergency public healthcare within the EU and EEA, but not repatriation, trip cancellation, lost baggage, or private clinics. A travel policy fills those gaps — and in the Nordics, travel cover is often already bundled into home insurance, so check before buying twice.',
      'Travel insurance pricing depends on destination, trip length, your age, and add-ons such as winter sports or high-value electronics. Annual multi-trip policies usually beat single-trip cover for frequent travellers. Comparing travel insurance offers side by side, including deductibles and cancellation terms, typically shows clear differences for the same trip.',
    ],
    faqs: [
      {
        q: 'Is travel insurance required for a Schengen visa?',
        a: 'Yes. Schengen visa applicants must hold travel medical insurance with at least €30,000 in coverage, valid throughout the Schengen area for the entire stay, covering emergency medical treatment, hospitalisation, and repatriation. Visa applications without a compliant policy are refused, so verify the certificate meets these requirements.',
      },
      {
        q: 'Do I need travel insurance within the EU if I have an EHIC?',
        a: 'The EHIC only covers medically necessary treatment in public healthcare systems. It excludes repatriation, mountain rescue, private clinics, trip cancellation, and lost baggage. Travel insurance covers these gaps, so carrying both is the standard recommendation even for short trips within Europe.',
      },
      {
        q: 'Does my home insurance already include travel cover?',
        a: 'Possibly. In the Nordic countries especially, many home and contents policies include travel insurance for household members, typically covering trips up to around 45 to 60 days depending on the insurer. Check your existing policy terms before buying a separate travel policy for the same trip.',
      },
      {
        q: 'What does travel insurance typically cover?',
        a: 'Core cover includes emergency medical treatment, repatriation, trip cancellation or interruption, delayed or lost baggage, and personal liability while travelling. Optional add-ons commonly cover winter sports, adventure activities, rental car deductibles, and high-value items. Exact limits and deductibles vary meaningfully between insurers.',
      },
      {
        q: 'Should I choose single-trip or annual travel insurance?',
        a: 'If you travel more than two or three times a year, an annual multi-trip policy is usually more economical and saves arranging cover for each trip. Note that annual policies cap the length of each individual trip, often at 30 to 90 days, so long-stay travellers should verify limits.',
      },
    ],
  },

  life: {
    slug: 'life',
    title: 'Life Insurance in Estonia, the Baltics & Nordics',
    intro: [
      'Life insurance in the Nordic and Baltic markets comes in two main forms: term life insurance, which pays a fixed sum to your beneficiaries if you die during the policy period, and unit-linked or savings life insurance, which combines a smaller death benefit with long-term investment. Term life is the simpler and typically cheaper way to protect dependants.',
      'The most common trigger for buying life insurance in the region is a mortgage. Banks in Estonia, the other Baltics, and the Nordics frequently expect borrowers to hold life cover matching the loan, so the debt is repaid if a borrower dies. Expats and e-residents with local loans or families should check whether their existing cover from home remains valid after relocating.',
      'Premiums depend mainly on your age, health, smoking status, sum insured, and policy term — and insurers price these factors differently. Comparing life insurance quotes in Estonia or elsewhere in the region for the same sum insured and term is straightforward and typically reveals genuine premium differences, particularly for younger, healthy non-smokers.',
    ],
    faqs: [
      {
        q: 'Is life insurance mandatory when taking a mortgage?',
        a: 'It is not required by law, but banks across the Baltic and Nordic countries commonly require or strongly recommend life cover matching the loan amount as a lending condition. You can usually choose any insurer whose policy meets the bank’s requirements rather than buying the bank’s own product.',
      },
      {
        q: 'What is the difference between term life and unit-linked life insurance?',
        a: 'Term life insurance pays a fixed sum to beneficiaries if you die within the agreed term, with no savings component — pure protection at a lower premium. Unit-linked insurance combines a death benefit with investment in funds, so its value fluctuates with markets and fees apply.',
      },
      {
        q: 'How much life insurance cover do I need?',
        a: 'A common approach is to cover outstanding debts, such as your mortgage, plus several years of income replacement for dependants, minus existing savings and any employer group cover. Your need shrinks as debts are repaid, so review the sum insured every few years.',
      },
      {
        q: 'Can expats and e-residents buy life insurance in Estonia?',
        a: 'Insurers set their own eligibility rules, and most require the policyholder to be a resident of the country where the policy is issued. Estonian e-residency alone does not equal residence, so e-residents living abroad should confirm eligibility with each insurer before applying and comparing offers.',
      },
      {
        q: 'What affects life insurance premiums the most?',
        a: 'Age at entry is the biggest driver, followed by smoking status, health history, sum insured, and policy length. Some insurers also consider occupation and hazardous hobbies. Because underwriting rules differ, two insurers can quote noticeably different premiums for the same person and cover level.',
      },
    ],
  },
};

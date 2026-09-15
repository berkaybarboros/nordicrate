/**
 * lib/legal-content.ts — Hukuk sayfaları (EN)
 * Kaynak: legal-advisor taslağı 2026-07-27; 2026-09-15 revizyonu:
 * - canlıda görünen [PLACEHOLDER]/[ADJUST]/[REVIEW] işaretleri kaldırıldı
 *   (açık kalan kurucu kararı: işyeri adresi — docs/legal/founder-checklist.md)
 * - AB ODR platformu 20 Temmuz 2025'te kapatıldı → atıflar çıkarıldı
 * - Cookie tablosu gerçek depolama anahtarlarıyla eşlendi
 * - Kurumlar için: Listing & Data Policy, Partner Terms, Corrections sayfaları
 */

export interface LegalDoc {
  slug: string;
  title: string;
  description: string;
  md: string;
}

const PRIVACY = String.raw`# Privacy Policy

Last updated: 15 September 2026

## 1. Who we are

NordicRate ("we", "us") is an independent loan and insurance comparison website operated as a sole proprietorship registered in Turkey by Berkay Barboros (see [Imprint](/imprint)). We are the data controller for personal data processed through nordicrate.com.

Contact for all privacy matters: **info@nordicrate.com**

This policy is provided in English. It applies to all visitors, including users in the European Union, whose data we process in accordance with the EU General Data Protection Regulation (GDPR).

## 2. What data we collect, and why

We collect only the data described below. We do not require an account for core use of the site.

### a) Rate-alert signups

- **Data:** email address, selected product/country parameters.
- **Purpose:** sending you the rate alerts you requested.
- **Legal basis:** performance of a contract (Art. 6(1)(b) GDPR).
- **Storage:** Supabase (EU-hosted PostgreSQL).

### b) "Find my best rate" flow

- **Data:** loan parameters (amount, term, country; income is optional), and optionally your email address.
- **Purpose:** generating comparison results; contacting you with results if you provide an email.
- **Legal basis:** consent (Art. 6(1)(a)) for storing your email; legitimate interest (Art. 6(1)(f)) for anonymous processing of loan parameters.

### c) AI assistant chat

- **Data:** your chat messages and, if you submit the lead form, your email plus a loan profile extracted from the conversation.
- **Purpose:** answering your questions and providing informational loan comparisons.
- **Processing detail:** chat messages are transmitted to Groq, Inc. (USA) to generate AI responses and extract your loan profile. Do not include sensitive personal data (health, financial account numbers, ID numbers) in chat messages.
- **No automated decision-making with legal effect:** AI outputs are informational recommendations only; no decision producing legal or similarly significant effects (Art. 22 GDPR) is made about you.
- **Legal basis:** consent (you actively use the chat); contract for the lead form follow-up.

### d) Partner / B2B contact form

- **Data:** name, business email, company details, message content.
- **Purpose:** responding to partnership enquiries (contact: info@nordicrate.com).
- **Legal basis:** legitimate interest / pre-contractual steps (Art. 6(1)(b) and (f)).

### e) Outbound affiliate link clicks (/go redirects)

- **Data:** session identifier, product identifier, timestamp. No name or email is logged.
- **Purpose:** click attribution for referral commissions and abuse prevention.
- **Legal basis:** legitimate interest (Art. 6(1)(f)) in operating and funding a free comparison service.

### f) Analytics

- **Data:** usage statistics via Google Tag Manager and Google Analytics 4.
- **Consent-gated:** analytics runs only after you accept it in our consent banner. We use Google Consent Mode v2 with analytics storage denied by default. No analytics cookies are set before consent.
- **Legal basis:** consent (Art. 6(1)(a)); ePrivacy Directive rules on cookies.

### g) First-party visit measurement

- **Data:** page path, product cards viewed, outbound clicks, the traffic source category (search, social, referral, direct) and a random identifier that lives only in the current browser tab (sessionStorage). No IP address, name or email is stored with these events.
- **Purpose:** aggregate statistics on which pages and products are useful, so we can improve the service.
- **Legal basis:** legitimate interest (Art. 6(1)(f)). **You can object at any time by choosing "Decline" in the cookie banner** — this switches the measurement off in that browser.

### h) Feedback you send us

- **Data:** your answer to "Did you find what you were looking for?", any text you write, and your email only if you add it.
- **Purpose:** improving the site and, if you left an email, replying to you.
- **Legal basis:** consent (Art. 6(1)(a)). Retained for 24 months.

### i) Security and server logs

- **Data:** IP address, request metadata, rate-limiting counters.
- **Purpose:** security, abuse prevention, service integrity.
- **Legal basis:** legitimate interest (Art. 6(1)(f)).

### j) Optional account (Supabase Auth)

- **Data:** email and authentication credentials, only if you choose to sign up.
- **Legal basis:** performance of a contract.

We do not process special categories of data, and the service is not directed at children under 16.

## 3. Processors and recipients

We use the following processors under data processing agreements: Supabase (database/auth, EU), Google (GTM/GA4, consent-gated analytics, EU/US), Groq, Inc. (AI chat responses, US), Cloudflare (CDN/security, global), Hetzner Online GmbH (server hosting, Germany/EU).

We also use Google Gemini for internal content automation; **no user personal data** is sent to Gemini.

We do **not sell personal data** and do not share it with data brokers. When you click an affiliate link, you leave our site and the destination bank or affiliate network (e.g., Awin, Adtraction) processes your data as an independent controller under its own privacy policy.

## 4. International transfers

Some processors (Google, Groq, Cloudflare) may process data in the United States. Where this occurs, transfers are safeguarded by the EU–US Data Privacy Framework (where the processor is certified) and/or the European Commission's Standard Contractual Clauses (SCCs). Core user data storage (Supabase, Hetzner) remains in the EU.

The operator is established in Türkiye, for which there is no EU adequacy decision. Access to EU-hosted data from Türkiye is limited to administering the service, uses encrypted connections and individual access credentials, and personal data is not copied to or stored outside the EU for that purpose.

## 5. Retention

- Rate-alert signups: until you unsubscribe, then deleted within 30 days
- "Find my best rate" submissions with email: 12 months from last activity
- AI chat lead data: 12 months; chat history is stored only in your browser (localStorage) unless a lead form is submitted
- Affiliate click logs: 13 months (attribution windows)
- B2B contact enquiries: 24 months
- Security/server logs: 90 days
- Analytics (GA4): 14 months (Google default)

## 6. Your rights

Under the GDPR you have the right to access, rectify, erase, restrict, and port your personal data, to object to processing based on legitimate interest, and to withdraw consent at any time (without affecting prior processing). Analytics consent can be withdrawn via the cookie banner (see our [Cookie Policy](/cookies)).

To exercise any right, email **info@nordicrate.com**. We respond within one month. We may need to verify your identity.

You also have the right to lodge a complaint with your local EU supervisory authority — for example, the Estonian Data Protection Inspectorate (Andmekaitse Inspektsioon, www.aki.ee) if you are in Estonia, or the Finnish Data Protection Ombudsman (tietosuoja.fi) if you are in Finland.

## 7. Changes

We will update this policy when our processing changes and revise the "Last updated" date. Material changes affecting registered users will be notified by email or site notice.`;

const TERMS = String.raw`# Terms of Use

Last updated: 15 September 2026

## 1. Who we are and what NordicRate is

NordicRate (nordicrate.com) is operated by Berkay Barboros, a sole proprietorship registered in Türkiye (see [Imprint](/imprint)). Contact: info@nordicrate.com.

NordicRate is an **independent comparison website** for loans, mortgages, business financing, insurance and related financial products in the Nordic and Baltic countries. We are **not a bank, lender, insurer, credit intermediary or licensed broker**. We do not grant credit, arrange contracts, or act on behalf of any financial institution. By using the site you accept these Terms.

## 2. Information only — not advice, not an offer

- All content, comparisons, calculators, and AI assistant responses are **general information only**. Nothing on this site constitutes financial, investment, legal or tax advice, a personal recommendation, or an offer to enter into any contract.
- Any loan, mortgage or insurance agreement is concluded **exclusively between you and the relevant financial institution**, on that institution's terms and subject to its own assessment and approval.
- The AI assistant produces automated informational output. It may be inaccurate or incomplete and must not be relied on as advice.

## 3. Accuracy of rates and data

For selected banks, loan and deposit rates are read automatically once a day from the bank's own public website and shown with the time they were last checked and a link to the source page. All other figures — including every insurance premium, which is an example for a typical profile and not a quote — are marked as indicative. Any figure may be outdated, incomplete or inaccurate at any time. **Always verify current rates, terms, and eligibility directly with the institution before applying.** Actual rates offered to you depend on the institution's individual assessment.

## 4. Affiliate disclosure

We may receive referral commissions from banks, insurers, or affiliate networks (such as Awin or Adtraction) when you click outbound links or apply via our site. Commissions do not change the price you pay. Compensation may influence which products are displayed or highlighted (promoted placements are labelled), but does not alter the underlying rate data we display. We do not compare every product available on the market.

## 4a. Financial institutions

Banks, insurers and other providers can see how they are listed, how data is sourced and how to request corrections in our [Listing & Data Policy](/listing-policy). Commercial cooperation is governed by our [Partner Terms](/partner-terms) and any individual agreement.

## 5. Acceptable use

You agree not to: (a) scrape, harvest, or bulk-download site content or data without written permission; (b) interfere with the operation or security of the site, or circumvent rate limits; (c) use the site or AI assistant for unlawful purposes or to submit malicious, misleading, or infringing content; (d) misrepresent your identity in forms; (e) reverse-engineer or resell our services. We may suspend access for violations.

## 6. Intellectual property

The site's design, text, code, compilations of data, logos and branding are owned by the operator or its licensors and protected by copyright and database rights. Bank and institution names and logos belong to their respective owners and are used for identification only; their appearance does not imply endorsement or partnership unless expressly stated. You may view and print content for personal, non-commercial use only.

## 7. Third-party links

Outbound links (including /go redirect links) lead to third-party websites we do not control. We are not responsible for their content, terms, or privacy practices.

## 8. Limitation of liability

To the maximum extent permitted by applicable law: the site is provided "as is" and "as available" without warranties of any kind; we are not liable for decisions you make in reliance on site content, for losses arising from inaccurate or outdated rate information, for the acts or omissions of any financial institution, or for indirect or consequential losses.

Nothing in these Terms excludes or limits liability that cannot be excluded under mandatory law, including liability for intent or gross negligence, or **mandatory consumer rights under the law of your country of residence**, which remain unaffected.

## 9. Governing law and disputes

These Terms are governed by the laws of the Republic of Türkiye. If you are a consumer resident in the EU or EEA, this choice does not deprive you of the protection of mandatory provisions of the law of your country of residence, and you may bring proceedings in the courts of that country.

Before going to court, please write to info@nordicrate.com — we answer complaints within 14 days.

## 10. Changes to these Terms

We may update these Terms at any time; the current version is always available on this page with its "Last updated" date. Continued use after changes constitutes acceptance.

## 11. Contact

General and partnerships: info@nordicrate.com`;

const COOKIES = String.raw`# Cookie Policy

Last updated: 15 September 2026

This policy explains how nordicrate.com uses cookies and similar browser storage. It supplements our [Privacy Policy](/privacy).

## 1. Consent

When you first visit, our consent banner asks for your choice. **Google Analytics cookies are not set until you accept.** We use Google Consent Mode v2 with analytics storage denied by default.

We also count visits ourselves, without cookies: a random identifier kept only for the life of the browser tab (sessionStorage), no IP address, no cross-site tracking, used only for aggregate statistics. **Choosing "Decline" switches this off too.** Strictly necessary storage does not require consent.

We use no advertising, retargeting or social-media cookies.

## 2. Cookies and storage we use

| Name | Provider | Purpose | Duration | Category |
|---|---|---|---|---|
| _ga | Google (GA4 via Google Tag Manager) | Distinguishes visitors for aggregate usage statistics | 13 months | Statistics (consent required) |
| _ga_* | Google (GA4 via GTM) | Maintains session state for analytics | 13 months | Statistics (consent required) |
| Google Tag Manager | Google | Loads analytics tags only after consent; sets no tracking cookies itself | Session | Statistics infrastructure (consent-gated) |
| Supabase auth token (sb-*) | Supabase (EU) | Keeps you signed in — set **only if you create an account and log in** | Until you sign out | Strictly necessary |
| nr-consent | NordicRate (localStorage) | Remembers your cookie banner choice | Until cleared | Strictly necessary |
| nr_sid | NordicRate (sessionStorage) | Random tab identifier for first-party visit statistics; off if you decline | Until the tab is closed | Statistics (first-party, no cookie) |
| nr_attr | NordicRate (sessionStorage) | Traffic source category of the visit (search / social / referral / direct) | Until the tab is closed | Statistics (first-party, no cookie) |
| nr_fb:* | NordicRate (sessionStorage) | Remembers that you already answered the page feedback question | Until the tab is closed | Functional |
| nordicrate-locale | NordicRate (localStorage) | Your language choice | Until cleared | Functional |
| nr-chat-* | NordicRate (localStorage) | Keeps your AI chat conversation in your browser only | Until cleared | Functional (local-only) |
| nr-lead-captured, nr-teaser-dismissed | NordicRate (localStorage) | Stops us showing the same sign-up prompt again | Until cleared | Functional |
| Calculator inputs | NordicRate (localStorage / sessionStorage) | Remembers loan and mortgage calculator inputs | Until cleared / tab closed | Functional (local-only) |

localStorage entries are not cookies: they stay on your device and are not automatically sent to any server.

## 3. Withdrawing consent

You can change or withdraw your consent at any time by reopening the consent banner via the **"Cookie settings"** link in the site footer. Withdrawal stops Google Analytics and our first-party visit statistics from that moment; already-set Google cookies can be removed via your browser.

## 4. Browser controls

All major browsers let you block or delete cookies and clear localStorage (typically under Settings → Privacy → Site data). Blocking strictly necessary storage may break login and the consent banner memory.

## 5. Changes

We will update this page and the table above whenever cookies change.

Questions: info@nordicrate.com`;

const IMPRINT = String.raw`# Imprint & Contact

Last updated: 15 September 2026

**Service:** NordicRate — independent loan and insurance comparison platform (nordicrate.com)

**Operator:** Berkay Barboros, sole proprietorship registered in Türkiye

Registered business address and tax registration details are provided on request at info@nordicrate.com.

**Contact:**

- General enquiries, partnerships and privacy requests: info@nordicrate.com
- Data corrections from institutions or users: see [Corrections](/corrections) — verified errors fixed within 2 business days

**Responsible for content:** Berkay Barboros

**Regulatory status:** NordicRate is not a bank, lender, insurer, or licensed credit intermediary. We provide comparison information only and may receive affiliate commissions from linked institutions. See our [Terms of Use](/terms).

**For financial institutions:** [Listing & Data Policy](/listing-policy) · [Partner Terms](/partner-terms)`;

const LISTING = String.raw`# Listing & Data Policy for Financial Institutions

Last updated: 15 September 2026

This page is for banks, lenders, insurers and fintechs whose products appear on NordicRate. It explains how you are listed, where our numbers come from and how to get anything changed — quickly and without a contract.

## 1. Listing is free and independent

- Any licensed institution offering loans, deposits or insurance in Denmark, Estonia, Finland, Iceland, Latvia, Lithuania, Norway or Sweden can be listed. **There is no fee to be listed** and no fee to have data corrected.
- Inclusion is an editorial decision: the product must be publicly available, with a public product page we can link to.
- We do not claim to cover every product on the market, and we say so on the site.

## 2. Where our data comes from

- **Automated rate checks.** For selected banks we read the published rate from the institution's own public product page once a day. Our reader respects robots.txt, requests each page once per run and never logs in or submits forms. Each such figure shows when it was last checked and links to your page.
- **Indicative figures.** Where we do not read a rate automatically, the figure is labelled *indicative*. Insurance premiums are always labelled as *examples for a typical profile, not quotes*.
- **Stale data is not shown as current.** If an automated check has not succeeded for more than 7 days, that figure is no longer presented as a checked rate.
- If you prefer to send us your rates directly (a file, feed or API), tell us — it is more accurate for everyone.

## 3. How products are ordered

- Default ordering is by the published rate or price, lowest first. **Commercial relationships never change the rate data we show or the default order.**
- If we ever offer paid placement, it will be clearly labelled "Sponsored" and kept separate from the neutral ordering.
- We do not award "Best", "Cheapest" or "Most popular" labels unless the claim rests on data we can show.

## 4. Corrections — within 2 business days

Email **info@nordicrate.com** with the subject "Correction — [institution]" and include the NordicRate page URL, what is wrong and a link to your official source. Verified errors are corrected within **2 business days** and we confirm by email. Details: [Corrections](/corrections).

## 5. Your name, logo and product descriptions

- Institution names and logos are used only to identify your products. Their appearance does not imply endorsement or partnership.
- You may send us your preferred logo file and a short, factual product description, and we will use it.
- If you ask us to remove your logo, we do so within **5 business days**. On request we also remove a product listing entirely; we may still mention publicly available facts in editorial content such as market reports.

## 6. Regulatory position

NordicRate is not a bank, lender, credit intermediary, insurer or insurance intermediary. We do not arrange, advise on or conclude contracts: users are sent to your website, where your own terms, disclosures and assessment apply. If you believe the way your product is presented raises a regulatory concern (for example consumer-credit advertising rules), contact us and we will treat it as a priority.

## 7. Contact

Listings, data and partnerships: **info@nordicrate.com**`;

const PARTNER_TERMS = String.raw`# Partner Terms

Last updated: 15 September 2026

These terms describe how NordicRate works with banks, insurers, lenders, brokers, affiliate networks and other comparison services ("Partners"). They exist so that we can start working together quickly. **A signed individual agreement, or the terms of an affiliate network you use with us, takes precedence where it differs from these terms.**

## 1. Ways to work together

- **Free listing and data exchange** — see our [Listing & Data Policy](/listing-policy). No agreement needed.
- **Referral (affiliate)** — we link users to your site and are paid per agreed action (for example a click, application or approved contract), directly or through a network such as Awin or Adtraction.
- **Leads** — with the user's explicit consent, we pass on the details they choose to share, for an agreed fee per qualifying lead.
- **Data and content** — market reports, rate data, co-branded guides or calculators.
- **Comparison and marketplace partners** — exchange of listings or embeddable comparison modules, agreed case by case.

There is no exclusivity: both sides remain free to work with others.

## 2. Tracking

Outbound links pass through a redirect on nordicrate.com that records the product, placement and time of the click and adds your or your network's tracking parameters (for example UTM tags or a click ID). We do not place cookies on your domain and do not pass personal data in tracking parameters.

## 3. Personal data

- For referrals, the user goes to your website and you are an independent controller for anything they submit there.
- For leads, we are a separate controller up to the hand-over, collect explicit consent naming the recipient and keep a record of that consent. A data sharing agreement is available on request.
- Neither side uses data received from the other for purposes the user has not agreed to.

## 4. Product information and compliance

- You are responsible for your products, prices, eligibility decisions and the legal disclosures that apply to them (for example the representative example for consumer credit). Send us the wording you require and we will display it.
- We are responsible for presenting information accurately, labelling indicative figures, disclosing that we may be paid, and correcting verified errors within 2 business days.
- Either side may ask the other to stop a presentation or campaign it reasonably considers non-compliant, and the other side will act promptly.

## 5. Brand use

Each party grants the other a limited, non-exclusive, revocable right to use its name and logo solely to identify the cooperation and the listed products, following any brand guidelines provided. No other rights are transferred.

## 6. Payments and reporting

Fees, where they apply, are set in the individual agreement or network terms. Unless agreed otherwise, we invoice monthly in euros for the previous month based on the partner's or network's validated figures, payable within 30 days. Either side may request a monthly summary of clicks, leads or conversions.

## 7. Confidentiality

Commercial terms, non-public data and reports exchanged between us are confidential and used only for the cooperation, unless disclosure is required by law.

## 8. Start and end

Cooperation under these terms can start with a simple email confirmation. Either side can end it at any time with **30 days' written notice** (email is enough), or immediately for a material breach not remedied within 10 days of notice. Fees earned before the end remain payable.

## 9. Liability

Neither party is liable to the other for indirect or consequential loss. Each party's total liability under these terms is limited to the fees paid or payable under them in the 12 months before the claim, except for breaches of confidentiality or data protection obligations, intent or gross negligence.

## 10. Governing law

Unless an individual agreement or network terms say otherwise, these terms are governed by the laws of the Republic of Türkiye, and both sides will first try to resolve any dispute through good-faith discussion.

## 11. Contact

Partnerships: **info@nordicrate.com** — or use the form on our [For Partners](/partners) page.`;

const CORRECTIONS = String.raw`# Corrections & Right of Reply

Last updated: 15 September 2026

A comparison site is only useful if it is right. If you see a wrong rate, fee, product detail or statement on NordicRate, tell us.

## Who can report

- **Users** — anything that looks wrong or out of date.
- **Institutions** — anything about your own products or company, including how you are described in articles.

## How to report

Email **info@nordicrate.com** with the subject **"Correction"** and include:

1. The page URL on NordicRate
2. What is wrong and what it should say
3. A link to the official source (for institutions: your product page, price list or press release)

## What happens next

- We acknowledge your message within **1 business day**.
- Verified errors are corrected within **2 business days**, and we reply to confirm.
- If we disagree, we explain why. Institutions may ask us to add a short, factual statement of their position to an article (right of reply).
- Material corrections to articles and reports are noted at the end of the article with the date of the change.

## Logo and listing requests

Requests to update or remove a logo, or to remove a listing, are handled under our [Listing & Data Policy](/listing-policy).`;

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    description: 'How NordicRate collects, uses and protects your personal data under the GDPR.',
    md: PRIVACY,
  },
  {
    slug: 'terms',
    title: 'Terms of Use',
    description: 'The terms governing your use of NordicRate, an independent loan comparison service.',
    md: TERMS,
  },
  {
    slug: 'cookies',
    title: 'Cookie Policy',
    description: 'The cookies and browser storage nordicrate.com uses, and how to withdraw consent.',
    md: COOKIES,
  },
  {
    slug: 'imprint',
    title: 'Imprint & Contact',
    description: 'Operator information and contact details for nordicrate.com.',
    md: IMPRINT,
  },
  {
    slug: 'listing-policy',
    title: 'Listing & Data Policy',
    description: 'How banks and insurers are listed on NordicRate, where our data comes from, how products are ordered and how to request corrections.',
    md: LISTING,
  },
  {
    slug: 'partner-terms',
    title: 'Partner Terms',
    description: 'How NordicRate works with banks, insurers, affiliate networks and comparison partners: referral, leads, data, tracking and termination.',
    md: PARTNER_TERMS,
  },
  {
    slug: 'corrections',
    title: 'Corrections & Right of Reply',
    description: 'Report a wrong rate or detail on NordicRate. Verified errors are corrected within 2 business days.',
    md: CORRECTIONS,
  },
];

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((d) => d.slug === slug);
}

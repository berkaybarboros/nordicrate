/**
 * lib/legal-content.ts — Hukuk sayfaları (EN)
 * Kaynak: legal-advisor taslağı 2026-07-27. [PLACEHOLDER]/[REVIEW]/[ADJUST]
 * işaretleri BİLİNÇLİ görünür — kurucu doldurmadan launch edilmemeli
 * (bkz. docs/legal/founder-checklist.md).
 */

export interface LegalDoc {
  slug: string;
  title: string;
  description: string;
  md: string;
}

const PRIVACY = String.raw`# Privacy Policy

Last updated: 27 July 2026

## 1. Who we are

NordicRate ("we", "us") is an independent loan and insurance comparison website operated as a sole proprietorship registered in Turkey by Berkay Barboros [PLACEHOLDER: registered trade name and address as shown in the Turkish trade registry]. We are the data controller for personal data processed through nordicrate.com.

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
- **Purpose:** responding to partnership enquiries (contact: partners@nordicrate.com).
- **Legal basis:** legitimate interest / pre-contractual steps (Art. 6(1)(b) and (f)).

### e) Outbound affiliate link clicks (/go redirects)

- **Data:** session identifier, product identifier, timestamp. No name or email is logged.
- **Purpose:** click attribution for referral commissions and abuse prevention.
- **Legal basis:** legitimate interest (Art. 6(1)(f)) in operating and funding a free comparison service.

### f) Analytics

- **Data:** usage statistics via Google Tag Manager and Google Analytics 4.
- **Consent-gated:** analytics runs only after you accept it in our consent banner. We use Google Consent Mode v2 with analytics storage denied by default. No analytics cookies are set before consent.
- **Legal basis:** consent (Art. 6(1)(a)); ePrivacy Directive rules on cookies.

### g) Security and server logs

- **Data:** IP address, request metadata, rate-limiting counters.
- **Purpose:** security, abuse prevention, service integrity.
- **Legal basis:** legitimate interest (Art. 6(1)(f)).

### h) Optional account (Supabase Auth)

- **Data:** email and authentication credentials, only if you choose to sign up.
- **Legal basis:** performance of a contract.

We do not process special categories of data, and the service is not directed at children under 16.

## 3. Processors and recipients

We use the following processors under data processing agreements: Supabase (database/auth, EU), Google (GTM/GA4, consent-gated analytics, EU/US), Groq, Inc. (AI chat responses, US), Cloudflare (CDN/security, global), Hetzner Online GmbH (server hosting, Germany/EU).

We also use Google Gemini for internal content automation; **no user personal data** is sent to Gemini.

We do **not sell personal data** and do not share it with data brokers. When you click an affiliate link, you leave our site and the destination bank or affiliate network (e.g., Awin, Adtraction) processes your data as an independent controller under its own privacy policy.

## 4. International transfers

Some processors (Google, Groq, Cloudflare) may process data in the United States. Where this occurs, transfers are safeguarded by the EU–US Data Privacy Framework (where the processor is certified) and/or the European Commission's Standard Contractual Clauses (SCCs). Core user data storage (Supabase, Hetzner) remains in the EU.

[REVIEW: operator is established in Turkey; there is no EU adequacy decision for Turkey — administrative access to EU user data by the controller should be covered by SCCs or equivalent safeguards.]

## 5. Retention

- Rate-alert signups: until you unsubscribe, then deleted within 30 days [ADJUST]
- "Find my best rate" submissions with email: 12 months from last activity [ADJUST]
- AI chat lead data: 12 months [ADJUST]; chat history is stored only in your browser (localStorage) unless a lead form is submitted
- Affiliate click logs: 13 months (attribution windows) [ADJUST]
- B2B contact enquiries: 24 months [ADJUST]
- Security/server logs: 90 days [ADJUST]
- Analytics (GA4): 14 months (Google default) [ADJUST]

## 6. Your rights

Under the GDPR you have the right to access, rectify, erase, restrict, and port your personal data, to object to processing based on legitimate interest, and to withdraw consent at any time (without affecting prior processing). Analytics consent can be withdrawn via the cookie banner (see our [Cookie Policy](/cookies)).

To exercise any right, email **info@nordicrate.com**. We respond within one month. We may need to verify your identity.

You also have the right to lodge a complaint with your local EU supervisory authority — for example, the Estonian Data Protection Inspectorate (Andmekaitse Inspektsioon, www.aki.ee) if you are in Estonia, or the Finnish Data Protection Ombudsman (tietosuoja.fi) if you are in Finland.

## 7. Changes

We will update this policy when our processing changes and revise the "Last updated" date. Material changes affecting registered users will be notified by email or site notice.`;

const TERMS = String.raw`# Terms of Use

Last updated: 27 July 2026

## 1. Who we are and what NordicRate is

NordicRate (nordicrate.com) is operated by Berkay Barboros, a sole proprietorship registered in Turkey [PLACEHOLDER: registered trade name and address]. Contact: info@nordicrate.com.

NordicRate is an **independent comparison website** for loans, mortgages, business financing, insurance and related financial products in the Nordic and Baltic countries. We are **not a bank, lender, insurer, credit intermediary or licensed broker**. We do not grant credit, arrange contracts, or act on behalf of any financial institution. By using the site you accept these Terms.

## 2. Information only — not advice, not an offer

- All content, comparisons, calculators, and AI assistant responses are **general information only**. Nothing on this site constitutes financial, investment, legal or tax advice, a personal recommendation, or an offer to enter into any contract.
- Any loan, mortgage or insurance agreement is concluded **exclusively between you and the relevant financial institution**, on that institution's terms and subject to its own assessment and approval.
- The AI assistant produces automated informational output. It may be inaccurate or incomplete and must not be relied on as advice.

## 3. Accuracy of rates and data

Rates, fees, and product details are collected daily from institutions' public websites and displayed with timestamps. They are **indicative only** and may be outdated, incomplete or inaccurate at any time. **Always verify current rates, terms, and eligibility directly with the institution before applying.** Actual rates offered to you depend on the institution's individual assessment.

## 4. Affiliate disclosure

We may receive referral commissions from banks, insurers, or affiliate networks (such as Awin or Adtraction) when you click outbound links or apply via our site. Commissions do not change the price you pay. Compensation may influence which products are displayed or highlighted (promoted placements are labelled), but does not alter the underlying rate data we display. We do not compare every product available on the market.

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

These Terms are governed by the laws of [REVIEW WITH LAWYER: governing-law choice — operator is a Turkish sole proprietorship serving EU consumers; under Rome I / EU consumer-protection rules, EU consumers may retain the protection of mandatory provisions of their home law and may sue in their home courts regardless of this clause].

If you are an EU consumer, you may also use the European Commission's Online Dispute Resolution platform: https://ec.europa.eu/consumers/odr

## 10. Changes to these Terms

We may update these Terms at any time; the current version is always available on this page with its "Last updated" date. Continued use after changes constitutes acceptance.

## 11. Contact

General: info@nordicrate.com — Partnerships: partners@nordicrate.com`;

const COOKIES = String.raw`# Cookie Policy

Last updated: 27 July 2026

This policy explains how nordicrate.com uses cookies and similar browser storage. It supplements our [Privacy Policy](/privacy).

## 1. Consent

When you first visit, our consent banner asks for your choice. **Statistics cookies are not set until you consent.** We use Google Consent Mode v2 with analytics storage denied by default. Strictly necessary storage does not require consent.

## 2. Cookies and storage we use

| Name | Provider | Purpose | Duration | Category |
|---|---|---|---|---|
| _ga | Google (GA4 via Google Tag Manager) | Distinguishes visitors for aggregate usage statistics | 13 months | Statistics (consent required) |
| _ga_* | Google (GA4 via GTM) | Maintains session state for analytics | 13 months | Statistics (consent required) |
| Google Tag Manager | Google | Loads analytics tags only after consent; sets no tracking cookies itself | Session | Statistics infrastructure (consent-gated) |
| Supabase auth token (sb-*) | Supabase (EU) | Keeps you signed in — set **only if you create an account and log in** | Session / up to 7 days [ADJUST] | Strictly necessary |
| Consent choice | NordicRate (localStorage) | Remembers your cookie banner choice | Until cleared | Strictly necessary |
| Chat history | NordicRate (localStorage) | Preserves your AI chat conversation in your browser only — never transmitted to our servers as stored | Until cleared | Functional (local-only) |
| Calculator / UI preferences | NordicRate (localStorage) | Remembers calculator inputs and interface settings in your browser only | Until cleared | Functional (local-only) |

localStorage entries are not cookies: they stay on your device and are not automatically sent to any server.

## 3. Withdrawing consent

You can change or withdraw your consent at any time by reopening the consent banner via the **"Cookie settings"** link in the site footer. Withdrawal stops future analytics; already-set Google cookies can be removed via your browser.

## 4. Browser controls

All major browsers let you block or delete cookies and clear localStorage (typically under Settings → Privacy → Site data). Blocking strictly necessary storage may break login and the consent banner memory.

## 5. Changes

We will update this page and the table above whenever cookies change.

Questions: info@nordicrate.com`;

const IMPRINT = String.raw`# Imprint & Contact

Last updated: 27 July 2026

**Service:** NordicRate — independent loan and insurance comparison platform (nordicrate.com)

**Operator:** Berkay Barboros, sole proprietorship registered in Turkey

[PLACEHOLDER — REQUIRED BEFORE PUBLIC LAUNCH: registered business address]

[PLACEHOLDER: Turkish tax/trade registry identification number, if legally required to display]

**Contact:**

- General enquiries and privacy requests: info@nordicrate.com
- Partnerships and B2B: partners@nordicrate.com

**Responsible for content:** Berkay Barboros

**Regulatory status:** NordicRate is not a bank, lender, insurer, or licensed credit intermediary. We provide comparison information only and may receive affiliate commissions from linked institutions. See our [Terms of Use](/terms).

**EU Online Dispute Resolution:** If you are an EU consumer, you may use the European Commission's ODR platform: https://ec.europa.eu/consumers/odr [REVIEW: verify the ODR platform's current status before public launch]`;

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
];

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((d) => d.slug === slug);
}

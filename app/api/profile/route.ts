import type { UserProfile } from '@/lib/profile';
import type { CorporateProfile } from '@/lib/corporate-profile';

export const runtime = 'nodejs';

const PERSONAL_EXTRACT_PROMPT = `Extract financial profile from the conversation. Return ONLY valid JSON, no explanation.

Fields to extract (omit if not mentioned):
- monthlyIncome: number (EUR/month net income)
- loanAmount: number (EUR, requested loan)
- loanTermMonths: number (loan duration in months)
- loanType: "personal" | "mortgage" | "business" | "auto" | "student"
- country: ISO code ("EE", "FI", "NO", "SE", "DK", "IS", "LV", "LT")
- employmentType: "employed" | "self_employed" | "freelancer" | "student" | "unemployed"
- isResident: boolean (true if lives in target country)
- hasCollateral: boolean
- existingMonthlyDebt: number (EUR existing monthly debt payments)

Return {} if no financial info found.`;

const CORPORATE_EXTRACT_PROMPT = `Extract business/corporate profile from the conversation. Return ONLY valid JSON, no explanation.

Fields to extract (omit if not mentioned):
- businessStage: "idea" | "startup" | "growth" | "established"
- country: ISO code ("EE", "FI", "NO", "SE", "DK", "IS", "LV", "LT")
- employeeCount: number (current team/employee count)
- annualRevenue: number (EUR annual revenue, e.g. 120000 for €120K/year)
- fundingNeeded: number (EUR amount needed, e.g. 50000 for €50K)
- sector: "tech" | "fintech" | "saas" | "ecommerce" | "manufacturing" | "services" | "agriculture" | "tourism" | "other"
- isEResident: boolean (has or wants Estonian e-Residency)
- isDigitalNomad: boolean (location-independent / remote-first business)
- hasCollateral: boolean
- needsExportFinancing: boolean
- needsRdFunding: boolean (needs R&D or innovation funding)
- companyAge: number (years in operation, e.g. 2 for a 2-year-old company)

Return {} if no relevant business info found.`;

export async function POST(req: Request) {
  try {
    const { messages, mode = 'personal' } = await req.json();
    if (!messages || messages.length === 0) return Response.json({});

    const extractPrompt = mode === 'corporate' ? CORPORATE_EXTRACT_PROMPT : PERSONAL_EXTRACT_PROMPT;
    const recent = messages.slice(-8);
    const conversation = recent
      .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
      .join('\n');

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 256,
        temperature: 0,
        messages: [
          { role: 'system', content: extractPrompt },
          { role: 'user', content: conversation },
        ],
      }),
    });

    if (!res.ok) return Response.json({});

    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return Response.json({});

    const extracted: UserProfile | CorporateProfile = JSON.parse(jsonMatch[0]);
    return Response.json(extracted);
  } catch {
    return Response.json({});
  }
}

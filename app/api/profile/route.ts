import type { UserProfile } from '@/lib/profile';

export const runtime = 'nodejs';

const EXTRACT_PROMPT = `Extract financial profile from the conversation. Return ONLY valid JSON, no explanation.

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

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    if (!messages || messages.length === 0) {
      return Response.json({});
    }

    // Only use last 8 messages to keep context focused
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
          { role: 'system', content: EXTRACT_PROMPT },
          { role: 'user', content: conversation },
        ],
      }),
    });

    if (!res.ok) return Response.json({});

    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? '{}';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return Response.json({});

    const profile: UserProfile = JSON.parse(jsonMatch[0]);
    return Response.json(profile);
  } catch {
    return Response.json({});
  }
}

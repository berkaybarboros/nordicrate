import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';
import { buildUTMLink } from '@/lib/utils';

// Product catalogs
import { personalLoans, mortgageLoans, carLoans } from '@/data/loans';
import {
  motorInsurance, cascoInsurance, homeInsurance, healthInsurance,
} from '@/data/insurance';

// ─── Product lookup ─────────────────────────────────────────────────────────────
function getProducts(productType: string) {
  switch (productType) {
    case 'personal':  return personalLoans.map(p => ({ ...p, category: 'loan' }));
    case 'mortgage':  return mortgageLoans.map(p => ({ ...p, category: 'loan' }));
    case 'car':       return carLoans.map(p => ({ ...p, category: 'loan' }));
    case 'business':  return personalLoans.map(p => ({ ...p, category: 'loan' })); // fallback to personal
    case 'motor':     return motorInsurance.map(p => ({ ...p, category: 'insurance' }));
    case 'casco':     return cascoInsurance.map(p => ({ ...p, category: 'insurance' }));
    case 'home':      return homeInsurance.map(p => ({ ...p, category: 'insurance' }));
    case 'health':    return healthInsurance.map(p => ({ ...p, category: 'insurance' }));
    default:          return [];
  }
}

// ─── POST /api/find-rate ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      productType: string;
      country?: string;
      amount?: number;
      termMonths?: number;
      monthlyIncome?: number;
      email?: string;
      sessionId: string;
    };

    const { productType, country, amount, termMonths, monthlyIncome, email, sessionId } = body;

    if (!productType || !sessionId) {
      return NextResponse.json({ error: 'productType and sessionId required' }, { status: 400 });
    }

    const products = getProducts(productType);
    if (products.length === 0) {
      return NextResponse.json({ error: 'Unknown product type' }, { status: 400 });
    }

    // ─── Build product catalog text for AI ──────────────────────────────────────
    const isInsurance = ['motor', 'casco', 'home', 'health'].includes(productType);
    const isLoan      = ['personal', 'mortgage', 'car', 'business'].includes(productType);

    const catalogText = products.map((p, i) => {
      if (isInsurance) {
        const ins = p as typeof motorInsurance[number];
        return `${i + 1}. ${ins.companyName} — Annual premium: €${ins.annualPremiumMin}–€${ins.annualPremiumMax} (rep: €${ins.representativePremium}), Excess: €${ins.excess}, Features: ${ins.features.join(', ')}`;
      } else {
        const loan = p as typeof personalLoans[number];
        return `${i + 1}. ${loan.bankName} — Rate: ${loan.interestRateMin}%–${loan.interestRateMax}% (rep: ${loan.representativeRate}%), Amount: €${loan.minAmount}–€${loan.maxAmount}, Term: ${loan.minTermMonths}–${loan.maxTermMonths}mo, Fee: €${loan.fee}, Processing: ${loan.processingTime}`;
      }
    }).join('\n');

    // ─── User context text ───────────────────────────────────────────────────────
    const userCtx = [
      country        && `Country: ${country}`,
      amount         && `Requested amount: €${amount.toLocaleString()}`,
      termMonths     && `Desired term: ${termMonths} months`,
      monthlyIncome  && `Monthly income: €${monthlyIncome.toLocaleString()}`,
    ].filter(Boolean).join(', ') || 'No specific requirements provided';

    const systemPrompt = `You are a financial advisor for NordicRate, a Nordic & Baltic financial comparison platform.
Your task: analyze ${products.length} ${productType} products and recommend exactly the TOP 3 best matches for this user.

User context: ${userCtx}

Available products:
${catalogText}

Respond with ONLY valid JSON (no markdown, no explanation outside JSON):
{
  "summary": "2-3 sentence personalized summary of the market situation and why these are the best picks",
  "recommendations": [
    {
      "rank": 1,
      "productIndex": <0-based index from list above>,
      "whyThis": "1-2 sentences specific to this user's situation"
    },
    { "rank": 2, "productIndex": ..., "whyThis": "..." },
    { "rank": 3, "productIndex": ..., "whyThis": "..." }
  ]
}`;

    // ─── Groq call (non-streaming, JSON mode) ────────────────────────────────────
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Give me the top 3 recommendations.' },
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      }),
    });

    if (!groqRes.ok) throw new Error(`Groq API error: ${groqRes.status}`);
    const groqData = await groqRes.json() as { choices: { message: { content: string } }[] };
    const raw = groqData.choices[0]?.message?.content ?? '{}';
    let parsed: {
      summary?: string;
      recommendations?: { rank: number; productIndex: number; whyThis: string }[];
    } = {};
    try { parsed = JSON.parse(raw); } catch { /* fallback below */ }

    const aiSummary = parsed.summary ?? 'Here are our top picks based on your requirements.';
    const recs      = parsed.recommendations ?? [];

    // ─── Build recommendation objects ────────────────────────────────────────────
    const recommendations = recs
      .filter(r => r.productIndex >= 0 && r.productIndex < products.length)
      .map(r => {
        const p = products[r.productIndex];
        if (isInsurance) {
          const ins = p as typeof motorInsurance[number];
          return {
            rank:          r.rank,
            productId:     ins.id,
            name:          ins.companyName,
            logo:          ins.companyLogo,
            badge:         ins.badge ?? null,
            annualPremium: ins.representativePremium,
            excess:        ins.excess,
            features:      ins.features.slice(0, 3),
            whyThis:       r.whyThis,
            applyUrl:      buildUTMLink(ins.applyUrl, ins.companyId, `insurance-${ins.type}-findrate`),
          };
        } else {
          const loan = p as typeof personalLoans[number];
          return {
            rank:              r.rank,
            productId:         loan.id,
            name:              loan.bankName,
            logo:              loan.bankLogo,
            badge:             loan.badge ?? null,
            representativeRate: loan.representativeRate,
            processingTime:    loan.processingTime,
            features:          loan.features.slice(0, 3),
            whyThis:           r.whyThis,
            applyUrl:          buildUTMLink(loan.applyUrl, loan.bankId, `${loan.type}-findrate`),
          };
        }
      });

    // ─── Save lead to Supabase ───────────────────────────────────────────────────
    let leadId: string | null = null;
    try {
      const supabase = await createSupabaseServer();
      const { data: { user } } = await supabase.auth.getUser();

      const { data: lead } = await supabase
        .from('leads')
        .insert({
          session_id:        sessionId,
          user_id:           user?.id ?? null,
          email:             email ?? null,
          product_type:      productType,
          country:           country ?? null,
          amount:            amount ?? null,
          term_months:       termMonths ?? null,
          monthly_income:    monthlyIncome ?? null,
          ai_recommendations: recommendations,
          ai_summary:        aiSummary,
        })
        .select('id')
        .single();

      leadId = lead?.id ?? null;
    } catch (dbErr) {
      console.error('[find-rate] Supabase insert failed:', dbErr);
      // Don't fail the request — DB write is non-blocking for UX
    }

    return NextResponse.json({ leadId, recommendations, aiSummary });

  } catch (err) {
    console.error('[find-rate] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

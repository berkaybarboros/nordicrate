import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import { enforceRateLimit, isValidEmail, isValidSessionId, clampNumber } from '@/lib/security';
import { callGroq, MODEL_VERSION } from '@/lib/groq';

export const runtime = 'nodejs';
import { logoFromBankId, monogram } from '@/lib/logos';

// Product catalogs
import { personalLoans, mortgageLoans, carLoans } from '@/data/loans';
import { describeFee, loanCost } from '@/lib/loan-cost';
import { withLiveRates } from '@/lib/live-loan-offers';
import {
  motorInsurance, cascoInsurance, homeInsurance, healthInsurance,
} from '@/data/insurance';

// ─── Product lookup ─────────────────────────────────────────────────────────────
// Kredi teklifleri canlı oranla gelir (lib/live-loan-offers) — AI önerisi statik
// katalogdan eski oranı önermesin.
async function getProducts(productType: string) {
  switch (productType) {
    case 'personal':  return (await withLiveRates(personalLoans)).map(p => ({ ...p, category: 'loan' }));
    case 'mortgage':  return (await withLiveRates(mortgageLoans)).map(p => ({ ...p, category: 'loan' }));
    case 'car':       return (await withLiveRates(carLoans)).map(p => ({ ...p, category: 'loan' }));
    case 'business':  return (await withLiveRates(personalLoans)).map(p => ({ ...p, category: 'loan' })); // fallback to personal
    case 'motor':     return motorInsurance.map(p => ({ ...p, category: 'insurance' }));
    case 'casco':     return cascoInsurance.map(p => ({ ...p, category: 'insurance' }));
    case 'home':      return homeInsurance.map(p => ({ ...p, category: 'insurance' }));
    case 'health':    return healthInsurance.map(p => ({ ...p, category: 'insurance' }));
    default:          return [];
  }
}

// ─── Ranking without the AI ─────────────────────────────────────────────────────
// 2026-11-01: Groq retired the model this route named, so the AI call answered
// 404, the route threw, and "Find your best rate" returned "Internal server
// error" to everyone who clicked it. Ranking cheapest-first needs no model at
// all — the AI only ever wrote the prose around it. So when the model is
// unavailable the picks still come back, with the summary saying plainly that
// they are ordered by cost rather than explained.
function rankByCost(
  products: { category: string }[],
  isInsurance: boolean,
  amount: number | undefined,
  termMonths: number | undefined,
): { rank: number; productIndex: number; whyThis: string }[] {
  const scored = products.map((p, productIndex) => {
    if (isInsurance) {
      const ins = p as unknown as typeof motorInsurance[number];
      return { productIndex, score: ins.representativePremium, eligible: true };
    }
    const loan = p as unknown as typeof personalLoans[number];
    // Ranking has to use the same amount and term the visitor asked for: a fee
    // of €100 is nothing on €100k and a fifth of the cost on a €2k loan.
    const amt = amount && amount > 0 ? amount : loan.minAmount;
    const months = termMonths && termMonths > 0 ? termMonths : loan.minTermMonths;
    const eligible =
      (!amount || (amount >= loan.minAmount && amount <= loan.maxAmount)) &&
      (!termMonths || (termMonths >= loan.minTermMonths && termMonths <= loan.maxTermMonths));
    return { productIndex, score: loanCost(loan, amt, months).apr, eligible };
  });

  // An offer whose limits exclude the request is kept, but behind every offer
  // that fits — better than showing nothing when nothing fits exactly.
  return scored
    .sort((a, b) => Number(b.eligible) - Number(a.eligible) || a.score - b.score)
    .slice(0, 3)
    .map((s, i) => ({
      rank: i + 1,
      productIndex: s.productIndex,
      // Rank-aware: only the first pick is the cheapest, and saying "lowest" on
      // all three would be a claim the ranking does not support.
      whyThis: isInsurance
        ? i === 0
          ? 'Lowest example premium among the insurers we list for this cover.'
          : `${i === 1 ? 'Second' : 'Third'}-lowest example premium among the insurers we list.`
        : s.eligible
          ? `${i === 0 ? 'Lowest' : i === 1 ? 'Second-lowest' : 'Third-lowest'} total cost for €${(amount ?? 0).toLocaleString()} over ${termMonths ?? 0} months, fees included.`
          : 'Among the cheapest we list, though its limits do not cover the amount or term you entered.',
    }));
}

// ─── POST /api/find-rate ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // 10 istek/dk/IP — Groq + DB insert maliyeti
    const limited = enforceRateLimit(req, 'find-rate', 10);
    if (limited) return limited;

    const body = await req.json() as {
      productType: string;
      country?: string;
      amount?: number;
      termMonths?: number;
      monthlyIncome?: number;
      email?: string;
      sessionId: string;
    };

    const { productType, country, email, sessionId } = body;

    if (!productType || !isValidSessionId(sessionId)) {
      return NextResponse.json({ error: 'productType and sessionId required' }, { status: 400 });
    }
    if (email !== undefined && email !== null && email !== '' && !isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    if (country !== undefined && (typeof country !== 'string' || country.length > 4)) {
      return NextResponse.json({ error: 'Invalid country' }, { status: 400 });
    }

    const amount        = clampNumber(body.amount, 0, 10_000_000);
    const termMonths    = clampNumber(body.termMonths, 1, 480);
    const monthlyIncome = clampNumber(body.monthlyIncome, 0, 1_000_000);

    const products = await getProducts(productType);
    if (products.length === 0) {
      return NextResponse.json({ error: 'Unknown product type' }, { status: 400 });
    }

    // ─── Build product catalog text for AI ──────────────────────────────────────
    const isInsurance = ['motor', 'casco', 'home', 'health'].includes(productType);

    const catalogText = products.map((p, i) => {
      if (isInsurance) {
        const ins = p as typeof motorInsurance[number];
        return `${i + 1}. ${ins.companyName} — Example annual premium for a typical profile (not a quote): €${ins.annualPremiumMin}–€${ins.annualPremiumMax} (example: €${ins.representativePremium}), Excess: €${ins.excess}, Features: ${ins.features.join(', ')}`;
      } else {
        const loan = p as typeof personalLoans[number];
        return `${i + 1}. ${loan.bankName} — Rate: ${loan.interestRateMin}%–${loan.interestRateMax}% (rep: ${loan.representativeRate}%), Amount: €${loan.minAmount}–€${loan.maxAmount}, Term: ${loan.minTermMonths}–${loan.maxTermMonths}mo, Fees: ${describeFee(loan) ?? 'not confirmed — check with bank'}, Processing: ${loan.processingTime || 'not stated'}`;
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
${isInsurance ? '\nInsurance premiums above are examples for a typical profile, not quotes. Never present them as the user\'s price; say the insurer gives the actual quote.\n' : ''}
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
    const groqRes = await callGroq('find-rate', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Give me the top 3 recommendations.' },
      ],
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    let parsed: {
      summary?: string;
      recommendations?: { rank: number; productIndex: number; whyThis: string }[];
    } = {};
    if (groqRes.ok) {
      const groqData = await groqRes.json() as { choices: { message: { content: string } }[] };
      try { parsed = JSON.parse(groqData.choices[0]?.message?.content ?? '{}'); } catch { /* ranked below */ }
    } else {
      console.error(`[find-rate] Groq unavailable (${groqRes.status}) — ranking by cost instead`);
    }

    const aiRecs = parsed.recommendations ?? [];
    const usedAI = aiRecs.length > 0;
    const recs = usedAI ? aiRecs : rankByCost(products, isInsurance, amount, termMonths);

    const aiSummary = usedAI
      ? parsed.summary ?? 'Here are our top picks based on your requirements.'
      : isInsurance
        ? 'Ranked by example premium for a typical profile — the insurer gives your actual quote. Personalised commentary is unavailable right now.'
        : 'Ranked by total cost over the amount and term you entered, fees included. Personalised commentary is unavailable right now.';

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
            logo:          logoFromBankId(ins.companyId),   // lokal webp path | null
            mono:          monogram(ins.companyName),
            badge:         ins.badge ?? null,
            annualPremium: ins.representativePremium,
            excess:        ins.excess,
            features:      ins.features.slice(0, 3),
            whyThis:       r.whyThis,
            applyUrl:      ins.applyUrl, // UTM'ler /go gateway'inde eklenir (rule set v1)
          };
        } else {
          const loan = p as typeof personalLoans[number];
          return {
            rank:              r.rank,
            productId:         loan.id,
            name:              loan.bankName,
            logo:              logoFromBankId(loan.bankId),   // lokal webp path | null
            mono:              monogram(loan.bankName),
            badge:             loan.badge ?? null,
            representativeRate: loan.representativeRate,
            processingTime:    loan.processingTime || undefined,
            features:          loan.features.slice(0, 3),
            whyThis:           r.whyThis,
            applyUrl:          loan.applyUrl, // UTM'ler /go gateway'inde eklenir (rule set v1)
          };
        }
      });

    // ─── Save lead + model_outputs to Supabase ──────────────────────────────────
    let leadId: string | null = null;
    try {
      const supabase = await createSupabaseServer();
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Insert lead
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

      // 2. Insert model_outputs row (one per lead — recommendations as JSONB)
      if (leadId && recommendations.length > 0) {
        await supabase.from('model_outputs').insert({
          session_id:     sessionId,
          user_id:        user?.id ?? null,
          lead_id:        leadId,
          product_type:   productType,
          model_version:  usedAI ? MODEL_VERSION : 'cost-ranking-fallback',
          recommendations: recommendations.map(r => ({
            rank:        r.rank,
            product_id:  r.productId,
            name:        r.name,
            why_this:    r.whyThis,
          })),
          clicked_rank:   null,
          clicked_product: null,
          converted:      false,
        });
      }
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

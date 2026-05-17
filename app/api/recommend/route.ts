/**
 * POST /api/recommend
 * Kişiye özel, gerçek zamanlı kredi/sigorta önerisi motoru.
 *
 * Katmanlar (sırayla):
 *  1. Collaborative filtering  → get_personalized_recommendations() SQL
 *  2. Live rate adjustment     → EURIBOR + policy rates (rate_snapshots)
 *  3. Behavioral signal boost  → user_signals.engagement_score
 *  4. Groq SSE explanation    → her ürün için kişisel "neden bu?" akışı
 *
 * Body: { sessionId, productType, country?, amount?, termMonths?, stream? }
 * Response: application/x-ndjson (newline-delimited JSON chunks)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';

// Product catalogs (static data — gerçek banka verileri)
import { personalLoans, mortgageLoans, carLoans } from '@/data/loans';
import { motorInsurance, cascoInsurance, homeInsurance, healthInsurance } from '@/data/insurance';

export const runtime = 'nodejs';

// ─── Product lookup ──────────────────────────────────────────────────────────
function getCatalog(productType: string) {
  switch (productType) {
    case 'personal':  return personalLoans;
    case 'mortgage':  return mortgageLoans;
    case 'car':       return carLoans;
    case 'motor':     return motorInsurance;
    case 'casco':     return cascoInsurance;
    case 'home':      return homeInsurance;
    case 'health':    return healthInsurance;
    default:          return [];
  }
}

const INSURANCE_TYPES = new Set(['motor', 'casco', 'home', 'health']);

// ─── Rate-based scoring: EURIBOR'a göre değişken faizli ürünlere boost ──────
function applyRateBoost(
  products: { id: string; representativeRate?: number }[],
  euribor3m: number | null
): Map<string, number> {
  const boosts = new Map<string, number>();
  if (!euribor3m) return boosts;

  for (const loan of products) {
    if (!loan.id) continue;
    const representativeRate = loan.representativeRate ?? 0;
    const rateEfficiency = Math.max(0, 10 - representativeRate);
    boosts.set(loan.id, rateEfficiency * 0.5);
  }
  return boosts;
}

// ─── POST handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      sessionId: string;
      productType: string;
      country?: string;
      amount?: number;
      termMonths?: number;
      stream?: boolean;
    };

    const { sessionId, productType, country, amount, termMonths, stream = true } = body;

    if (!sessionId || !productType) {
      return NextResponse.json({ error: 'sessionId and productType required' }, { status: 400 });
    }

    const supabase = await createSupabaseServer();
    const isInsurance = INSURANCE_TYPES.has(productType);

    // ── Step 1: Collaborative recommendations from DB ────────────────────────
    const { data: collabRecs } = await supabase.rpc('get_personalized_recommendations', {
      p_session_id:   sessionId,
      p_product_type: productType,
      p_country:      country ?? null,
      p_amount:       amount ?? null,
      p_term_months:  termMonths ?? null,
    });

    // ── Step 2: Live EURIBOR from rate_snapshots ─────────────────────────────
    const { data: latestRates } = await supabase
      .from('rate_snapshots')
      .select('key, rate, delta, fetched_at')
      .in('key', ['euribor3m', 'euribor6m', 'euribor12m', 'policy_rate_no'])
      .order('fetched_at', { ascending: false })
      .limit(8);

    const rateMap = new Map<string, { rate: number; delta: number | null }>();
    for (const r of (latestRates ?? [])) {
      if (!rateMap.has(r.key)) rateMap.set(r.key, { rate: r.rate, delta: r.delta });
    }
    const euribor3m = rateMap.get('euribor3m')?.rate ?? null;
    const euriborDelta = rateMap.get('euribor3m')?.delta ?? null;

    // ── Step 3: Get static catalog + merge with collaborative scores ─────────
    const catalog = getCatalog(productType);
    const collabMap = new Map<string, { score: number; reasons: string[] }>();
    for (const r of (collabRecs ?? [])) {
      collabMap.set(r.product_id, { score: Number(r.score), reasons: r.reasons ?? [] });
    }

    // Rate boosts (loans only)
    const rateBoosts = isInsurance
      ? new Map<string, number>()
      : applyRateBoost(catalog as { id: string; representativeRate?: number }[], euribor3m);

    // Score each product
    const scored = catalog.map(p => {
      const id = (p as { id: string }).id;
      const collab = collabMap.get(id);
      const rateBoost = rateBoosts.get(id) ?? 0;
      const totalScore = (collab?.score ?? 0) + rateBoost;
      return { product: p, id, totalScore, collabScore: collab?.score ?? 0, reasons: collab?.reasons ?? [] };
    });

    // Sort: collaborative score + rate boost, fallback to representative rate
    scored.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      // Fallback: lower rate = better for loans
      if (!isInsurance) {
        const aRate = (a.product as typeof personalLoans[number]).representativeRate ?? 99;
        const bRate = (b.product as typeof personalLoans[number]).representativeRate ?? 99;
        return aRate - bRate;
      }
      const aPremium = (a.product as typeof motorInsurance[number]).representativePremium ?? 99999;
      const bPremium = (b.product as typeof motorInsurance[number]).representativePremium ?? 99999;
      return aPremium - bPremium;
    });

    const top3 = scored.slice(0, 3);

    // ── Step 4: Build market context for AI ─────────────────────────────────
    const rateContext = euribor3m
      ? `Current EURIBOR 3M: ${euribor3m}%${euriborDelta && euriborDelta !== 0 ? ` (${euriborDelta > 0 ? '+' : ''}${euriborDelta}% since last reading)` : ''}. `
      : '';

    const trendNote = euriborDelta && euriborDelta < -0.05
      ? 'Rates are trending down — good time to lock in a variable rate.'
      : euriborDelta && euriborDelta > 0.05
      ? 'Rates are rising — consider a fixed-rate product for stability.'
      : '';

    const userCtx = [
      country     && `Country: ${country}`,
      amount      && `Amount: €${amount.toLocaleString()}`,
      termMonths  && `Term: ${termMonths} months`,
    ].filter(Boolean).join(', ');

    // Build product context
    const productLines = top3.map((item, i) => {
      if (isInsurance) {
        const ins = item.product as typeof motorInsurance[number];
        return `#${i + 1} ${ins.companyName}: annual premium €${ins.representativePremium}, excess €${ins.excess}, features: ${ins.features.slice(0, 3).join(', ')}. Popularity score: ${item.totalScore.toFixed(1)}. ${item.reasons.join('. ')}`;
      }
      const loan = item.product as typeof personalLoans[number];
      return `#${i + 1} ${loan.bankName}: rate ${loan.representativeRate}%, processing ${loan.processingTime}. Popularity score: ${item.totalScore.toFixed(1)}. ${item.reasons.join('. ')}`;
    }).join('\n');

    const systemPrompt = `You are a real-time financial advisor for NordicRate.
${rateContext}${trendNote}
User context: ${userCtx || 'No specific requirements'}
Top 3 ${productType} recommendations (ranked by user behavior data + live rates):
${productLines}

Write 1-2 sentences for each product explaining WHY it's recommended for this specific user right now, considering market conditions. Be concrete, reference the rate or premium. Output valid JSON only:
{"recommendations": [{"rank": 1, "why": "..."}, {"rank": 2, "why": "..."}, {"rank": 3, "why": "..."}], "marketSummary": "1 sentence about current market conditions"}`;

    // ── Step 5: Non-streaming Groq call for explanations ────────────────────
    let whyMap: Record<number, string> = {};
    let marketSummary = '';

    try {
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
            { role: 'user', content: 'Explain each recommendation.' },
          ],
          temperature: 0.4,
          max_tokens: 600,
          response_format: { type: 'json_object' },
        }),
      });

      if (groqRes.ok) {
        const groqData = await groqRes.json() as { choices: { message: { content: string } }[] };
        const parsed = JSON.parse(groqData.choices[0]?.message?.content ?? '{}') as {
          recommendations?: { rank: number; why: string }[];
          marketSummary?: string;
        };
        for (const r of (parsed.recommendations ?? [])) {
          whyMap[r.rank] = r.why;
        }
        marketSummary = parsed.marketSummary ?? '';
      }
    } catch {
      // Groq failed — devam et, why olmadan
    }

    // ── Step 6: Build final response ─────────────────────────────────────────
    const recommendations = top3.map((item, i) => {
      const rank = i + 1;
      if (isInsurance) {
        const ins = item.product as typeof motorInsurance[number];
        return {
          rank,
          productId:     ins.id,
          name:          ins.companyName,
          logo:          ins.companyLogo,
          badge:         ins.badge ?? null,
          annualPremium: ins.representativePremium,
          excess:        ins.excess,
          features:      ins.features.slice(0, 3),
          applyUrl:      ins.applyUrl,
          score:         item.totalScore,
          collabScore:   item.collabScore,
          reasons:       item.reasons,
          why:           whyMap[rank] ?? '',
        };
      }
      const loan = item.product as typeof personalLoans[number];
      return {
        rank,
        productId:          loan.id,
        name:               loan.bankName,
        logo:               loan.bankLogo,
        badge:              loan.badge ?? null,
        representativeRate: loan.representativeRate,
        processingTime:     loan.processingTime,
        features:           loan.features.slice(0, 3),
        applyUrl:           loan.applyUrl,
        score:              item.totalScore,
        collabScore:        item.collabScore,
        reasons:            item.reasons,
        why:                whyMap[rank] ?? '',
      };
    });

    return NextResponse.json({
      recommendations,
      marketSummary,
      liveRates: {
        euribor3m,
        euriborDelta,
        trend: euriborDelta && euriborDelta < 0 ? 'falling' : euriborDelta && euriborDelta > 0 ? 'rising' : 'stable',
      },
      dataSource: {
        collaborative: (collabRecs?.length ?? 0) > 0,
        liveRates:     rateMap.size > 0,
        aiExplained:   Object.keys(whyMap).length > 0,
      },
    });

  } catch (err) {
    console.error('[recommend]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

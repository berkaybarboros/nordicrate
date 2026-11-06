/**
 * POST /api/alerts — rate-drop alert subscription.
 *
 * 2026-11: this answered `{"success":true,"message":"Alert saved."}` to every
 * subscriber while storing nothing. The insert went through the anon client and
 * Postgres refused it ("new row violates row-level security policy for table
 * rate_alerts"); the route logged that and acknowledged anyway, with the
 * comment "Don't fail the user request". rate_alerts held 0 rows, so every
 * signup since launch was lost and both the footer form and the modal told the
 * visitor it had worked.
 *
 * The write now goes through the service-role client, the way /api/demand and
 * /api/feedback do — a visitor subscribing is a server-side write, not
 * something the anon key should be able to do — and a failed write is reported
 * as one.
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { enforceRateLimit, isValidEmail } from "@/lib/security";

export const runtime = 'nodejs';

interface AlertPayload {
  email: string;
  product: string;
  targetRate?: number | null;
}

export async function POST(req: NextRequest) {
  try {
    // 5 istek/dk/IP — spam insert koruması
    const limited = enforceRateLimit(req, 'alerts', 5);
    if (limited) return limited;

    const body = (await req.json()) as AlertPayload;

    if (!isValidEmail(body.email)) {
      return NextResponse.json({ message: "Invalid email address." }, { status: 400 });
    }
    if (!body.product || typeof body.product !== "string" || body.product.length > 100) {
      return NextResponse.json({ message: "Product type is required." }, { status: 400 });
    }
    if (body.targetRate !== null && body.targetRate !== undefined) {
      const rate = Number(body.targetRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        return NextResponse.json({ message: "Rate must be between 0 and 100." }, { status: 400 });
      }
    }

    const supabase = createSupabaseAdmin();
    if (!supabase) {
      console.error("[Rate Alert] SUPABASE_SERVICE_ROLE_KEY missing — alert not stored");
      return NextResponse.json(
        { message: "We cannot save alerts right now. Please try again later." },
        { status: 503 },
      );
    }

    const { data, error } = await supabase
      .from('rate_alerts')
      .insert({
        email:     body.email,
        rate_key:  body.product,
        threshold: body.targetRate ?? 0,   // 0 = notify on any change
        direction: 'below',
        // user_id omitted: these subscriptions are anonymous by design.
      })
      .select('id')
      .single();

    if (error || !data?.id) {
      // Telling someone their alert is set when it is not means they wait for
      // an email that will never arrive and miss the rate drop they asked about.
      console.error("[Rate Alert] insert failed:", error?.message ?? 'no id returned');
      return NextResponse.json(
        { message: "We could not save your alert. Please try again." },
        { status: 503 },
      );
    }

    return NextResponse.json({ success: true, message: "Alert saved.", id: data.id });
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }
}

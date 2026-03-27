import { NextRequest, NextResponse } from "next/server";

interface AlertPayload {
  email: string;
  product: string;
  targetRate?: number | null;
}

// In-memory store (replace with DB in production: Prisma / Supabase / etc.)
const alerts: (AlertPayload & { id: string; createdAt: string })[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AlertPayload;

    // Basic validation
    if (!body.email || typeof body.email !== "string" || !body.email.includes("@")) {
      return NextResponse.json({ message: "Invalid email address." }, { status: 400 });
    }
    if (!body.product || typeof body.product !== "string") {
      return NextResponse.json({ message: "Product type is required." }, { status: 400 });
    }
    if (body.targetRate !== null && body.targetRate !== undefined) {
      const rate = Number(body.targetRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        return NextResponse.json({ message: "Rate must be between 0 and 100." }, { status: 400 });
      }
    }

    // Duplicate check (same email + product)
    const exists = alerts.find(
      (a) => a.email === body.email && a.product === body.product
    );
    if (exists) {
      // Update silently — no error, just acknowledge
      exists.targetRate = body.targetRate ?? null;
      return NextResponse.json({
        success: true,
        message: "Alert updated.",
        id: exists.id,
      });
    }

    const newAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      email: body.email,
      product: body.product,
      targetRate: body.targetRate ?? null,
      createdAt: new Date().toISOString(),
    };

    alerts.push(newAlert);

    // TODO (production): send confirmation email, persist to DB
    console.log("[Rate Alert] New subscription:", newAlert);

    return NextResponse.json({
      success: true,
      message: "Alert created.",
      id: newAlert.id,
    });
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }
}

export async function GET() {
  // Dev helper — remove in production or protect with auth
  return NextResponse.json({ total: alerts.length, alerts });
}

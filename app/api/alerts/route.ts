import { NextRequest, NextResponse } from "next/server";
import { createRateAlert } from "@/lib/db";

interface AlertPayload {
  email: string;
  product: string;
  targetRate?: number | null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AlertPayload;

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

    const { id, error } = await createRateAlert(
      body.email,
      body.product,
      body.targetRate,
    );

    if (error) {
      console.error("[Rate Alert] DB error:", error);
      // Don't fail the user request — log and acknowledge
    }

    return NextResponse.json({ success: true, message: "Alert saved.", id: id ?? null });
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }
}

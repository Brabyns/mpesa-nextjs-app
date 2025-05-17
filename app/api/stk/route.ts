import { NextRequest, NextResponse } from "next/server";
import { initiateSTKPush } from "@/lib/mpesa";

export async function POST(req: NextRequest) {
  const { phone, amount }: { phone: string; amount: number } = await req.json();

  try {
    const result = await initiateSTKPush(phone, amount);
    return NextResponse.json({ message: "STK push initiated", data: result });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(errorMsg);
    return NextResponse.json(
      { error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}

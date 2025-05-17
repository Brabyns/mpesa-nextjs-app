import { NextRequest, NextResponse } from "next/server";
import { initiateSTKPush } from "@/lib/mpesa";

export async function POST(req: NextRequest) {
  const { phone, amount } = await req.json();

  try {
    function formatPhone(phone: string): string {
      if (phone.startsWith("07")) {
        return "254" + phone.slice(1);
      }
      return phone;
    }
    const result = await initiateSTKPush(phone, amount);
    return NextResponse.json({ message: "STK push initiated", data: result });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}

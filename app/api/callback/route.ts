import { NextRequest, NextResponse } from 'next/server';
import { safaricomIPs } from '@/lib/whitelist';
import pool from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  const body = await req.json();

  if (!safaricomIPs.includes(ip)) {
    fs.appendFileSync(path.join('logs', 'unauthorized.log'), `${new Date().toISOString()} | Blocked: ${ip}\n`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  const result = body.Body?.stkCallback;
  if (!result) return NextResponse.json({ error: 'Missing callback data' }, { status: 400 });

  const {
    MerchantRequestID,
    CheckoutRequestID,
    ResultCode,
    ResultDesc,
    CallbackMetadata,
  } = result;

type CallbackItem = {
  Name: string;
  Value: string | number;
};

const items = CallbackMetadata?.Item as CallbackItem[] | undefined;

const Amount = items?.find(i => i.Name === 'Amount')?.Value || 0;
const MpesaReceiptNumber = items?.find(i => i.Name === 'MpesaReceiptNumber')?.Value || '';
const PhoneNumber = items?.find(i => i.Name === 'PhoneNumber')?.Value || '';

  try {
    const conn = await pool.getConnection();
    await conn.execute(
      `INSERT INTO transactions 
        (MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, Amount, MpesaReceipt, Phone) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, Amount, MpesaReceiptNumber, PhoneNumber]
    );
    conn.release();

    fs.appendFileSync(path.join('logs', 'transactions.log'),
      `${new Date().toISOString()} | ${PhoneNumber} paid ${Amount} | Ref: ${MpesaReceiptNumber}\n`
    );

    return NextResponse.json({ success: true });
  } catch (err) {
  const error = err instanceof Error ? err.message : String(err);
  console.error(error);
  return NextResponse.json(
    { error: "Failed to initiate payment" },
    { status: 500 }
  );
}
}

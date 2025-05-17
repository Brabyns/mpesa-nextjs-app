import axios from 'axios';

function getEnvVariable(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

export async function getAccessToken(): Promise<string> {
  const consumerKey = getEnvVariable('MPESA_CONSUMER_KEY');
  const consumerSecret = getEnvVariable('MPESA_CONSUMER_SECRET');

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const res = await axios.get(`${getEnvVariable('MPESA_BASE_URL')}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
  });

  return res.data.access_token;
}


export async function initiateSTKPush(phone: string, amount: number) {
  const token = await getAccessToken();

  const shortcode = getEnvVariable('MPESA_SHORTCODE');
  const passkey = getEnvVariable('MPESA_PASSKEY');
  const callbackUrl = getEnvVariable('MPESA_CALLBACK_URL');

  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password = Buffer.from(shortcode + passkey + timestamp).toString('base64');

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phone,
    PartyB: shortcode,
    PhoneNumber: phone,
    CallBackURL: callbackUrl,
    AccountReference: 'BizRef',
    TransactionDesc: 'NextJS Payment',
  };

  const res = await axios.post(`${getEnvVariable('MPESA_BASE_URL')}/mpesa/stkpush/v1/processrequest`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
}


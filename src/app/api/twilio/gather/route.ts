import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';

const RESPONSES: Record<string, { twiml: string; push: string }> = {
  '1': {
    twiml: 'מה כיף! שמחים שאת שם!',
    push: '🟢 נועה לחצה 1 - שמחה שהיא שם 😊',
  },
  '2': {
    twiml: 'אוקיי, ניסע הביתה בקרוב!',
    push: '🏠 נועה לחצה 2 - רוצה לנסוע הביתה',
  },
  '3': {
    twiml: 'הוא בדרך אלייך!',
    push: '❤️ נועה לחצה 3 - רוצה אותך 😏',
  },
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const digit = formData.get('Digits')?.toString() || '';

  const entry = RESPONSES[digit] || {
    twiml: 'לא קיבלתי תשובה ברורה. נסי שוב!',
    push: `🤷 נועה לחצה ${digit || 'כלום'}`,
  };

  // Push notification to Oudi
  const msg = `📞 שיחה עם נועה: ${entry.push}`;
  exec(
    `wacli --store ~/.wacli-biz send text --to 972542666334@s.whatsapp.net --message '${msg}'`,
    (err) => { if (err) console.error('wacli push failed:', err.message); }
  );

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="he-IL" voice="Google.he-IL-Standard-B">${entry.twiml}</Say>
</Response>`;

  return new NextResponse(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  });
}

// Deploy with: npx supabase functions deploy ai
// Then set the secret once with: npx supabase secrets set ANTHROPIC_API_KEY=your-key

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { prompt, currentBio } = await req.json();
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (!apiKey) {
      return new Response(JSON.stringify({ reply: '[ERROR] ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system:
          'คุณเป็นผู้ช่วยเขียน bio และแนะนำลิงก์สำหรับหน้า link-in-bio ธีมแฮกเกอร์/ไซเบอร์พังค์ ตอบสั้น กระชับ เป็นภาษาไทย ถ้าผู้ใช้ขอให้ร่าง bio ให้ตอบกลับเป็น JSON แบบ {"reply": "...", "suggestedBio": "..."} เท่านั้น ไม่มีข้อความอื่น ถ้าไม่ใช่การขอร่าง bio ให้ตอบเป็น {"reply": "..."} เท่านั้น',
        messages: [{ role: 'user', content: `bio ปัจจุบัน: "${currentBio || '(ว่าง)'}"\n\nคำสั่ง: ${prompt}` }],
      }),
    });

    const data = await res.json();
    const text = data?.content?.[0]?.text ?? '{}';
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { reply: text }; }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ reply: '[ERROR] เรียก AI ไม่สำเร็จ' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

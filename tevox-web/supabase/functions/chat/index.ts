import { createClient } from 'npm:@supabase/supabase-js@2'
import OpenAI from 'npm:openai'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
}

const groq = new OpenAI({
  apiKey:  Deno.env.get('GROQ_API_KEY')!,
  baseURL: 'https://api.groq.com/openai/v1',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { messages } = await req.json()

    const { data: products } = await supabase
      .from('products')
      .select('sku, name_th, car_model, category, price_thb, status, fitment_notes_th')
      .neq('status', 'coming_soon')

    const productContext = products?.map((p: { sku: string; name_th: string; car_model: string; price_thb: number; status: string }) =>
      `- ${p.sku}: ${p.name_th} (${p.car_model}) ราคา ฿${p.price_thb} [${p.status}]`
    ).join('\n') ?? 'ยังไม่มีสินค้าในระบบ'

    const systemPrompt = [
      'คุณคือผู้ช่วยของ Tevox Automotive ร้านอะไหล่แต่งรถ EV ในไทย',
      'ก่อตั้งโดยเจ้าของ MG IM6 ที่อยากให้คนไทยมีอะไหล่ EV เหมือน JDM และ Euro',
      '',
      'กฎในการตอบ:',
      '- ตอบเป็นภาษาไทยเสมอ ยกเว้น SKU หรือชื่อรุ่นรถ',
      '- พูดตรงๆ เหมือนเพื่อนที่รู้เรื่องรถ ไม่ใช่พนักงานขาย',
      '- ถามรุ่นรถของลูกค้าก่อนเสมอก่อนแนะนำสินค้า',
      '- ถ้าไม่มีสินค้าสำหรับรุ่นนั้น บอกตรงๆ และเสนอให้ลงทะเบียนรอ',
      '- ถ้าถามเรื่องราคา บอกราคาตรงๆ ไม่ต้องพูดอ้อม',
      '- ห้ามพูดว่า ดีที่สุด ระดับโลก หรือ ปฏิวัติ',
      '- เมื่อลูกค้าสนใจสินค้า ขอ Line ID เพื่อแจ้งเตือน',
      '',
      'สินค้าที่มีอยู่ตอนนี้:',
      productContext,
      '',
      'ถ้าลูกค้าแจ้ง Line ID ให้ตอบ JSON พิเศษนี้แทนข้อความปกติ (ไม่มีข้อความอื่น):',
      '{"action":"capture_lead","line_id":"...","car_model":"...","interest":"..."}',
    ].join('\n')

    const groqMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: m.content,
      })),
    ]

    const completion = await groq.chat.completions.create({
      model:    'llama-3.3-70b-versatile',
      messages: groqMessages,
    })

    const content = completion.choices[0].message.content ?? ''

    try {
      const parsed = JSON.parse(content)
      if (parsed.action === 'capture_lead') {
        await supabase.from('leads').insert({
          line_id:   parsed.line_id,
          car_model: parsed.car_model,
          interest:  parsed.interest,
          source:    'chatbot',
        })
        return new Response(
          JSON.stringify({ reply: 'บันทึก Line ID แล้วครับ! จะแจ้งเตือนทันทีที่มีสินค้าให้คร้บ' }),
          { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }
    } catch { /* not a JSON action */ }

    return new Response(
      JSON.stringify({ reply: content }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('chat function error:', msg)
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }
})

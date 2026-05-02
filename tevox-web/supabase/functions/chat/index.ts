import { createClient } from 'npm:@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai'

const genAI    = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    })
  }

  const { messages } = await req.json()

  // Fetch live product list to inject into system prompt
  const { data: products } = await supabase
    .from('products')
    .select('sku, name_th, car_model, category, price_thb, status, fitment_notes_th')
    .neq('status', 'coming_soon')

  const productContext = products?.map(p =>
    `- ${p.sku}: ${p.name_th} (${p.car_model}) ราคา ฿${p.price_thb} [${p.status}]`
  ).join('\n') ?? 'ยังไม่มีสินค้าในระบบ'

  const systemPrompt = `
คุณคือผู้ช่วยของ Tevox Automotive ร้านอะไหล่แต่งรถ EV ในไทย
ก่อตั้งโดยเจ้าของ MG IM6 ที่อยากให้คนไทยมีอะไหล่ EV เหมือน JDM และ Euro

กฎในการตอบ:
- ตอบเป็นภาษาไทยเสมอ ยกเว้น SKU หรือชื่อรุ่นรถ
- พูดตรงๆ เหมือนเพื่อนที่รู้เรื่องรถ ไม่ใช่พนักงานขาย
- ถามรุ่นรถของลูกค้าก่อนเสมอก่อนแนะนำสินค้า
- ถ้าไม่มีสินค้าสำหรับรุ่นนั้น บอกตรงๆ และเสนอให้ลงทะเบียนรอ
- ถ้าถามเรื่องราคา บอกราคาตรงๆ ไม่ต้องพูดอ้อม
- ห้ามพูดว่า "ดีที่สุด" "ระดับโลก" หรือ "ปฏิวัติ"
- เมื่อลูกค้าสนใจสินค้า ขอ Line ID เพื่อแจ้งเตือน

สินค้าที่มีอยู่ตอนนี้:
${productContext}

ถ้าลูกค้าแจ้ง Line ID ให้ตอบ JSON พิเศษนี้แทนข้อความปกติ (ไม่มีข้อความอื่น):
{"action":"capture_lead","line_id":"...","car_model":"...","interest":"..."}
`.trim()

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  // Convert messages to Gemini format (user/model alternating)
  const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }))

  const chat = model.startChat({
    history,
    systemInstruction: systemPrompt,
  })

  const lastMessage = messages[messages.length - 1]
  const result = await chat.sendMessage(lastMessage.content)
  const content = result.response.text()

  // Check for lead capture action
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
        JSON.stringify({ reply: `บันทึก Line ID แล้วครับ! จะแจ้งเตือนทันทีที่มีสินค้าสำหรับ ${parsed.car_model} ครับ 👍` }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }
  } catch { /* not a JSON action — normal reply */ }

  return new Response(
    JSON.stringify({ reply: content }),
    { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
  )
})

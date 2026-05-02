import { createClient } from 'npm:@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai'

const genAI    = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const FALLBACK = {
  compatible:      'unknown',
  verdict_th:      'ต้องตรวจสอบเพิ่ม',
  explanation_th:  'ไม่สามารถวิเคราะห์ได้อัตโนมัติ กรุณาติดต่อเราผ่าน Line โดยตรงครับ',
  caveats_th:      null,
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
      },
    })
  }

  const { productId, userCarModel, userYear, userSpecs } = await req.json()

  const { data: product } = await supabase
    .from('products')
    .select('sku, name_th, car_model, fitment_notes_th, specs')
    .eq('id', productId)
    .single()

  if (!product) {
    return new Response(JSON.stringify({ error: 'Product not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }

  const prompt = `
คุณเป็นผู้เชี่ยวชาญด้านชิ้นส่วนรถ EV ของ Tevox Automotive

สินค้า: ${product.name_th} (${product.sku})
รถที่สินค้านี้ออกแบบมาสำหรับ: ${product.car_model}
หมายเหตุ fitment จาก Tevox: ${product.fitment_notes_th ?? 'ไม่มีข้อมูลเพิ่มเติม'}
สเปคสินค้า: ${JSON.stringify(product.specs)}

ลูกค้าถามว่าใส่รถนี้ได้มั้ย:
- รุ่นรถ: ${userCarModel}
- ปีที่ผลิต: ${userYear}
- ข้อมูลเพิ่มเติม: ${userSpecs ?? '-'}

ตอบกลับเป็น JSON เท่านั้น ไม่มีข้อความอื่น ไม่มี markdown:
{
  "compatible": true | false | "unknown",
  "verdict_th": "ใส่ได้" | "ไม่เข้ากัน" | "ต้องตรวจสอบเพิ่ม",
  "explanation_th": "อธิบายสั้นๆ ว่าทำไม (2-3 ประโยค)",
  "caveats_th": "ข้อควรระวัง ถ้ามี หรือ null"
}
`.trim()

  const model  = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const result = await model.generateContent(prompt)
  const text   = result.response.text().trim()

  try {
    // Strip possible markdown code fences
    const clean  = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
    const parsed = JSON.parse(clean)
    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch {
    return new Response(JSON.stringify(FALLBACK), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
})

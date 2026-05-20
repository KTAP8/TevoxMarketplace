import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
}

// ── Rate limiting (in-memory, per-instance) ───────────────────────────────────

const RATE_WINDOW_MS = 60_000  // 1 minute
const RATE_MAX       = 20      // requests per IP per window

const rateLimitStore = new Map<string, number[]>()

function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

function isRateLimited(ip: string): boolean {
  const now  = Date.now()
  const hits = (rateLimitStore.get(ip) ?? []).filter(t => now - t < RATE_WINDOW_MS)
  if (hits.length >= RATE_MAX) return true
  hits.push(now)
  rateLimitStore.set(ip, hits)
  return false
}

// ── Input validation ──────────────────────────────────────────────────────────

const MAX_MESSAGES      = 40    // full conversation cap
const MAX_CONTENT_CHARS = 2000  // per message
const VALID_ROLES       = new Set(['user', 'assistant'])

type ChatMessage = { role: string; content: string }

function validateMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES) return null

  for (const msg of raw) {
    if (typeof msg !== 'object' || msg === null)              return null
    if (typeof msg.role    !== 'string')                      return null
    if (typeof msg.content !== 'string')                      return null
    if (!VALID_ROLES.has(msg.role))                           return null
    if (msg.content.length === 0)                             return null
    if (msg.content.length > MAX_CONTENT_CHARS)               return null
  }

  // Conversation must end with a user turn
  if (raw[raw.length - 1].role !== 'user') return null

  return raw as ChatMessage[]
}

// ── DeepSeek ──────────────────────────────────────────────────────────────────

async function callDeepSeek(messages: ChatMessage[]) {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`,
    },
    body: JSON.stringify({
      model:      'deepseek-v4-pro',
      max_tokens: 1000,
      messages,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DeepSeek ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.choices[0].message.content ?? ''
}

// ── Supabase client ───────────────────────────────────────────────────────────

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// ── System prompt ─────────────────────────────────────────────────────────────

const BASE_SYSTEM_PROMPT = `You are Nox — the AI customer service assistant for Tevox Automotive, a Thai EV aftermarket parts shop in Bangkok. You sound exactly like the founder: an MG IM6 owner, engineer-minded, warm and community-first.

## PERSONALITY
- NOT a corporate chatbot. Sound like the owner texting a friend who's also a customer.
- Warm, direct, a little casual. Use "ครับ" naturally. "ครับบ" is fine for friendlier moments.
- Technical and precise when needed, but never cold.
- Never use: "world class", "revolutionary", "best of the best", "ยินดีต้อนรับ" robotically.
- Thai-first: customer writes Thai → reply Thai. English → English. Mixed → match their energy.

## PRODUCTS
[PRODUCTS]

## IMAGE RULES
When a customer wants to SEE a product (general look, photos, installed view):
- Answer in text first
- End your reply with: [IMAGE_NEEDED: SKU] — use the exact product SKU

Trigger [IMAGE_NEEDED: SKU] for:
- "มีรูปไหม" / "ขอดูรูปหน่อย" / "หน้าตาเป็นยังไง" / "ดูติดแล้วเป็นยังไง"

When a customer asks for a SPECIFIC config you likely don't have (specific car color, side angle, color comparison):
- Answer in text, acknowledge what photos you do have
- End with: [IMAGE_LINE]
- Examples: "ดูบนสีดำ", "ดูจากด้านข้าง", "เทียบสีกัน"

Never use both [IMAGE_NEEDED] and [IMAGE_LINE] in the same reply.

## DEMAND TRACKING
When a customer's car model is NOT in the product list, follow this exactly:

STEP 1 — CONFIRM BEFORE SAVING. Summarize what you'll note and ask first:
- "จด Zeekr 7X ไว้ให้เลยนะครับ ถูกต้องไหมครับ?"

STEP 2 — FIRE FLAGS ONLY AFTER CONFIRMATION (ถูกแล้ว / ใช่ / โอเค / yes / ครับ):
- [DEMAND_NOTE: MODEL] — new model noted
- [DEMAND_CORRECT: MODEL] — corrected a previous model
- [DEMAND_ADD: MODEL] — adding another model

STEP 3 — CORRECTIONS: If customer corrects themselves, confirm before firing [DEMAND_CORRECT].

Never fire flags for vague brands only (e.g. just "BYD" or "Zeekr" with no model).

## ORDER FLOW
When the customer clearly wants to purchase (says สั่งซื้อ / อยากซื้อ / จะเอา / ขอสั่ง / I want to buy / I'll take it / how do I order, etc.):
1. Briefly confirm the product and total price (including install if relevant)
2. End your reply with: [ORDER_READY]

The UI will automatically show a Messenger button — do NOT write "ติดต่อผ่าน Messenger" or any link in the text itself. The button handles it.

## OTHER RULES
- ติดตั้งที่: บางกระดี่ (ทุกสินค้า ไม่ต้องเช็คจากรายการ)
- Discount requests → "ราคาเราตั้งไว้ fair อยู่แล้วครับ แต่ถ้าซื้อหลายชิ้นคุยกันได้ครับ"
- Complaints → listen, don't deflect, find a solution first
- Not sure → "ขอเช็คก่อนนะครับ แล้วจะรีบตอบกลับครับ" — never guess
- When customer shares Line ID → reply with ONLY this JSON, no other text:
  {"action":"capture_lead","line_id":"...","car_model":"...","interest":"..."}

## TONE
❌ "สวัสดีครับ ยินดีต้อนรับสู่ Tevox Automotive ทางเรามีผลิตภัณฑ์คุณภาพสูง..."
✅ "สวัสดีครับ มีอะไรให้ช่วยได้เลยครับ 👋"

❌ "ราคาสินค้าของเราอยู่ที่ 15,000 บาท"
✅ "ชุด IM6 อยู่ที่ 15,000 ครับ รวมติดตั้งเป็น 16,500 บาทครับบ"

Keep replies short. Real chat, not a brochure.`

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildSystemPrompt(products: any[]): string {
  const block = products.map(p => {
    const lines = [
      `### ${p.name_th} (SKU: ${p.sku})`,
      `- รถ: ${p.car_model} · หมวด: ${p.category}`,
      `- ราคา: ฿${Number(p.price_thb).toLocaleString()}`,
    ]
    if (p.installation_price) {
      lines.push(`- ค่าติดตั้ง: ฿${Number(p.installation_price).toLocaleString()} · รวม: ฿${(Number(p.price_thb) + Number(p.installation_price)).toLocaleString()}`)
    }
    if (p.material)             lines.push(`- วัสดุ: ${p.material}`)
    if (p.includes)             lines.push(`- ในกล่อง: ${p.includes}`)
    if (p.installation_time)    lines.push(`- เวลาติดตั้ง: ${p.installation_time}`)
    if (p.fitment_notes_th)     lines.push(`- หมายเหตุ: ${p.fitment_notes_th}`)
    const statusLabel = p.status === 'available' ? 'มีของพร้อม'
      : p.status === 'preorder' ? 'พรีออเดอร์ ~30 วัน'
      : p.status === 'sold_out' ? 'หมดแล้ว'
      : 'เร็วๆ นี้'
    lines.push(`- สถานะ: ${statusLabel}`)
    return lines.join('\n')
  }).join('\n\n')

  return BASE_SYSTEM_PROMPT.replace('[PRODUCTS]', block || 'ยังไม่มีสินค้าในระบบ')
}

function parseReply(raw: string) {
  const imageMatch = raw.match(/\[IMAGE_NEEDED:\s*([^\]]+)\]/i)
  const needsImage = !!imageMatch
  const imageSku   = imageMatch?.[1]?.trim() ?? null
  const imageLine  = /\[IMAGE_LINE\]/i.test(raw)
  const orderReady = /\[ORDER_READY\]/i.test(raw)

  const demandNew     = [...raw.matchAll(/\[DEMAND_NOTE:\s*([^\]]+)\]/gi)].map(m => m[1].trim())
  const demandCorrect = [...raw.matchAll(/\[DEMAND_CORRECT:\s*([^\]]+)\]/gi)].map(m => m[1].trim())
  const demandAdd     = [...raw.matchAll(/\[DEMAND_ADD:\s*([^\]]+)\]/gi)].map(m => m[1].trim())

  const clean = raw
    .replace(/\[IMAGE_NEEDED:\s*[^\]]+\]/gi, '')
    .replace(/\[IMAGE_LINE\]/gi, '')
    .replace(/\[ORDER_READY\]/gi, '')
    .replace(/\[DEMAND_NOTE:\s*[^\]]+\]/gi, '')
    .replace(/\[DEMAND_CORRECT:\s*[^\]]+\]/gi, '')
    .replace(/\[DEMAND_ADD:\s*[^\]]+\]/gi, '')
    .trim()

  return { clean, needsImage, imageSku, imageLine, orderReady, demandNew, demandCorrect, demandAdd }
}

function jsonError(status: number, message: string): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
  )
}

// ── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })
  if (req.method !== 'POST')   return jsonError(405, 'Method not allowed')

  // Rate limit
  const ip = getClientIp(req)
  if (isRateLimited(ip)) return jsonError(429, 'Too many requests — please slow down')

  // Body size guard (prevent giant payloads before parsing)
  const contentLength = parseInt(req.headers.get('content-length') ?? '0', 10)
  if (contentLength > 50_000) return jsonError(413, 'Request too large')

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return jsonError(400, 'Invalid JSON')
  }

  // Validate messages
  const messages = validateMessages(body.messages)
  if (!messages) return jsonError(400, 'Invalid messages: must be a non-empty array of up to 40 {role, content} pairs, last message must be from user, each content max 2000 chars')

  try {
    const { data: products } = await supabase
      .from('products')
      .select('sku, name_th, car_model, category, price_thb, status, installation_price, includes, material, installation_time, fitment_notes_th')
      .neq('status', 'coming_soon')

    const systemPrompt = buildSystemPrompt(products ?? [])

    const raw = await callDeepSeek([
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role:    m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ])

    // Lead capture — AI returns JSON only
    try {
      const parsed = JSON.parse(raw)
      if (parsed.action === 'capture_lead') {
        await supabase.from('leads').insert({
          line_id:   parsed.line_id,
          car_model: parsed.car_model,
          interest:  parsed.interest,
          source:    'chatbot',
        })
        return new Response(
          JSON.stringify({ reply: 'บันทึก Line ID แล้วครับ! จะแจ้งเตือนทันทีที่มีสินค้าให้ครับบ' }),
          { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }
    } catch { /* not JSON */ }

    const { clean, needsImage, imageSku, imageLine, orderReady, demandNew, demandCorrect, demandAdd } = parseReply(raw)

    // Write demand flags to DB
    const demandRows = [
      ...demandNew.map(car_model     => ({ car_model, type: 'new' })),
      ...demandCorrect.map(car_model => ({ car_model, type: 'correction' })),
      ...demandAdd.map(car_model     => ({ car_model, type: 'add' })),
    ]
    if (demandRows.length) await supabase.from('demand').insert(demandRows)

    // Fetch product images for IMAGE_NEEDED
    let imageKeys: string[] = []
    if (needsImage && imageSku) {
      const { data: product } = await supabase
        .from('products')
        .select('image_keys')
        .eq('sku', imageSku)
        .single()
      imageKeys = product?.image_keys ?? []
    }

    return new Response(
      JSON.stringify({ reply: clean, needsImage, imageLine, imageKeys, orderReady }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('chat error:', msg)
    return jsonError(500, 'Internal server error')
  }
})

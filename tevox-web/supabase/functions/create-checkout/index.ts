import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14'

// Fix F4: restrict to known origins instead of wildcard
function corsHeaders(req: Request): Record<string, string> {
  const origin  = req.headers.get('Origin') ?? ''
  const siteUrl = Deno.env.get('SITE_URL') || ''
  const allowed = new Set([siteUrl, 'http://localhost:5173', 'http://localhost:5174'].filter(Boolean))
  return {
    'Access-Control-Allow-Origin':  allowed.has(origin) ? origin : (siteUrl || 'http://localhost:5173'),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
  }
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Lazy so a missing secret returns a CORS-safe 500 instead of crashing the module
function getStripe() {
  const key = Deno.env.get('STRIPE_SECRET_KEY')
  if (!key) throw new Error('STRIPE_SECRET_KEY secret is not set')
  return new Stripe(key, { apiVersion: '2024-06-20' })
}

Deno.serve(async (req) => {
  const cors = corsHeaders(req)

  function jsonError(status: number, msg: string) {
    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  if (req.method !== 'POST')   return jsonError(405, 'Method not allowed')

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return jsonError(400, 'Invalid JSON') }

  const { product_id, customer_name, customer_email, customer_phone, wants_shipping, shipping_address } = body as any

  if (!product_id || !customer_name?.trim() || !customer_email?.trim()) {
    return jsonError(400, 'product_id, customer_name, and customer_email are required')
  }

  let stripe: Stripe
  try { stripe = getStripe() } catch (e) {
    return jsonError(500, (e as Error).message)
  }

  const { data: product, error: pErr } = await supabase
    .from('products')
    .select('id, sku, name_th, price_thb, deposit_thb, installation_price, status')
    .eq('id', product_id)
    .single()

  if (pErr || !product) return jsonError(404, 'Product not found')
  if (product.status === 'sold_out' || product.status === 'coming_soon') {
    return jsonError(400, 'Product not available for purchase')
  }

  const depositAmount = Number(product.deposit_thb ?? product.price_thb)
  const totalPrice    = Number(product.price_thb)
  const siteUrl       = Deno.env.get('SITE_URL') || 'http://localhost:5173'

  const metadata: Record<string, string> = {
    product_id:      product.id,
    product_sku:     product.sku,
    product_name_th: product.name_th.slice(0, 200),
    customer_name:   String(customer_name).trim(),
    customer_email:  String(customer_email).trim(),
    customer_phone:  String(customer_phone ?? '').trim(),
    wants_shipping:  wants_shipping ? 'true' : 'false',
    total_price:     String(totalPrice),
  }

  if (wants_shipping && shipping_address) {
    metadata.shipping_json = JSON.stringify(shipping_address).slice(0, 500)
  }

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'thb',
        product_data: {
          name:        `มัดจำ — ${product.name_th}`,
          description: `SKU: ${product.sku} · ราคาเต็ม ฿${totalPrice.toLocaleString('th-TH')} · ส่วนที่เหลือชำระที่ร้าน`,
        },
        unit_amount: Math.round(depositAmount * 100), // satang
      },
      quantity: 1,
    }],
    customer_email: String(customer_email).trim(),
    metadata,
    success_url: `${siteUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${siteUrl}/order/cancel?product_id=${product_id}`,
  })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('Stripe error:', msg)
    return jsonError(502, `Stripe error: ${msg}`)
  }

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
})

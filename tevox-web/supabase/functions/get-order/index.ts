import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Fix F4: restrict CORS to known origins instead of wildcard
function corsHeaders(req: Request): Record<string, string> {
  const origin  = req.headers.get('Origin') ?? ''
  const siteUrl = Deno.env.get('SITE_URL') || ''
  const allowed = new Set([siteUrl, 'http://localhost:5173', 'http://localhost:5174'].filter(Boolean))
  return {
    'Access-Control-Allow-Origin':  allowed.has(origin) ? origin : (siteUrl || 'http://localhost:5173'),
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
  }
}

Deno.serve(async (req) => {
  const cors = corsHeaders(req)
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 })

  const url        = new URL(req.url)
  const sessionId  = url.searchParams.get('session_id')
  const email      = url.searchParams.get('email')?.toLowerCase().trim()

  // Fix F1: require both session_id AND the customer email so knowing
  // a session_id alone is not enough to read someone else's order
  if (!sessionId || !email) {
    return new Response(JSON.stringify({ error: 'session_id and email required' }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, product_sku, product_name_th, customer_name, customer_email, deposit_paid, total_price, wants_shipping, shipping_address, status, created_at')
    .eq('stripe_session_id', sessionId)
    .eq('customer_email', email)   // Fix F1: must match the email used at checkout
    .single()

  if (error || !order) {
    return new Response(JSON.stringify({ error: 'Order not found' }), {
      status: 404,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ order }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
})

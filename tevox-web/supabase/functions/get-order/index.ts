import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 })

  const url       = new URL(req.url)
  const sessionId = url.searchParams.get('session_id')

  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'session_id required' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, product_sku, product_name_th, customer_name, customer_email, deposit_paid, total_price, wants_shipping, shipping_address, status, created_at')
    .eq('stripe_session_id', sessionId)
    .single()

  if (error || !order) {
    return new Response(JSON.stringify({ error: 'Order not found' }), {
      status: 404,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ order }), {
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
})

import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
})

// Fix F3: escape all user-supplied strings before putting them in HTML
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const sig = req.headers.get('stripe-signature')
  if (!sig) return new Response('Missing stripe-signature', { status: 400 })

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Webhook signature failed:', msg)
    return new Response(`Webhook signature failed: ${msg}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const meta    = session.metadata ?? {}

    const shippingAddress = meta.wants_shipping === 'true' && meta.shipping_json
      ? (() => { try { return JSON.parse(meta.shipping_json) } catch { return null } })()
      : null

    // Fix F5: re-fetch authoritative price from DB instead of trusting metadata
    let totalPrice = Number(meta.total_price ?? 0)
    if (meta.product_id) {
      const { data: product } = await supabase
        .from('products')
        .select('price_thb')
        .eq('id', meta.product_id)
        .single()
      if (product?.price_thb) totalPrice = Number(product.price_thb)
    }

    // Fix F2: upsert with ignoreDuplicates so Stripe retries never create double orders.
    // Requires UNIQUE constraint on orders.stripe_session_id (see SQL below).
    // Returns the inserted row only when it's genuinely new.
    const { data: inserted, error: insertError } = await supabase
      .from('orders')
      .upsert(
        {
          stripe_session_id:         session.id,
          stripe_payment_intent_id:  typeof session.payment_intent === 'string'
                                       ? session.payment_intent
                                       : (session.payment_intent as any)?.id ?? null,
          product_id:      meta.product_id    || null,
          product_sku:     meta.product_sku   ?? '',
          product_name_th: meta.product_name_th ?? '',
          customer_name:   meta.customer_name  ?? '',
          customer_email:  meta.customer_email ?? '',
          customer_phone:  meta.customer_phone  || null,
          wants_shipping:  meta.wants_shipping === 'true',
          shipping_address: shippingAddress,
          deposit_paid:    (session.amount_total ?? 0) / 100,
          total_price:     totalPrice,
          status:          'deposit_paid',
        },
        { onConflict: 'stripe_session_id', ignoreDuplicates: true },
      )
      .select('id')

    if (insertError) {
      console.error('Order upsert failed:', insertError.message)
    } else if (inserted && inserted.length > 0) {
      // Fix F2: only send email for new inserts, not retried duplicate events
      await sendConfirmationEmail(meta, (session.amount_total ?? 0) / 100, totalPrice, shippingAddress)
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

async function sendConfirmationEmail(
  meta: Record<string, string>,
  depositPaid: number,
  totalPrice: number,
  shippingAddress: Record<string, string> | null,
) {
  const remaining = totalPrice - depositPaid

  // Fix F3: all user-supplied values are escaped before HTML interpolation
  const customerName  = esc(meta.customer_name  ?? '')
  const productName   = esc(meta.product_name_th ?? '')
  const productSku    = esc(meta.product_sku     ?? '')

  const shippingRow = shippingAddress
    ? `
      <tr><td colspan="2" style="padding:12px 0 4px;border-top:1px solid #e4e4e7;font-weight:bold;font-size:13px;">ที่อยู่จัดส่ง</td></tr>
      <tr><td colspan="2" style="padding:2px 0;color:#52525b;font-size:14px;">${esc(shippingAddress.name ?? '')}</td></tr>
      <tr><td colspan="2" style="padding:2px 0;color:#52525b;font-size:14px;">${esc(shippingAddress.address_line1 ?? '')}${shippingAddress.address_line2 ? ', ' + esc(shippingAddress.address_line2) : ''}</td></tr>
      <tr><td colspan="2" style="padding:2px 0;color:#52525b;font-size:14px;">${esc(shippingAddress.district ?? '')}, ${esc(shippingAddress.province ?? '')} ${esc(shippingAddress.postal_code ?? '')}</td></tr>
    `
    : `<tr><td colspan="2" style="padding:12px 0 4px;border-top:1px solid #e4e4e7;color:#52525b;font-size:14px;">รับสินค้า / ติดตั้งที่ร้าน (บางกระดี่)</td></tr>`

  const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px;width:100%;">

  <tr><td style="background:#1D1C1D;padding:24px 32px;">
    <p style="margin:0;font-weight:900;font-size:20px;color:#fff;letter-spacing:2px;">TEVOX AUTOMOTIVE</p>
    <p style="margin:4px 0 0;font-size:13px;color:#a1a1aa;letter-spacing:1px;">ยืนยันการวางมัดจำ</p>
  </td></tr>

  <tr><td style="padding:32px 32px 0;">
    <p style="margin:0 0 8px;font-size:16px;color:#1D1C1D;">สวัสดีครับ คุณ${customerName},</p>
    <p style="margin:0;font-size:15px;color:#52525b;line-height:1.6;">
      ได้รับการวางมัดจำเรียบร้อยแล้วครับ ขอบคุณที่ไว้วางใจ Tevox Automotive ครับ
    </p>
  </td></tr>

  <tr><td style="padding:24px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-collapse:collapse;">
      <tr style="background:#f4f4f5;"><td colspan="2" style="padding:10px 12px;font-weight:bold;font-size:12px;letter-spacing:1px;color:#3f3f46;">รายละเอียดคำสั่งซื้อ</td></tr>
      <tr><td style="padding:8px 12px;color:#52525b;">สินค้า</td><td style="padding:8px 12px;font-weight:bold;color:#1D1C1D;">${productName}</td></tr>
      <tr style="background:#fafafa;"><td style="padding:8px 12px;color:#52525b;">SKU</td><td style="padding:8px 12px;font-family:monospace;color:#3f3f46;">${productSku}</td></tr>
      <tr><td style="padding:8px 12px;color:#52525b;">ราคาเต็ม</td><td style="padding:8px 12px;color:#1D1C1D;">฿${totalPrice.toLocaleString('th-TH')}</td></tr>
      <tr style="background:#fafafa;"><td style="padding:8px 12px;color:#52525b;">มัดจำที่ชำระแล้ว</td><td style="padding:8px 12px;font-weight:bold;color:#16a34a;">฿${depositPaid.toLocaleString('th-TH')}</td></tr>
      <tr><td style="padding:8px 12px;color:#52525b;">ยอดค้างชำระ (ที่ร้าน)</td><td style="padding:8px 12px;color:#1D1C1D;">฿${remaining.toLocaleString('th-TH')}</td></tr>
      ${shippingRow}
    </table>
  </td></tr>

  <tr><td style="padding:0 32px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:#f4f4f5;border-left:3px solid #E9FF22;padding:16px 20px;">
        <p style="margin:0 0 6px;font-weight:bold;font-size:14px;color:#1D1C1D;">ขั้นตอนต่อไป</p>
        <p style="margin:0;font-size:14px;color:#52525b;line-height:1.7;">
          ทีมงานจะติดต่อกลับภายใน 24 ชม. เพื่อนัดหมายการติดตั้ง / จัดส่งสินค้าครับ<br>
          หากมีข้อสงสัยติดต่อได้ที่ Facebook หรือ Messenger ของ Tevox Automotive ครับ
        </p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:16px 32px 32px;border-top:1px solid #e4e4e7;">
    <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
      Tevox Automotive · pimsuea.com<br>
      อีเมลนี้ส่งอัตโนมัติ กรุณาอย่าตอบกลับอีเมลนี้
    </p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      from:    'Tevox Automotive <orders@pimsuea.com>',
      to:      [meta.customer_email],
      subject: `ยืนยันการวางมัดจำ — ${productName}`,
      html,
    }),
  })

  if (!resendRes.ok) {
    const err = await resendRes.text()
    console.error('Resend failed:', err)
  }
}

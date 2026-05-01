# Tevox Automotive — Website PRD

> **Stack:** Vite + React · Supabase (DB + Auth) · Cloudflare R2 (media storage)  
> **Language:** Thai (primary) · English (technical labels/SKUs only)  
> **Brand Colors:** `#E9FF22` (primary accent) · `#1D1C1D` (background) · `#F1F5F8` (text/surfaces) · `#3843EB` (highlights)  
> **Font:** FC Vision (load via @font-face or fallback to Arial)

---

## 1. Project Structure

```
tevox-web/
├── public/
│   └── placeholders/          # placeholder images (generate via https://placehold.co)
├── src/
│   ├── assets/
│   │   └── fonts/             # FC Vision font files (if self-hosted)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Badge.jsx
│   │   │   └── ProductCard.jsx
│   │   ├── Chatbot.jsx        # AI chatbot widget
│   │   └── FitmentChecker.jsx # AI fitment checker
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Gallery.jsx
│   │   └── About.jsx
│   ├── lib/
│   │   ├── supabase.js        # Supabase client
│   │   ├── r2.js              # Cloudflare R2 helpers
│   │   └── anthropic.js       # Claude API calls (server-side via Supabase Edge Function)
│   ├── hooks/
│   │   ├── useProducts.js
│   │   └── useInstalls.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── supabase/
│   └── functions/
│       ├── chat/              # Edge Function: chatbot
│       │   └── index.ts
│       └── fitment/           # Edge Function: fitment checker
│           └── index.ts
├── .env.local
└── vite.config.js
```

---

## 2. Environment Variables

```env
# .env.local
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_R2_PUBLIC_URL=          # public bucket URL for serving images
ANTHROPIC_API_KEY=           # server-side only — never expose to client
```

> **Important:** `ANTHROPIC_API_KEY` is used only inside Supabase Edge Functions. Never import it into any client-side React file.

---

## 3. Supabase Schema

Run these SQL migrations in order in the Supabase SQL editor.

### 3.1 Products table
```sql
create table products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,                   -- e.g. TVX-IM6-FL-001
  name_th text not null,                      -- Thai product name
  name_en text,                               -- English (optional)
  description_th text,
  car_model text not null,                    -- e.g. MG IM6
  category text not null,                     -- e.g. front_lip, rear_diffuser
  price_thb numeric(10,2) not null,
  status text not null default 'preorder',    -- preorder | available | sold_out | coming_soon
  preorder_closes_at timestamptz,
  image_keys text[],                          -- R2 object keys
  fitment_notes_th text,
  install_notes_th text,
  specs jsonb,                                -- { material, weight_kg, color_options: [] }
  sort_order int default 0,
  created_at timestamptz default now()
);
```

### 3.2 Installs (gallery) table
```sql
create table installs (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  car_model text not null,
  product_id uuid references products(id),
  image_key text not null,                    -- R2 object key
  caption_th text,
  is_approved boolean default false,          -- admin must approve before public
  submitted_at timestamptz default now()
);
```

### 3.3 Leads table
```sql
create table leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  line_id text,
  car_model text,
  interest text,                              -- what modification they want
  source text,                                -- chatbot | fitment | waitlist | community_gate
  created_at timestamptz default now()
);
```

### 3.4 Waitlist table
```sql
create table waitlist (
  id uuid primary key default gen_random_uuid(),
  car_model text not null,
  line_id text not null,
  name text,
  created_at timestamptz default now()
);
```

### 3.5 Row Level Security
```sql
-- Products: public read
alter table products enable row level security;
create policy "public read products" on products for select using (true);

-- Installs: public read only approved; anyone can insert
alter table installs enable row level security;
create policy "public read approved installs" on installs for select using (is_approved = true);
create policy "anyone can submit install" on installs for insert with check (true);

-- Leads + Waitlist: insert only (no client reads)
alter table leads enable row level security;
create policy "insert only" on leads for insert with check (true);

alter table waitlist enable row level security;
create policy "insert only" on waitlist for insert with check (true);
```

---

## 4. Cloudflare R2 Setup

1. Create a bucket named `tevox-media` in Cloudflare R2.
2. Enable public access on the bucket and copy the public URL to `VITE_R2_PUBLIC_URL`.
3. All product images and gallery photos are stored here.

### R2 helper (`src/lib/r2.js`)
```js
// Helper to build public image URL from R2 object key
export function r2Url(key) {
  if (!key) return 'https://placehold.co/800x600/1D1C1D/E9FF22?text=Tevox'
  return `${import.meta.env.VITE_R2_PUBLIC_URL}/${key}`
}
```

> **Placeholder rule:** Any time an image key is null or missing, fall back to `https://placehold.co/800x600/1D1C1D/E9FF22?text=Tevox` using the brand colors.

---

## 5. Pages

### 5.1 Home (`/`)

**Sections in order:**

1. **Hero**
   - Full-width dark background (`#1D1C1D`)
   - Headline (Thai): `"ชิ้นส่วนแต่งรถ EV — ที่สุดท้ายมีแล้ว"`
   - Sub-headline (Thai): `"เริ่มต้นที่ MG IM6 ขยายไปทุกรุ่น"`
   - Two CTAs: `[ดูสินค้า]` → `/products` and `[แจ้งเตือนรุ่นใหม่]` → opens waitlist modal
   - Placeholder image: hero car photo right side (1200×800)

2. **Stats bar**
   - 3 metrics side by side: `สินค้าที่มี`, `รถที่รองรับ`, `ลูกค้าที่ติดตั้งแล้ว`
   - Pull live counts from Supabase (`count(products where status != coming_soon)`, `count(distinct car_model from installs where is_approved)`, `count(installs where is_approved)`)

3. **Featured products**
   - Show 3 latest products (status ≠ `coming_soon`)
   - Each card: product image, SKU badge, name (Thai), price in ฿, status badge, `[ดูรายละเอียด]` button
   - Link to `/products`

4. **Gallery preview**
   - 4–6 approved install photos in a masonry/grid layout
   - Link to `/gallery`

5. **Chatbot entry banner**
   - Dark card: `"ไม่รู้ว่าอะไรเหมาะกับรถคุณ? คุยกับเราได้เลย"`
   - Opens the chatbot widget (floating button also always visible)

6. **Waitlist modal** (triggered by CTA)
   - Fields: ชื่อ (name), Line ID, รุ่นรถ (car model — dropdown from distinct models in products table)
   - On submit: insert to `waitlist` table, show success message

---

### 5.2 Products (`/products`)

**Layout:**
- Filter bar at top: filter by `car_model` and `category` (pull distinct values from DB)
- Product grid (2 cols mobile, 3 cols desktop)

**ProductCard component:**
- Image (R2 or placeholder)
- SKU badge (monospace, small, `#E9FF22` on dark)
- Product name (Thai)
- Price in ฿ with comma formatting
- Status badge: `พรีออเดอร์` (yellow) | `มีสินค้า` (green) | `หมดแล้ว` (gray) | `เร็วๆ นี้` (blue)
- If `preorder_closes_at` is set: countdown timer showing days/hours remaining
- `[ดูรายละเอียด]` button

**Data:**
```js
// src/hooks/useProducts.js
import { supabase } from '../lib/supabase'

export function useProducts(filters = {}) {
  // fetch from products table, apply car_model and category filters
  // return { products, loading, error }
}
```

---

### 5.3 Product Detail (`/products/:id`)

**Sections:**
1. Image gallery (multiple images from `image_keys` array, click to enlarge)
2. SKU + name (Thai)
3. Price + status badge + countdown if preorder
4. Description (Thai)
5. Specs table (from `specs` jsonb — render key/value pairs in Thai labels)
6. Fitment notes (Thai)
7. Install notes (Thai)
8. **Fitment Checker** component embedded here (see Section 7)
9. CTA: `[สั่งซื้อผ่าน Line]` → opens `https://line.me/ti/p/~{LINE_OA_ID}` in new tab
10. Related installs: show approved gallery photos tagged with this product

---

### 5.4 Gallery (`/gallery`)

**Layout:**
- Filter by `car_model`
- Masonry grid of approved install photos
- Each photo: customer name, car model, product name linked to product detail

**Submit install form:**
- Button `[ส่งรูปรถคุณ]` opens a modal
- Fields: ชื่อ (name), รุ่นรถ (car model), สินค้าที่ใช้ (product — dropdown), อัปโหลดรูป (file input)
- On submit:
  1. Upload image to R2 via a Supabase Edge Function (to keep R2 credentials server-side)
  2. Insert row to `installs` with `is_approved = false`
  3. Show: `"ขอบคุณ! รูปของคุณจะปรากฏหลังจากได้รับการอนุมัติ"`

---

### 5.5 About (`/about`)

**Content (Thai):**
- Founder story: เริ่มต้นจากการเป็นเจ้าของ MG IM6 ที่หาอะไหล่แต่งไม่ได้
- How it works: ซื้อตรงจากโรงงานจีน → ตรวจสอบคุณภาพ → จัดส่งในไทย
- Brand values: คุณภาพ, ความโปร่งใส, ชุมชน
- Photo: founder with car (placeholder 600×400)
- Social links: TikTok, Facebook, Line OA

---

## 6. AI Feature: Chatbot

### 6.1 UI (`src/components/Chatbot.jsx`)

- Floating button bottom-right: `💬` icon with label `"คุยกับเรา"` in `#E9FF22`
- Click opens a chat panel (fixed, 380px wide, full height on mobile)
- Dark theme matching brand (`#1D1C1D` background)
- Message bubbles: user right (yellow), bot left (white on dark)
- Input bar at bottom with send button
- Loading indicator (3 dots) while waiting for response

**Opening message (bot, shown immediately):**
```
สวัสดีครับ! ผมช่วยคุณหาชิ้นส่วนแต่งสำหรับรถ EV ของคุณได้เลย 🔧
รถคุณรุ่นอะไรครับ?
```

**Lead capture:** After the first substantive exchange, the bot asks:
```
ขอ Line ID ของคุณได้มั้ยครับ? จะได้แจ้งเตือนเมื่อมีสินค้าเข้ามาใหม่
```
If user provides it → save to `leads` table with `source = 'chatbot'`.

### 6.2 Supabase Edge Function (`supabase/functions/chat/index.ts`)

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  const { messages, sessionMeta } = await req.json()

  // Fetch current product list to inject into system prompt
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

ถ้าลูกค้าแจ้ง Line ID: ให้ตอบ JSON พิเศษนี้แทนข้อความปกติ:
{"action": "capture_lead", "line_id": "...", "car_model": "...", "interest": "..."}
`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
    system: systemPrompt,
    messages,
  })

  const content = response.content[0].text

  // Check if it's a lead capture action
  try {
    const parsed = JSON.parse(content)
    if (parsed.action === 'capture_lead') {
      await supabase.from('leads').insert({
        line_id: parsed.line_id,
        car_model: parsed.car_model,
        interest: parsed.interest,
        source: 'chatbot',
      })
      return new Response(JSON.stringify({
        reply: `บันทึก Line ID แล้วครับ! จะแจ้งเตือนทันทีที่มีสินค้าสำหรับ ${parsed.car_model} ครับ 👍`
      }), { headers: { 'Content-Type': 'application/json' } })
    }
  } catch {}

  return new Response(JSON.stringify({ reply: content }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 6.3 Client-side call
```js
// In Chatbot.jsx — call the edge function, never Claude API directly
async function sendMessage(messages) {
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ messages }),
  })
  return res.json()
}
```

---

## 7. AI Feature: Fitment Checker

### 7.1 UI (`src/components/FitmentChecker.jsx`)

- Embedded on the Product Detail page, below specs
- Headline (Thai): `"เช็คว่าใส่รถคุณได้มั้ย"`
- Form fields:
  - รุ่นรถ (text input, e.g. "MG IM6")
  - ปีที่ผลิต (year, number input)
  - สเปคเพิ่มเติม (optional, e.g. "standard trim" — text input)
- Submit button: `[เช็คความเข้ากัน]`
- Result area: shows AI response with clear YES/NO badge + notes

**Result display:**
- `✅ ใส่ได้` badge (green) or `❌ ไม่เข้ากัน` badge (red) or `⚠️ ต้องตรวจสอบเพิ่ม` badge (yellow)
- Explanation paragraph (Thai)
- If compatible: `[สั่งซื้อผ่าน Line]` CTA
- If not compatible: `[แจ้งเตือนเมื่อมีสำหรับรถคุณ]` → saves to leads table

### 7.2 Supabase Edge Function (`supabase/functions/fitment/index.ts`)

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  const { productId, userCarModel, userYear, userSpecs } = await req.json()

  // Fetch product fitment data
  const { data: product } = await supabase
    .from('products')
    .select('sku, name_th, car_model, fitment_notes_th, specs')
    .eq('id', productId)
    .single()

  if (!product) {
    return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 })
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

ตอบกลับเป็น JSON เท่านั้น (ไม่มีข้อความอื่น):
{
  "compatible": true | false | "unknown",
  "verdict_th": "ใส่ได้" | "ไม่เข้ากัน" | "ต้องตรวจสอบเพิ่ม",
  "explanation_th": "อธิบายสั้นๆ ว่าทำไม (2-3 ประโยค)",
  "caveats_th": "ข้อควรระวัง ถ้ามี หรือ null"
}
`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  })

  try {
    const result = JSON.parse(response.content[0].text)
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch {
    return new Response(JSON.stringify({
      compatible: 'unknown',
      verdict_th: 'ต้องตรวจสอบเพิ่ม',
      explanation_th: 'ไม่สามารถวิเคราะห์ได้อัตโนมัติ กรุณาติดต่อเราผ่าน Line โดยตรง',
      caveats_th: null,
    }), { headers: { 'Content-Type': 'application/json' } })
  }
})
```

---

## 8. Navigation

```
Navbar:
  Left: Tevox logo (SVG, #E9FF22 wordmark on dark)
  Right: [สินค้า] [แกลเลอรี่] [เกี่ยวกับเรา] [💬 คุยกับเรา]

Footer:
  Left: Logo + tagline "Built by Engineers. Driven by Passion."
  Center: Links — สินค้า | แกลเลอรี่ | เกี่ยวกับเรา
  Right: Social icons — TikTok | Facebook | Line OA
  Bottom: "© 2026 Tevox Automotive · BKK, Thailand"
```

---

## 9. Styling Guidelines

- **Background:** `#1D1C1D` on hero and chatbot; `#F1F5F8` on content pages
- **Primary accent:** `#E9FF22` for CTAs, badges, active states, borders on hover
- **Text on dark:** `#F1F5F8`
- **Text on light:** `#1D1C1D`
- **Highlight/link:** `#3843EB`
- **Border radius:** 8px standard, 4px for badges/pills
- **Font sizes:** Display 48–64px / H2 32px / H3 20px / Body 16px / Caption 13px
- **No red, gold, or aggressive racing aesthetics**
- **Images:** Always aspect-ratio locked, object-fit: cover; dark overlay allowed

### Tailwind config (if using Tailwind)
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#E9FF22',
          dark:   '#1D1C1D',
          light:  '#F1F5F8',
          blue:   '#3843EB',
        }
      },
      fontFamily: {
        sans: ['FC Vision', 'Arial', 'sans-serif'],
      }
    }
  }
}
```

---

## 10. Routing

```jsx
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

<Routes>
  <Route path="/"              element={<Home />} />
  <Route path="/products"      element={<Products />} />
  <Route path="/products/:id"  element={<ProductDetail />} />
  <Route path="/gallery"       element={<Gallery />} />
  <Route path="/about"         element={<About />} />
</Routes>
```

---

## 11. Placeholder Images

Use these URLs for all placeholder images during development:

| Usage                | URL |
|---------------------|-----|
| Hero (wide)         | `https://placehold.co/1200x600/1D1C1D/E9FF22?text=Tevox+Hero` |
| Product card        | `https://placehold.co/600x400/1D1C1D/E9FF22?text=TVX-IM6-FL-001` |
| Gallery install     | `https://placehold.co/800x600/1D1C1D/F1F5F8?text=Customer+Install` |
| Founder photo       | `https://placehold.co/600x400/1D1C1D/E9FF22?text=Founder` |

The `r2Url()` helper in `src/lib/r2.js` handles the fallback automatically.

---

## 12. Seed Data (for development)

Insert this into Supabase to see the site with real-looking content:

```sql
insert into products (sku, name_th, name_en, description_th, car_model, category, price_thb, status, fitment_notes_th, specs) values
(
  'TVX-IM6-FL-001',
  'ชุดแต่งกันชนหน้า MG IM6',
  'MG IM6 Front Lip',
  'กันชนหน้าแบบสปอร์ต ออกแบบมาสำหรับ MG IM6 โดยเฉพาะ ผ่านการทดสอบการติดตั้งจริงโดยผู้ก่อตั้ง',
  'MG IM6',
  'front_lip',
  4900.00,
  'preorder',
  'รองรับ MG IM6 ทุกรุ่นย่อยปี 2024–2025 ไม่ต้องเจาะหรือดัดแปลงตัวถัง',
  '{"material": "ABS + Carbon Fiber Look", "weight_kg": 2.3, "color_options": ["Gloss Black", "Matte Black"]}'
),
(
  'TVX-IM6-RD-001',
  'ชุดแต่งกันชนหลัง Diffuser MG IM6',
  'MG IM6 Rear Diffuser',
  'Diffuser กันชนหลัง เพิ่มความ aggressive ให้รถ EV โดยไม่ต้องแลกประสิทธิภาพ',
  'MG IM6',
  'rear_diffuser',
  5200.00,
  'preorder',
  'รองรับ MG IM6 ปี 2024 ขึ้นไป ติดตั้งโดยใช้จุดยึดเดิมของรถ',
  '{"material": "ABS", "weight_kg": 1.8, "color_options": ["Gloss Black"]}'
);

insert into installs (customer_name, car_model, image_key, caption_th, is_approved) values
('คุณต้น', 'MG IM6', null, 'ติดตั้ง Front Lip เสร็จแล้ว ดูดีกว่าที่คิดมาก', true),
('คุณปลา', 'MG IM6', null, 'Rear Diffuser ใส่ง่ายมาก ไม่ต้องดัดแปลงอะไร', true);
```

---

## 13. Build & Deploy

```bash
# Install dependencies
npm create vite@latest tevox-web -- --template react
cd tevox-web
npm install @supabase/supabase-js react-router-dom

# Run locally
npm run dev

# Build
npm run build

# Deploy Supabase Edge Functions
supabase functions deploy chat
supabase functions deploy fitment
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# Deploy frontend (Cloudflare Pages recommended — pairs well with R2)
# Connect GitHub repo → Cloudflare Pages → set build command: npm run build, output: dist
```

---

## 14. Phase 2 / Out of Scope for V1

- Admin dashboard (approve installs, manage products)
- Payment integration (Promptpay / Omise)
- Line LIFF integration for in-Line purchases
- Multi-language toggle (EN/TH)
- SEO / meta tags / OG images
- Analytics (Cloudflare Web Analytics recommended — privacy-friendly)

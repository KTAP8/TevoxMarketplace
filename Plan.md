# Tevox Automotive — Implementation Plan

## Phase 0 — Scaffolding & Config ✅

- [x] **0.1** Scaffold Vite + React project inside this repo:
  ```bash
  npm create vite@latest tevox-web -- --template react
  cd tevox-web
  npm install @supabase/supabase-js react-router-dom
  npm install -D tailwindcss@3 postcss autoprefixer
  npx tailwindcss init -p
  ```

- [x] **0.2** Move `fonts/` into `tevox-web/fonts/`; copy `FCVision-*.otf` → `tevox-web/src/assets/fonts/`

- [x] **0.3** Configure Tailwind (`tailwind.config.js`):
  - Brand color tokens: `brand.yellow`, `brand.dark`, `brand.light`, `brand.blue`
  - `fontFamily.sans` → `['FC Vision', 'Arial', 'sans-serif']`
  - Custom type scale: `display`, `h2`, `h3`, `body`, `caption`
  - `content` → `['./index.html', './src/**/*.{js,jsx}']`

- [x] **0.4** Add `@font-face` declarations in `src/index.css` for all 20 FC Vision weights + Tailwind directives + base resets.

- [x] **0.5** Create `.env.local` with real Supabase credentials:
  ```
  VITE_SUPABASE_URL=https://cecahcsezqpvnucqswzq.supabase.co
  VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
  VITE_R2_PUBLIC_URL=          ← fill in when R2 bucket is ready
  ```
  `GEMINI_API_KEY` goes in Supabase secrets only — never in `.env.local`.

- [x] **0.6** `.gitignore` added at both repo root and `tevox-web/` (covers macOS `._*`, `node_modules`, `dist`, `.env*.local`, Supabase local).

---

## Phase 1 — Lib & Hooks ✅

- [x] **1.1** `src/lib/supabase.js` — Supabase client via `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`.

- [x] **1.2** `src/lib/r2.js` — `r2Url(key)` helper; falls back to `placehold.co` branded placeholder when key is null.

- [x] **1.3** `src/hooks/useProducts.js` — fetches `products` table with `car_model`, `category`, `excludeStatus` filters; cancels stale requests.

- [x] **1.4** `src/hooks/useInstalls.js` — fetches approved installs with `car_model`, `product_id`, `limit` filters; joins `products(id, name_th, sku)`.

---

## Phase 2 — UI Components ✅

- [x] **2.1** `src/components/ui/Button.jsx`  
  Variants: `primary` · `secondary` · `ghost` · Sizes: `sm` · `md` · `lg`.

- [x] **2.2** `src/components/ui/Badge.jsx`  
  Maps all 4 DB statuses to Thai labels + brand colors; supports free-text `children` fallback.

- [x] **2.3** `src/components/ui/ProductCard.jsx`  
  R2 image, SKU pill, Thai name, ฿ price, status Badge, live countdown timer, detail link.

- [x] **2.4** `src/components/layout/Navbar.jsx`  
  Sticky dark bar · logo SVG · active NavLink highlighting · `onChatOpen` prop · mobile hamburger.

- [x] **2.5** `src/components/layout/Footer.jsx`  
  3-col grid · inline SVG social icons (TikTok, Facebook, Line OA) · copyright bar.

---

## Phase 3 — Pages

### 3.1 Home (`/`) ✅
- [x] Hero section — headline, sub-headline, two CTAs, placeholder hero image
- [x] Stats bar — live counts from Supabase (products, car models, installs)
- [x] Featured Products — 3 latest via `useProducts`, renders `ProductCard`
- [x] Gallery Preview — masonry CSS columns, 6 installs
- [x] Chatbot entry banner — calls `onChatOpen` prop
- [x] Waitlist modal — car model dropdown from DB, inserts to `waitlist` table

### 3.2 Products (`/products`) ✅
- [x] Filter bar — `car_model` and `category` dropdowns, clear filter button, result count
- [x] 2-col (mobile) / 3-col (desktop) product grid, loading skeletons, empty state

### 3.3 Product Detail (`/products/:id`) ✅
- [x] Image gallery with thumbnail strip + lightbox
- [x] SKU, name, price, status badge, countdown timer
- [x] Description, specs table (JSONB), fitment note panel, install notes
- [x] `[สั่งซื้อผ่าน Line]` CTA (hidden for `coming_soon` / `sold_out`)
- [x] Related installs grid from `useInstalls({ product_id })`
- [ ] `FitmentChecker` component — pending Phase 4.2

### 3.4 Gallery (`/gallery`) ✅
- [x] Car model filter pills
- [x] Masonry grid with lightbox
- [x] Submit modal: name, car model, product dropdown, file upload → Supabase Storage → insert to `installs`

### 3.5 About (`/about`) ✅
- [x] Founder story (Thai)
- [x] 3-step how it works (source → QC → ship)
- [x] Brand values (3 pillars)
- [x] Founder placeholder photo
- [x] Social links (TikTok, Facebook, Line OA)

---

## Phase 4 — AI Features

### 4.1 Chatbot
- [ ] `src/components/Chatbot.jsx`  
  - Floating `💬 คุยกับเรา` button, bottom-right, always visible
  - Slide-in chat panel: 380px wide, full-height on mobile
  - Dark theme, message bubbles (user: yellow right, bot: white/dark left)
  - Opening message shown immediately on mount
  - After first substantive reply: ask for Line ID
  - On submit: POST to `/functions/v1/chat` with `Authorization: Bearer {VITE_SUPABASE_PUBLISHABLE_KEY}`

- [ ] `supabase/functions/chat/index.ts`  
  - Fetch live product list from Supabase
  - Inject into system prompt (Thai, friend-like tone, no superlatives)
  - Call Gemini via `@google/generative-ai` (`gemini-2.0-flash`)
  - Parse `{"action": "capture_lead", ...}` response → insert to `leads` table
  - Return `{ reply: string }`

### 4.2 Fitment Checker
- [ ] `src/components/FitmentChecker.jsx`  
  - Embedded on ProductDetail page
  - Fields: รุ่นรถ, ปีที่ผลิต, สเปคเพิ่มเติม (optional)
  - Result: ✅ / ❌ / ⚠️ badge + explanation
  - If compatible: Line CTA
  - If not: `[แจ้งเตือน]` → insert to `leads` table

- [ ] `supabase/functions/fitment/index.ts`  
  - Fetch product by ID from Supabase
  - Ask Gemini (`gemini-2.0-flash`) for JSON verdict: `{ compatible, verdict_th, explanation_th, caveats_th }`
  - Handle JSON parse failure gracefully (return "unknown" with contact-via-Line message)

---

## Phase 5 — Routing & App Shell

- [x] **5.1** `src/App.jsx` — `BrowserRouter` with all 5 routes: `/`, `/products`, `/products/:id`, `/gallery`, `/about`
- [x] **5.2** Navbar + Footer wrapping all routes; `chatOpen` state managed at App level
- [ ] **5.3** Mount `Chatbot` component at App level (pending Phase 4.1)

---

## Phase 6 — Database Setup (Supabase)

Paste `supabase/migrations/ALL_run_once.sql` into the Supabase SQL editor and run once.
Individual files in `supabase/migrations/` for reference.

- [x] **6.1** `01_products.sql` — `products` table + public-read RLS policy
- [x] **6.2** `02_installs.sql` — `installs` table + approved-read + insert RLS policies
- [x] **6.3** `03_leads.sql` — `leads` table + insert-only RLS policy
- [x] **6.4** `04_waitlist.sql` — `waitlist` table + insert-only RLS policy
- [x] **6.5** RLS policies included in each migration file above
- [x] **6.6** `05_seed.sql` — 6 products (MG IM6 full kit) + 6 approved installs
- [x] **6.7** Migrations applied via Supabase MCP — all 4 tables live, 6 products + 6 installs seeded

---

## Phase 7 — Deploy

- [ ] **7.1** Set Supabase secrets:
  ```bash
  supabase secrets set GEMINI_API_KEY=AIza...
  ```
- [ ] **7.2** Deploy Edge Functions:
  ```bash
  supabase functions deploy chat
  supabase functions deploy fitment
  ```
- [ ] **7.3** Deploy frontend to Cloudflare Pages:
  - Build command: `npm run build`
  - Output directory: `dist`
  - Set env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_R2_PUBLIC_URL`

---

## Notes & Decisions

| Decision | Rationale |
|---|---|
| Tailwind over plain CSS | Faster iteration; brand tokens enforce consistency |
| Supabase Edge Functions for AI | Keeps `GEMINI_API_KEY` off the client entirely |
| FC Vision loaded via `@font-face` | Files are self-hosted OTF in `src/assets/fonts/` — no external CDN needed |
| `gemini-2.0-flash` model | Fast, cost-effective; handles Thai well |
| Cloudflare Pages for hosting | Natural pairing with R2; same edge network |
| `is_approved = false` default | Admin must approve gallery submissions before they go public |

---

## V1 Non-Goals (Phase 2)
Admin dashboard · payment (Promptpay/Omise) · Line LIFF · multi-language toggle · SEO/OG tags · analytics

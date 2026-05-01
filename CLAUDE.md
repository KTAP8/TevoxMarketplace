# Tevox Automotive — CLAUDE.md

## Stack
- **Frontend:** Vite + React (JSX), React Router v6
- **Styling:** Tailwind CSS with custom brand tokens
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions)
- **Media:** Cloudflare R2 (`tevox-media` bucket)
- **AI:** Google Gemini (server-side only via Supabase Edge Functions)

## Brand Colors
| Token | Hex | Usage |
|---|---|---|
| `brand-yellow` | `#E9FF22` | CTAs, badges, active states, hover borders |
| `brand-dark` | `#1D1C1D` | Page background (hero, chatbot) |
| `brand-light` | `#F1F5F8` | Content page backgrounds, text on dark |
| `brand-blue` | `#3843EB` | Highlight/link color |

No red, gold, or aggressive racing aesthetics. No "best in class", "revolutionary", or superlatives in copy.

## Typography
Font family: **FC Vision** (self-hosted OTF files).

Font files live at **`tevox-web/fonts/`** (source OTFs) and are also copied to **`tevox-web/src/assets/fonts/`** where Vite picks them up.  
The `@font-face` declarations in `src/index.css` reference `./assets/fonts/`.

Available weights: Thin (100), ExtraLight (200), Light (300), Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800), Heavy (900), Black (950-ish).  
Each has a matching Italic variant.

Tailwind font-family config:
```js
fontFamily: { sans: ['FC Vision', 'Arial', 'sans-serif'] }
```

## Language Rules
- **All UI copy:** Thai
- **SKUs, car model names, technical labels:** English/Latin only
- **Code:** English identifiers always
- Chatbot and fitment AI responses must be Thai (enforced in system prompt)

## Security Rules — CRITICAL
- `GEMINI_API_KEY` is **server-side only**. Never import it into any file under `src/`.
- It is consumed exclusively inside `supabase/functions/chat/index.ts` and `supabase/functions/fitment/index.ts` via `Deno.env.get('GEMINI_API_KEY')`.
- Client calls Gemini indirectly by POSTing to the Supabase Edge Function URL with the anon key.

## Environment Variables
```
VITE_SUPABASE_URL          # public — safe for client
VITE_SUPABASE_PUBLISHABLE_KEY     # public — safe for client
VITE_R2_PUBLIC_URL         # public bucket URL for serving images
GEMINI_API_KEY             # server-side Edge Functions only
```

## Project File Structure
```
tevox-web/
├── public/placeholders/
├── src/
│   ├── assets/fonts/          ← copy from project-root fonts/
│   ├── components/
│   │   ├── layout/Navbar.jsx
│   │   ├── layout/Footer.jsx
│   │   ├── ui/Button.jsx
│   │   ├── ui/Badge.jsx
│   │   ├── ui/ProductCard.jsx
│   │   ├── Chatbot.jsx
│   │   └── FitmentChecker.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Gallery.jsx
│   │   └── About.jsx
│   ├── lib/
│   │   ├── supabase.js
│   │   └── r2.js
│   ├── hooks/
│   │   ├── useProducts.js
│   │   └── useInstalls.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── supabase/functions/
│   ├── chat/index.ts
│   └── fitment/index.ts
├── .env.local
├── tailwind.config.js
└── vite.config.js
```

## Styling Conventions
| Element | Value |
|---|---|
| Border radius | 8px standard · 4px for badges/pills |
| Display / Hero | 48–64px |
| H2 | 32px |
| H3 | 20px |
| Body | 16px |
| Caption | 13px |
| Images | `object-fit: cover`, aspect-ratio locked, dark overlay OK |

Background rule: `#1D1C1D` on hero sections and chatbot panel; `#F1F5F8` on content pages.

## Image Placeholders
```
Hero (wide):        https://placehold.co/1200x600/1D1C1D/E9FF22?text=Tevox+Hero
Product card:       https://placehold.co/600x400/1D1C1D/E9FF22?text=TVX-IM6-FL-001
Gallery install:    https://placehold.co/800x600/1D1C1D/F1F5F8?text=Customer+Install
Founder photo:      https://placehold.co/600x400/1D1C1D/E9FF22?text=Founder
```
The `r2Url(key)` helper in `src/lib/r2.js` applies the fallback automatically.

## Product Status Labels (Thai)
| DB value | Display | Badge color |
|---|---|---|
| `preorder` | `พรีออเดอร์` | yellow (`brand-yellow`) |
| `available` | `มีสินค้า` | green |
| `sold_out` | `หมดแล้ว` | gray |
| `coming_soon` | `เร็วๆ นี้` | blue (`brand-blue`) |

## Supabase Schema Summary
- `products` — public read (RLS); has `image_keys text[]` for R2 keys
- `installs` — public read only where `is_approved = true`; anyone can insert
- `leads` — insert only (chatbot + fitment lead capture)
- `waitlist` — insert only (waitlist modal)

## AI Model to Use
Edge Functions use `gemini-2.0-flash` via the `@google/generative-ai` npm package (works in Deno via npm: specifier). Use `GoogleGenerativeAI` from that package — do not call the REST endpoint directly.

## Out of Scope (V1)
Admin dashboard · payment · Line LIFF · multi-language toggle · SEO/OG · analytics

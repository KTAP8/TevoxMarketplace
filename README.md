# Tevox Automotive — Website

EV aftermarket parts marketplace for Thai EV owners. Built by owners, for owners.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Vite + React (JSX), React Router v6, Tailwind CSS |
| Backend | Supabase (PostgreSQL + Edge Functions) |
| AI | Groq `llama-3.3-70b-versatile` (chatbot) |
| Media | Cloudflare R2 |
| Deployment | Vercel (frontend) |

## Project Structure

```
TevoxMarketplace/
└── tevox-web/
    ├── src/
    │   ├── assets/fonts/          # FC Vision OTF files
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Navbar.jsx
    │   │   │   └── Footer.jsx
    │   │   ├── ui/
    │   │   │   ├── Button.jsx
    │   │   │   ├── Badge.jsx
    │   │   │   └── ProductCard.jsx
    │   │   └── Chatbot.jsx
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
    │   └── index.css
    ├── supabase/functions/
    │   └── chat/index.ts          # Groq-powered chatbot
    ├── vercel.json
    └── tailwind.config.js
```

## Local Development

```bash
cd tevox-web
npm install
npm run dev
```

Create `tevox-web/.env.local`:

```env
VITE_SUPABASE_URL=https://cecahcsezqpvnucqswzq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_R2_PUBLIC_URL=                          # leave empty to use placeholders
```

## Environment Variables

### Frontend (Vercel)

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (safe for client) |
| `VITE_R2_PUBLIC_URL` | Cloudflare R2 public bucket URL |

### Edge Functions (Supabase Secrets)

| Secret | Description |
|---|---|
| `GROQ_API_KEY` | Groq API key — used by the `chat` function |

Set via Supabase dashboard → Edge Functions → Manage secrets.

## Deploying Edge Functions

```bash
# From tevox-web/
supabase functions deploy chat
```

Or use the Supabase MCP server from Claude Code.

## Deploying Frontend

Push to the connected GitHub repo — Vercel auto-deploys on every push to `main`.

**Vercel settings:**
- Root Directory: `tevox-web`
- Build Command: `npm run build`
- Output Directory: `dist`

## Database Schema

### `products`
Public read. Stores all EV aftermarket parts.

Key columns: `sku`, `name_th`, `car_model`, `category`, `price_thb`, `status`, `image_keys[]`, `specs` (jsonb)

Status values: `preorder` | `available` | `sold_out` | `coming_soon`

### `installs`
Public read where `is_approved = true`. Customer install gallery photos.

### `leads`
Insert only. Captured from the chatbot when a user shares their Line ID.

### `waitlist`
Insert only. Users who want to be notified when new products arrive.

## Brand

| Token | Hex | Usage |
|---|---|---|
| `brand-yellow` | `#E9FF22` | CTAs, active states, badges |
| `brand-dark` | `#1D1C1D` | Hero, navbar, chatbot background |
| `brand-light` | `#F1F5F8` | Content page backgrounds |
| `brand-blue` | `#3843EB` | Links, highlights |

Font: **FC Vision** (self-hosted OTF). Falls back to Arial.

All UI copy is Thai. SKUs, car model names, and technical labels are English.

## AI Chatbot

The chatbot (`TEVOX // ASSIST`) runs via a Supabase Edge Function using Groq's `llama-3.3-70b-versatile`. It fetches the live product list on every request and injects it into the system prompt. When a user shares their Line ID, the function saves a lead to the `leads` table automatically.

# Tevox Nox — Implementation Reference for Claude Code

---

## 1. SYSTEM PROMPT

This is the base system prompt. Do NOT hardcode products here — those come from your database at runtime (see Section 3).

```
You are Nox — the AI customer service assistant for Tevox Automotive, a Thai EV aftermarket parts shop based in Bangkok. You were built to sound exactly like the founder: an MG IM6 owner, ICE student, engineer-minded but warm and community-first.

---

## YOUR PERSONALITY
- You are NOT a corporate chatbot. You sound like the owner texting a friend who happens to be a customer.
- Warm, direct, a little casual. Use "ครับ" naturally. Double "ครับบ" is fine for friendlier moments.
- You are technical and precise when needed, but never cold.
- You care. You're not trying to upsell aggressively — but you do recommend what genuinely makes sense.
- Never use: "world class", "revolutionary", "best of the best", "ยินดีต้อนรับ" in a robotic way.
- Thai-first. If customer writes Thai → reply Thai. If English → reply English. If mixed → match their energy.

---

## PRODUCTS & PRICING
[INJECTED FROM DATABASE AT RUNTIME — see implementation notes]

---

## IMAGE RULE (CRITICAL)
Some questions require sending an image. When this happens:
- Answer the question normally in text
- End your reply with exactly this line on its own: [IMAGE_NEEDED]

Trigger [IMAGE_NEEDED] when customer asks about:
- How the car looks with the kit on
- Color options / specific color (beige, white, black, etc.)
- What the product looks like
- Any "มีรูปไหม" / "ขอดูรูปหน่อย" type question

---

## HANDLING EDGE CASES

- Model not supported yet → Tell them honestly, say we're expanding, ask which model so we can prioritize.

DEMAND TRACKING RULES — follow exactly:

STEP 1 — CONFIRM BEFORE SAVING
When a customer mentions one or more unsupported models, DO NOT fire any demand flag yet.
Summarize what you're about to save and ask them to confirm first. Examples:
- Single: "จด Zeekr 7X ไว้ให้เลยนะครับ ถูกต้องไหมครับ?"
- Multiple: "จะจดไว้ให้ 3 รุ่นเลยนะครับ: Zeekr 7X, Zeekr X และ Zeekr 009 — ถูกต้องไหมครับ?"

STEP 2 — FIRE FLAGS ONLY AFTER CUSTOMER CONFIRMS
Only after customer confirms (ถูกแล้ว / ใช่ / โอเค / yes / correct / ครับ) → fire the flags:
- [DEMAND_NOTE: MODEL_NAME] → new confirmed model (can appear multiple times in one reply)
- [DEMAND_CORRECT: MODEL_NAME] → customer corrected a previously noted model
- [DEMAND_ADD: MODEL_NAME] → customer adding another model on top of existing ones

STEP 3 — CORRECTIONS
If customer says ขอโทษ / ไม่ใช่ / แก้ / sorry / หมายถึง → ask them to confirm the corrected model before firing [DEMAND_CORRECT].

Never fire any flag for a vague brand with no model (e.g. just "BYD" or "Zeekr").
Never fire any flag before customer confirmation.

- Negotiation / discount → ราคาเราตั้งไว้ fair อยู่แล้วครับ ไม่ได้บวกมาก แต่ถ้าซื้อหลายชิ้นคุยกันได้ครับ
- Complaint → รับฟัง ไม่โยน ไม่แก้ตัว หาทางออกก่อน
- Unsure → "ขอเช็คก่อนนะครับ แล้วจะรีบตอบกลับครับ" — never guess

---

## TONE EXAMPLES
❌ "สวัสดีครับ ยินดีต้อนรับสู่ Tevox Automotive ทางเรามีผลิตภัณฑ์คุณภาพสูง..."
✅ "สวัสดีครับ มีอะไรให้ช่วยได้เลยครับ 👋"

❌ "ราคาสินค้าของเราอยู่ที่ 15,000 บาทสำหรับชุดแต่ง MG IM6"
✅ "ชุด IM6 อยู่ที่ 15,000 ครับ รวมติดตั้งเป็น 16,500 บาทครับบ"

Keep replies concise. No long paragraphs. Feel like a real chat, not a brochure.
```

---

## 2. MODEL & API

```javascript
// Endpoint
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// Model
const MODEL = "deepseek-chat"; // DeepSeek-V3 / flash — confirm exact string in DeepSeek dashboard

// Auth — store in .env, never hardcode
// DEEPSEEK_API_KEY=your_key_here
```

DeepSeek uses OpenAI-compatible format, so the system prompt goes inside `messages`:

```javascript
const response = await fetch(DEEPSEEK_API_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
  },
  body: JSON.stringify({
    model: MODEL,
    max_tokens: 1000,
    messages: [
      { role: "system", content: systemPrompt }, // system goes here, not top-level
      ...conversationHistory                      // full history every call
    ]
  })
});

const data = await response.json();
const reply = data.choices[0].message.content;
```

---

## 3. INJECTING PRODUCTS FROM DATABASE

Before every API call, fetch your products and inject them into the system prompt:

```javascript
async function buildSystemPrompt() {
  const products = await db.getProducts(); // your DB call — adjust to your schema

  const productBlock = products.map(p => `
### ${p.name}
- Price: ${p.price} บาท + ติดตั้ง ${p.installation_price} บาท = รวม ${p.price + p.installation_price} บาท
- Includes: ${p.includes}
- Material: ${p.material}
- Installation time: ${p.installation_time}
- Installation location: ${p.installation_location}
- Lead time: ${p.in_stock ? "มีของพร้อม นัดวันติดตั้งได้เลย" : "Preorder ~30 วัน"}
- Notes: ${p.notes ?? ""}
  `.trim()).join("\n\n");

  return BASE_SYSTEM_PROMPT.replace(
    "[INJECTED FROM DATABASE AT RUNTIME — see implementation notes]",
    productBlock
  );
}

// Then use it:
const systemPrompt = await buildSystemPrompt();
```

Adjust field names (`p.name`, `p.price` etc.) to match your actual database columns.

---

## 4. FLAG PARSING

Run this on every reply before showing it to the customer:

```javascript
function parseReply(rawReply) {
  const needsImage = rawReply.includes("[IMAGE_NEEDED]");

  const demandModels      = [...rawReply.matchAll(/\[DEMAND_NOTE:\s*([^\]]+)\]/gi)].map(m => m[1].trim());
  const demandCorrections = [...rawReply.matchAll(/\[DEMAND_CORRECT:\s*([^\]]+)\]/gi)].map(m => m[1].trim());
  const demandAdditions   = [...rawReply.matchAll(/\[DEMAND_ADD:\s*([^\]]+)\]/gi)].map(m => m[1].trim());

  const cleanReply = rawReply
    .replace("[IMAGE_NEEDED]", "")
    .replace(/\[DEMAND_NOTE:\s*[^\]]+\]/gi, "")
    .replace(/\[DEMAND_CORRECT:\s*[^\]]+\]/gi, "")
    .replace(/\[DEMAND_ADD:\s*[^\]]+\]/gi, "")
    .trim();

  return { cleanReply, needsImage, demandModels, demandCorrections, demandAdditions };
}
```

---

## 5. WHAT TO DO WITH EACH FLAG

```javascript
const { cleanReply, needsImage, demandModels, demandCorrections, demandAdditions } = parseReply(rawReply);

// Show clean reply to customer
sendToCustomer(cleanReply);

// Image flag → notify yourself to send a photo manually
if (needsImage) {
  await notifyOwner({ type: "IMAGE_NEEDED", question: lastCustomerMessage });
}

// New confirmed models → insert into demand table
for (const model of demandModels) {
  await db.upsertDemand({ model, type: "new" });
}

// Correction → update existing entry (find same brand, replace model name)
for (const model of demandCorrections) {
  await db.correctDemand({ model }); // find most recent same-brand entry, update name
}

// Additional model → always a new separate row
for (const model of demandAdditions) {
  await db.upsertDemand({ model, type: "add" });
}
```

---

## 6. CONVERSATION MEMORY

No memory between API calls — always send the full history:

```javascript
// Store in your session/db
const conversationHistory = [
  { role: "user", content: "ชุดแต่ง IM6 ราคาเท่าไหร่" },
  { role: "assistant", content: "ชุด IM6 อยู่ที่ 15,000 ครับ รวมติดตั้งเป็น 16,500 บาทครับบ" },
  // append each new message before calling the API
];
```

---

## 7. REFINEMENT LOOP (OPTIONAL)

When you mark a reply as wrong and provide the correct answer, call the API again to update the system prompt:

```javascript
async function refineSystemPrompt(currentPrompt, question, wrongAnswer, correctAnswer) {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 3000,
      messages: [{
        role: "user",
        content: `You are helping refine a customer service chatbot system prompt for Tevox Automotive.

The bot gave a wrong answer. The owner provided the correct one.
Update the system prompt so this type of question is answered correctly in future.

CURRENT SYSTEM PROMPT:
${currentPrompt}

FEEDBACK:
- Customer asked: "${question}"
- Bot answered: "${wrongAnswer}"
- Correct answer: "${correctAnswer}"

INSTRUCTIONS:
1. Identify what caused the wrong answer
2. Add or modify only what's needed — keep everything else intact
3. Return ONLY the updated system prompt — no explanation, no preamble, no markdown fences`
      }]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// Save the returned string as your new system prompt in your DB or config
```

---

## 8. SETUP CHECKLIST

- [ ] Add `DEEPSEEK_API_KEY` to your `.env`
- [ ] Copy the base system prompt from Section 1 into your codebase as `BASE_SYSTEM_PROMPT`
- [ ] Build `buildSystemPrompt()` to inject products from your DB (Section 3) — adjust field names to match your schema
- [ ] Replace old model string and endpoint with DeepSeek values (Section 2)
- [ ] Add `parseReply()` function (Section 4) — run on every API response before displaying
- [ ] Handle each flag appropriately (Section 5)
- [ ] Make sure full conversation history is sent every API call (Section 6)
- [ ] (Optional) Hook up refinement loop for self-improvement (Section 7)

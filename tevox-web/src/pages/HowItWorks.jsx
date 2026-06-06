import { Link } from 'react-router-dom'

const STEPS = [
  {
    n: '01',
    title: 'เลือกสินค้า',
    body:  'เลือกชิ้นส่วนแต่งที่ต้องการจากหน้าสินค้า ตรวจสอบรุ่นรถที่รองรับและรายละเอียดก่อนสั่ง หากไม่แน่ใจสามารถสอบถามผ่านแชทหรือ Messenger ได้ทันที',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    n: '02',
    title: 'วางมัดจำออนไลน์',
    body:  'ชำระมัดจำผ่านระบบ Stripe ที่ปลอดภัย รองรับบัตรเครดิต/เดบิตทุกธนาคาร ไม่มีการเก็บข้อมูลบัตรในระบบของเรา ยอดที่เหลือชำระที่ร้านในวันติดตั้ง',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
        <line x1="6" y1="15" x2="9" y2="15" />
      </svg>
    ),
  },
  {
    n: '03',
    title: 'รอทีมงานติดต่อกลับ',
    body:  'ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมงหลังการชำระมัดจำ เพื่อยืนยันออเดอร์และนัดหมายวันติดตั้งที่สะดวก',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    n: '04',
    title: 'ติดตั้งและรับสินค้า',
    body:  'มาที่ร้าน Tevox Automotive บางกระดี่ ทีมช่างติดตั้งให้โดยไม่ต้องเจาะตัวถังรถ ใช้เวลา 2–4 ชั่วโมง ชำระยอดที่เหลือและรับสินค้าหรือรอรับหลังติดตั้งเสร็จ',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  return (
    <div className="bg-zinc-50 min-h-screen">

      {/* Hero */}
      <section className="bg-brand-dark py-20 px-6">
        <div className="max-w-4xl mx-auto text-center flex flex-col gap-4">
          <p className="font-mono text-micro text-brand-yellow tracking-[0.2em] uppercase">[ HOW IT WORKS ]</p>
          <h1 className="text-display font-black text-white leading-tight">
            สั่งซื้อง่าย<br />
            <span className="text-brand-yellow">4 ขั้นตอน</span>
          </h1>
          <p className="text-body text-zinc-400 max-w-lg mx-auto leading-relaxed mt-2">
            ตั้งแต่เลือกสินค้าจนถึงติดตั้งเสร็จ ใช้เวลาไม่นาน ไม่ยุ่งยาก
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-0">
        {STEPS.map((step, i) => (
          <div key={step.n} className="flex gap-0 items-stretch">

            {/* Number + connector */}
            <div className="flex flex-col items-center w-16 shrink-0">
              <div className="w-12 h-12 bg-brand-yellow text-brand-dark flex items-center justify-center font-mono font-black text-caption tracking-widest shrink-0">
                {step.n}
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-px flex-1 bg-zinc-200 my-2" />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-12 ${i < STEPS.length - 1 ? '' : ''}`}>
              <div className="bg-white border border-zinc-200 p-6 ml-4 flex gap-5 items-start">
                <div className="text-zinc-300 shrink-0 mt-0.5">{step.icon}</div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-h3 font-black text-brand-dark">{step.title}</h2>
                  <p className="text-body text-zinc-500 leading-relaxed">{step.body}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Pricing note */}
      <section className="bg-brand-dark py-12 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-800">
          {[
            { label: 'มัดจำวันนี้', value: 'ตามที่ระบุในสินค้า', note: 'ชำระออนไลน์ผ่าน Stripe' },
            { label: 'ยอดที่เหลือ', value: 'ราคาสินค้า − มัดจำ', note: 'ชำระที่ร้านวันติดตั้ง' },
            { label: 'ค่าติดตั้ง', value: 'ตามที่ระบุในสินค้า', note: 'ชำระที่ร้านวันติดตั้ง' },
          ].map(item => (
            <div key={item.label} className="bg-brand-dark px-6 py-6 flex flex-col gap-1.5">
              <p className="font-mono text-micro text-zinc-600 tracking-[0.15em] uppercase">{item.label}</p>
              <p className="text-h3 font-black text-white">{item.value}</p>
              <p className="text-caption text-zinc-500">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* No-drill note */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <div className="border border-brand-yellow/30 bg-brand-yellow/5 p-6 flex flex-col gap-2">
          <p className="font-mono text-micro text-brand-yellow tracking-[0.15em] uppercase">[ ไม่เจาะตัวถังรถ ]</p>
          <p className="text-body text-zinc-700 leading-relaxed">
            สินค้าของ Tevox Automotive ออกแบบให้ติดตั้งได้โดยไม่ต้องเจาะหรือดัดแปลงตัวถังรถ
            ช่างทดสอบความพอดีก่อนส่งมอบทุกชิ้น
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20 text-center">
        <Link to="/products">
          <button className="bg-brand-yellow text-brand-dark font-bold text-body px-10 py-4 hover:brightness-105 transition-all tracking-wide">
            เลือกสินค้าได้เลย →
          </button>
        </Link>
      </section>

    </div>
  )
}

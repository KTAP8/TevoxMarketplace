import { useState } from 'react'
import { Link } from 'react-router-dom'

const FAQS = [
  {
    category: 'การสั่งซื้อและมัดจำ',
    items: [
      {
        q: 'มัดจำคืออะไร และต่างจากการซื้อปกติอย่างไร?',
        a: 'มัดจำคือการชำระเงินบางส่วนเพื่อยืนยันการจอง สินค้าที่ระบุว่าเป็น "พรีออเดอร์" หรือ "มีสินค้า" จะต้องวางมัดจำออนไลน์ก่อน แล้วชำระยอดที่เหลือรวมถึงค่าติดตั้งที่ร้านในวันที่นัดหมาย',
      },
      {
        q: 'วางมัดจำแล้วเปลี่ยนใจ ขอคืนเงินได้ไหม?',
        a: 'ขึ้นอยู่กับเงื่อนไขของสินค้าแต่ละรายการ กรุณาติดต่อทีมงานผ่าน Messenger หรือโทรตรงเพื่อแจ้งความประสงค์ก่อนนัดหมายการติดตั้ง ทีมงานจะพิจารณาตามสถานการณ์จริง',
      },
      {
        q: 'ชำระส่วนที่เหลือเมื่อไหร่และที่ไหน?',
        a: 'ชำระยอดที่เหลือในวันที่มาติดตั้งหรือรับสินค้าที่ร้าน Tevox Automotive สาขาบางกระดี่ รับชำระทั้งเงินสดและโอนธนาคาร',
      },
      {
        q: 'รับชำระบัตรอะไรบ้างสำหรับมัดจำออนไลน์?',
        a: 'รองรับบัตรเครดิตและบัตรเดบิตทุกธนาคารผ่านระบบ Stripe ทั้ง Visa, Mastercard และ JCB ชำระผ่านหน้าเว็บ Stripe ที่เข้ารหัส SSL',
      },
      {
        q: 'หลังชำระมัดจำจะได้รับอะไร?',
        a: 'อีเมลยืนยันคำสั่งซื้อจะถูกส่งทันทีหลังการชำระเงิน ระบุรายละเอียดสินค้า ยอดที่ชำระ และยอดค้างที่ต้องจ่ายที่ร้าน จากนั้นทีมงานจะโทรหรือ Message มาภายใน 24 ชั่วโมง',
      },
    ],
  },
  {
    category: 'การติดตั้ง',
    items: [
      {
        q: 'ต้องมาติดตั้งที่ร้านเองไหม?',
        a: 'แนะนำให้มาติดตั้งที่ร้าน เพราะช่างจะตรวจสอบความพอดีกับรถของลูกค้าโดยตรง อย่างไรก็ตาม สินค้าบางรายการสามารถจัดส่งได้ถ้าลูกค้ามีช่างที่ไว้วางใจ สามารถเลือกตัวเลือกจัดส่งในหน้าสั่งซื้อ',
      },
      {
        q: 'ร้านอยู่ที่ไหน และใช้เวลาติดตั้งนานเท่าไหร่?',
        a: 'ร้านตั้งอยู่ที่บางกระดี่ ปทุมธานี การติดตั้งใช้เวลาประมาณ 2–4 ชั่วโมงขึ้นอยู่กับประเภทสินค้า ทีมงานจะแจ้งรายละเอียดที่อยู่แน่นอนเมื่อนัดหมาย',
      },
      {
        q: 'ต้องเจาะหรือดัดแปลงตัวถังรถไหม?',
        a: 'ไม่ครับ สินค้าของ Tevox Automotive ออกแบบมาให้ติดตั้งได้โดยไม่ต้องเจาะหรือตัดตัวถังรถ ใช้จุดยึดเดิมของรถเป็นหลัก',
      },
      {
        q: 'ค่าติดตั้งรวมอยู่ในราคาสินค้าไหม?',
        a: 'ไม่ครับ ค่าติดตั้งแยกต่างหากจากราคาสินค้า และชำระที่ร้านในวันติดตั้ง ราคาค่าติดตั้งระบุไว้ในหน้าสินค้าแต่ละรายการ',
      },
    ],
  },
  {
    category: 'ความเข้ากันได้',
    items: [
      {
        q: 'สินค้าเข้ากับรถรุ่นอื่นนอกจากที่ระบุได้ไหม?',
        a: 'สินค้าแต่ละรายการออกแบบมาสำหรับรุ่นรถที่ระบุโดยเฉพาะ ไม่แนะนำให้ใช้กับรุ่นอื่นโดยไม่ตรวจสอบ ถ้าไม่แน่ใจสามารถถามผ่านแชทพร้อมระบุยี่ห้อ รุ่น ปีและสเปคของรถได้ทันที',
      },
      {
        q: 'ซื้อแล้วสินค้าไม่พอดีรถจะทำอย่างไร?',
        a: 'แจ้งทีมงานทันที ก่อนการติดตั้งช่างจะตรวจสอบความพอดีก่อนเสมอ ถ้าพบปัญหาจะประสานแก้ไขก่อนดำเนินการ ไม่ให้ลูกค้าต้องแบกรับปัญหาคนเดียว',
      },
      {
        q: 'ใช้แชทหรือ Fitment Checker ช่วยตรวจสอบได้ไหม?',
        a: 'ได้ครับ ใช้ปุ่ม "คุยกับเรา" หรือ AI Fitment Checker ในหน้าสินค้าเพื่อถามเรื่องความเข้ากันได้ แจ้งยี่ห้อ รุ่น ปี และระดับตกแต่ง (Trim) เพื่อให้ได้คำตอบที่ตรงที่สุด',
      },
    ],
  },
  {
    category: 'การจัดส่ง',
    items: [
      {
        q: 'จัดส่งทั่วประเทศไหม?',
        a: 'จัดส่งได้ทุกจังหวัดทั่วไทย ค่าจัดส่งและเวลาขึ้นอยู่กับขนาดและน้ำหนักของสินค้า ทีมงานจะแจ้งรายละเอียดเมื่อติดต่อกลับ',
      },
      {
        q: 'จัดส่งใช้เวลาเท่าไหร่?',
        a: 'โดยปกติ 3–7 วันทำการหลังยืนยันออเดอร์ สินค้าพรีออเดอร์อาจใช้เวลานานกว่า ทีมงานจะแจ้ง ETA ที่แน่นอนในการติดต่อครั้งแรก',
      },
    ],
  },
  {
    category: 'การรับประกัน',
    items: [
      {
        q: 'สินค้ามีการรับประกันไหม?',
        a: 'มีครับ สินค้าทุกชิ้นรับประกันคุณภาพงานผลิต ระยะเวลารับประกันระบุในหน้าสินค้า ครอบคลุมชำรุดจากการผลิต ไม่ครอบคลุมความเสียหายจากอุบัติเหตุหรือการใช้งานผิดประเภท',
      },
      {
        q: 'ถ้าสินค้าชำรุดหรือไม่สมบูรณ์ทำอย่างไร?',
        a: 'ถ่ายรูปชิ้นส่วนที่มีปัญหาพร้อมหมายเลข SKU และติดต่อทีมงานผ่าน Messenger ทีมงานจะพิจารณาและแจ้งขั้นตอนต่อไปภายใน 48 ชั่วโมง',
      },
    ],
  },
]

function Chevron({ open }) {
  return (
    <svg
      width="18" height="18" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="4,7 9,13 14,7" />
    </svg>
  )
}

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-zinc-200 last:border-0">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full text-left py-4 px-5 flex justify-between items-center gap-4 hover:bg-zinc-50 transition-colors"
      >
        <span className={`text-body leading-snug ${open ? 'font-bold text-brand-dark' : 'text-zinc-700'}`}>
          {q}
        </span>
        <Chevron open={open} />
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-body text-zinc-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  return (
    <div className="bg-zinc-50 min-h-screen">

      {/* Hero */}
      <section className="bg-brand-dark py-20 px-6">
        <div className="max-w-3xl mx-auto text-center flex flex-col gap-4">
          <p className="font-mono text-micro text-brand-yellow tracking-[0.2em] uppercase">[ FAQ ]</p>
          <h1 className="text-display font-black text-white leading-tight">
            คำถามที่<br />
            <span className="text-brand-yellow">พบบ่อย</span>
          </h1>
          <p className="text-body text-zinc-400 max-w-md mx-auto leading-relaxed mt-2">
            ไม่เจอคำตอบที่ต้องการ? ทักหาเราผ่าน Messenger ได้ทันที
          </p>
        </div>
      </section>

      {/* FAQ content */}
      <div className="max-w-3xl mx-auto px-6 py-14 flex flex-col gap-10">

        {FAQS.map(section => (
          <div key={section.category}>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-micro text-brand-yellow tracking-[0.2em] uppercase whitespace-nowrap">
                [ {section.category} ]
              </span>
              <div className="h-px flex-1 bg-zinc-200" />
            </div>
            <div className="bg-white border border-zinc-200 divide-y divide-zinc-200">
              {section.items.map((item, i) => (
                <AccordionItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}

        {/* Still have questions */}
        <div className="bg-brand-dark p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-mono text-micro text-brand-yellow tracking-[0.15em] uppercase mb-2">ยังมีคำถามอื่น?</p>
            <p className="text-body text-white font-bold">ทีมงานพร้อมช่วยเหลือทุกวัน</p>
            <p className="text-caption text-zinc-400 mt-1">ตอบกลับภายใน 24 ชั่วโมง</p>
          </div>
          <div className="flex gap-3">
            <a
              href="https://m.me/tevoxautomotive"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-yellow text-brand-dark font-bold text-body px-6 py-3 hover:brightness-105 transition-all whitespace-nowrap"
            >
              Messenger
            </a>
            <Link to="/how-it-works">
              <button className="border border-zinc-600 text-zinc-300 text-body px-6 py-3 hover:border-zinc-400 hover:text-white transition-colors whitespace-nowrap">
                วิธีสั่งซื้อ
              </button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

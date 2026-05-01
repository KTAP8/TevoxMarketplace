import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

const values = [
  { icon: '🔩', title: 'คุณภาพ', desc: 'ทุกชิ้นผ่านการทดสอบการติดตั้งจริงก่อนวางขาย ไม่ขายของที่ตัวเองไม่กล้าใส่รถตัวเอง' },
  { icon: '💬', title: 'ความโปร่งใส', desc: 'บอกตรงๆ ว่าใส่ได้ไม่ได้ ราคาเท่าไหร่ ใช้เวลานานแค่ไหน ไม่มีการโอเว่อร์เกินจริง' },
  { icon: '🚗', title: 'ชุมชน', desc: 'เราเริ่มจากการเป็นเจ้าของ EV เหมือนกัน เข้าใจปัญหาและต้องการสิ่งเดียวกัน' },
]

const steps = [
  { step: '01', title: 'ซื้อตรงจากโรงงานจีน', desc: 'คัดเลือกผู้ผลิตที่เชื่อถือได้ในจีน เจรจาตรง ไม่ผ่านคนกลาง' },
  { step: '02', title: 'ตรวจสอบคุณภาพ', desc: 'ทดสอบการติดตั้งจริงบน MG IM6 ของผู้ก่อตั้งก่อนทุกครั้ง' },
  { step: '03', title: 'จัดส่งในไทย', desc: 'พร้อมคู่มือติดตั้งภาษาไทย และ support ตลอดผ่าน Line OA' },
]

export default function About() {
  return (
    <div className="flex flex-col">

      {/* Hero */}
      <section className="bg-brand-dark py-20">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-caption font-semibold text-brand-yellow uppercase tracking-widest">เกี่ยวกับเรา</span>
              <h1 className="text-display font-black text-brand-light leading-tight">
                เริ่มจากปัญหา<br />
                <span className="text-brand-yellow">ของคนใช้ EV</span>
              </h1>
            </div>
            <p className="text-body text-zinc-400 leading-relaxed">
              ผู้ก่อตั้ง Tevox เป็นเจ้าของ MG IM6 คนแรกๆ ในไทย และเจอปัญหาเดียวกันกับทุกคน —
              ชิ้นส่วนแต่งรถ EV หาแทบไม่ได้ในไทย ต้องสั่งเองจากจีนโดยไม่รู้ว่าใส่ได้จริงหรือเปล่า
            </p>
            <p className="text-body text-zinc-400 leading-relaxed">
              Tevox เกิดขึ้นเพื่อแก้ปัญหานี้โดยตรง เราทดสอบทุกชิ้นกับรถจริงก่อน
              แล้วค่อยนำมาขาย เหมือนที่ JDM และ Euro Parts ทำมาหลายสิบปี
            </p>
            <div className="flex gap-3 mt-2">
              <Link to="/products"><Button variant="primary">ดูสินค้า</Button></Link>
              <a href="https://line.me/ti/p/~tevoxauto" target="_blank" rel="noopener noreferrer">
                <Button variant="secondary">ติดต่อเรา</Button>
              </a>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden aspect-[4/3]">
            <img
              src="https://placehold.co/600x400/1D1C1D/E9FF22?text=Founder"
              alt="ผู้ก่อตั้ง Tevox"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-brand-light py-16">
        <div className="max-w-6xl mx-auto px-4 flex flex-col gap-10">
          <h2 className="text-h2 font-bold text-brand-dark">เราทำงานอย่างไร</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col gap-3 p-6 bg-white rounded-lg border border-zinc-200">
                <span className="font-mono text-display font-black text-zinc-100 leading-none select-none">{step}</span>
                <h3 className="text-h3 font-bold text-brand-dark">{title}</h3>
                <p className="text-body text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand values */}
      <section className="bg-white py-16 border-t border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 flex flex-col gap-10">
          <h2 className="text-h2 font-bold text-brand-dark">สิ่งที่เราเชื่อ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-3">
                <span className="text-4xl">{icon}</span>
                <h3 className="text-h3 font-bold text-brand-dark">{title}</h3>
                <p className="text-body text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social / CTA */}
      <section className="bg-brand-dark py-16 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-h2 font-bold text-brand-light">ติดตามเราได้ที่</h2>
            <p className="text-body text-zinc-400">อัปเดตสินค้าใหม่ รีวิว และเทคนิคการแต่งรถ EV</p>
          </div>
          <div className="flex gap-4">
            <a href="https://tiktok.com/@tevoxauto" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">TikTok</Button>
            </a>
            <a href="https://facebook.com/tevoxauto" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">Facebook</Button>
            </a>
            <a href="https://line.me/ti/p/~tevoxauto" target="_blank" rel="noopener noreferrer">
              <Button variant="primary">Line OA</Button>
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}

import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

const steps = [
  { step: '01', title: 'ซื้อตรงจากโรงงานจีน', desc: 'คัดเลือกผู้ผลิตที่เชื่อถือได้ในจีน เจรจาตรง ไม่ผ่านคนกลาง' },
  { step: '02', title: 'ตรวจสอบคุณภาพ', desc: 'ทดสอบการติดตั้งจริงบน MG IM6 ของผู้ก่อตั้งก่อนทุกครั้ง' },
  { step: '03', title: 'จัดส่งในไทย', desc: 'พร้อมคู่มือติดตั้งภาษาไทย และ support ตลอดผ่าน Line OA' },
]

const values = [
  { label: 'QUALITY',       title: 'คุณภาพ',        desc: 'ทุกชิ้นผ่านการทดสอบการติดตั้งจริงก่อนวางขาย ไม่ขายของที่ตัวเองไม่กล้าใส่รถตัวเอง' },
  { label: 'TRANSPARENCY',  title: 'ความโปร่งใส',   desc: 'บอกตรงๆ ว่าใส่ได้ไม่ได้ ราคาเท่าไหร่ ใช้เวลานานแค่ไหน ไม่มีการโอเว่อร์เกินจริง' },
  { label: 'COMMUNITY',     title: 'ชุมชน',         desc: 'เราเริ่มจากการเป็นเจ้าของ EV เหมือนกัน เข้าใจปัญหาและต้องการสิ่งเดียวกัน' },
]

export default function About() {
  return (
    <div className="flex flex-col">

      {/* ── Founder hero (dark) ── */}
      <section className="relative bg-brand-dark bg-dot-faint overflow-hidden border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-[1fr_420px] lg:grid-cols-[1fr_500px] min-h-[70vh] items-stretch">
          <div className="flex flex-col justify-center py-20 pr-0 md:pr-16">
            <p className="font-mono text-micro text-zinc-600 tracking-[0.2em] uppercase mb-6">[ ABOUT TEVOX ]</p>
            <h1 className="text-display font-black text-zinc-100 leading-none mb-4">
              เริ่มจากปัญหา<br />
              <span className="text-brand-yellow">ของคนใช้ EV</span>
            </h1>
            <div className="h-px w-12 bg-brand-yellow my-6" />
            <div className="flex flex-col gap-4 max-w-lg">
              <p className="text-body text-zinc-400 leading-relaxed">
                ผู้ก่อตั้ง Tevox เป็นเจ้าของ MG IM6 คนแรกๆ ในไทย และเจอปัญหาเดียวกันกับทุกคน —
                ชิ้นส่วนแต่งรถ EV หาแทบไม่ได้ในไทย ต้องสั่งเองจากจีนโดยไม่รู้ว่าใส่ได้จริงหรือเปล่า
              </p>
              <p className="text-body text-zinc-400 leading-relaxed">
                Tevox เกิดขึ้นเพื่อแก้ปัญหานี้โดยตรง เราทดสอบทุกชิ้นกับรถจริงก่อน
                แล้วค่อยนำมาขาย เหมือนที่ JDM และ Euro Parts ทำมาหลายสิบปี
              </p>
              <blockquote className="border-l-2 border-brand-yellow pl-4 mt-2">
                <p className="text-zinc-300 text-body italic leading-relaxed">
                  " ถ้าตัวเองไม่กล้าใส่รถตัวเอง ก็ไม่ขาย "
                </p>
              </blockquote>
            </div>
            <div className="flex gap-3 mt-8">
              <Link to="/products"><Button variant="primary">ดูสินค้า</Button></Link>
              <a href="https://line.me/ti/p/~tevoxauto" target="_blank" rel="noopener noreferrer">
                <Button variant="secondary">ติดต่อเรา</Button>
              </a>
            </div>
          </div>
          <div className="hidden md:block relative">
            <img src="https://placehold.co/600x700/131312/E9FF22?text=Founder" alt="ผู้ก่อตั้ง Tevox" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-transparent to-transparent w-20" />
            <div className="absolute bottom-8 left-6">
              <p className="font-mono text-micro text-zinc-600 tracking-[0.15em] uppercase">[ FOUNDER · MG IM6 OWNER ]</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works (light) ── */}
      <section className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <p className="font-mono text-micro text-zinc-400 tracking-[0.15em] uppercase mb-2">[ PROCESS ]</p>
          <h2 className="text-h2 font-black text-brand-dark mb-12">เราทำงานอย่างไร</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-200">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="bg-white p-8 flex flex-col gap-5">
                <div className="flex items-start gap-4">
                  <span className="font-mono font-bold text-[52px] text-zinc-100 leading-none tabular-nums shrink-0">
                    {step}
                  </span>
                  <div className="pt-7 h-px flex-1 bg-zinc-200" />
                </div>
                <h3 className="text-h3 font-bold text-brand-dark">{title}</h3>
                <p className="text-body text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values (light warm) ── */}
      <section className="bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <p className="font-mono text-micro text-zinc-400 tracking-[0.15em] uppercase mb-2">[ VALUES ]</p>
          <h2 className="text-h2 font-black text-brand-dark mb-12">สิ่งที่เราเชื่อ</h2>

          <div className="flex flex-col gap-0 divide-y divide-zinc-200 border-t border-zinc-200">
            {values.map(({ label, title, desc }) => (
              <div key={label} className="py-8 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
                <div>
                  <span className="font-mono text-micro text-zinc-400 tracking-[0.15em] uppercase block mb-1">{label}</span>
                  <h3 className="text-h3 font-bold text-brand-dark">{title}</h3>
                </div>
                <p className="text-body text-zinc-500 leading-relaxed max-w-xl">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social CTA (white) ── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex flex-col gap-2">
            <p className="font-mono text-micro text-zinc-400 tracking-[0.15em] uppercase">[ FOLLOW US ]</p>
            <h2 className="text-h2 font-black text-brand-dark">ติดตามเราได้ที่</h2>
            <p className="text-zinc-500 text-body">อัปเดตสินค้าใหม่ รีวิว และเทคนิคการแต่งรถ EV</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { href: 'https://tiktok.com/@tevoxauto',   label: 'TikTok' },
              { href: 'https://facebook.com/tevoxauto',  label: 'Facebook' },
              { href: 'https://line.me/ti/p/~tevoxauto', label: 'Line OA', primary: true },
            ].map(({ href, label, primary }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer">
                <Button variant={primary ? 'primary' : 'secondary'}>{label}</Button>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

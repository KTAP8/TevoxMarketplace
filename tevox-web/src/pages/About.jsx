import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useSettings } from '../hooks/useSettings'

function SocialIcon({ platform }) {
  if (platform === 'TikTok') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.6 5.82s1.42 1.83 3.4 1.83v3.19c-1.27 0-2.37-.4-3.24-.99v4.42c0 4.47-3.59 7.73-7.76 7.73-4.17 0-7.76-3.26-7.76-7.73s3.59-7.73 7.76-7.73v3.28c-2.43 0-4.57 1.87-4.57 4.45s2.14 4.45 4.57 4.45c2.43 0 4.57-1.87 4.57-4.45V1h3.03v4.82z" />
    </svg>
  )
  if (platform === 'Facebook') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  )
  if (platform === 'Messenger') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 3.062 1.445 5.791 3.712 7.569L5.75 22l2.475-1.344A9.908 9.908 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm1.07 13.024l-2.551-2.72-4.979 2.718 5.477-5.817 2.613 2.72 4.916-2.72-5.476 5.819z" />
    </svg>
  )
  return null
}

const steps = [
  { step: '01', title: 'ซื้อตรงจากโรงงานจีน', desc: 'คัดเลือกผู้ผลิตที่เชื่อถือได้ในจีน เจรจาตรง ไม่ผ่านคนกลาง' },
  { step: '02', title: 'ตรวจสอบคุณภาพ', desc: 'เช็คคุณภาพและความพอดีก่อนส่งถึงมือลูกค้าทุกชิ้น ออกแบบให้ติดตั้งโดยไม่ต้องเจาะตัวถังรถ เพื่อรักษาสภาพสีและโครงสร้างเดิมของรถ' },
  { step: '03', title: 'ติดตั้งโดยช่างที่ไว้ใจได้', desc: 'ติดตั้งที่ร้านพาร์ทเนอร์ บางกระดี่ ใส่ใจทุกจุด หากมีโอกาสที่บอดี้คิทจะเสียดสีรถในระยะยาว เราจะติด PPF ป้องกันให้ก่อนเสมอ' },
]

const values = [
  { label: 'QUALITY',       title: 'คุณภาพ',        desc: 'ทุกชิ้นผ่านการทดสอบการติดตั้งจริงก่อนวางขาย ไม่ขายของที่ตัวเองไม่กล้าใส่รถตัวเอง' },
  { label: 'TRANSPARENCY',  title: 'ความโปร่งใส',   desc: 'บอกตรงๆ ว่าใส่ได้ไม่ได้ ราคาเท่าไหร่ ใช้เวลานานแค่ไหน ไม่มีการโอเว่อร์เกินจริง' },
  { label: 'COMMUNITY',     title: 'ชุมชน',         desc: 'เราเริ่มจากการเป็นเจ้าของ EV เหมือนกัน เข้าใจปัญหาและต้องการสิ่งเดียวกัน' },
]

export default function About() {
  const { settings } = useSettings()

  const socialLinks = [
    settings.tiktok_url    && { href: settings.tiktok_url,    label: 'TikTok' },
    settings.facebook_url  && { href: settings.facebook_url,  label: 'Facebook' },
    settings.messenger_url && { href: settings.messenger_url, label: 'Messenger', primary: true },
  ].filter(Boolean)

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
              {settings.messenger_url && (
                <a href={settings.messenger_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary">ติดต่อเรา</Button>
                </a>
              )}
            </div>
          </div>
          <div className="hidden md:block relative">
            <img src="https://pub-8e41e2b3a9c54834a89b577b2c07cb83.r2.dev/founder_img.png" alt="ผู้ก่อตั้ง Tevox" className="absolute inset-0 w-full h-full object-cover" />
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
                  <span className="font-mono font-bold text-[52px] text-zinc-800 leading-none tabular-nums shrink-0">
                    {step}
                  </span>
                  <div className="pt-7 h-px flex-1 bg-zinc-400" />
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

      {/* ── Social CTA (dark) ── */}
      <section className="bg-brand-dark border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex flex-col gap-2">
            <p className="font-mono text-micro text-zinc-600 tracking-[0.15em] uppercase">[ FOLLOW US ]</p>
            <h2 className="text-h2 font-black text-zinc-100">ติดตามเราได้ที่</h2>
            <p className="text-zinc-500 text-body">อัปเดตสินค้าใหม่ รีวิว และเทคนิคการแต่งรถ EV</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map(({ href, label, primary }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2.5 border px-5 py-3 font-mono text-caption tracking-wider transition-colors group ${
                  primary
                    ? 'border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-brand-dark'
                    : 'border-zinc-700 text-zinc-400 hover:border-brand-yellow hover:text-brand-yellow'
                }`}
              >
                <SocialIcon platform={label} />
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

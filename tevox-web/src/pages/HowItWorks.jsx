import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [selectedModel, setSelectedModel] = useState('BYD Seal')
  const [paymentPrice, setPaymentPrice] = useState(18000)
  const [stripePaid, setStripePaid] = useState(false)
  const [payLoading, setPayLoading] = useState(false)

  const containerRef = useRef(null)
  const isScrollingRef = useRef(false)

  // Reset Stripe simulation after success
  useEffect(() => {
    if (stripePaid) {
      const timer = setTimeout(() => setStripePaid(false), 8000)
      return () => clearTimeout(timer)
    }
  }, [stripePaid])

  // Track window scroll progress and map it to step transitions
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || isScrollingRef.current) return
      
      const rect = containerRef.current.getBoundingClientRect()
      const navbarHeight = 56 // height of the sticky navbar (h-14 = 56px)
      const totalScrollableHeight = rect.height - window.innerHeight + navbarHeight
      const scrolled = navbarHeight - rect.top // distance scrolled inside sticky window

      if (totalScrollableHeight <= 0) return

      let progress = scrolled / totalScrollableHeight
      progress = Math.max(0, Math.min(1, progress))
      setScrollProgress(progress)

      // Map progress directly to active step index (0, 1, 2, 3)
      const stepCount = 4
      let stepIndex = Math.floor(progress * stepCount)
      if (stepIndex >= stepCount) stepIndex = stepCount - 1
      setActiveStep(stepIndex)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initialize state on mount

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Handle manual step button clicks
  const handleStepClick = (index) => {
    if (!containerRef.current) return
    
    isScrollingRef.current = true
    setActiveStep(index)

    const rect = containerRef.current.getBoundingClientRect()
    const containerTopY = window.scrollY + rect.top
    const navbarHeight = 56
    const totalScrollableHeight = rect.height - window.innerHeight + navbarHeight
    
    // Position scroll at the midpoint of target step range
    const targetProgress = (index + 0.5) / 4
    const targetScrollY = containerTopY + targetProgress * totalScrollableHeight - navbarHeight
    setScrollProgress(targetProgress)

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    })

    // Release scroll tracking lock after smooth scroll completes
    setTimeout(() => {
      isScrollingRef.current = false
    }, 850)
  }

  const handleSimulatePayment = () => {
    setPayLoading(true)
    setTimeout(() => {
      setPayLoading(false)
      setStripePaid(true)
    }, 1200)
  }

  const steps = [
    {
      n: '01',
      title: 'เลือกสินค้าที่ใช่',
      body: 'ค้นหาชิ้นส่วนตกแต่งที่ออกแบบมาเฉพาะรุ่นรถของคุณ ตรวจสอบรายละเอียดและรุ่นรถที่เข้ากันได้ หากต้องการคำแนะนำเพิ่มเติม สามารถสอบถามผ่าน AI Chatbot หรือคุยกับแอดมินทางแชทได้ทันที',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      )
    },
    {
      n: '02',
      title: 'วางมัดจำออนไลน์อย่างปลอดภัย',
      body: 'ชำระเงินมัดจำบางส่วน (ประมาณ 30-50%) ผ่านระบบ Stripe / การโอนผ่าน Messenger ที่ปลอดภัยระดับมาตรฐานสากล รองรับบัตรเครดิต บัตรเดบิต และช่องทางโมบายแบงก์กิ้ง ยอดส่วนที่เหลือชำระที่หน้าร้านหลังจากติดตั้งเสร็จสิ้น',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
          <line x1="6" y1="15" x2="10" y2="15" />
        </svg>
      )
    },
    {
      n: '03',
      title: 'คอนเฟิร์มสั่งผลิต',
      body: 'หลังชำระมัดจำ ทีมงานจะติดต่อกลับผ่านช่องทางแชทหรือโทรศัพท์ภายใน 24 ชั่วโมง เพื่อยืนยันออเดอร์ ความถูกต้องของรุ่นรถ สีของสินค้า และทำการสั่งสิ่งค้าให้',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    },
    {
      n: '04',
      title: 'ติดตั้งโดยผู้เชี่ยวชาญ & รับรถ',
      body: 'เดินทางมาติดตั้งที่หน้าร้าน Tevox Automotive บางกระดี่ ทีมช่างติดตั้งด้วยเทคนิคไร้การเจาะตัวถัง 100% ปกป้องสีรถด้วยฟิล์ม PPF บริเวณจุดสัมผัสที่มีโอกาสทำให้สีเป็นรอย ใช้เวลาติดตั้ง 2-4 ชั่วโมง ก่อนชำระยอดที่เหลือแล้วรับรถกลับบ้าน',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      )
    }
  ]

  const carSpecs = {
    'BYD Seal': { lip: 'Front Lip Carbon', side: 'Side Skirts Carbon', diffuser: 'Sport Rear Diffuser' },
    'Deepal S05': { lip: 'Front Splitter Performance Gloss Black', side: 'Aero Skirts High-Gloss Black', diffuser: 'Sport Rear Diffuser' },
    'MG IM6': { lip: 'Front Spoiler Tevox Custom', diffuser: 'Rear Diffuser Sport Plus' }
  }

  return (
    <div className="bg-brand-dark min-h-screen text-brand-light font-sans relative overflow-visible">
      
      {/* Background decoration container with isolated overflow-hidden to allow page sticky to work */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-brand-yellow/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-yellow/10 rounded-full blur-[120px]" />
        <div className="absolute top-2/3 right-0 w-[300px] h-[300px] bg-brand-blue/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-dot-faint" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 z-10 border-b border-zinc-800/80">
        <div className="max-w-6xl mx-auto text-center flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-none mb-6 animate-pulse">
            <span className="w-1.5 h-1.5 bg-brand-yellow rounded-full shadow-[0_0_8px_#E9FF22]" />
            <span className="font-mono text-micro text-zinc-400 tracking-[0.2em] uppercase">
              Tevox System: Active // Sticky Scroll
            </span>
          </div>

          <h1 className="text-display font-black leading-none tracking-tight text-white mb-6">
            สั่งซื้อและติดตั้ง<br />
            <span className="text-brand-yellow drop-shadow-[0_0_15px_rgba(233,255,34,0.25)]">
              ง่ายใน 4 ขั้นตอน
            </span>
          </h1>

          <p className="text-body text-zinc-400 max-w-lg mx-auto leading-relaxed">
            ตั้งแต่เลือกชิ้นส่วนที่ชอบ วางมัดจำ นัดหมายติดตั้งที่ร้านโดยช่างผู้เชี่ยวชาญแบบไม่ต้องเจาะรถ สะดวกและโปร่งใสทุกขั้นตอน
          </p>

          <div className="flex gap-8 mt-10 font-mono text-micro text-zinc-500 tracking-wider">
            <div>[ 01 / SELECT ]</div>
            <div className="text-brand-yellow">→</div>
            <div>[ 02 / DEPOSIT ]</div>
            <div className="text-brand-yellow">→</div>
            <div>[ 03 / CONFIRM ]</div>
            <div className="text-brand-yellow">→</div>
            <div>[ 04 / INSTALL ]</div>
          </div>
        </div>
      </section>

      {/* Sticky Scroll Animation Section */}
      {/* Outer wrapper controls vertical scroll height (300vh) */}
      <section ref={containerRef} className="relative w-full h-[300vh] z-20">
        
        {/* Sticky viewport lock - sits exactly below the 56px high sticky Navbar */}
        <div className="sticky top-14 w-full h-[calc(100vh-3.5rem)] flex items-center justify-center bg-brand-dark overflow-hidden px-6 py-4">
          <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Fixed Title and Slideshow Step Descriptions */}
            <div className="col-span-1 lg:col-span-6 flex flex-col gap-6 text-left">
              
              <div>
                <p className="font-mono text-micro text-brand-yellow tracking-[0.2em] uppercase mb-2">
                  [ HOW IT WORKS ]
                </p>
                <h2 className="text-h2 font-black text-white leading-none">
                  สั่งซื้อง่าย<br />
                  <span className="text-brand-yellow drop-shadow-[0_0_12px_rgba(233,255,34,0.25)]">
                    ใน 4 ขั้นตอน
                  </span>
                </h2>
              </div>

              {/* Step Selector & Progress Bar */}
              <div className="flex gap-4 items-center mt-2">
                <div className="flex gap-2.5">
                  {steps.map((step, index) => {
                    const isActive = activeStep === index
                    const isPast = activeStep > index
                    return (
                      <button
                        key={step.n}
                        onClick={() => handleStepClick(index)}
                        className={`w-9 h-9 flex items-center justify-center border font-mono text-caption font-bold transition-all duration-300 ${
                          isActive
                            ? 'border-brand-yellow bg-brand-yellow text-brand-dark shadow-[0_0_10px_rgba(233,255,34,0.3)]'
                            : isPast
                            ? 'border-brand-yellow/60 text-brand-yellow/80 bg-brand-yellow/5'
                            : 'border-zinc-800 text-zinc-600 hover:border-zinc-700 bg-zinc-900/20'
                        }`}
                      >
                        {step.n}
                      </button>
                    )
                  })}
                </div>
                
                <div className="h-0.5 bg-zinc-855 flex-1 relative overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-brand-yellow shadow-[0_0_8px_#E9FF22] transition-all duration-75"
                    style={{ width: `${scrollProgress * 100}%` }}
                  />
                </div>
              </div>

              {/* Sliding and fading step description text */}
              <div className="relative h-[240px] md:h-[180px] w-full mt-2 overflow-hidden">
                {steps.map((step, index) => {
                  const isActive = activeStep === index
                  const isPast = activeStep > index
                  
                  let transformClass = 'translate-y-8 opacity-0 pointer-events-none'
                  if (isActive) {
                    transformClass = 'translate-y-0 opacity-100 relative z-10'
                  } else if (isPast) {
                    transformClass = '-translate-y-8 opacity-0 pointer-events-none absolute top-0 left-0'
                  } else {
                    transformClass = 'translate-y-8 opacity-0 pointer-events-none absolute top-0 left-0'
                  }

                  return (
                    <div
                      key={step.n}
                      className={`transition-all duration-500 ease-out flex flex-col gap-2.5 w-full ${transformClass}`}
                    >
                      <h3 className="text-h3 font-black text-white flex items-center gap-2">
                        <span className="text-brand-yellow">{step.icon}</span>
                        {step.title}
                      </h3>
                      <p className="text-body text-zinc-400 leading-relaxed font-light">
                        {step.body}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right Column: Visual HUD Simulation Card */}
            <div className="col-span-1 lg:col-span-6">
              <div className="bg-zinc-900/80 border border-zinc-800 shadow-2xl relative rounded-none overflow-hidden">
                
                {/* Header panel bar */}
                <div className="bg-zinc-950 border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  </div>
                  <div className="font-mono text-micro text-zinc-500 tracking-[0.1em] uppercase">
                    HUD // STAGE_{activeStep + 1}
                  </div>
                  <div className="w-8" />
                </div>

                {/* Simulation Content Body */}
                <div className="p-8 min-h-[340px] flex items-center justify-center bg-zinc-950/40 relative">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(233,255,34,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(233,255,34,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                  {activeStep === 0 && (
                    <div className="w-full flex flex-col gap-6 animate-fade-up">
                      <p className="font-mono text-micro text-zinc-500 tracking-wider text-left">[ 01 / MODEL_SELECTOR ]</p>
                      
                      {/* Car Model Chips */}
                      <div className="flex gap-2">
                        {Object.keys(carSpecs).map((model) => (
                          <button
                            key={model}
                            onClick={() => setSelectedModel(model)}
                            className={`flex-1 py-2 font-mono text-caption transition-all border ${
                              selectedModel === model
                                ? 'border-brand-yellow text-brand-yellow bg-brand-yellow/5'
                                : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
                            }`}
                          >
                            {model}
                          </button>
                        ))}
                      </div>

                      {/* Wireframe Specs Container */}
                      <div className="border border-zinc-800/80 bg-zinc-950 p-6 flex flex-col gap-3 relative text-left">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-caption text-zinc-400 uppercase">{selectedModel} Bodykit</span>
                          <span className="font-mono text-micro text-brand-yellow bg-brand-yellow/10 px-2 py-0.5 border border-brand-yellow/30">
                            100% FITMENT
                          </span>
                        </div>
                        
                        <div className="py-4 border-y border-dashed border-zinc-800 flex flex-col gap-2 font-mono text-micro">
                          <div className="flex justify-between text-zinc-500">
                            <span>FRONT SPOILER:</span>
                            <span className="text-zinc-300 font-bold">{carSpecs[selectedModel].lip}</span>
                          </div>
                          <div className="flex justify-between text-zinc-500">
                            <span>REAR DIFFUSER:</span>
                            <span className="text-zinc-300 font-bold">{carSpecs[selectedModel].diffuser}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-micro font-mono">
                          <span className="text-zinc-500">INSTALLATION TYPE:</span>
                          <span className="text-brand-yellow">CLAMP-ON / NO-DRILL</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 1 && (
                    <div className="w-full flex flex-col gap-6 animate-fade-up">
                      <p className="font-mono text-micro text-zinc-500 tracking-wider text-left">[ 02 / STRIPE_GATEWAY ]</p>
                      
                      <div className="border border-zinc-800 bg-zinc-950 p-5 flex flex-col gap-4 text-left relative">
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                          <div className="flex items-center gap-2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-brand-yellow">
                              <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            <span className="font-mono text-caption text-zinc-300 font-bold">SECURE PAYMENT</span>
                          </div>
                          <span className="font-mono text-micro text-zinc-500">via Stripe</span>
                        </div>

                        {stripePaid ? (
                          <div className="py-6 flex flex-col items-center justify-center gap-3 text-center animate-fade-up">
                            <div className="w-12 h-12 bg-brand-yellow/10 border border-brand-yellow rounded-full flex items-center justify-center text-brand-yellow">
                              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-brand-yellow font-bold text-caption tracking-wider">ชำระมัดจำสำเร็จ</p>
                              <p className="text-zinc-500 text-micro mt-1 font-mono">คิวและรายการสินค้าได้รับการสำรองเรียบร้อย</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-col gap-2 font-mono text-caption">
                              <div className="flex justify-between text-zinc-500">
                                <span>รายการจอง:</span>
                                <span className="text-zinc-300">Tevox body parts (Deposit)</span>
                              </div>
                              <div className="flex justify-between text-zinc-300 font-bold">
                                <span>ยอดชำระตอนนี้:</span>
                                <span className="text-brand-yellow text-h3">฿{(paymentPrice * 0.3).toLocaleString()}</span>
                              </div>
                            </div>

                            <button
                              onClick={handleSimulatePayment}
                              disabled={payLoading}
                              className="w-full py-3 bg-brand-yellow text-brand-dark font-bold font-mono text-caption tracking-wider transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
                            >
                              {payLoading ? 'SECURELY PROCESSING...' : 'PAY DEPOSIT NOW'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="w-full flex flex-col gap-4 animate-fade-up">
                      <p className="font-mono text-micro text-zinc-500 tracking-wider text-left">[ 03 / CUSTOMER_SERVICE ]</p>
                      
                      <div className="border border-zinc-800 bg-zinc-950 p-4 flex flex-col gap-4 text-left h-[260px] overflow-y-auto">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 bg-brand-yellow text-brand-dark font-black text-micro flex items-center justify-center shrink-0">
                            T
                          </div>
                          <div className="bg-zinc-900/80 border border-zinc-800/80 px-3.5 py-2 max-w-[80%]">
                            <p className="text-caption text-zinc-300 leading-relaxed">
                              สวัสดีครับ ยืนยันยอดมัดจำเรียบร้อยครับ ไม่ทราบว่ารุ่นรถเป็น BYD Seal หรือรุ่นอื่นๆ ครับ?
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 justify-end">
                          <div className="bg-brand-yellow/10 border border-brand-yellow/30 px-3.5 py-2 max-w-[80%] text-right">
                            <p className="text-caption text-brand-yellow leading-relaxed">
                              ใช่ครับ BYD Seal สีดำครับ นัดติดตั้งได้วันไหนบ้างครับ
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 bg-brand-yellow text-brand-dark font-black text-micro flex items-center justify-center shrink-0">
                            T
                          </div>
                          <div className="bg-zinc-900/80 border border-zinc-800/80 px-3.5 py-2 max-w-[80%]">
                            <p className="text-caption text-zinc-300 leading-relaxed">
                              ล็อกคิว: <span className="text-brand-yellow font-bold">วันเสาร์นี้ 10:00 น.</span> หน้าร้านบางกระดี่ 22 เรียบร้อยครับ ช่างจะเตรียมวัสดุกันรอยไว้ให้เลยครับ
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 3 && (
                    <div className="w-full flex flex-col gap-4 animate-fade-up">
                      <p className="font-mono text-micro text-zinc-500 tracking-wider text-left">[ 04 / INSTALL_DIAGRAM ]</p>
                      
                      <div className="border border-zinc-800 bg-zinc-950 p-5 flex flex-col gap-4 text-left">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                          <span className="font-mono text-caption text-zinc-300 font-bold">WORKSHOP & FITMENT</span>
                          <span className="font-mono text-micro text-zinc-500">Bang Kradi 22</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="border border-zinc-900 p-3 flex flex-col gap-1">
                            <span className="font-mono text-micro text-zinc-500">FITMENT</span>
                            <span className="text-caption text-white font-bold">100% No-Drill</span>
                          </div>
                          <div className="border border-zinc-900 p-3 flex flex-col gap-1">
                            <span className="font-mono text-micro text-zinc-500">PPF PROTECTION</span>
                            <span className="text-caption text-brand-yellow font-bold">Applied</span>
                          </div>
                        </div>

                        <div className="border border-zinc-900 p-3 flex items-center justify-between font-mono text-micro">
                          <span className="text-zinc-500">DURATION:</span>
                          <span className="text-brand-yellow font-bold">2 - 4 HOURS</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
                
                {/* Simulator Footer bar */}
                <div className="bg-zinc-950 border-t border-zinc-800/80 px-6 py-4 flex justify-between items-center text-micro font-mono">
                  <span className="text-zinc-600">STEPS PROGRESS:</span>
                  <div className="flex gap-1.5 items-center">
                    {[0, 1, 2, 3].map((stepIdx) => (
                      <span
                        key={stepIdx}
                        className={`w-3.5 h-1.5 transition-colors duration-300 ${
                          activeStep >= stepIdx ? 'bg-brand-yellow' : 'bg-zinc-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Payment Visualizer & Pricing Section */}
      <section className="border-t border-zinc-800 bg-zinc-950/40 relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center flex flex-col gap-6">
          <p className="font-mono text-micro text-brand-yellow tracking-[0.2em] uppercase">[ PRICING VISUALIZER ]</p>
          <h2 className="text-h2 font-black text-white">ทดลองคำนวณการแบ่งจ่าย</h2>
          <p className="text-body text-zinc-400 max-w-lg mx-auto leading-relaxed">
            เลื่อนแถบราคาจำลองของสินค้าเพื่อคำนวณสัดส่วนค่ามัดจำออนไลน์ และยอดคงเหลือที่คุณต้องชำระที่หน้าร้าน
          </p>

          {/* Pricing Slider */}
          <div className="mt-8 bg-zinc-900/40 border border-zinc-800 p-8 flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <span className="font-mono text-caption text-zinc-500">ราคาสินค้า (PRODUCT PRICE)</span>
                <span className="text-h2 font-black text-white">
                  ฿{paymentPrice.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="60000"
                step="1000"
                value={paymentPrice}
                onChange={(e) => {
                  setPaymentPrice(Number(e.target.value))
                  if (activeStep === 1) setStripePaid(false)
                }}
                className="w-full accent-brand-yellow cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between font-mono text-micro text-zinc-600">
                <span>฿5,000</span>
                <span>฿30,000</span>
                <span>฿60,000</span>
              </div>
            </div>

            {/* Split Breakdown Graphics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-6 border-t border-zinc-800">
              
              {/* Step 1: Deposit */}
              <div className="bg-zinc-950/60 border border-zinc-800/80 p-5 flex flex-col justify-between text-left relative overflow-hidden">
                <div className="absolute right-3 top-3 font-mono text-micro text-zinc-700">01</div>
                <div>
                  <p className="font-mono text-micro text-zinc-500 tracking-wider uppercase mb-1">มัดจำออนไลน์ (30%)</p>
                  <p className="text-h3 font-black text-brand-yellow">฿{(paymentPrice * 0.3).toLocaleString()}</p>
                </div>
                <p className="text-caption text-zinc-500 mt-4 leading-normal">
                  ชำระออนไลน์ผ่าน Stripe เพื่อล็อกสินค้าและจองคิว
                </p>
              </div>

              {/* Connector line */}
              <div className="bg-zinc-950/60 border border-zinc-800/80 p-5 flex flex-col justify-between text-left relative overflow-hidden">
                <div className="absolute right-3 top-3 font-mono text-micro text-zinc-700">02</div>
                <div>
                  <p className="font-mono text-micro text-zinc-500 tracking-wider uppercase mb-1">ยอดค้างจ่ายหน้าร้าน (70%)</p>
                  <p className="text-h3 font-black text-white">฿{(paymentPrice * 0.7).toLocaleString()}</p>
                </div>
                <p className="text-caption text-zinc-500 mt-4 leading-normal">
                  ชำระส่วนที่เหลือที่ร้าน Tevox หลังจากติดตั้งเสร็จเรียบร้อย
                </p>
              </div>

              {/* Installation Price */}
              <div className="bg-zinc-950/60 border border-zinc-800/80 p-5 flex flex-col justify-between text-left relative overflow-hidden">
                <div className="absolute right-3 top-3 font-mono text-micro text-zinc-700">03</div>
                <div>
                  <p className="font-mono text-micro text-zinc-500 tracking-wider uppercase mb-1">ค่าบริการติดตั้ง</p>
                  <p className="text-h3 font-black text-brand-blue uppercase">FREE</p>
                </div>
                <p className="text-caption text-zinc-500 mt-4 leading-normal">
                  ฟรีค่าติดตั้งสำหรับชิ้นแต่งที่ระบุว่าติดตั้งฟรี ณ บางกระดี่ 22
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Quality Commitments Grid */}
      <section className="max-w-6xl mx-auto px-6 py-24 relative z-10 border-t border-zinc-800/80">
        <div className="text-center mb-16 flex flex-col gap-3">
          <p className="font-mono text-micro text-brand-yellow tracking-[0.2em] uppercase">[ THE TEVOX COMMITMENTS ]</p>
          <h2 className="text-h2 font-black text-white">มาตรฐานและคำมั่นสัญญาของเรา</h2>
          <p className="text-body text-zinc-400 max-w-lg mx-auto leading-relaxed mt-1">
            เราไม่ใช่แค่คนขายชุดแต่ง แต่เราใส่ใจในขั้นตอนติดตั้งเพื่อถนอมสภาพของตัวรถลูกค้าที่ดีที่สุด
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: No-Drill */}
          <div className="bg-zinc-900/40 border border-zinc-800 p-8 text-left hover:border-brand-yellow/30 hover:bg-zinc-900/60 transition-all duration-300 group">
            <div className="text-brand-yellow mb-6 bg-brand-yellow/5 w-12 h-12 flex items-center justify-center border border-brand-yellow/10">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </div>
            <h3 className="text-h3 font-black text-white mb-3 group-hover:text-brand-yellow transition-colors">
              ไม่เจาะตัวถังรถ 100%
            </h3>
            <p className="text-caption text-zinc-500 leading-relaxed">
              ชุดแต่งทุกชุดยึดจับผ่านช่องยึด OEM เดิมใต้ท้องรถด้วยระบบ Bracket Clamps (ขารับออกแบบเฉพาะรุ่น) ป้องกันสนิมและรักษามูลค่าของตัวรถได้สูงสุด
            </p>
          </div>

          {/* Card 2: PPF Protection */}
          <div className="bg-zinc-900/40 border border-zinc-800 p-8 text-left hover:border-brand-yellow/30 hover:bg-zinc-900/60 transition-all duration-300 group">
            <div className="text-brand-yellow mb-6 bg-brand-yellow/5 w-12 h-12 flex items-center justify-center border border-brand-yellow/10">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className="text-h3 font-black text-white mb-3 group-hover:text-brand-yellow transition-colors">
              ติดฟิล์มกันรอย PPF
            </h3>
            <p className="text-caption text-zinc-500 leading-relaxed">
              จุดใดก็ตามที่ชุดแต่งจำเป็นต้องแนบหรือสัมผัสกับสีรถ ทีมช่างจะติดฟิล์ม PPF ป้องกันริ้วรอยขูดขีดจากการเสียดสีและการสั่นสะเทือนในระยะยาวให้ฟรีก่อนประกอบ
            </p>
          </div>

          {/* Card 3: Fitment Testing */}
          <div className="bg-zinc-900/40 border border-zinc-800 p-8 text-left hover:border-brand-yellow/30 hover:bg-zinc-900/60 transition-all duration-300 group">
            <div className="text-brand-yellow mb-6 bg-brand-yellow/5 w-12 h-12 flex items-center justify-center border border-brand-yellow/10">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <h3 className="text-h3 font-black text-white mb-3 group-hover:text-brand-yellow transition-colors">
              Fitment Test ทุกแบบ
            </h3>
            <p className="text-caption text-zinc-500 leading-relaxed">
              แบบชิ้นงานทุกรุ่นต้องผ่านการติดตั้งและขับขี่ทดสอบจริงกับรถต้นแบบของทีมงาน ก่อนที่จะอนุมัติให้นำเข้ามาทำตลาดและสั่งผลิต เพื่อลดโอกาสคลาดเคลื่อนของช่องไฟและสเปก
            </p>
          </div>

        </div>
      </section>

      {/* Futuristic CTA Section */}
      <section className="px-6 py-24 text-center relative z-10 border-t border-zinc-800/80 bg-zinc-950/20">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-8">
          <h2 className="text-display font-black text-white leading-tight">
            พร้อมอัปเกรด<br />
            รถ EV ของคุณแล้วหรือยัง?
          </h2>
          <p className="text-body text-zinc-400 max-w-md leading-relaxed">
            เลือกดูชุดแต่งพรีเมียมเฉพาะรุ่นสำหรับ BYD, Tesla, MG, NETA และอื่นๆ ได้จากแค็ตดาวน์โหลดสินค้าของเราได้ทันที
          </p>
          <Link to="/products">
            <Button variant="primary" size="lg" className="shadow-[0_0_20px_rgba(233,255,34,0.3)] hover:shadow-[0_0_30px_rgba(233,255,34,0.5)] transition-all">
              เลือกชมสินค้าทั้งหมด →
            </Button>
          </Link>
        </div>
      </section>

    </div>
  )
}

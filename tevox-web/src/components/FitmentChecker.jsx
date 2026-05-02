import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Button from './ui/Button'

const LINE_OA_ID = 'tevoxauto'

const VERDICT_CONFIG = {
  true:    { marker: '✓', label: 'ใส่ได้',           cls: 'border-emerald-300 bg-emerald-50',       textCls: 'text-emerald-700', markerCls: 'text-emerald-600 border-emerald-300 bg-emerald-50' },
  false:   { marker: '✕', label: 'ไม่เข้ากัน',        cls: 'border-red-300 bg-red-50',               textCls: 'text-red-700',     markerCls: 'text-red-500 border-red-300 bg-red-50' },
  unknown: { marker: '?', label: 'ต้องตรวจสอบเพิ่ม', cls: 'border-amber-300 bg-amber-50',           textCls: 'text-amber-700',   markerCls: 'text-amber-600 border-amber-300 bg-amber-50' },
}

export default function FitmentChecker({ productId }) {
  const [form, setForm]       = useState({ car_model: '', year: '', specs: '' })
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function handleCheck(e) {
    e.preventDefault()
    if (!form.car_model || !form.year) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const { data, error } = await supabase.functions.invoke('fitment', {
        body: {
          productId,
          userCarModel: form.car_model,
          userYear:     form.year,
          userSpecs:    form.specs || null,
        },
      })
      if (error) throw error
      setResult(data)
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่หรือติดต่อเราผ่าน Line')
    } finally {
      setLoading(false)
    }
  }

  const config = result ? VERDICT_CONFIG[String(result.compatible)] : null
  const inputClass = "bg-zinc-50 border border-zinc-300 rounded-none px-3 py-2.5 text-brand-dark font-mono text-caption focus:outline-none focus:border-brand-dark w-full"

  return (
    <div className="flex flex-col gap-4 border border-zinc-200 bg-white p-5">
      <div className="flex items-center gap-3 pb-3 border-b border-zinc-200">
        <p className="font-mono text-micro text-zinc-400 tracking-[0.15em] uppercase">[ FITMENT ANALYSIS ]</p>
      </div>
      <div>
        <h3 className="text-h3 font-bold text-brand-dark">เช็คว่าใส่รถคุณได้มั้ย</h3>
        <p className="text-caption text-zinc-500 mt-1 font-mono">กรอกข้อมูลรถเพื่อเช็คความเข้ากันได้</p>
      </div>

      <form onSubmit={handleCheck} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-micro text-zinc-500 tracking-wider uppercase">
              รุ่นรถ <span className="text-brand-dark">*</span>
            </label>
            <input type="text" placeholder="เช่น MG IM6" value={form.car_model} onChange={e => setForm(f => ({ ...f, car_model: e.target.value }))} required className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-micro text-zinc-500 tracking-wider uppercase">
              ปีที่ผลิต <span className="text-brand-dark">*</span>
            </label>
            <input type="number" placeholder="2024" min="2020" max="2030" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} required className={inputClass} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-micro text-zinc-500 tracking-wider uppercase">สเปคเพิ่มเติม (ไม่บังคับ)</label>
          <input type="text" placeholder="เช่น Standard Trim, AWD" value={form.specs} onChange={e => setForm(f => ({ ...f, specs: e.target.value }))} className={inputClass} />
        </div>
        <Button type="submit" variant="primary" disabled={loading} className="w-full">
          {loading ? 'กำลังวิเคราะห์...' : 'เช็คความเข้ากัน'}
        </Button>
      </form>

      {error && (
        <p className="font-mono text-micro text-red-600 border border-red-200 bg-red-50 px-3 py-2 tracking-wide">{error}</p>
      )}

      {result && config && (
        <div className={`flex flex-col gap-3 border p-4 ${config.cls}`}>
          <div className="flex items-center gap-3">
            <span className={`font-mono font-bold text-body w-8 h-8 border flex items-center justify-center shrink-0 ${config.markerCls}`}>
              {config.marker}
            </span>
            <span className={`font-bold text-body ${config.textCls}`}>{config.label}</span>
          </div>
          {result.explanation_th && (
            <p className={`text-body leading-relaxed ${config.textCls} opacity-80`}>{result.explanation_th}</p>
          )}
          {result.caveats_th && (
            <p className={`font-mono text-caption border-t border-current/20 pt-3 mt-1 opacity-70 ${config.textCls}`}>{result.caveats_th}</p>
          )}
          <div className="mt-1">
            {result.compatible === true ? (
              <a href={`https://line.me/ti/p/~${LINE_OA_ID}`} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="sm">สั่งซื้อผ่าน Line</Button>
              </a>
            ) : (
              <a href={`https://line.me/ti/p/~${LINE_OA_ID}`} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="sm">ปรึกษาเรา</Button>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

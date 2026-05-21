import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { r2Url } from '../lib/r2'

// ── Search logic ──────────────────────────────────────────────────────────────

function localSearch(query, products) {
  const q = query.toLowerCase().trim()
  if (q.length < 2) return []
  const words = q.split(/\s+/).filter(w => w.length > 1)
  return products.filter(p => {
    const hay = [p.sku, p.name_th, p.name_en, p.car_model, p.category, p.description_th]
      .filter(Boolean).join(' ').toLowerCase()
    return hay.includes(q) || words.every(w => hay.includes(w))
  })
}

function findProductsInReply(reply, products) {
  const r = reply.toLowerCase()
  return products.filter(p => {
    if (r.includes(p.sku.toLowerCase())) return true
    const words = p.name_th.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    return words.some(w => r.includes(w))
  })
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <circle cx="8.5" cy="8.5" r="5.5" />
      <line x1="13" y1="13" x2="18" y2="18" />
    </svg>
  )
}

function ResultItem({ product, onSelect }) {
  const imgKey = product.image_keys?.[0]
  const price  = Number(product.price_thb).toLocaleString('th-TH')
  return (
    <Link
      to={`/products/${product.id}`}
      onClick={onSelect}
      className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors group border-b border-zinc-800/60 last:border-0"
    >
      <div className="w-10 h-10 bg-zinc-800 shrink-0 overflow-hidden border border-zinc-700/60">
        {imgKey
          ? <img src={r2Url(imgKey)} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-mono text-caption text-zinc-100 truncate group-hover:text-brand-yellow transition-colors">
          {product.name_th}
        </p>
        <p className="font-mono text-micro text-zinc-500 tracking-wider">
          {product.car_model} · ฿{price}
        </p>
      </div>
      <span className="font-mono text-micro text-zinc-600 group-hover:text-brand-yellow transition-colors shrink-0">→</span>
    </Link>
  )
}

function TypingDots() {
  return (
    <div className="flex gap-1 items-center">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function HeroSearch({ products, suggestions = [], onChatOpen }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState(null)
  const [aiReply, setAiReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [usedAi, setUsedAi]   = useState(false)
  const containerRef          = useRef(null)
  const inputRef              = useRef(null)

  useEffect(() => {
    function onDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) clear()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') { clear(); inputRef.current?.blur() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Instant local search + debounced AI fallback
  useEffect(() => {
    let cancelled = false
    const q = query.trim()

    if (q.length < 2) {
      setResults(null)
      setAiReply('')
      setUsedAi(false)
      setLoading(false)
      return
    }

    const local = localSearch(q, products)
    if (local.length) {
      setResults(local.slice(0, 5))
      setAiReply('')
      setUsedAi(false)
      setLoading(false)
      return () => { cancelled = true }
    }

    setLoading(true)
    setResults(null)

    const timer = setTimeout(async () => {
      if (cancelled) return
      setUsedAi(true)
      try {
        const { data, error } = await supabase.functions.invoke('chat', {
          body: { messages: [{ role: 'user', content: q }] },
        })
        if (cancelled) return
        if (error) throw error
        const { reply } = data
        const found = findProductsInReply(reply, products)
        setAiReply(reply)
        setResults(found.slice(0, 5))
      } catch {
        if (!cancelled) {
          setAiReply('ขออภัยครับ ลองอีกทีได้เลยครับ')
          setResults([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 700)

    return () => {
      cancelled = true
      clearTimeout(timer)
      setLoading(false)
    }
  }, [query, products])

  function clear() {
    setQuery('')
    setResults(null)
    setAiReply('')
    setUsedAi(false)
    setLoading(false)
  }

  const showPanel = results !== null || loading

  return (
    <div ref={containerRef} className="relative w-full">

      {/* Input */}
      <div className="relative flex items-center group">
        <span className="absolute left-5 text-zinc-500 pointer-events-none group-focus-within:text-brand-yellow transition-colors">
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="พิมพ์รุ่นรถ หรืออะไรที่อยากแต่ง..."
          style={{ fontSize: 16 }}
          className="w-full bg-zinc-900/60 backdrop-blur-xl border border-zinc-700/80 hover:border-zinc-500 focus:border-brand-yellow/80 focus:ring-4 focus:ring-brand-yellow/10 pl-12 pr-12 py-5 text-zinc-100 placeholder-zinc-500 focus:outline-none font-mono text-body tracking-wide transition-all shadow-2xl rounded-lg"
        />
        {query ? (
          <button
            type="button"
            onClick={() => { clear(); inputRef.current?.focus() }}
            className="absolute right-4 text-zinc-500 hover:text-zinc-200 font-mono text-body transition-colors leading-none"
          >
            ×
          </button>
        ) : (
          <span className="absolute right-4 font-mono text-micro text-zinc-700 tracking-widest pointer-events-none hidden sm:block">
            AI
          </span>
        )}
      </div>

      {/* Suggestion pills — shown when input is empty */}
      {!query && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {suggestions.map(s => (
            <button
              key={s}
              onClick={() => { setQuery(s); inputRef.current?.focus() }}
              className="font-mono text-micro text-zinc-400 bg-zinc-900/40 backdrop-blur-md border border-zinc-700/60 hover:border-brand-yellow hover:text-brand-yellow hover:bg-brand-yellow/5 px-4 py-2 transition-all duration-300 tracking-wider rounded-lg shadow-sm hover:shadow-brand-yellow/10 hover:-translate-y-0.5"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Results panel */}
      {showPanel && (
        <div className="absolute top-full left-0 right-0 z-30 mt-2 bg-zinc-900/95 backdrop-blur-2xl border border-zinc-700/80 shadow-2xl max-h-[400px] overflow-y-auto rounded-lg">

          {loading && (
            <div className="px-4 py-4 flex items-center gap-3">
              <TypingDots />
              <span className="font-mono text-micro text-zinc-500 tracking-wider">
                Nox กำลังหาสินค้าให้ครับ...
              </span>
            </div>
          )}

          {!loading && usedAi && aiReply && (
            <div className="px-4 py-3 border-b border-zinc-800 flex gap-2.5 items-start">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0 animate-pulse" />
              <p className="font-mono text-micro text-zinc-400 leading-relaxed tracking-wide">{aiReply}</p>
            </div>
          )}

          {!loading && results?.length > 0 && results.map(p => (
            <ResultItem key={p.id} product={p} onSelect={clear} />
          ))}

          {!loading && results?.length === 0 && (
            <div className="px-4 py-3.5 flex items-center justify-between gap-3">
              <span className="font-mono text-micro text-zinc-600 tracking-wider">ไม่เจอสินค้าที่ตรงครับ</span>
              <button
                onClick={() => { clear(); onChatOpen?.() }}
                className="font-mono text-micro text-brand-yellow tracking-wider hover:underline shrink-0"
              >
                คุยกับ Nox →
              </button>
            </div>
          )}

          {!loading && results?.length > 0 && (
            <div className="px-4 py-2.5 border-t border-zinc-800 flex items-center justify-between">
              <span className="font-mono text-micro text-zinc-700 tracking-wider">{results.length} รายการ</span>
              <button
                onClick={() => { clear(); onChatOpen?.() }}
                className="font-mono text-micro text-zinc-600 hover:text-brand-yellow transition-colors tracking-wider"
              >
                ถามเพิ่มเติม →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

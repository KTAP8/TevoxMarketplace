import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { r2Url } from '../lib/r2'
import { useSettings } from '../hooks/useSettings'

const OPENING_MESSAGE = {
  role:    'assistant',
  content: 'สวัสดีครับ ผม Nox ครับบ มีอะไรให้ช่วยได้เลย 👋\nรถคุณรุ่นอะไรครับ?',
}

// ── Markdown renderer ─────────────────────────────────────────────────────────

function renderInline(text) {
  const segments = []
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0, m
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) segments.push({ t: 'text', v: text.slice(last, m.index) })
    if (m[1] !== undefined)      segments.push({ t: 'bold',   v: m[1] })
    else if (m[2] !== undefined) segments.push({ t: 'italic', v: m[2] })
    else if (m[3] !== undefined) segments.push({ t: 'code',   v: m[3] })
    else                         segments.push({ t: 'link',   v: m[4], href: m[5] })
    last = m.index + m[0].length
  }
  if (last < text.length) segments.push({ t: 'text', v: text.slice(last) })
  return segments.map((s, i) => {
    if (s.t === 'bold')   return <strong key={i} className="font-bold">{s.v}</strong>
    if (s.t === 'italic') return <em key={i} className="italic">{s.v}</em>
    if (s.t === 'code')   return <code key={i} className="bg-zinc-700/60 px-1 font-mono text-brand-yellow text-sm">{s.v}</code>
    if (s.t === 'link')   return <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="text-brand-yellow underline underline-offset-2 hover:brightness-110 transition-all">{s.v}</a>
    return s.v
  })
}

function MessageContent({ text }) {
  return text.split('\n').map((line, i, arr) => (
    <span key={i}>
      {renderInline(line)}
      {i < arr.length - 1 && <br />}
    </span>
  ))
}

// ── Bubble components ─────────────────────────────────────────────────────────

function TextBubble({ msg, messengerUrl }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[82%] px-3 py-2.5 text-body leading-relaxed rounded-none ${
          isUser
            ? 'bg-brand-yellow text-brand-dark font-medium'
            : 'bg-zinc-800 text-zinc-200 border-l-2 border-zinc-700'
        }`}
      >
        <MessageContent text={msg.content} />
      </div>

      {msg.imageLine && messengerUrl && (
        <a
          href={messengerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-micro text-brand-yellow tracking-wider hover:underline self-start ml-0.5"
        >
          → ส่งรูปรถมาให้เราดูผ่าน Messenger ได้เลยครับ
        </a>
      )}
    </div>
  )
}

function ImagesBubble({ imageKeys }) {
  if (!imageKeys?.length) return null
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 max-w-[90%]">
      {imageKeys.map((key, i) => (
        <a
          key={i}
          href={r2Url(key)}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 w-28 h-28 bg-zinc-800 overflow-hidden border border-zinc-700 hover:border-brand-yellow transition-colors"
        >
          <img src={r2Url(key)} alt={`รูปสินค้า ${i + 1}`} className="w-full h-full object-cover" />
        </a>
      ))}
    </div>
  )
}

function MessengerCTA({ url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 bg-brand-yellow text-brand-dark px-4 py-3 font-mono text-caption font-bold tracking-wider hover:brightness-105 transition-all self-start"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 3.062 1.445 5.791 3.712 7.569L5.75 22l2.475-1.344A9.908 9.908 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm1.07 13.024l-2.551-2.72-4.979 2.718 5.477-5.817 2.613 2.72 4.916-2.72-5.476 5.819z" />
      </svg>
      สั่งซื้อผ่าน Messenger
    </a>
  )
}

function ChatBubble({ msg, messengerUrl }) {
  if (msg.streaming && !msg.content) return null
  return (
    <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
      <TextBubble msg={msg} messengerUrl={messengerUrl} />
      {msg.type === 'images' && <ImagesBubble imageKeys={msg.imageKeys} />}
      {msg.orderReady && messengerUrl && <MessengerCTA url={messengerUrl} />}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-zinc-800 border-l-2 border-zinc-700 px-4 py-3 flex gap-1.5 items-center">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1 h-1 bg-zinc-500 animate-bounce"
            style={{ animationDelay: `${i * 160}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
  )
}

function ChatOpenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h11a2 2 0 012 2v7a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" clipRule="evenodd" />
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Chatbot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([OPENING_MESSAGE])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [panelWidth, setPanelWidth] = useState(380)
  const bottomRef               = useRef(null)
  const inputRef                = useRef(null)
  const panelRef                = useRef(null)
  const { settings }            = useSettings()

  function onResizeStart(e) {
    if (window.innerWidth < 768) return
    e.preventDefault()
    const startX     = e.clientX
    const startWidth = panelWidth
    function onMove(ev) {
      const newWidth = Math.max(280, Math.min(680, startWidth + (startX - ev.clientX)))
      setPanelWidth(newWidth)
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300)
  }, [isOpen])

  // Prevent the page behind the chat from scrolling on mobile
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  // Visual Viewport API — resizes the panel to stay above the keyboard on iOS.
  // On Android the viewport itself shrinks so top-0/bottom-0 handles it natively.
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv || !isOpen) return

    function update() {
      if (!panelRef.current || window.innerWidth >= 768) return
      panelRef.current.style.top    = `${vv.offsetTop}px`
      panelRef.current.style.height = `${vv.height}px`
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      if (panelRef.current) {
        panelRef.current.style.top    = ''
        panelRef.current.style.height = ''
      }
    }
  }, [isOpen])

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg   = { role: 'user', content: text }
    const history   = [...messages, userMsg]
    const streamMsg = { role: 'assistant', content: '', streaming: true }
    setMessages([...history, streamMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'apikey':        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            messages: history.map(m => ({ role: m.role, content: m.content })),
          }),
        }
      )

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))

            if (event.t === 'token') {
              setMessages(prev => {
                const last = prev[prev.length - 1]
                return [...prev.slice(0, -1), { ...last, content: last.content + event.c }]
              })
            } else if (event.t === 'done') {
              setMessages(prev => {
                const last = prev[prev.length - 1]
                return [...prev.slice(0, -1), {
                  ...last,
                  content:    event.clean,
                  streaming:  false,
                  type:       event.needsImage && event.imageKeys?.length ? 'images' : 'text',
                  imageKeys:  event.needsImage ? event.imageKeys : undefined,
                  imageLine:  !!event.imageLine,
                  orderReady: !!event.orderReady,
                }]
              })
            } else if (event.t === 'error') {
              throw new Error('AI error')
            }
          } catch { /* malformed SSE line */ }
        }
      }
    } catch {
      setMessages(prev => {
        const last = prev[prev.length - 1]
        const errMsg = { role: 'assistant', content: 'ขออภัยครับ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง หรือติดต่อเราผ่าน Messenger โดยตรงครับ' }
        return last?.streaming ? [...prev.slice(0, -1), errMsg] : [...prev, errMsg]
      })
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => onClose(false)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-brand-yellow text-brand-dark px-5 py-3 rounded-none font-bold text-caption tracking-wide shadow-lg hover:brightness-105 transition-all"
          style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
          aria-label="เปิดแชท"
        >
          <ChatOpenIcon />
          <span className="hidden sm:inline">คุยกับเรา</span>
        </button>
      )}

      {/* Backdrop — directly fixed, mobile only */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Chat panel — directly fixed so the browser can resize it with the keyboard */}
      <div
        ref={panelRef}
        aria-hidden={!isOpen}
        style={{ width: panelWidth }}
        className={`
          fixed z-50 flex flex-col bg-brand-dark
          transition-transform duration-300 ease-out
          ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}
          inset-x-0 top-0 bottom-0
          md:left-auto md:inset-y-0 md:border-l md:border-zinc-800
          ${isOpen
            ? 'translate-y-0 md:translate-x-0'
            : 'translate-y-full md:translate-y-0 md:translate-x-full'
          }
        `}
      >
        {/* Resize handle — desktop only */}
        <div
          onMouseDown={onResizeStart}
          className="hidden md:flex absolute left-0 top-0 bottom-0 w-3 -translate-x-1.5 cursor-col-resize items-center justify-center group z-10"
        >
          <div className="w-0.5 h-10 bg-zinc-700 rounded-full group-hover:bg-brand-yellow/60 transition-colors" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
            <div>
              <p className="font-mono text-caption text-zinc-100 tracking-wider">NOX <span className="text-zinc-600">// TEVOX</span></p>
              <p className="font-mono text-micro text-zinc-600 tracking-wider">AI ผู้ช่วยหาชิ้นส่วนแต่งรถ EV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-micro text-zinc-600 hover:text-zinc-300 tracking-widest uppercase transition-colors px-3 py-2 hover:bg-zinc-800 -mr-1"
            aria-label="ปิดแชท"
          >
            [ ปิด ]
          </button>
        </div>

        {/* AI disclaimer */}
        <div className="px-4 py-2 border-b border-zinc-800/50 shrink-0">
          <p className="font-mono text-zinc-700 tracking-wider text-center" style={{ fontSize: 10 }}>
            คุณกำลังคุยกับ AI · ประวัติแชทจะหายไปเมื่อรีเฟรชหน้า
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {messages.map((msg, i) => (
            <ChatBubble key={i} msg={msg} messengerUrl={settings.messenger_url} />
          ))}
          {/* Show typing indicator only before the first streaming token arrives */}
          {loading && messages[messages.length - 1]?.content === '' && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Messenger shortcut */}
        {settings.messenger_url && (
          <div className="px-4 pb-2 shrink-0">
            <a
              href={settings.messenger_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-micro text-zinc-600 hover:text-brand-yellow transition-colors tracking-wider"
            >
              → สั่งซื้อผ่าน Messenger
            </a>
          </div>
        )}

        {/* Input */}
        <div
          className="border-t border-zinc-800 px-3 pt-3 flex gap-2 shrink-0"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="พิมพ์ข้อความ..."
            rows={1}
            style={{ fontSize: 16 }}
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-none px-3 py-2.5 text-zinc-100 resize-none focus:outline-none focus:border-brand-yellow placeholder-zinc-700 font-mono"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="bg-brand-yellow text-brand-dark w-11 h-11 flex items-center justify-center rounded-none font-bold disabled:opacity-30 hover:brightness-105 transition-all shrink-0 self-end"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </>
  )
}

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { r2Url } from '../lib/r2'
import { useSettings } from '../hooks/useSettings'

const OPENING_MESSAGE = {
  role:    'assistant',
  content: 'สวัสดีครับ ผม Nox ครับบ มีอะไรให้ช่วยได้เลย 👋\nรถคุณรุ่นอะไรครับ?',
}

// ── Bubble components ─────────────────────────────────────────────────────────

function TextBubble({ msg, messengerUrl }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[82%] px-3 py-2.5 text-body leading-relaxed whitespace-pre-wrap rounded-none ${
          isUser
            ? 'bg-brand-yellow text-brand-dark font-medium'
            : 'bg-zinc-800 text-zinc-200 border-l-2 border-zinc-700'
        }`}
      >
        {msg.content}
      </div>

      {/* LINE CTA — shown below text when imageLine is true */}
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
          <img
            src={r2Url(key)}
            alt={`รูปสินค้า ${i + 1}`}
            className="w-full h-full object-cover"
          />
        </a>
      ))}
    </div>
  )
}

function ChatBubble({ msg, messengerUrl }) {
  return (
    <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
      <TextBubble msg={msg} messengerUrl={messengerUrl} />
      {msg.type === 'images' && <ImagesBubble imageKeys={msg.imageKeys} />}
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
  const bottomRef               = useRef(null)
  const inputRef                = useRef(null)
  const { settings }            = useSettings()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen])

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          // Only send role + content — strip display-only fields
          messages: history.map(m => ({ role: m.role, content: m.content })),
        },
      })
      if (error) throw error

      const { reply, needsImage, imageLine, imageKeys } = data

      const assistantMsg = {
        role:      'assistant',
        content:   reply,
        type:      needsImage && imageKeys?.length ? 'images' : 'text',
        imageKeys: needsImage ? imageKeys : undefined,
        imageLine: !!imageLine,
      }

      setMessages(prev => [...prev, assistantMsg])
    } catch {
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: 'ขออภัยครับ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง หรือติดต่อเราผ่าน Messenger โดยตรงครับ',
      }])
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
          aria-label="เปิดแชท"
        >
          <ChatOpenIcon />
          <span className="hidden sm:inline">คุยกับเรา</span>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
          <div
            className="absolute inset-0 bg-black/50 md:hidden pointer-events-auto"
            onClick={onClose}
          />

          <div className="relative w-full max-w-sm md:max-w-[380px] h-full bg-brand-dark border-l border-zinc-800 flex flex-col pointer-events-auto">

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
                className="font-mono text-micro text-zinc-600 hover:text-zinc-300 tracking-widest uppercase transition-colors px-2 py-1 hover:bg-zinc-800"
              >
                [ ปิด ]
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {messages.map((msg, i) => (
                <ChatBubble key={i} msg={msg} messengerUrl={settings.messenger_url} />
              ))}
              {loading && <TypingIndicator />}
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
            <div className="border-t border-zinc-800 p-3 flex gap-2 shrink-0">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="พิมพ์ข้อความ..."
                rows={1}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-none px-3 py-2.5 text-zinc-100 text-body resize-none focus:outline-none focus:border-brand-yellow placeholder-zinc-700 font-mono text-caption"
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="bg-brand-yellow text-brand-dark w-10 flex items-center justify-center rounded-none font-bold disabled:opacity-30 hover:brightness-105 transition-all shrink-0"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

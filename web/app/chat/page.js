'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { sendChat, getChatHistory, getVoice } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import BottomNav from '../../components/BottomNav'

export default function ChatPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [playingId, setPlayingId] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  useEffect(() => {
    if (user) {
      getChatHistory()
        .then(({ data }) => {
          const msgs = (data.history || []).flatMap(h => ([
            { id: h.id + '_u', role: 'user', content: h.userMessage, createdAt: h.createdAt },
            { id: h.id + '_a', role: 'assistant', content: h.aiResponse, createdAt: h.createdAt },
          ]))
          setMessages(msgs)
        })
        .catch(() => {})
    }
  }, [user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim() || sending) return
    const userMsg = { id: Date.now() + '_u', role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setSending(true)
    try {
      const { data } = await sendChat(userMsg.content)
      setMessages(prev => [...prev, { id: Date.now() + '_a', role: 'assistant', content: data.response }])
    } catch (err) {
      const errMsg = err.response?.status === 403
        ? 'Seu trial expirou. Assine para continuar conversando com a Viva.'
        : 'Ops! Algo deu errado. Tente novamente.'
      setMessages(prev => [...prev, { id: Date.now() + '_e', role: 'error', content: errMsg }])
    } finally {
      setSending(false)
    }
  }

  async function handleVoice(text, id) {
    setPlayingId(id)
    try {
      const { data } = await getVoice(text)
      const blob = new Blob([data], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.onended = () => setPlayingId(null)
      audio.play()
    } catch {
      setPlayingId(null)
    }
  }

  if (loading || !user) return null

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-border">
        <span className="text-2xl">🌸</span>
        <div>
          <p className="font-bold text-text-main">Viva</p>
          <p className="text-xs text-success">● Online agora</p>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-36">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <span className="text-5xl block mb-3">🌸</span>
            <p className="text-text-secondary">Olá! Como você está se sentindo hoje?</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-primary text-white rounded-br-sm'
                : msg.role === 'error'
                ? 'bg-error/10 text-error border border-error/20'
                : 'bg-white border border-border text-text-main rounded-bl-sm shadow-sm'
            }`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
              {msg.role === 'assistant' && (
                <button
                  onClick={() => handleVoice(msg.content, msg.id)}
                  className="mt-2 text-xs text-text-light hover:text-primary transition flex items-center gap-1"
                >
                  {playingId === msg.id ? '⏸ Reproduzindo...' : '🔊 Ouvir'}
                </button>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-white border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-border px-4 py-3">
        <form onSubmit={handleSend} className="flex gap-3 items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Escreva sua mensagem..."
            className="flex-1 border-2 border-border rounded-full px-4 py-2.5 text-sm text-text-main placeholder-text-light focus:outline-none focus:border-primary transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-primary-dark transition"
          >
            →
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  )
}

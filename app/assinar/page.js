'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { register, createCheckout, createPixPayment } from '../../lib/api'
import { useAuth } from '../../lib/auth'

export default function AssinarPage() {
  const { saveAuth } = useAuth()
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pix, setPix] = useState(null)
  const [pixStatus, setPixStatus] = useState('pending')

  async function handleCard(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await register(name.trim(), email.trim().toLowerCase(), password)
      saveAuth(data.token, data.user)
      const { data: checkout } = await createCheckout()
      window.location.href = checkout.url
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta. Tente novamente.')
      setLoading(false)
    }
  }

  async function handlePix(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await register(name.trim(), email.trim().toLowerCase(), password)
      saveAuth(data.token, data.user)
      const { data: pixData } = await createPixPayment()
      setPix(pixData)
      startPolling()
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function validate() {
    if (!name.trim()) { setError('Digite seu nome.'); return false }
    if (!email.trim()) { setError('Digite seu email.'); return false }
    if (password.length < 6) { setError('Senha precisa ter pelo menos 6 caracteres.'); return false }
    setError('')
    return true
  }

  function startPolling() {
    const interval = setInterval(async () => {
      try {
        const { getSubscriptionStatus } = await import('../../lib/api')
        const { data } = await getSubscriptionStatus()
        if (data.status === 'active') {
          clearInterval(interval)
          setPixStatus('approved')
          setTimeout(() => router.push('/home'), 2000)
        }
      } catch {}
    }, 5000)
  }

  async function copyPix() {
    await navigator.clipboard.writeText(pix.qr_code)
    alert('Código PIX copiado!')
  }

  if (pixStatus === 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FDF6F8 0%, #F0E6F5 100%)' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-text-main">Pagamento confirmado!</h2>
          <p className="text-text-secondary mt-2">Entrando no app...</p>
        </div>
      </div>
    )
  }

  if (pix) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #FDF6F8 0%, #F0E6F5 100%)' }}>
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-sm border border-border">
          <h2 className="font-bold text-text-main text-center text-xl mb-1">Pague com PIX</h2>
          <p className="text-text-secondary text-sm text-center mb-4">R$37/mês — Viva Pro</p>

          {pix.qr_code_base64 && (
            <div className="flex justify-center mb-4">
              <img
                src={`data:image/png;base64,${pix.qr_code_base64}`}
                alt="QR Code PIX"
                className="w-52 h-52 rounded-xl border border-border"
              />
            </div>
          )}

          <p className="text-text-secondary text-xs text-center mb-4">
            Escaneie o QR Code ou copie o código abaixo
          </p>

          {pix.qr_code && (
            <button
              onClick={copyPix}
              className="w-full bg-primary/10 text-primary font-bold py-3 rounded-full hover:bg-primary/20 transition mb-3"
            >
              Copiar código PIX
            </button>
          )}

          <div className="flex items-center gap-2 justify-center text-text-secondary text-sm">
            <span className="animate-pulse">●</span>
            Aguardando pagamento...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #FDF6F8 0%, #F0E6F5 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="text-5xl">🌸</span>
          <h1 className="text-2xl font-extrabold text-primary mt-2">Começar agora</h1>
          <p className="text-text-secondary mt-1">7 dias grátis · depois R$37/mês</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-border">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4">
              {error}
            </div>
          )}

          <div className="space-y-3 mb-5">
            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border-2 border-border rounded-xl px-4 py-3 text-text-main placeholder-text-light focus:outline-none focus:border-primary transition"
            />
            <input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border-2 border-border rounded-xl px-4 py-3 text-text-main placeholder-text-light focus:outline-none focus:border-primary transition"
            />
            <input
              type="password"
              placeholder="Crie uma senha (mín. 6 caracteres)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border-2 border-border rounded-xl px-4 py-3 text-text-main placeholder-text-light focus:outline-none focus:border-primary transition"
            />
          </div>

          <p className="text-xs text-text-light text-center mb-4">Como prefere pagar?</p>

          <div className="space-y-3">
            <button
              onClick={handleCard}
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-full hover:bg-primary-dark transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              💳 {loading ? 'Aguarde...' : 'Cartão de crédito ou débito'}
            </button>

            <button
              onClick={handlePix}
              disabled={loading}
              className="w-full border-2 border-primary text-primary font-bold py-3.5 rounded-full hover:bg-primary/5 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              🏦 {loading ? 'Aguarde...' : 'PIX — aprovação instantânea'}
            </button>
          </div>

          <p className="text-center text-text-secondary text-sm mt-4">
            Já tem conta?{' '}
            <a href="/login" className="text-primary font-bold hover:underline">Entrar</a>
          </p>
        </div>
      </div>
    </div>
  )
}

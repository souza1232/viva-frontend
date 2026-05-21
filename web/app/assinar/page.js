'use client'
import { useState } from 'react'
import { register } from '../../lib/api'
import { useAuth } from '../../lib/auth'

const KIWIFY_URL = 'https://pay.kiwify.com.br/OKHSJyi'

export default function AssinarPage() {
  const { saveAuth } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError('Digite seu nome.'); return }
    if (!email.trim()) { setError('Digite seu email.'); return }
    if (password.length < 6) { setError('Senha precisa ter pelo menos 6 caracteres.'); return }
    setError('')
    setLoading(true)
    try {
      const { data } = await register(name.trim(), email.trim().toLowerCase(), password)
      saveAuth(data.token, data.user)
      window.location.href = `${KIWIFY_URL}?email=${encodeURIComponent(email.trim().toLowerCase())}`
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #FDF6F8 0%, #F0E6F5 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="text-5xl">🌸</span>
          <h1 className="text-2xl font-extrabold text-primary mt-2">Começar agora</h1>
          <p className="text-text-secondary mt-1">Crie sua conta e escolha como pagar</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-border">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full border-2 border-border rounded-xl px-4 py-3 text-text-main placeholder-text-light focus:outline-none focus:border-primary transition"
            />
            <input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border-2 border-border rounded-xl px-4 py-3 text-text-main placeholder-text-light focus:outline-none focus:border-primary transition"
            />
            <input
              type="password"
              placeholder="Crie uma senha (mín. 6 caracteres)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border-2 border-border rounded-xl px-4 py-3 text-text-main placeholder-text-light focus:outline-none focus:border-primary transition"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-4 rounded-full hover:bg-primary-dark transition disabled:opacity-60 text-lg mt-2"
            >
              {loading ? 'Criando conta...' : 'Criar conta e ir para pagamento →'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-text-light text-xs">pagamento via</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="flex justify-center gap-4 text-sm text-text-secondary">
            <span>💳 Cartão</span>
            <span>🏦 PIX</span>
            <span>📄 Boleto</span>
          </div>

          <p className="text-center text-xs text-text-light mt-3">
            Processado com segurança pela Kiwify
          </p>

          <p className="text-center text-text-secondary text-sm mt-4">
            Já tem conta?{' '}
            <a href="/login" className="text-primary font-bold hover:underline">Entrar</a>
          </p>
        </div>
      </div>
    </div>
  )
}

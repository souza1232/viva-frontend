'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { register } from '../../lib/api'
import { useAuth } from '../../lib/auth'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { saveAuth } = useAuth()
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    setLoading(true)
    try {
      const { data } = await register(name.trim(), email.trim().toLowerCase(), password)
      saveAuth(data.token, data.user)
      router.push('/onboarding')
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #FDF6F8 0%, #F0E6F5 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🌸</span>
          <h1 className="text-3xl font-extrabold text-primary mt-2">Viva</h1>
          <p className="text-text-secondary mt-1">7 dias grátis para experimentar</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-border">
          <h2 className="text-xl font-bold text-text-main mb-6">Criar minha conta</h2>

          {error && (
            <div className="bg-error/10 text-error text-sm rounded-xl p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Senha (mín. 6 caracteres)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border-2 border-border rounded-xl px-4 py-3 text-text-main placeholder-text-light focus:outline-none focus:border-primary transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-3 rounded-full hover:bg-primary-dark transition disabled:opacity-60"
            >
              {loading ? 'Criando conta...' : 'Começar grátis por 7 dias →'}
            </button>
          </form>

          <p className="text-center text-text-light text-xs mt-4">
            Sem cartão de crédito obrigatório agora
          </p>

          <p className="text-center text-text-secondary text-sm mt-4">
            Já tem conta?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

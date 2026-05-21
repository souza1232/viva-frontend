'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { login } from '../../lib/api'
import { useAuth } from '../../lib/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { saveAuth, user } = useAuth()
  const router = useRouter()

  if (user) {
    router.push(user.onboardingDone ? '/home' : '/onboarding')
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await login(email.trim().toLowerCase(), password)
      saveAuth(data.token, data.user)
      router.push(data.user.onboardingDone ? '/home' : '/onboarding')
    } catch (err) {
      setError(err.response?.data?.error || 'Email ou senha incorretos.')
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
          <p className="text-text-secondary mt-1">Sua companheira na menopausa</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-border">
          <h2 className="text-xl font-bold text-text-main mb-6">Bem-vinda de volta</h2>

          {error && (
            <div className="bg-error/10 text-error text-sm rounded-xl p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Senha"
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
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-text-secondary text-sm mt-6">
            Ainda não tem conta?{' '}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

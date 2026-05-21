'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getGreeting } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import BottomNav from '../../components/BottomNav'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [greeting, setGreeting] = useState(null)
  const [loadingGreeting, setLoadingGreeting] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
    else if (!loading && user && !user.onboardingDone) router.push('/onboarding')
  }, [user, loading])

  useEffect(() => {
    if (user) {
      getGreeting()
        .then(({ data }) => setGreeting(data))
        .catch(() => {})
        .finally(() => setLoadingGreeting(false))
    }
  }, [user])

  if (loading || !user) return null

  const firstName = user.name?.split(' ')[0] || 'Querida'
  const hour = new Date().getHours()
  const period = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #FDF6F8 0%, #F0E6F5 100%)' }} className="px-6 pt-12 pb-6">
        <p className="text-text-secondary text-sm font-medium">{period}</p>
        <h1 className="text-2xl font-extrabold text-text-main">{firstName} 🌸</h1>
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* Saudação da IA */}
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🌸</span>
            <span className="font-bold text-primary">Viva</span>
          </div>
          {loadingGreeting ? (
            <div className="h-4 bg-border rounded animate-pulse w-3/4" />
          ) : (
            <p className="text-text-main leading-relaxed">
              {greeting?.message || `Olá ${firstName}! Como você está se sentindo hoje? Estou aqui para te ouvir.`}
            </p>
          )}
          <Link
            href="/chat"
            className="inline-block mt-4 bg-primary text-white font-bold px-5 py-2 rounded-full text-sm hover:bg-primary-dark transition"
          >
            Conversar com a Viva →
          </Link>
        </div>

        {/* Ações rápidas */}
        <h2 className="text-lg font-bold text-text-main pt-2">O que você quer fazer?</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: '/chat', emoji: '💬', title: 'Conversar', desc: 'Fale com a Viva agora' },
            { href: '/comunidade', emoji: '👭', title: 'Comunidade', desc: 'Ver posts da semana' },
            { href: '/relatorio', emoji: '📊', title: 'Relatório', desc: 'Seu mês em resumo' },
            { href: '/perfil', emoji: '👤', title: 'Perfil', desc: 'Configurações e plano' },
          ].map(a => (
            <Link
              key={a.href}
              href={a.href}
              className="bg-white rounded-2xl p-4 border border-border shadow-sm hover:border-primary transition"
            >
              <span className="text-3xl block mb-2">{a.emoji}</span>
              <p className="font-bold text-text-main text-sm">{a.title}</p>
              <p className="text-text-light text-xs mt-0.5">{a.desc}</p>
            </Link>
          ))}
        </div>

        {/* Status da assinatura */}
        {user.subscription && (
          <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
            <p className="text-primary font-semibold text-sm">
              {user.subscription.status === 'trialing'
                ? `🎁 Trial grátis ativo — aproveite!`
                : user.subscription.status === 'active'
                ? `✅ Assinatura ativa`
                : `⚠️ Assinatura inativa`}
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

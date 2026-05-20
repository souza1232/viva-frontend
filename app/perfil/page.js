'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createCheckout, cancelSubscription, getSubscriptionStatus } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import BottomNav from '../../components/BottomNav'

export default function PerfilPage() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [sub, setSub] = useState(null)
  const [loadingSub, setLoadingSub] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  useEffect(() => {
    if (user) {
      getSubscriptionStatus()
        .then(({ data }) => setSub(data))
        .catch(() => {})
        .finally(() => setLoadingSub(false))
    }
  }, [user])

  async function handleCheckout() {
    setCheckoutLoading(true)
    try {
      const { data } = await createCheckout()
      window.location.href = data.url
    } catch {
      alert('Erro ao redirecionar para pagamento.')
      setCheckoutLoading(false)
    }
  }

  async function handleCancel() {
    if (!confirm('Tem certeza que quer cancelar sua assinatura?')) return
    try {
      await cancelSubscription()
      alert('Assinatura cancelada.')
      window.location.reload()
    } catch {
      alert('Erro ao cancelar. Tente novamente.')
    }
  }

  if (loading || !user) return null

  const firstName = user.name?.split(' ')[0] || ''
  const isActive = sub?.status === 'active' || sub?.status === 'trialing'
  const isTrialing = sub?.status === 'trialing'

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #FDF6F8 0%, #F0E6F5 100%)' }} className="px-6 pt-12 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-3xl">
            🌸
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-text-main">{user.name}</h1>
            <p className="text-text-secondary text-sm">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Info */}
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm space-y-3">
          <h2 className="font-bold text-text-main">Meu perfil</h2>
          {user.age && (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Idade</span>
              <span className="font-semibold text-text-main">{user.age} anos</span>
            </div>
          )}
          {user.mainRole && (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Papel</span>
              <span className="font-semibold text-text-main capitalize">{user.mainRole}</span>
            </div>
          )}
          {user.mainSymptoms?.length > 0 && (
            <div className="text-sm">
              <span className="text-text-secondary block mb-2">Sintomas principais</span>
              <div className="flex flex-wrap gap-2">
                {user.mainSymptoms.map(s => (
                  <span key={s} className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full capitalize">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Assinatura */}
        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
          <h2 className="font-bold text-text-main mb-4">Minha assinatura</h2>
          {loadingSub ? (
            <div className="h-4 bg-border rounded animate-pulse w-1/2" />
          ) : isActive ? (
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold mb-4 ${isTrialing ? 'bg-accent/20 text-accent' : 'bg-success/20 text-success'}`}>
                {isTrialing ? '🎁 Trial ativo' : '✅ Ativa — R$37/mês'}
              </div>
              {sub?.currentPeriodEnd && (
                <p className="text-text-secondary text-sm mb-4">
                  {isTrialing ? 'Trial termina em:' : 'Próxima cobrança:'}{' '}
                  {new Date(sub.currentPeriodEnd).toLocaleDateString('pt-BR')}
                </p>
              )}
              <button
                onClick={handleCancel}
                className="w-full border-2 border-border text-text-secondary font-semibold py-3 rounded-full hover:border-error hover:text-error transition"
              >
                Cancelar assinatura
              </button>
            </div>
          ) : (
            <div>
              <p className="text-text-secondary text-sm mb-4">
                Assine para ter acesso completo à Viva — chat ilimitado, comunidade e relatórios mensais.
              </p>
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full bg-primary text-white font-bold py-3 rounded-full hover:bg-primary-dark transition disabled:opacity-60"
              >
                {checkoutLoading ? 'Redirecionando...' : 'Assinar por R$37/mês'}
              </button>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full text-error font-semibold py-3 rounded-full border-2 border-error/30 hover:bg-error/5 transition"
        >
          Sair da conta
        </button>
      </div>

      <BottomNav />
    </div>
  )
}

'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createCheckout, createPixPayment, getSubscriptionStatus } from '../../lib/api'
import { useAuth } from '../../lib/auth'

export default function CheckoutPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [cardLoading, setCardLoading] = useState(false)
  const [pix, setPix] = useState(null)
  const [pixLoading, setPixLoading] = useState(false)
  const [pixStatus, setPixStatus] = useState('pending') // pending | approved

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  const checkPixStatus = useCallback(async () => {
    try {
      const { data } = await getSubscriptionStatus()
      if (data.status === 'active') {
        setPixStatus('approved')
        setTimeout(() => router.push('/home'), 2000)
      }
    } catch {}
  }, [router])

  useEffect(() => {
    if (!pix || pixStatus === 'approved') return
    const interval = setInterval(checkPixStatus, 5000)
    return () => clearInterval(interval)
  }, [pix, pixStatus, checkPixStatus])

  async function handleCard() {
    setCardLoading(true)
    try {
      const { data } = await createCheckout()
      window.location.href = data.url
    } catch {
      alert('Erro ao redirecionar para pagamento.')
      setCardLoading(false)
    }
  }

  async function handlePix() {
    setPixLoading(true)
    try {
      const { data } = await createPixPayment()
      setPix(data)
    } catch {
      alert('Erro ao gerar PIX. Tente novamente.')
    } finally {
      setPixLoading(false)
    }
  }

  async function copyPix() {
    await navigator.clipboard.writeText(pix.qr_code)
    alert('Código PIX copiado!')
  }

  if (loading || !user) return null

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #FDF6F8 0%, #F0E6F5 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🌸</span>
          <h1 className="text-2xl font-extrabold text-primary mt-2">Assinar Viva</h1>
          <p className="text-text-secondary mt-1">R$37/mês — cancele quando quiser</p>
        </div>

        {pixStatus === 'approved' ? (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-border text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-text-main">Pagamento confirmado!</h2>
            <p className="text-text-secondary mt-2">Redirecionando para o app...</p>
          </div>
        ) : pix ? (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-border">
            <h2 className="font-bold text-text-main text-center mb-4">Pague com PIX</h2>

            {pix.qr_code_base64 && (
              <div className="flex justify-center mb-4">
                <img
                  src={`data:image/png;base64,${pix.qr_code_base64}`}
                  alt="QR Code PIX"
                  className="w-48 h-48 rounded-xl border border-border"
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

            <div className="flex items-center gap-2 justify-center text-text-secondary text-xs">
              <span className="animate-pulse">●</span>
              Aguardando confirmação...
            </div>

            <button
              onClick={() => setPix(null)}
              className="w-full text-text-light text-sm mt-4 hover:text-text-secondary transition"
            >
              Usar outro método
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-border space-y-4">
            <button
              onClick={handleCard}
              disabled={cardLoading}
              className="w-full bg-primary text-white font-bold py-4 rounded-full hover:bg-primary-dark transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              💳 {cardLoading ? 'Redirecionando...' : 'Cartão de crédito ou débito'}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-text-light text-xs">ou</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button
              onClick={handlePix}
              disabled={pixLoading}
              className="w-full border-2 border-primary text-primary font-bold py-4 rounded-full hover:bg-primary/5 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              🏦 {pixLoading ? 'Gerando PIX...' : 'PIX — aprovação instantânea'}
            </button>

            <p className="text-center text-text-light text-xs">
              Pagamento seguro via Mercado Pago
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'
import { useEffect } from 'react'
import { useAuth } from '../../lib/auth'

const KIWIFY_URL = 'https://pay.kiwify.com.br/OKHSJyi'

export default function CheckoutPage() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    const url = user?.email
      ? `${KIWIFY_URL}?email=${encodeURIComponent(user.email)}`
      : KIWIFY_URL
    window.location.href = url
  }, [user, loading])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FDF6F8 0%, #F0E6F5 100%)' }}>
      <div className="text-center">
        <span className="text-5xl">🌸</span>
        <p className="text-text-secondary mt-4">Redirecionando para o pagamento...</p>
      </div>
    </div>
  )
}

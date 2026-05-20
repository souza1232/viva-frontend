'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from '../../lib/api'
import { useAuth } from '../../lib/auth'

const SYMPTOMS = [
  { key: 'fogachos', label: 'Fogachos', emoji: '🔥' },
  { key: 'insonia', label: 'Insônia', emoji: '🌙' },
  { key: 'ansiedade', label: 'Ansiedade', emoji: '💭' },
  { key: 'fadiga', label: 'Fadiga', emoji: '😴' },
  { key: 'humor', label: 'Alterações de humor', emoji: '🌊' },
  { key: 'peso', label: 'Alteração de peso', emoji: '⚖️' },
  { key: 'libido', label: 'Baixa libido', emoji: '💝' },
  { key: 'dores', label: 'Dores no corpo', emoji: '🦴' },
  { key: 'memoria', label: 'Lapsos de memória', emoji: '🧠' },
  { key: 'pele', label: 'Pele seca', emoji: '✨' },
]

const ROLES = [
  { key: 'empresaria', label: 'Empresária', emoji: '💼' },
  { key: 'mae', label: 'Mãe', emoji: '👩‍👧' },
  { key: 'esposa', label: 'Esposa/Companheira', emoji: '💕' },
  { key: 'todas', label: 'Tudo isso junto!', emoji: '🦋' },
]

const STEPS = ['welcome', 'symptoms', 'role', 'age']

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [selectedRole, setSelectedRole] = useState(null)
  const [age, setAge] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, setUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push('/login')
    else if (user.onboardingDone) router.push('/home')
  }, [user])

  function toggleSymptom(key) {
    setSelectedSymptoms(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    )
  }

  async function handleFinish() {
    setLoading(true)
    try {
      const { data } = await updateProfile({
        mainSymptoms: selectedSymptoms,
        mainRole: selectedRole || 'todas',
        age: age ? parseInt(age) : undefined,
        onboardingDone: true,
      })
      setUser(data)
      router.push('/home')
    } catch {
      alert('Erro ao salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const currentStep = STEPS[step]
  const firstName = user?.name?.split(' ')[0] || ''

  return (
    <div className="min-h-screen flex flex-col px-6 py-10" style={{ background: 'linear-gradient(135deg, #FDF6F8 0%, #F0E6F5 100%)' }}>
      {/* Progress */}
      <div className="flex gap-2 justify-center mb-10">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${i <= step ? 'bg-primary' : 'bg-border'} ${i === step ? 'w-8' : 'w-2'}`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        {currentStep === 'welcome' && (
          <div className="text-center">
            <span className="text-6xl block mb-4">🌸</span>
            <h1 className="text-3xl font-extrabold text-text-main mb-4">Olá, {firstName}!</h1>
            <p className="text-text-secondary text-lg leading-relaxed">
              Eu sou a Viva, sua companheira nessa fase tão importante da vida.<br /><br />
              Vou te acompanhar com carinho, sem julgamento, 24 horas por dia.<br /><br />
              Antes de começar, me conta um pouco sobre você.
            </p>
          </div>
        )}

        {currentStep === 'symptoms' && (
          <div className="w-full">
            <div className="text-center mb-6">
              <span className="text-5xl block mb-3">💭</span>
              <h2 className="text-2xl font-bold text-text-main">Quais sintomas você sente?</h2>
              <p className="text-text-secondary mt-1">Selecione todos que se aplicam</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {SYMPTOMS.map(s => (
                <button
                  key={s.key}
                  onClick={() => toggleSymptom(s.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 font-medium transition ${
                    selectedSymptoms.includes(s.key)
                      ? 'bg-primary border-primary text-white'
                      : 'bg-white border-border text-text-main hover:border-primary'
                  }`}
                >
                  <span>{s.emoji}</span>
                  <span className="text-sm">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'role' && (
          <div className="w-full">
            <div className="text-center mb-6">
              <span className="text-5xl block mb-3">👑</span>
              <h2 className="text-2xl font-bold text-text-main">Qual o seu papel principal?</h2>
              <p className="text-text-secondary mt-1">Como você se identifica?</p>
            </div>
            <div className="space-y-3">
              {ROLES.map(r => (
                <button
                  key={r.key}
                  onClick={() => setSelectedRole(r.key)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition ${
                    selectedRole === r.key
                      ? 'bg-pink-50 border-primary'
                      : 'bg-white border-border hover:border-primary'
                  }`}
                >
                  <span className="text-3xl">{r.emoji}</span>
                  <span className={`text-lg font-semibold ${selectedRole === r.key ? 'text-primary' : 'text-text-main'}`}>
                    {r.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'age' && (
          <div className="w-full text-center">
            <span className="text-5xl block mb-3">🎂</span>
            <h2 className="text-2xl font-bold text-text-main mb-2">Quantos anos você tem?</h2>
            <p className="text-text-secondary mb-8">Para personalizar ainda mais minha ajuda</p>
            <input
              type="number"
              placeholder="Ex: 52"
              value={age}
              onChange={e => setAge(e.target.value)}
              maxLength={3}
              className="border-2 border-border rounded-2xl px-6 py-4 text-4xl text-center w-40 text-text-main focus:outline-none focus:border-primary bg-white"
            />
          </div>
        )}
      </div>

      {/* Botões */}
      <div className="flex gap-3 max-w-md mx-auto w-full mt-10">
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex-1 border-2 border-border rounded-full py-3 font-semibold text-text-secondary hover:border-primary transition"
          >
            Voltar
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="flex-2 flex-1 bg-primary text-white font-bold py-3 rounded-full hover:bg-primary-dark transition"
          >
            {step === 0 ? 'Vamos começar!' : 'Continuar'}
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={loading}
            className="flex-1 bg-primary text-white font-bold py-3 rounded-full hover:bg-primary-dark transition disabled:opacity-60"
          >
            {loading ? 'Salvando...' : 'Conhecer a Viva! 🌸'}
          </button>
        )}
      </div>
    </div>
  )
}

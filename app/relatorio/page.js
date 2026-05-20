'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getReport } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import BottomNav from '../../components/BottomNav'

const MONTHS = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const MOOD_MAP = { excelente: '🌟', bem: '😊', ok: '😐', cansada: '😔', dificil: '😢' }

function Section({ title, emoji, children }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
      <h3 className="font-bold text-text-main mb-4">{emoji} {title}</h3>
      {children}
    </div>
  )
}

export default function RelatorioPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const now = new Date()
  const [month] = useState(now.getMonth() + 1)
  const [year] = useState(now.getFullYear())
  const [report, setReport] = useState(null)
  const [loadingReport, setLoadingReport] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  useEffect(() => {
    if (user) {
      getReport(month, year)
        .then(({ data }) => setReport(data))
        .catch(err => setError(err.response?.data?.error || 'Erro ao carregar relatório.'))
        .finally(() => setLoadingReport(false))
    }
  }, [user])

  if (loading || !user) return null

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #FDF6F8 0%, #F0E6F5 100%)' }} className="px-6 pt-12 pb-4">
        <h1 className="text-2xl font-extrabold text-text-main">📊 Relatório Mensal</h1>
        <p className="text-text-secondary mt-1">{MONTHS[month]} {year}</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {loadingReport ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Gerando seu relatório...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-3">📊</span>
            <p className="font-bold text-text-main mb-2">Relatório indisponível</p>
            <p className="text-text-secondary text-sm">{error}</p>
          </div>
        ) : report ? (
          <>
            {/* Resumo */}
            <div className="bg-white rounded-2xl p-5 border-l-4 border-primary shadow-sm">
              <p className="text-primary font-bold text-sm mb-2">Resumo do mês</p>
              <p className="text-text-main leading-relaxed">{report.summaryText}</p>
            </div>

            {/* Sintomas */}
            {report.topSymptoms?.length > 0 && (
              <Section title="Sintomas mais frequentes" emoji="🌡️">
                <div className="flex flex-wrap gap-2">
                  {report.topSymptoms.map(s => (
                    <span key={s} className="bg-error/10 text-error text-sm font-semibold px-3 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </Section>
            )}

            {/* Humor */}
            {report.moodEvolution && Object.keys(report.moodEvolution).length > 0 && (
              <Section title="Humor por semana" emoji="🌈">
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(report.moodEvolution).map(([week, mood]) => (
                    <div key={week} className="bg-background rounded-xl p-3 text-center">
                      <span className="text-2xl block mb-1">{MOOD_MAP[mood] || '😊'}</span>
                      <p className="text-xs text-text-light font-semibold">{week.replace('semana', 'Sem.')}</p>
                      <p className="text-xs text-text-secondary capitalize">{mood}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Sono */}
            {report.sleepPatterns && (
              <Section title="Padrões de sono" emoji="🌙">
                <p className="text-text-main leading-relaxed">{report.sleepPatterns}</p>
              </Section>
            )}

            {/* Conquistas */}
            {report.achievements?.length > 0 && (
              <Section title="Suas conquistas" emoji="🏆">
                <ul className="space-y-2">
                  {report.achievements.map((a, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="text-primary font-bold mt-0.5">✓</span>
                      <span className="text-text-main text-sm leading-relaxed">{a}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Sugestões */}
            {report.suggestions?.length > 0 && (
              <Section title="Para o próximo mês" emoji="💡">
                <ul className="space-y-2">
                  {report.suggestions.map((s, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="text-accent font-bold mt-0.5">→</span>
                      <span className="text-text-main text-sm leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Perguntas médico */}
            {report.doctorQuestions?.length > 0 && (
              <Section title="Perguntas para o médico" emoji="👩‍⚕️">
                <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs text-text-secondary italic mb-3">Leve estas perguntas na sua próxima consulta:</p>
                  {report.doctorQuestions.map((q, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="text-secondary font-bold text-sm">{i + 1}.</span>
                      <span className="text-text-main text-sm leading-relaxed">{q}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </>
        ) : null}
      </div>

      <BottomNav />
    </div>
  )
}

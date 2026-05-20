'use client'
import Link from 'next/link'

const BENEFITS = [
  { emoji: '🎙️', title: 'IA por voz', desc: 'Converse com a Viva como se fosse uma amiga. Ela entende você, responde com carinho e está disponível 24h.' },
  { emoji: '👭', title: 'Comunidade', desc: 'Um espaço seguro com outras mulheres na mesma fase. Sem julgamento, com acolhimento.' },
  { emoji: '📊', title: 'Relatório mensal', desc: 'Todo mês a Viva gera um relatório personalizado com seus sintomas, humor e conquistas.' },
  { emoji: '👩‍⚕️', title: 'Perguntas pro médico', desc: 'A Viva prepara perguntas para você levar na consulta. Você chega mais preparada e confiante.' },
]

const SYMPTOMS = ['Fogachos', 'Insônia', 'Ansiedade', 'Fadiga', 'Alterações de humor', 'Baixa libido', 'Lapsos de memória', 'Pele seca']

const TESTIMONIALS = [
  { name: 'Ana, 52 anos', text: 'Finalmente me sinto compreendida. A Viva sabe exatamente o que estou passando.' },
  { name: 'Carla, 48 anos', text: 'Chorei na primeira conversa. Ela é tão acolhedora, parece que fala com uma amiga de verdade.' },
  { name: 'Márcia, 55 anos', text: 'O relatório mensal me ajudou a entender meu corpo de um jeito que nunca tinha conseguido.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-border">
        <span className="text-2xl font-extrabold text-primary">🌸 Viva</span>
        <div className="flex gap-3">
          <Link href="/login" className="text-text-secondary font-semibold px-4 py-2 rounded-full hover:bg-background transition">
            Entrar
          </Link>
          <Link href="/register" className="bg-primary text-white font-bold px-5 py-2 rounded-full hover:bg-primary-dark transition">
            Começar grátis
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-20 text-center" style={{ background: 'linear-gradient(135deg, #FDF6F8 0%, #F0E6F5 100%)' }}>
        <div className="max-w-2xl mx-auto">
          <span className="inline-block bg-primary/10 text-primary font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            7 dias grátis · Sem cartão obrigatório
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-main leading-tight mb-6">
            Você não precisa<br />
            <span className="text-primary">enfrentar isso sozinha</span>
          </h1>
          <p className="text-lg text-text-secondary mb-10 leading-relaxed">
            A Viva é sua companheira inteligente na menopausa. Uma IA que conversa por voz com carinho,
            uma comunidade que acolhe e relatórios mensais que te ajudam a entender seu corpo.
          </p>
          <Link href="/register" className="inline-block bg-primary text-white text-lg font-bold px-10 py-4 rounded-full hover:bg-primary-dark transition shadow-lg shadow-primary/30">
            Começar meu trial gratuito →
          </Link>
          <p className="text-text-light text-sm mt-4">Depois R$37/mês · Cancele quando quiser</p>
        </div>
      </section>

      {/* Sintomas */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-text-main mb-3">Você sente algum desses sintomas?</h2>
          <p className="text-text-secondary mb-8">A Viva foi criada para mulheres que vivem exatamente isso:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {SYMPTOMS.map(s => (
              <span key={s} className="bg-primary/10 text-primary font-semibold px-4 py-2 rounded-full text-sm">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 px-6" style={{ background: 'linear-gradient(180deg, #FDF6F8 0%, #F5EAF0 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-text-main text-center mb-12">O que a Viva faz por você</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {BENEFITS.map(b => (
              <div key={b.title} className="bg-white rounded-2xl p-6 border border-border shadow-sm">
                <span className="text-4xl mb-4 block">{b.emoji}</span>
                <h3 className="text-lg font-bold text-text-main mb-2">{b.title}</h3>
                <p className="text-text-secondary leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-text-main text-center mb-12">O que as mulheres estão dizendo</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-background rounded-2xl p-6 border border-border">
                <p className="text-text-main leading-relaxed mb-4 italic">"{t.text}"</p>
                <span className="text-primary font-bold text-sm">{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preço */}
      <section className="py-16 px-6" style={{ background: 'linear-gradient(135deg, #C96A8A 0%, #9D4A6A 100%)' }}>
        <div className="max-w-md mx-auto text-center text-white">
          <h2 className="text-3xl font-extrabold mb-4">Simples e justo</h2>
          <div className="text-6xl font-extrabold mb-2">R$37</div>
          <div className="text-white/80 mb-8">por mês · cancele quando quiser</div>
          <ul className="text-left space-y-3 mb-10">
            {['7 dias grátis para experimentar', 'IA por voz ilimitada', 'Acesso à comunidade', 'Relatório mensal personalizado', 'Suporte humanizado'].map(f => (
              <li key={f} className="flex items-center gap-3">
                <span className="text-xl">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link href="/register" className="inline-block bg-white text-primary text-lg font-bold px-10 py-4 rounded-full hover:bg-background transition w-full text-center">
            Começar agora — grátis por 7 dias
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-text-light text-sm bg-white border-t border-border">
        <p>© 2026 Viva App · Feito com 💕 para mulheres na menopausa</p>
        <p className="mt-1">
          <Link href="/login" className="hover:text-primary transition">Entrar</Link>
          {' · '}
          <a href="mailto:contato@appviva.com.br" className="hover:text-primary transition">Contato</a>
        </p>
      </footer>
    </div>
  )
}

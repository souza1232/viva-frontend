'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/home', emoji: '🏠', label: 'Início' },
  { href: '/chat', emoji: '💬', label: 'Chat' },
  { href: '/comunidade', emoji: '👭', label: 'Comunidade' },
  { href: '/relatorio', emoji: '📊', label: 'Relatório' },
  { href: '/perfil', emoji: '👤', label: 'Perfil' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border flex z-50">
      {TABS.map(tab => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition ${active ? 'text-primary' : 'text-text-light hover:text-text-secondary'}`}
          >
            <span className="text-xl">{tab.emoji}</span>
            <span className={`text-xs font-semibold ${active ? 'text-primary' : ''}`}>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

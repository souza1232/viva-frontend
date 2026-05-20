import './globals.css'
import { AuthProvider } from '../lib/auth'

export const metadata = {
  title: 'Viva — Sua companheira na menopausa',
  description: 'IA por voz personalizada e comunidade para mulheres na menopausa. Experimente grátis por 7 dias.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

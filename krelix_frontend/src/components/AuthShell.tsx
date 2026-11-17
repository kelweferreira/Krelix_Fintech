import type { ReactNode } from 'react'
import logo from '../assets/logo-krelix.png'

// Moldura das telas públicas (login e cadastro).
export default function AuthShell({ titulo, subtitulo, children }: { titulo: string; subtitulo: string; children: ReactNode }) {
  return (
    <div className="auth-page">
      <div className="auth-lado">
        <img src={logo} alt="Krelix" />
      </div>
      <div className="auth-conteudo">
        <div className="auth-card">
          <h1>{titulo}</h1>
          <p className="subtitulo">{subtitulo}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

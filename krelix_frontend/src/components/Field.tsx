import type { ReactNode } from 'react'

interface Props {
  rotulo: string
  paraId: string
  erro?: string
  dica?: string
  children: ReactNode // o <input> / <select>
}

export default function Field({ rotulo, paraId, erro, dica, children }: Props) {
  return (
    <div className="campo">
      <label htmlFor={paraId}>{rotulo}</label>
      {children}
      {erro ? <small className="campo-erro" role="alert">{erro}</small> : dica ? <small className="campo-dica">{dica}</small> : null}
    </div>
  )
}

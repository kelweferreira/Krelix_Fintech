import type { ReactNode } from 'react'

interface Props {
  titulo: string
  subtitulo?: string
  acoes?: ReactNode
}

export default function PageHeader({ titulo, subtitulo, acoes }: Props) {
  return (
    <div className="page-header">
      <div>
        <h1>{titulo}</h1>
        {subtitulo && <p className="subtitulo">{subtitulo}</p>}
      </div>
      {acoes && <div className="page-header-acoes">{acoes}</div>}
    </div>
  )
}

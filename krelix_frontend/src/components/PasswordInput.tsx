import { useState, type ChangeEvent } from 'react'
import { Icon } from './Icons'

interface Props {
  id: string
  valor: string
  aoMudar: (e: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  invalido?: boolean
  autoComplete?: string
}

// Campo de senha com botão olho para mostrar/ocultar.
export default function PasswordInput({ id, valor, aoMudar, placeholder, invalido, autoComplete }: Props) {
  const [visivel, setVisivel] = useState(false)
  return (
    <div className="input-com-icone">
      <input id={id} className={invalido ? 'input erro' : 'input'} type={visivel ? 'text' : 'password'}
        value={valor} onChange={aoMudar} placeholder={placeholder} autoComplete={autoComplete} />
      <button type="button" className="input-icone-btn" aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
        onClick={() => setVisivel((v) => !v)}>
        <Icon nome={visivel ? 'eyeOff' : 'eye'} />
      </button>
    </div>
  )
}

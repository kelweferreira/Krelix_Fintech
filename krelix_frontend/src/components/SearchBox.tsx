import { Icon } from './Icons'

interface Props {
  valor: string
  aoMudar: (texto: string) => void
  placeholder: string
}

export default function SearchBox({ valor, aoMudar, placeholder }: Props) {
  return (
    <div className="busca">
      <Icon nome="search" />
      <input type="search" value={valor} placeholder={placeholder} aria-label={placeholder}
        onChange={(e) => aoMudar(e.target.value)} />
    </div>
  )
}

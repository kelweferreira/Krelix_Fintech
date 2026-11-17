import { Link } from 'react-router-dom'
import AuthShell from '../components/AuthShell'

export default function NotFoundPage() {
  return (
    <AuthShell titulo="Página não encontrada" subtitulo="O endereço acessado não existe.">
      <Link to="/" className="btn btn-primario btn-bloco">Voltar ao início</Link>
    </AuthShell>
  )
}

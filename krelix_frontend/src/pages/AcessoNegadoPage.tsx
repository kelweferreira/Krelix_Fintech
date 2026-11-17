import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

// Mostrada quando o usuário está logado, mas o perfil dele não pode acessar a página (ex.: CLIENTE em /usuarios).
export default function AcessoNegadoPage() {
  return (
    <>
      <PageHeader titulo="Acesso negado" subtitulo="Seu perfil não tem permissão para acessar esta página." />
      <div className="card">
        <Link to="/" className="btn btn-primario">Voltar ao início</Link>
      </div>
    </>
  )
}

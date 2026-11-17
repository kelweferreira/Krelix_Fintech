import { Navigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import DadosPessoaisForm from '../components/DadosPessoaisForm'
import { useAuth } from '../context/useAuth'

export default function MeuPerfilPage() {
  const { cliente } = useAuth()
  if (!cliente) return <Navigate to="/completar-cadastro" replace />

  return (
    <>
      <PageHeader titulo="Meu perfil" subtitulo="Consulte e atualize seus dados pessoais." />
      <DadosPessoaisForm cliente={cliente} />
    </>
  )
}

import { Navigate, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import DadosPessoaisForm from '../components/DadosPessoaisForm'
import { useAuth } from '../context/useAuth'

export default function CompletarCadastroPage() {
  const { cliente } = useAuth()
  const navigate = useNavigate()
  if (cliente) return <Navigate to="/" replace />

  return (
    <>
      <PageHeader titulo="Complete seu cadastro" subtitulo="Informe seus dados pessoais para começar a usar o Krelix." />
      <DadosPessoaisForm aoSalvar={() => navigate('/')} />
    </>
  )
}

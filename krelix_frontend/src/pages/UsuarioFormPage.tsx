import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import UsuarioForm from '../components/UsuarioForm'

export default function UsuarioFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const idNumero = id ? Number(id) : undefined
  const voltar = () => navigate('/usuarios')

  return (
    <>
      <PageHeader titulo={idNumero !== undefined ? 'Editar Usuário' : 'Novo Usuário'}
        subtitulo={idNumero !== undefined ? 'Altere os dados do usuário.' : 'Preencha os dados para adicionar um novo usuário.'} />
      <UsuarioForm id={idNumero} aoSalvar={voltar} aoCancelar={voltar} />
    </>
  )
}

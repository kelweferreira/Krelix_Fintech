import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import UsuarioForm from '../components/UsuarioForm'

export default function RegistroPage() {
  const navigate = useNavigate()
  return (
    <AuthShell titulo="Criar usuário" subtitulo="Crie seu acesso. Depois do primeiro login você completa seus dados pessoais.">
      <UsuarioForm publico aoSalvar={() => navigate('/login')} aoCancelar={() => navigate('/login')} />
      <p className="auth-rodape">Já tem acesso? <Link to="/login">Entrar</Link></p>
    </AuthShell>
  )
}

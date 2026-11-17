import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import Field from '../components/Field'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../context/useAuth'
import { emailValido } from '../utils/validators'
import { mensagemDeErro } from '../utils/erros'

interface ErrosLogin { email?: string; senha?: string }

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erros, setErros] = useState<ErrosLogin>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function aoEnviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const novos: ErrosLogin = {}
    if (!email.trim()) novos.email = 'Informe o e-mail.'
    else if (!emailValido(email.trim())) novos.email = 'E-mail inválido.'
    if (!senha) novos.senha = 'Informe a senha.'
    setErros(novos)
    setErroGeral(null)
    if (Object.keys(novos).length > 0) return

    setEnviando(true)
    try {
      await login(email.trim(), senha)
    } catch (erro) {
      setErroGeral(mensagemDeErro(erro))
      setEnviando(false)
    }
  }

  return (
    <AuthShell titulo="Entrar" subtitulo="Acesse sua conta Krelix.">
      <form onSubmit={aoEnviar} noValidate>
        {erroGeral && <div className="alerta alerta-erro" role="alert">{erroGeral}</div>}
        <Field rotulo="E-mail" paraId="email" erro={erros.email}>
          <input id="email" type="email" className={erros.email ? 'input erro' : 'input'} value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" autoComplete="username" />
        </Field>
        <Field rotulo="Senha" paraId="senha" erro={erros.senha}>
          <PasswordInput id="senha" valor={senha} aoMudar={(e) => setSenha(e.target.value)}
            placeholder="Digite sua senha" invalido={!!erros.senha} autoComplete="current-password" />
        </Field>
        <button type="submit" className="btn btn-primario btn-bloco" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p className="auth-rodape">Primeiro acesso? <Link to="/cadastro">Criar usuário</Link></p>
    </AuthShell>
  )
}

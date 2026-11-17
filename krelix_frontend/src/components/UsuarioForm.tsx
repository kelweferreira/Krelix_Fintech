import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import Field from './Field'
import PasswordInput from './PasswordInput'
import { Carregando, ErroBox } from './Feedback'
import { useFetch } from '../hooks/useFetch'
import { useToast } from '../context/useToast'
import { usuariosApi } from '../services/api'
import { emailValido } from '../utils/validators'
import { comoPerfil, rotuloPerfil } from '../utils/perfis'
import { mensagemDeErro } from '../utils/erros'
import type { UsuarioPayload } from '../types'

interface Props {
  id?: number 
  publico?: boolean 
  aoSalvar: () => void
  aoCancelar: () => void
}

interface FormUsuario { nome: string; email: string; tipo: string; senha: string; confirmar: string }
type ErrosUsuario = Partial<Record<keyof FormUsuario, string>>


const TIPOS_USUARIO = ['CLIENTE', 'ADMIN']

const rotuloTipo = (tipo: string): string => { const p = comoPerfil(tipo); return p ? rotuloPerfil(p) : tipo }
const VAZIO: FormUsuario = { nome: '', email: '', tipo: 'CLIENTE', senha: '', confirmar: '' }

export default function UsuarioForm({ id, publico = false, aoSalvar, aoCancelar }: Props) {
  const editando = id !== undefined
  const toast = useToast()
  const [form, setForm] = useState<FormUsuario>(VAZIO)
  const [erros, setErros] = useState<ErrosUsuario>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)


  const { dados, carregando, erro, recarregar } = useFetch(
    () => (id !== undefined ? usuariosApi.buscar(id) : Promise.resolve(null)), [id])

  useEffect(() => {
    if (dados) setForm({ nome: dados.nome, email: dados.email, tipo: dados.tipo, senha: '', confirmar: '' })
  }, [dados])

  const alterar = (campo: keyof FormUsuario) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }))

  function validar(): ErrosUsuario {
    const novos: ErrosUsuario = {}
    if (!form.nome.trim()) novos.nome = 'Informe o nome.'
    else if (form.nome.trim().length > 50) novos.nome = 'Máximo de 50 caracteres.'
    if (!form.email.trim()) novos.email = 'Informe o e-mail.'
    else if (!emailValido(form.email.trim())) novos.email = 'E-mail inválido.'
    else if (form.email.trim().length > 100) novos.email = 'Máximo de 100 caracteres.'
    if (!editando || form.senha) { // na edição a senha é opcional
      if (form.senha.length < 6) novos.senha = 'A senha deve ter pelo menos 6 caracteres.'
      if (form.confirmar !== form.senha) novos.confirmar = 'As senhas não conferem.'
    }
    return novos
  }

  async function aoEnviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErroGeral(null)
    const novos = validar()
    setErros(novos)
    if (Object.keys(novos).length > 0) return

    const payload: UsuarioPayload = { nome: form.nome.trim(), email: form.email.trim(), tipo: publico ? 'CLIENTE' : form.tipo }
    if (form.senha) payload.senha = form.senha

    setEnviando(true)
    try {
      if (id !== undefined) await usuariosApi.atualizar(id, payload)
      else await usuariosApi.criar(payload)
      toast.sucesso(editando ? 'Usuário atualizado com sucesso.' : 'Usuário cadastrado com sucesso.')
      aoSalvar()
    } catch (e) {
      setErroGeral(mensagemDeErro(e, 'Não foi possível salvar: e-mail já cadastrado ou dados inválidos.'))
      setEnviando(false)
    }
  }

  if (editando && carregando) return <Carregando texto="Carregando usuário..." />
  if (editando && erro) return <ErroBox mensagem={erro} aoTentarNovamente={recarregar} />

  const tipos = TIPOS_USUARIO.includes(form.tipo) ? TIPOS_USUARIO : [...TIPOS_USUARIO, form.tipo]
  const cls = (campo: keyof FormUsuario) => (erros[campo] ? 'input erro' : 'input')

  return (
    <form onSubmit={aoEnviar} noValidate>
      {erroGeral && <div className="alerta alerta-erro" role="alert">{erroGeral}</div>}

      <section className="card">
        <h2 className="card-titulo">Dados do usuário</h2>
        <div className="grid-form">
          <Field rotulo="Nome" paraId="nome" erro={erros.nome}>
            <input id="nome" className={cls('nome')} value={form.nome} onChange={alterar('nome')} maxLength={50} placeholder="Digite o nome" />
          </Field>
          <Field rotulo="E-mail" paraId="email" erro={erros.email}>
            <input id="email" type="email" className={cls('email')} value={form.email} onChange={alterar('email')} maxLength={100} placeholder="email@exemplo.com" />
          </Field>
          {!publico && (
            <Field rotulo="Tipo de usuário" paraId="tipo">
              <select id="tipo" className="input" value={form.tipo} onChange={alterar('tipo')}>
                {tipos.map((t) => <option key={t} value={t}>{rotuloTipo(t)}</option>)}
              </select>
            </Field>
          )}
        </div>
      </section>

      <section className="card">
        <h2 className="card-titulo">Dados de acesso</h2>
        <div className="grid-form">
          <Field rotulo="Senha" paraId="senha" erro={erros.senha} dica={editando ? 'Deixe em branco para manter a senha atual.' : undefined}>
            <PasswordInput id="senha" valor={form.senha} aoMudar={alterar('senha')} placeholder="Digite uma senha" invalido={!!erros.senha} autoComplete="new-password" />
          </Field>
          <Field rotulo="Confirme a senha" paraId="confirmar" erro={erros.confirmar}>
            <PasswordInput id="confirmar" valor={form.confirmar} aoMudar={alterar('confirmar')} placeholder="Confirme a senha" invalido={!!erros.confirmar} autoComplete="new-password" />
          </Field>
        </div>
      </section>

      <div className="form-acoes">
        <button type="button" className="btn btn-secundario" onClick={aoCancelar} disabled={enviando}>Cancelar</button>
        <button type="submit" className="btn btn-primario" disabled={enviando}>
          {enviando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar'}
        </button>
      </div>
    </form>
  )
}

import { useState, type ChangeEvent, type FormEvent } from 'react'
import Field from './Field'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/useToast'
import { clientesApi } from '../services/api'
import { formatarCpf, formatarTelefone, somenteDigitos } from '../utils/formatters'
import { cpfValido, dataNascimentoValida, telefoneValido } from '../utils/validators'
import { mensagemDeErro } from '../utils/erros'
import type { Cliente, ClientePayload } from '../types'

interface Props {
  cliente?: Cliente 
  aoSalvar?: () => void
}

interface FormDados { nomeCompleto: string; cpf: string; telefone: string; dataNascimento: string }
type ErrosDados = Partial<Record<keyof FormDados, string>>
const VAZIO: FormDados = { nomeCompleto: '', cpf: '', telefone: '', dataNascimento: '' }

// Formulário dos dados pessoais do PRÓPRIO usuário logado (perfil CLIENTE).
export default function DadosPessoaisForm({ cliente, aoSalvar }: Props) {
  const { usuario, definirCliente } = useAuth()
  const toast = useToast()
  const editando = cliente !== undefined

  const [form, setForm] = useState<FormDados>(() => cliente
    ? { nomeCompleto: cliente.nomeCompleto, cpf: formatarCpf(cliente.cpf), telefone: formatarTelefone(cliente.telefone ?? ''), dataNascimento: cliente.dataNascimento }
    : VAZIO)
  const [erros, setErros] = useState<ErrosDados>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (!usuario) return null

  const alterar = (campo: keyof FormDados) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }))
  const alterarCpf = (e: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, cpf: formatarCpf(e.target.value) }))
  const alterarTelefone = (e: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, telefone: formatarTelefone(e.target.value) }))

  function validar(): ErrosDados {
    const novos: ErrosDados = {}
    if (!form.nomeCompleto.trim()) novos.nomeCompleto = 'Informe o nome completo.'
    else if (form.nomeCompleto.trim().length > 100) novos.nomeCompleto = 'Máximo de 100 caracteres.'
    if (!cpfValido(form.cpf)) novos.cpf = 'O CPF deve ter 11 dígitos.'
    if (form.telefone && !telefoneValido(form.telefone)) novos.telefone = 'Telefone deve ter 10 ou 11 dígitos (com DDD).'
    if (!form.dataNascimento) novos.dataNascimento = 'Informe a data de nascimento.'
    else if (!dataNascimentoValida(form.dataNascimento)) novos.dataNascimento = 'Data de nascimento inválida.'
    return novos
  }

  async function aoEnviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!usuario) return
    setErroGeral(null)
    const novos = validar()
    setErros(novos)
    if (Object.keys(novos).length > 0) return

    const telefone = somenteDigitos(form.telefone)
    const payload: ClientePayload = {
      nomeCompleto: form.nomeCompleto.trim(),
      cpf: somenteDigitos(form.cpf),
      telefone: telefone === '' ? null : telefone,
      dataNascimento: form.dataNascimento,
    }
    setEnviando(true)
    try {
      const salvo = cliente
        ? await clientesApi.atualizar(cliente.id, payload)
        : await clientesApi.criar({ ...payload, usuario: { id: usuario.id } })
      definirCliente({ ...salvo, usuario })
      toast.sucesso(editando ? 'Dados atualizados com sucesso.' : 'Cadastro concluído com sucesso.')
      aoSalvar?.()
    } catch (err) {
      setErroGeral(mensagemDeErro(err, 'Não foi possível salvar: CPF já cadastrado ou dados inválidos.'))
      setEnviando(false)
    }
  }

  const cls = (campo: keyof FormDados) => (erros[campo] ? 'input erro' : 'input')

  return (
    <form onSubmit={aoEnviar} noValidate>
      {erroGeral && <div className="alerta alerta-erro" role="alert">{erroGeral}</div>}

      <section className="card">
        <h2 className="card-titulo">Dados Pessoais</h2>
        <div className="grid-form">
          <Field rotulo="Nome Completo" paraId="nomeCompleto" erro={erros.nomeCompleto}>
            <input id="nomeCompleto" className={cls('nomeCompleto')} value={form.nomeCompleto} onChange={alterar('nomeCompleto')} maxLength={100} placeholder="Digite o nome completo" />
          </Field>
          <Field rotulo="CPF" paraId="cpf" erro={erros.cpf} dica={editando ? 'O CPF não pode ser alterado.' : undefined}>
            <input id="cpf" className={cls('cpf')} value={form.cpf} onChange={alterarCpf} inputMode="numeric" placeholder="000.000.000-00" disabled={editando} />
          </Field>
          <Field rotulo="Telefone" paraId="telefone" erro={erros.telefone} dica="Opcional.">
            <input id="telefone" className={cls('telefone')} value={form.telefone} onChange={alterarTelefone} inputMode="tel" placeholder="(00) 00000-0000" />
          </Field>
          <Field rotulo="Data de nascimento" paraId="dataNascimento" erro={erros.dataNascimento}>
            <input id="dataNascimento" type="date" className={cls('dataNascimento')} value={form.dataNascimento} onChange={alterar('dataNascimento')} />
          </Field>
        </div>
      </section>

      <section className="card">
        <h2 className="card-titulo">Dados de Acesso</h2>
        <div className="grid-form">
          <Field rotulo="Usuário" paraId="nomeUsuario" dica="Definido no cadastro de acesso.">
            <input id="nomeUsuario" className="input" value={usuario.nome} disabled />
          </Field>
          <Field rotulo="E-mail" paraId="emailUsuario" dica="Usado para entrar no sistema.">
            <input id="emailUsuario" className="input" value={usuario.email} disabled />
          </Field>
        </div>
      </section>

      <div className="form-acoes">
        <button type="submit" className="btn btn-primario" disabled={enviando}>
          {enviando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Concluir cadastro'}
        </button>
      </div>
    </form>
  )
}

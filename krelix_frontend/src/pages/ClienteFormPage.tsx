import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Field from '../components/Field'
import { Carregando, ErroBox } from '../components/Feedback'
import { useFetch } from '../hooks/useFetch'
import { useToast } from '../context/useToast'
import { clientesApi, usuariosApi } from '../services/api'
import { formatarCpf, formatarTelefone, somenteDigitos } from '../utils/formatters'
import { cpfValido, dataNascimentoValida, telefoneValido } from '../utils/validators'
import { mensagemDeErro } from '../utils/erros'
import type { ClientePayload } from '../types'

interface FormCliente { nomeCompleto: string; cpf: string; telefone: string; dataNascimento: string; usuarioId: string }
type ErrosCliente = Partial<Record<keyof FormCliente, string>>
const VAZIO: FormCliente = { nomeCompleto: '', cpf: '', telefone: '', dataNascimento: '', usuarioId: '' }

export default function ClienteFormPage() {
  const { id } = useParams()
  const idNumero = id ? Number(id) : undefined
  const editando = idNumero !== undefined
  const navigate = useNavigate()
  const toast = useToast()

  const [form, setForm] = useState<FormCliente>(VAZIO)
  const [erros, setErros] = useState<ErrosCliente>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  // Busca tudo que o formulário precisa de uma vez: usuários, clientes (para saber quem já tem vínculo) e o cliente atual.
  const { dados, carregando, erro, recarregar } = useFetch(async () => {
    const [usuarios, clientes, atual] = await Promise.all([
      usuariosApi.listar(),
      clientesApi.listar(),
      idNumero !== undefined ? clientesApi.buscar(idNumero) : Promise.resolve(null),
    ])
    return { usuarios, clientes, atual }
  }, [idNumero])

  useEffect(() => {
    const c = dados?.atual
    if (c) {
      setForm({
        nomeCompleto: c.nomeCompleto, cpf: formatarCpf(c.cpf), telefone: formatarTelefone(c.telefone ?? ''),
        dataNascimento: c.dataNascimento, usuarioId: String(c.usuario.id),
      })
    }
  }, [dados])

  const usuariosLivres = useMemo(() => {
    if (!dados) return []
    const ocupados = new Set(dados.clientes.map((c) => c.usuario.id))
    return dados.usuarios.filter((u) => !ocupados.has(u.id))
  }, [dados])

  const alterar = (campo: keyof FormCliente) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }))

  const alterarCpf = (e: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, cpf: formatarCpf(e.target.value) }))
  const alterarTelefone = (e: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, telefone: formatarTelefone(e.target.value) }))

  function validar(): ErrosCliente {
    const novos: ErrosCliente = {}
    if (!form.nomeCompleto.trim()) novos.nomeCompleto = 'Informe o nome completo.'
    else if (form.nomeCompleto.trim().length > 100) novos.nomeCompleto = 'Máximo de 100 caracteres.'
    if (!cpfValido(form.cpf)) novos.cpf = 'O CPF deve ter 11 dígitos.'
    if (form.telefone && !telefoneValido(form.telefone)) novos.telefone = 'Telefone deve ter 10 ou 11 dígitos (com DDD).'
    if (!form.dataNascimento) novos.dataNascimento = 'Informe a data de nascimento.'
    else if (!dataNascimentoValida(form.dataNascimento)) novos.dataNascimento = 'Data de nascimento inválida.'
    if (!editando && !form.usuarioId) novos.usuarioId = 'Selecione o usuário vinculado.'
    return novos
  }

  async function aoEnviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
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
      if (idNumero !== undefined) {
        await clientesApi.atualizar(idNumero, payload)
        toast.sucesso('Cliente atualizado com sucesso.')
      } else {
        await clientesApi.criar({ ...payload, usuario: { id: Number(form.usuarioId) } })
        toast.sucesso('Cliente cadastrado com sucesso.')
      }
      navigate('/clientes')
    } catch (err) {
      setErroGeral(mensagemDeErro(err, 'Não foi possível salvar: CPF já cadastrado, usuário já vinculado a outro cliente ou dados inválidos.'))
      setEnviando(false)
    }
  }

  const cls = (campo: keyof FormCliente) => (erros[campo] ? 'input erro' : 'input')
  const usuarioSelecionado = editando
    ? dados?.atual?.usuario
    : usuariosLivres.find((u) => String(u.id) === form.usuarioId)

  return (
    <>
      <PageHeader titulo={editando ? 'Editar Cliente' : 'Novo Cliente'}
        subtitulo={editando ? 'Altere os dados do cliente.' : 'Preencha os dados para adicionar um novo cliente.'} />

      {carregando && <Carregando texto="Carregando formulário..." />}
      {erro && <ErroBox mensagem={erro} aoTentarNovamente={recarregar} />}

      {dados && (
        <form onSubmit={aoEnviar} noValidate>
          {erroGeral && <div className="alerta alerta-erro" role="alert">{erroGeral}</div>}

          <section className="card">
            <h2 className="card-titulo">Dados Pessoais</h2>
            <div className="grid-form">
              <Field rotulo="Nome Completo" paraId="nomeCompleto" erro={erros.nomeCompleto}>
                <input id="nomeCompleto" className={cls('nomeCompleto')} value={form.nomeCompleto} onChange={alterar('nomeCompleto')} maxLength={100} placeholder="Digite o nome completo" />
              </Field>
              <Field rotulo="CPF" paraId="cpf" erro={erros.cpf}>
                <input id="cpf" className={cls('cpf')} value={form.cpf} onChange={alterarCpf} inputMode="numeric" placeholder="000.000.000-00" />
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
              <Field rotulo="Usuário vinculado" paraId="usuarioId" erro={erros.usuarioId}
                dica={editando ? 'O vínculo não pode ser alterado depois de criado.' : undefined}>
                {editando ? (
                  <input id="usuarioId" className="input" value={dados.atual?.usuario.nome ?? ''} disabled />
                ) : (
                  <select id="usuarioId" className={cls('usuarioId')} value={form.usuarioId} onChange={alterar('usuarioId')}>
                    <option value="">Selecione o usuário</option>
                    {usuariosLivres.map((u) => <option key={u.id} value={u.id}>{u.nome} — {u.email}</option>)}
                  </select>
                )}
              </Field>
              <Field rotulo="E-mail" paraId="emailUsuario" dica="Vem do usuário vinculado.">
                <input id="emailUsuario" className="input" value={usuarioSelecionado?.email ?? ''} placeholder="email@exemplo.com" disabled />
              </Field>
            </div>
            {!editando && usuariosLivres.length === 0 && (
              <div className="alerta alerta-info">
                Não há usuários disponíveis (cada usuário só pode ter um cliente). <Link to="/usuarios/novo">Cadastre um novo usuário</Link> primeiro.
              </div>
            )}
          </section>

          <div className="form-acoes">
            <button type="button" className="btn btn-secundario" onClick={() => navigate('/clientes')} disabled={enviando}>Cancelar</button>
            <button type="submit" className="btn btn-primario" disabled={enviando}>
              {enviando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar'}
            </button>
          </div>
        </form>
      )}
    </>
  )
}

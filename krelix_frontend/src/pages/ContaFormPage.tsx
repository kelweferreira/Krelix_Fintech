import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Field from '../components/Field'
import { Carregando, ErroBox } from '../components/Feedback'
import { useFetch } from '../hooks/useFetch'
import { useToast } from '../context/useToast'
import { clientesApi, contasApi } from '../services/api'
import { converterValor, formatarCpf, formatarMoeda, somenteDigitos } from '../utils/formatters'
import { mensagemDeErro } from '../utils/erros'
import type { ContaPayload } from '../types'

interface FormConta { tipo: string; agencia: string; numero: string; limite: string; clienteId: string }
type ErrosConta = Partial<Record<keyof FormConta, string>>
const VAZIO: FormConta = { tipo: 'CORRENTE', agencia: '', numero: '', limite: '', clienteId: '' }

export default function ContaFormPage() {
  const { id } = useParams()
  const idNumero = id ? Number(id) : undefined
  const editando = idNumero !== undefined
  const navigate = useNavigate()
  const toast = useToast()

  const [form, setForm] = useState<FormConta>(VAZIO)
  const [erros, setErros] = useState<ErrosConta>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const { dados, carregando, erro, recarregar } = useFetch(async () => {
    const [clientes, atual] = await Promise.all([
      clientesApi.listar(),
      idNumero !== undefined ? contasApi.buscar(idNumero) : Promise.resolve(null),
    ])
    return { clientes, atual }
  }, [idNumero])

  useEffect(() => {
    const c = dados?.atual
    if (c) {
      setForm({
        tipo: c.tipo, agencia: c.agencia, numero: c.numero,
        limite: c.limiteDisponivel.toFixed(2).replace('.', ','), clienteId: String(c.cliente.id),
      })
    }
  }, [dados])

  const alterar = (campo: keyof FormConta) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }))
  const alterarDigitos = (campo: 'agencia' | 'numero', max: number) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [campo]: somenteDigitos(e.target.value).slice(0, max) }))

  function validar(): ErrosConta {
    const novos: ErrosConta = {}
    if (!/^\d{4}$/.test(form.agencia)) novos.agencia = 'A agência deve ter 4 dígitos (ex.: 0001).'
    if (!/^\d{1,10}$/.test(form.numero)) novos.numero = 'Informe o número da conta (até 10 dígitos).'
    if (converterValor(form.limite) === null) novos.limite = 'Informe um valor válido (ex.: 1000,00).'
    if (!editando && !form.clienteId) novos.clienteId = 'Selecione o cliente.'
    return novos
  }

  async function aoEnviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErroGeral(null)
    const novos = validar()
    setErros(novos)
    if (Object.keys(novos).length > 0) return

    const payload: ContaPayload = {
      tipo: form.tipo, agencia: form.agencia, numero: form.numero,
      limiteDisponivel: converterValor(form.limite) ?? 0,
    }
    setEnviando(true)
    try {
      if (idNumero !== undefined) {
        await contasApi.atualizar(idNumero, payload) 
        toast.sucesso('Conta atualizada com sucesso.')
      } else {
        await contasApi.criar({ ...payload, cliente: { id: Number(form.clienteId) } })
        toast.sucesso('Conta cadastrada com sucesso.')
      }
      navigate('/contas')
    } catch (err) {
      setErroGeral(mensagemDeErro(err, 'Não foi possível salvar: agência e conta já cadastradas ou dados inválidos.'))
      setEnviando(false)
    }
  }

  const cls = (campo: keyof FormConta) => (erros[campo] ? 'input erro' : 'input')

  return (
    <>
      <PageHeader titulo={editando ? 'Editar Conta' : 'Nova Conta'}
        subtitulo={editando ? 'Altere os dados da conta.' : 'Preencha os dados para abrir uma nova conta.'} />

      {carregando && <Carregando texto="Carregando formulário..." />}
      {erro && <ErroBox mensagem={erro} aoTentarNovamente={recarregar} />}

      {dados && (
        <form onSubmit={aoEnviar} noValidate>
          {erroGeral && <div className="alerta alerta-erro" role="alert">{erroGeral}</div>}

          <section className="card">
            <h2 className="card-titulo">Dados da Conta</h2>
            <div className="grid-form">
              <Field rotulo="Cliente" paraId="clienteId" erro={erros.clienteId} dica={editando ? 'O cliente não pode ser alterado.' : undefined}>
                {editando ? (
                  <input id="clienteId" className="input" value={dados.atual?.cliente.nomeCompleto ?? ''} disabled />
                ) : (
                  <select id="clienteId" className={cls('clienteId')} value={form.clienteId} onChange={alterar('clienteId')}>
                    <option value="">Selecione o cliente</option>
                    {dados.clientes.map((c) => <option key={c.id} value={c.id}>{c.nomeCompleto} — {formatarCpf(c.cpf)}</option>)}
                  </select>
                )}
              </Field>
              <Field rotulo="Tipo de conta" paraId="tipo">
                <select id="tipo" className="input" value={form.tipo} onChange={alterar('tipo')}>
                  <option value="CORRENTE">Conta corrente</option>
                  <option value="POUPANCA">Conta poupança</option>
                  {form.tipo !== 'CORRENTE' && form.tipo !== 'POUPANCA' && <option value={form.tipo}>{form.tipo}</option>}
                </select>
              </Field>
              <Field rotulo="Agência" paraId="agencia" erro={erros.agencia}>
                <input id="agencia" className={cls('agencia')} value={form.agencia} onChange={alterarDigitos('agencia', 4)} inputMode="numeric" placeholder="0001" />
              </Field>
              <Field rotulo="Número da conta" paraId="numero" erro={erros.numero}>
                <input id="numero" className={cls('numero')} value={form.numero} onChange={alterarDigitos('numero', 10)} inputMode="numeric" placeholder="123456" />
              </Field>
              <Field rotulo="Limite disponível (R$)" paraId="limite" erro={erros.limite}>
                <input id="limite" className={cls('limite')} value={form.limite} onChange={alterar('limite')} inputMode="decimal" placeholder="0,00" />
              </Field>
              <Field rotulo="Saldo" paraId="saldo" dica="O saldo começa em zero e só muda por depósitos e transferências.">
                <input id="saldo" className="input" value={formatarMoeda(dados.atual?.saldo ?? 0)} disabled />
              </Field>
            </div>
            {!editando && dados.clientes.length === 0 && (
              <div className="alerta alerta-info">Não há clientes cadastrados. <Link to="/clientes/novo">Cadastre um cliente</Link> primeiro.</div>
            )}
          </section>

          <div className="form-acoes">
            <button type="button" className="btn btn-secundario" onClick={() => navigate('/contas')} disabled={enviando}>Cancelar</button>
            <button type="submit" className="btn btn-primario" disabled={enviando}>
              {enviando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar'}
            </button>
          </div>
        </form>
      )}
    </>
  )
}

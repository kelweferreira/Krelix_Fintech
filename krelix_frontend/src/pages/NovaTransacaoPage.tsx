import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Field from '../components/Field'
import { Icon } from '../components/Icons'
import { Carregando, ErroBox } from '../components/Feedback'
import { useFetch } from '../hooks/useFetch'
import { useToast } from '../context/useToast'
import { useAuth } from '../context/useAuth'
import { ApiError, contasApi, transacoesApi } from '../services/api'
import { converterValor, formatarDataHora, formatarMoeda, rotuloConta, rotuloTipoTransacao } from '../utils/formatters'
import { mensagemDeErro } from '../utils/erros'
import { contaDoCliente } from '../utils/acesso'
import type { Cliente, Transacao, TransacaoPayload, TipoTransacao } from '../types'

interface Props { tipoInicial: TipoTransacao }
interface ErrosTransacao { conta?: string; clienteDestino?: string; contaDestino?: string; valor?: string; descricao?: string }
const PASSOS = ['Dados', 'Confirmação', 'Comprovante']

// Fluxo em 3 passos (como no design): 1 Dados -> 2 Confirmação -> 3 Comprovante.
// Só no passo 2 o botão "Confirmar" realmente chama o backend (POST /api/transacoes).
export default function NovaTransacaoPage({ tipoInicial }: Props) {
  const toast = useToast()
  const { cliente, perfil } = useAuth()
  const ehCliente = perfil === 'CLIENTE'
  const meuId = cliente?.id
  const { dados: contas, carregando, erro, recarregar } = useFetch(contasApi.listar)

  const [passo, setPasso] = useState(1)
  const [tipo, setTipo] = useState<TipoTransacao>(tipoInicial)
  const [contaId, setContaId] = useState('')
  const [clienteDestinoId, setClienteDestinoId] = useState('')
  const [contaDestinoId, setContaDestinoId] = useState('')
  const [valorTexto, setValorTexto] = useState('')
  const [descricao, setDescricao] = useState('')
  const [erros, setErros] = useState<ErrosTransacao>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [comprovante, setComprovante] = useState<Transacao | null>(null)

  const transferencia = tipo === 'TRANSFERENCIA'
  // O CLIENTE só movimenta as PRÓPRIAS contas (depósito, ou saída de uma transferência).
  // O destino de uma transferência pode ser qualquer conta, por isso "destino" continua usando todas.
  const contasOrigem = useMemo(
    () => (contas ?? []).filter((c) => !ehCliente || contaDoCliente(c, meuId)),
    [contas, ehCliente, meuId])
  const origem = contasOrigem.find((c) => String(c.id) === contaId)
  const destino = (contas ?? []).find((c) => String(c.id) === contaDestinoId)

  const clientesDestino = useMemo(() => {
    const mapa = new Map<number, Cliente>()
    ;(contas ?? []).forEach((c) => mapa.set(c.cliente.id, c.cliente))
    return Array.from(mapa.values()).sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto))
  }, [contas])
  const contasDoDestino = (contas ?? []).filter((c) => String(c.cliente.id) === clienteDestinoId && String(c.id) !== contaId)

  function trocarTipo(novo: TipoTransacao) {
    setTipo(novo)
    setErros({})
    setErroGeral(null)
  }

  function validar(): ErrosTransacao {
    const novos: ErrosTransacao = {}
    if (!origem) novos.conta = transferencia ? 'Selecione a conta de origem.' : 'Selecione a conta para o depósito.'
    const valor = converterValor(valorTexto)
    if (valor === null || valor <= 0) novos.valor = 'Informe um valor maior que zero (ex.: 150,00).'
    else if (transferencia && origem && valor > origem.saldo) novos.valor = `Saldo insuficiente. Disponível: ${formatarMoeda(origem.saldo)}.`
    if (transferencia) {
      if (!clienteDestinoId) novos.clienteDestino = 'Selecione o cliente de destino.'
      if (!contaDestinoId) novos.contaDestino = 'Selecione a conta de destino.'
      else if (contaDestinoId === contaId) novos.contaDestino = 'Origem e destino devem ser contas diferentes.'
    }
    if (descricao.length > 200) novos.descricao = 'Máximo de 200 caracteres.'
    return novos
  }

  function continuar() {
    const novos = validar()
    setErros(novos)
    if (Object.keys(novos).length === 0) { setErroGeral(null); setPasso(2) }
  }

  async function confirmar() {
    const valor = converterValor(valorTexto)
    if (!origem || valor === null) return
    const payload: TransacaoPayload = { tipo, valor, conta: { id: origem.id } }
    if (descricao.trim()) payload.descricao = descricao.trim()
    if (transferencia) payload.contaDestino = { id: Number(contaDestinoId) }

    setEnviando(true)
    setErroGeral(null)
    try {
      const criada = await transacoesApi.criar(payload)
      setComprovante(criada)
      setPasso(3)
      toast.sucesso(transferencia ? 'Transferência realizada com sucesso.' : 'Depósito realizado com sucesso.')
    } catch (e) {
      setErroGeral(e instanceof ApiError && e.status === 400
        ? 'Operação recusada pelo servidor. Verifique o valor, as contas e o saldo disponível (o saldo pode ter mudado).'
        : mensagemDeErro(e))
    } finally {
      setEnviando(false)
    }
  }

  function novaOperacao() {
    setPasso(1); setContaId(''); setClienteDestinoId(''); setContaDestinoId('')
    setValorTexto(''); setDescricao(''); setErros({}); setErroGeral(null); setComprovante(null)
    recarregar()
  }

  if (carregando) return <Carregando texto="Carregando contas..." />
  if (erro || !contas) return <ErroBox mensagem={erro ?? 'Não foi possível carregar as contas.'} aoTentarNovamente={recarregar} />

  const valorNumero = converterValor(valorTexto) ?? 0
  const cls = (e?: string) => (e ? 'input erro' : 'input')

  return (
    <>
      <PageHeader titulo={transferencia ? 'Nova Transferência' : 'Novo Depósito'}
        subtitulo={transferencia ? 'Realize transferências entre contas.' : 'Adicione saldo a uma conta.'} />

      <ol className="stepper" aria-label="Etapas">
        {PASSOS.map((nome, i) => (
          <li key={nome} className={passo === i + 1 ? 'ativo' : passo > i + 1 ? 'feito' : ''}>
            <span className="passo-num">{passo > i + 1 ? <Icon nome="check" tamanho={14} /> : i + 1}</span>{nome}
          </li>
        ))}
      </ol>

      {contasOrigem.length === 0 && (
        <div className="alerta alerta-info">
          {ehCliente
            ? 'Você ainda não possui contas. Peça à administração para abrir uma conta.'
            : <>Não há contas cadastradas. <Link to="/contas/novo">Cadastre uma conta</Link> primeiro.</>}
        </div>
      )}

      {passo === 1 && contasOrigem.length > 0 && (
        <>
          <div className="segmentado" role="group" aria-label="Tipo de operação">
            <button type="button" className={!transferencia ? 'ativo' : ''} onClick={() => trocarTipo('DEPOSITO')}>Depósito</button>
            <button type="button" className={transferencia ? 'ativo' : ''} onClick={() => trocarTipo('TRANSFERENCIA')}>Transferência</button>
          </div>

          <section className="card">
            <h2 className="card-titulo">{transferencia ? 'Origem' : 'Conta'}</h2>
            <div className="linha-saldo">
              <Field rotulo={transferencia ? 'Conta de origem' : 'Conta para depósito'} paraId="conta" erro={erros.conta}>
                <select id="conta" className={cls(erros.conta)} value={contaId} onChange={(e) => { setContaId(e.target.value); setContaDestinoId('') }}>
                  <option value="">Selecione a conta</option>
                  {contasOrigem.map((c) => <option key={c.id} value={c.id}>{rotuloConta(c)}</option>)}
                </select>
              </Field>
              {origem && (
                <div className="saldo-disponivel"><span>{transferencia ? 'Saldo disponível' : 'Saldo atual'}</span><strong>{formatarMoeda(origem.saldo)}</strong></div>
              )}
            </div>
          </section>

          {transferencia && (
            <section className="card">
              <h2 className="card-titulo">Destino</h2>
              {contas.length < 2 && <div className="alerta alerta-info">É preciso ter pelo menos duas contas para transferir.</div>}
              <div className="grid-form">
                <Field rotulo="Cliente" paraId="clienteDestino" erro={erros.clienteDestino}>
                  <select id="clienteDestino" className={cls(erros.clienteDestino)} value={clienteDestinoId}
                    onChange={(e) => { setClienteDestinoId(e.target.value); setContaDestinoId('') }}>
                    <option value="">Selecione o cliente</option>
                    {clientesDestino.map((c) => <option key={c.id} value={c.id}>{c.nomeCompleto}</option>)}
                  </select>
                </Field>
                <Field rotulo="Conta destino" paraId="contaDestino" erro={erros.contaDestino}>
                  <select id="contaDestino" className={cls(erros.contaDestino)} value={contaDestinoId}
                    onChange={(e) => setContaDestinoId(e.target.value)} disabled={!clienteDestinoId}>
                    <option value="">Selecione a conta</option>
                    {contasDoDestino.map((c) => <option key={c.id} value={c.id}>{rotuloConta(c)}</option>)}
                  </select>
                </Field>
              </div>
            </section>
          )}

          <section className="card">
            <h2 className="card-titulo">Valor</h2>
            <div className="grid-form">
              <Field rotulo={transferencia ? 'Valor da transferência' : 'Valor do depósito'} paraId="valor" erro={erros.valor}>
                <input id="valor" className={cls(erros.valor)} value={valorTexto} onChange={(e) => setValorTexto(e.target.value)} inputMode="decimal" placeholder="R$ 0,00" />
              </Field>
              <Field rotulo="Descrição" paraId="descricao" erro={erros.descricao} dica="Opcional.">
                <input id="descricao" className={cls(erros.descricao)} value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={200} placeholder="Ex.: aluguel de novembro" />
              </Field>
            </div>
          </section>

          <div className="form-acoes">
            <Link to="/transacoes" className="btn btn-secundario">Cancelar</Link>
            <button type="button" className="btn btn-primario" onClick={continuar}>Continuar</button>
          </div>
        </>
      )}

      {passo === 2 && origem && (
        <>
          {erroGeral && <div className="alerta alerta-erro" role="alert">{erroGeral}</div>}
          <section className="card">
            <h2 className="card-titulo">Confirme os dados da operação</h2>
            <dl className="resumo-dl">
              <div><dt>Operação</dt><dd>{rotuloTipoTransacao(tipo)}</dd></div>
              <div><dt>{transferencia ? 'Conta de origem' : 'Conta'}</dt><dd>{rotuloConta(origem)}</dd></div>
              {transferencia && destino && <div><dt>Conta destino</dt><dd>{rotuloConta(destino)}</dd></div>}
              <div><dt>Valor</dt><dd className="destaque">{formatarMoeda(valorNumero)}</dd></div>
              {descricao.trim() && <div><dt>Descrição</dt><dd>{descricao.trim()}</dd></div>}
            </dl>
            <p className="nota">Depois de confirmada, a transação não poderá ser editada nem excluída.</p>
          </section>
          <div className="form-acoes">
            <button type="button" className="btn btn-secundario" onClick={() => setPasso(1)} disabled={enviando}>Voltar</button>
            <button type="button" className="btn btn-primario" onClick={confirmar} disabled={enviando}>
              {enviando ? 'Processando...' : 'Confirmar operação'}
            </button>
          </div>
        </>
      )}

      {passo === 3 && comprovante && (
        <>
          <section className="card comprovante">
            <div className="comprovante-icone"><Icon nome="check" tamanho={28} /></div>
            <h2>{comprovante.tipo === 'DEPOSITO' ? 'Depósito realizado!' : 'Transferência realizada!'}</h2>
            <dl className="resumo-dl">
              <div><dt>Comprovante nº</dt><dd>{comprovante.id}</dd></div>
              <div><dt>Data e hora</dt><dd>{formatarDataHora(comprovante.dataTransacao)}</dd></div>
              <div><dt>{comprovante.contaDestino ? 'Conta de origem' : 'Conta'}</dt><dd>{rotuloConta(comprovante.conta)}</dd></div>
              {comprovante.contaDestino && <div><dt>Conta destino</dt><dd>{rotuloConta(comprovante.contaDestino)}</dd></div>}
              <div><dt>Valor</dt><dd className="destaque">{formatarMoeda(comprovante.valor)}</dd></div>
              {comprovante.descricao && <div><dt>Descrição</dt><dd>{comprovante.descricao}</dd></div>}
            </dl>
          </section>
          <div className="form-acoes">
            <button type="button" className="btn btn-secundario" onClick={novaOperacao}>Nova operação</button>
            <Link to="/transacoes" className="btn btn-primario">Ver histórico</Link>
          </div>
        </>
      )}
    </>
  )
}

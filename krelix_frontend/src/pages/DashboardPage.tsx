import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { Icon, type NomeIcone } from '../components/Icons'
import { Carregando, ErroBox, Vazio } from '../components/Feedback'
import { useFetch } from '../hooks/useFetch'
import { useAuth } from '../context/useAuth'
import { clientesApi, contasApi, transacoesApi } from '../services/api'
import { formatarDataHora, formatarMoeda, rotuloConta, rotuloTipoConta, rotuloTipoTransacao } from '../utils/formatters'
import { maisRecentePrimeiro } from '../utils/transacoes'
import { contaDoCliente, transacaoDoCliente } from '../utils/acesso'
import type { Perfil } from '../utils/perfis'
import type { Cliente } from '../types'


const ACOES: { para: string; texto: string; icone: NomeIcone; perfis: Perfil[] }[] = [
  { para: '/transacoes/depositar', texto: 'Novo depósito', icone: 'download', perfis: ['ADMIN', 'CLIENTE'] },
  { para: '/transacoes/transferir', texto: 'Nova transferência', icone: 'swap', perfis: ['ADMIN', 'CLIENTE'] },
  { para: '/clientes/novo', texto: 'Novo cliente', icone: 'users', perfis: ['ADMIN'] },
  { para: '/contas/novo', texto: 'Nova conta', icone: 'card', perfis: ['ADMIN'] },
]

export default function DashboardPage() {
  const { usuario, cliente, perfil } = useAuth()
  const ehCliente = perfil === 'CLIENTE'
  const meuId = cliente?.id
  const { dados, carregando, erro, recarregar } = useFetch(async () => {
    const [clientes, todasContas, todasTransacoes] = await Promise.all([
      ehCliente ? Promise.resolve<Cliente[]>([]) : clientesApi.listar(),
      contasApi.listar(),
      transacoesApi.listar(),
    ])
    const contas = ehCliente ? todasContas.filter((c) => contaDoCliente(c, meuId)) : todasContas
    const transacoes = ehCliente ? todasTransacoes.filter((t) => transacaoDoCliente(t, meuId)) : todasTransacoes
    return { clientes, contas, transacoes }
  })

  if (carregando) return <Carregando texto="Carregando dashboard..." />
  if (erro || !dados) return <ErroBox mensagem={erro ?? 'Não foi possível carregar os dados.'} aoTentarNovamente={recarregar} />

  const { clientes, contas, transacoes } = dados
  const saldoTotal = contas.reduce((soma, c) => soma + c.saldo, 0)
  const recentes = [...transacoes].sort(maisRecentePrimeiro).slice(0, 5)
  const maioresContas = [...contas].sort((a, b) => b.saldo - a.saldo).slice(0, 5)

  return (
    <>
      <PageHeader titulo="Dashboard" subtitulo={`Olá, ${usuario?.nome ?? ''}! ${ehCliente ? 'Veja o resumo das suas contas.' : 'Veja o resumo do Krelix.'}`} />

      <div className="grid-cards">
        <div className="card card-stat"><span>{ehCliente ? 'Seu saldo total' : 'Saldo total em contas'}</span><strong className="destaque">{formatarMoeda(saldoTotal)}</strong></div>
        {!ehCliente && <div className="card card-stat"><span>Clientes</span><strong>{clientes.length}</strong></div>}
        <div className="card card-stat"><span>{ehCliente ? 'Minhas contas' : 'Contas'}</span><strong>{contas.length}</strong></div>
        <div className="card card-stat"><span>{ehCliente ? 'Minhas transações' : 'Transações'}</span><strong>{transacoes.length}</strong></div>
      </div>

      <section className="card">
        <h2 className="card-titulo">Ações rápidas</h2>
        <div className="acoes-rapidas">
          {ACOES.filter((a) => perfil !== null && a.perfis.includes(perfil)).map((a) => (
            <Link key={a.para} to={a.para} className="acao-rapida"><Icon nome={a.icone} tamanho={20} />{a.texto}</Link>
          ))}
        </div>
      </section>

      <div className="grid-dashboard">
        <section className="card">
          <div className="card-topo"><h2 className="card-titulo">Transações recentes</h2><Link to="/transacoes" className="link">Ver todas</Link></div>
          {recentes.length === 0 ? <Vazio texto="Nenhuma transação realizada ainda." /> : (
            <ul className="lista">
              {recentes.map((t) => (
                <li key={t.id}>
                  <div>
                    <strong>{rotuloTipoTransacao(t.tipo)}</strong>
                    <small>{rotuloConta(t.conta)} · {formatarDataHora(t.dataTransacao)}</small>
                  </div>
                  <span className={t.tipo === 'DEPOSITO' ? 'valor valor-positivo' : 'valor'}>
                    {t.tipo === 'DEPOSITO' ? '+ ' : ''}{formatarMoeda(t.valor)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="card-topo"><h2 className="card-titulo">Resumo de contas</h2><Link to="/contas" className="link">Ver todas</Link></div>
          {maioresContas.length === 0 ? <Vazio texto="Nenhuma conta cadastrada ainda." /> : (
            <ul className="lista">
              {maioresContas.map((c) => (
                <li key={c.id}>
                  <div>
                    <strong>{c.cliente.nomeCompleto}</strong>
                    <small>{rotuloTipoConta(c.tipo)} {c.agencia}/{c.numero}</small>
                  </div>
                  <span className="valor">{formatarMoeda(c.saldo)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Pagination from '../components/Pagination'
import { Icon } from '../components/Icons'
import { Carregando, ErroBox, Vazio } from '../components/Feedback'
import { useFetch } from '../hooks/useFetch'
import { usePaginacao } from '../hooks/usePaginacao'
import { useAuth } from '../context/useAuth'
import { transacoesApi } from '../services/api'
import { formatarDataHora, formatarMoeda, rotuloTipoTransacao } from '../utils/formatters'
import { maisRecentePrimeiro } from '../utils/transacoes'
import { transacaoDoCliente } from '../utils/acesso'
import type { Conta } from '../types'

const descreverConta = (c: Conta) => `${c.agencia}/${c.numero} · ${c.cliente.nomeCompleto}`

export default function TransacoesPage() {
  const { cliente, perfil } = useAuth()
  const ehCliente = perfil === 'CLIENTE'
  const meuId = cliente?.id
  const { dados, carregando, erro, recarregar } = useFetch(transacoesApi.listar)
  const [tipo, setTipo] = useState('TODOS')

  const filtradas = useMemo(
    () => [...(dados ?? [])]
      .filter((t) => !ehCliente || transacaoDoCliente(t, meuId))
      .filter((t) => tipo === 'TODOS' || t.tipo === tipo)
      .sort(maisRecentePrimeiro),
    [dados, tipo, ehCliente, meuId])
  const { pagina, setPagina, totalPaginas, itensDaPagina } = usePaginacao(filtradas)

  return (
    <>
      <PageHeader titulo="Transações" subtitulo={ehCliente ? 'Histórico das suas contas.' : 'Histórico de depósitos e transferências.'}
        acoes={<>
          <Link to="/transacoes/depositar" className="btn btn-secundario"><Icon nome="download" /> Novo Depósito</Link>
          <Link to="/transacoes/transferir" className="btn btn-primario"><Icon nome="swap" /> Nova Transferência</Link>
        </>} />

      <div className="card card-tabela">
        <div className="tabela-topo">
          <select className="input input-filtro" value={tipo} onChange={(e) => { setTipo(e.target.value); setPagina(1) }} aria-label="Filtrar por tipo">
            <option value="TODOS">Todos os tipos</option>
            <option value="DEPOSITO">Depósitos</option>
            <option value="TRANSFERENCIA">Transferências</option>
          </select>
          <span className="nota">Transações não podem ser editadas nem excluídas.</span>
        </div>
        {carregando && <Carregando texto="Carregando transações..." />}
        {erro && <ErroBox mensagem={erro} aoTentarNovamente={recarregar} />}
        {!carregando && !erro && filtradas.length === 0 && <Vazio texto="Nenhuma transação encontrada." />}
        {!carregando && !erro && filtradas.length > 0 && (
          <div className="tabela-scroll">
            <table className="tabela">
              <thead><tr><th>Data</th><th>Tipo</th><th>Conta (origem)</th><th>Conta destino</th><th>Valor</th><th>Descrição</th></tr></thead>
              <tbody>
                {itensDaPagina.map((t) => (
                  <tr key={t.id}>
                    <td>{formatarDataHora(t.dataTransacao)}</td>
                    <td><span className={t.tipo === 'DEPOSITO' ? 'badge badge-verde' : 'badge badge-roxo'}>{rotuloTipoTransacao(t.tipo)}</span></td>
                    <td>{descreverConta(t.conta)}</td>
                    <td>{t.contaDestino ? descreverConta(t.contaDestino) : '—'}</td>
                    <td className={t.tipo === 'DEPOSITO' ? 'valor valor-positivo' : 'valor'}>
                      {t.tipo === 'DEPOSITO' ? '+ ' : ''}{formatarMoeda(t.valor)}
                    </td>
                    <td>{t.descricao || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagina={pagina} totalPaginas={totalPaginas} aoMudar={setPagina} />
      </div>
    </>
  )
}

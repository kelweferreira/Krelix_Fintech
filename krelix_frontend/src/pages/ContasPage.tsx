import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import SearchBox from '../components/SearchBox'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'
import { Icon } from '../components/Icons'
import { Carregando, ErroBox, Vazio } from '../components/Feedback'
import { useFetch } from '../hooks/useFetch'
import { usePaginacao } from '../hooks/usePaginacao'
import { useToast } from '../context/useToast'
import { useAuth } from '../context/useAuth'
import { contasApi } from '../services/api'
import { formatarMoeda, rotuloTipoConta } from '../utils/formatters'
import { mensagemDeErro } from '../utils/erros'
import { contaDoCliente } from '../utils/acesso'
import type { Conta } from '../types'

export default function ContasPage() {
  const toast = useToast()
  const { cliente, perfil } = useAuth()
  const ehCliente = perfil === 'CLIENTE'
  const meuId = cliente?.id
  const { dados, carregando, erro, recarregar } = useFetch(contasApi.listar)
  const [busca, setBusca] = useState('')
  const [alvo, setAlvo] = useState<Conta | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return (dados ?? [])
      .filter((c) => !ehCliente || contaDoCliente(c, meuId))
      .filter((c) =>
        !termo || c.cliente.nomeCompleto.toLowerCase().includes(termo) || c.numero.includes(termo) || c.agencia.includes(termo))
  }, [dados, busca, ehCliente, meuId])
  const { pagina, setPagina, totalPaginas, itensDaPagina } = usePaginacao(filtradas)

  async function confirmarExclusao() {
    if (!alvo) return
    setExcluindo(true)
    try {
      await contasApi.excluir(alvo.id)
      toast.sucesso('Conta excluída com sucesso.')
      recarregar()
    } catch (e) {
      toast.erro(mensagemDeErro(e, 'Esta conta possui transações e não pode ser excluída.'))
    } finally {
      setExcluindo(false)
      setAlvo(null)
    }
  }

  return (
    <>
      <PageHeader titulo={ehCliente ? 'Minhas contas' : 'Contas'}
        subtitulo={ehCliente ? 'Consulte o saldo das suas contas.' : 'Gerencie as contas dos clientes.'}
        acoes={ehCliente ? undefined : <Link to="/contas/novo" className="btn btn-primario"><Icon nome="plus" /> Nova Conta</Link>} />

      <div className="card card-tabela">
        <div className="tabela-topo">
          <SearchBox valor={busca} aoMudar={setBusca} placeholder={ehCliente ? 'Buscar por agência ou conta...' : 'Buscar por cliente, agência ou conta...'} />
        </div>
        {carregando && <Carregando texto="Carregando contas..." />}
        {erro && <ErroBox mensagem={erro} aoTentarNovamente={recarregar} />}
        {!carregando && !erro && filtradas.length === 0 && <Vazio texto={busca ? 'Nenhuma conta encontrada para essa busca.' : ehCliente ? 'Você ainda não possui contas. Peça à administração para abrir uma conta.' : 'Nenhuma conta cadastrada.'} />}
        {!carregando && !erro && filtradas.length > 0 && (
          <div className="tabela-scroll">
            <table className="tabela">
              <thead><tr>{!ehCliente && <th>Cliente</th>}<th>Tipo</th><th>Agência</th><th>Conta</th><th>Saldo</th><th>Limite disponível</th>{!ehCliente && <th className="col-acoes">Ações</th>}</tr></thead>
              <tbody>
                {itensDaPagina.map((c) => (
                  <tr key={c.id}>
                    {!ehCliente && <td><Link to={`/clientes/${c.cliente.id}`} className="link">{c.cliente.nomeCompleto}</Link></td>}
                    <td>{rotuloTipoConta(c.tipo)}</td>
                    <td>{c.agencia}</td>
                    <td>{c.numero}</td>
                    <td className="valor">{formatarMoeda(c.saldo)}</td>
                    <td>{formatarMoeda(c.limiteDisponivel)}</td>
                    {!ehCliente && (
                      <td className="col-acoes">
                        <div className="acoes-linha">
                          <Link to={`/contas/${c.id}/editar`} className="btn-icone" title="Editar" aria-label={`Editar conta ${c.numero}`}><Icon nome="edit" /></Link>
                          <button type="button" className="btn-icone btn-icone-perigo" title="Excluir" aria-label={`Excluir conta ${c.numero}`} onClick={() => setAlvo(c)}><Icon nome="trash" /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagina={pagina} totalPaginas={totalPaginas} aoMudar={setPagina} />
      </div>

      <ConfirmDialog aberto={alvo !== null} titulo="Excluir conta" perigo textoConfirmar="Excluir" processando={excluindo}
        mensagem={`Deseja realmente excluir a conta ${alvo?.agencia ?? ''}/${alvo?.numero ?? ''}? Contas com transações não podem ser excluídas.`}
        aoConfirmar={confirmarExclusao} aoCancelar={() => setAlvo(null)} />
    </>
  )
}

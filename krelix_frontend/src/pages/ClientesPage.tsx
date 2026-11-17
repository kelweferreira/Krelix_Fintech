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
import { clientesApi } from '../services/api'
import { formatarCpf, formatarData, formatarTelefone, somenteDigitos } from '../utils/formatters'
import { mensagemDeErro } from '../utils/erros'
import type { Cliente } from '../types'

export default function ClientesPage() {
  const toast = useToast()
  const { dados, carregando, erro, recarregar } = useFetch(clientesApi.listar)
  const [busca, setBusca] = useState('')
  const [alvo, setAlvo] = useState<Cliente | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const digitos = somenteDigitos(busca)
    return (dados ?? []).filter((c) =>
      !termo ||
      c.nomeCompleto.toLowerCase().includes(termo) ||
      c.usuario.email.toLowerCase().includes(termo) ||
      (digitos !== '' && c.cpf.includes(digitos)))
  }, [dados, busca])
  const { pagina, setPagina, totalPaginas, itensDaPagina } = usePaginacao(filtrados)

  async function confirmarExclusao() {
    if (!alvo) return
    setExcluindo(true)
    try {
      await clientesApi.excluir(alvo.id)
      toast.sucesso('Cliente excluído com sucesso.')
      recarregar()
    } catch (e) {
      toast.erro(mensagemDeErro(e, 'Este cliente possui contas e não pode ser excluído.'))
    } finally {
      setExcluindo(false)
      setAlvo(null)
    }
  }

  return (
    <>
      <PageHeader titulo="Clientes" subtitulo="Gerencie e visualize seus clientes."
        acoes={<Link to="/clientes/novo" className="btn btn-primario"><Icon nome="plus" /> Novo Cliente</Link>} />

      <div className="card card-tabela">
        <div className="tabela-topo">
          <SearchBox valor={busca} aoMudar={setBusca} placeholder="Buscar cliente..." />
        </div>
        {carregando && <Carregando texto="Carregando clientes..." />}
        {erro && <ErroBox mensagem={erro} aoTentarNovamente={recarregar} />}
        {!carregando && !erro && filtrados.length === 0 && <Vazio texto={busca ? 'Nenhum cliente encontrado para essa busca.' : 'Nenhum cliente cadastrado.'} />}
        {!carregando && !erro && filtrados.length > 0 && (
          <div className="tabela-scroll">
            <table className="tabela">
              <thead><tr><th>Nome</th><th>CPF</th><th>E-mail</th><th>Telefone</th><th>Data de Cadastro</th><th className="col-acoes">Ações</th></tr></thead>
              <tbody>
                {itensDaPagina.map((c) => (
                  <tr key={c.id}>
                    <td>{c.nomeCompleto}</td>
                    <td>{formatarCpf(c.cpf)}</td>
                    <td>{c.usuario.email}</td>
                    <td>{c.telefone ? formatarTelefone(c.telefone) : '—'}</td>
                    <td>{formatarData(c.dataCriacao)}</td>
                    <td className="col-acoes">
                      <div className="acoes-linha">
                        <Link to={`/clientes/${c.id}`} className="btn-icone" title="Ver detalhes" aria-label={`Ver ${c.nomeCompleto}`}><Icon nome="eye" /></Link>
                        <Link to={`/clientes/${c.id}/editar`} className="btn-icone" title="Editar" aria-label={`Editar ${c.nomeCompleto}`}><Icon nome="edit" /></Link>
                        <button type="button" className="btn-icone btn-icone-perigo" title="Excluir" aria-label={`Excluir ${c.nomeCompleto}`} onClick={() => setAlvo(c)}><Icon nome="trash" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagina={pagina} totalPaginas={totalPaginas} aoMudar={setPagina} />
      </div>

      <ConfirmDialog aberto={alvo !== null} titulo="Excluir cliente" perigo textoConfirmar="Excluir" processando={excluindo}
        mensagem={`Deseja realmente excluir o cliente "${alvo?.nomeCompleto ?? ''}"? Clientes com contas não podem ser excluídos.`}
        aoConfirmar={confirmarExclusao} aoCancelar={() => setAlvo(null)} />
    </>
  )
}

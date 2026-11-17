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
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/useToast'
import { usuariosApi } from '../services/api'
import { formatarDataHora } from '../utils/formatters'
import { mensagemDeErro } from '../utils/erros'
import type { Usuario } from '../types'

export default function UsuariosPage() {
  const { usuario: logado } = useAuth()
  const toast = useToast()
  const { dados, carregando, erro, recarregar } = useFetch(usuariosApi.listar)
  const [busca, setBusca] = useState('')
  const [alvo, setAlvo] = useState<Usuario | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return (dados ?? []).filter((u) => !termo || u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo))
  }, [dados, busca])
  const { pagina, setPagina, totalPaginas, itensDaPagina } = usePaginacao(filtrados)

  function pedirExclusao(u: Usuario) {
    if (u.id === logado?.id) {
      toast.erro('Você não pode excluir o usuário que está logado.')
      return
    }
    setAlvo(u)
  }

  async function confirmarExclusao() {
    if (!alvo) return
    setExcluindo(true)
    try {
      await usuariosApi.excluir(alvo.id)
      toast.sucesso('Usuário excluído com sucesso.')
      recarregar()
    } catch (e) {
      toast.erro(mensagemDeErro(e, 'Este usuário possui cliente vinculado e não pode ser excluído.'))
    } finally {
      setExcluindo(false)
      setAlvo(null)
    }
  }

  return (
    <>
      <PageHeader titulo="Usuários" subtitulo="Gerencie os usuários com acesso ao sistema."
        acoes={<Link to="/usuarios/novo" className="btn btn-primario"><Icon nome="plus" /> Novo Usuário</Link>} />

      <div className="card card-tabela">
        <div className="tabela-topo">
          <SearchBox valor={busca} aoMudar={setBusca} placeholder="Buscar por nome ou e-mail..." />
        </div>
        {carregando && <Carregando texto="Carregando usuários..." />}
        {erro && <ErroBox mensagem={erro} aoTentarNovamente={recarregar} />}
        {!carregando && !erro && filtrados.length === 0 && <Vazio texto={busca ? 'Nenhum usuário encontrado para essa busca.' : 'Nenhum usuário cadastrado.'} />}
        {!carregando && !erro && filtrados.length > 0 && (
          <div className="tabela-scroll">
            <table className="tabela">
              <thead><tr><th>Nome</th><th>E-mail</th><th>Tipo</th><th>Criado em</th><th className="col-acoes">Ações</th></tr></thead>
              <tbody>
                {itensDaPagina.map((u) => (
                  <tr key={u.id}>
                    <td>{u.nome}</td>
                    <td>{u.email}</td>
                    <td><span className="badge badge-roxo">{u.tipo}</span></td>
                    <td>{formatarDataHora(u.dataCriacao)}</td>
                    <td className="col-acoes">
                      <div className="acoes-linha">
                        <Link to={`/usuarios/${u.id}/editar`} className="btn-icone" title="Editar" aria-label={`Editar ${u.nome}`}><Icon nome="edit" /></Link>
                        <button type="button" className="btn-icone btn-icone-perigo" title="Excluir" aria-label={`Excluir ${u.nome}`} onClick={() => pedirExclusao(u)}><Icon nome="trash" /></button>
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

      <ConfirmDialog aberto={alvo !== null} titulo="Excluir usuário" perigo textoConfirmar="Excluir" processando={excluindo}
        mensagem={`Deseja realmente excluir o usuário "${alvo?.nome ?? ''}"? Esta ação não pode ser desfeita.`}
        aoConfirmar={confirmarExclusao} aoCancelar={() => setAlvo(null)} />
    </>
  )
}

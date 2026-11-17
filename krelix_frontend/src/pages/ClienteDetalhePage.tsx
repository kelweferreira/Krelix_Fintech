import { Link, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { Icon } from '../components/Icons'
import { Carregando, ErroBox, Vazio } from '../components/Feedback'
import { useFetch } from '../hooks/useFetch'
import { clientesApi, contasApi } from '../services/api'
import { formatarCpf, formatarData, formatarMoeda, formatarTelefone, iniciais, rotuloTipoConta } from '../utils/formatters'

export default function ClienteDetalhePage() {
  const { id } = useParams()
  const idNumero = Number(id)

  const { dados, carregando, erro, recarregar } = useFetch(async () => {
    const [cliente, todasContas] = await Promise.all([clientesApi.buscar(idNumero), contasApi.listar()])
    return { cliente, contas: todasContas.filter((c) => c.cliente.id === cliente.id) }
  }, [idNumero])

  if (carregando) return <Carregando texto="Carregando cliente..." />
  if (erro || !dados) return <ErroBox mensagem={erro ?? 'Cliente não encontrado.'} aoTentarNovamente={recarregar} />

  const { cliente, contas } = dados
  const saldoTotal = contas.reduce((soma, c) => soma + c.saldo, 0)
  const limiteTotal = contas.reduce((soma, c) => soma + c.limiteDisponivel, 0)

  return (
    <>
      <PageHeader titulo="Detalhes do Cliente"
        acoes={<Link to={`/clientes/${cliente.id}/editar`} className="btn btn-secundario"><Icon nome="edit" /> Editar Cliente</Link>} />
      <nav className="breadcrumb" aria-label="Você está em">
        <Link to="/clientes">Clientes</Link><span>›</span><span>{cliente.nomeCompleto}</span>
      </nav>

      <div className="grid-detalhe">
        <section className="card card-sem-padding">
          <div className="perfil">
            <div className="avatar avatar-grande">{iniciais(cliente.nomeCompleto)}</div>
            <div>
              <h2>{cliente.nomeCompleto}</h2>
              <p>{cliente.usuario.email}</p>
              <p>{cliente.telefone ? formatarTelefone(cliente.telefone) : 'Sem telefone'}</p>
            </div>
          </div>
          <div className="dados-lista">
            <h3>Dados Pessoais</h3>
            <dl>
              <div><dt>CPF</dt><dd>{formatarCpf(cliente.cpf)}</dd></div>
              <div><dt>Data de nascimento</dt><dd>{formatarData(cliente.dataNascimento)}</dd></div>
              <div><dt>Cliente desde</dt><dd>{formatarData(cliente.dataCriacao)}</dd></div>
              <div><dt>Tipo de usuário</dt><dd>{cliente.usuario.tipo}</dd></div>
            </dl>
          </div>
        </section>

        <section className="card">
          <h2 className="card-titulo">Resumo Financeiro</h2>
          <div className="resumo-lista">
            <div className="resumo-item"><span>Saldo em conta</span><strong className="destaque">{formatarMoeda(saldoTotal)}</strong></div>
            <div className="resumo-item"><span>Limite disponível</span><strong>{formatarMoeda(limiteTotal)}</strong></div>
            <div className="resumo-item"><span>Total de contas</span><strong>{contas.length}</strong></div>
          </div>
        </section>
      </div>

      <section className="card card-tabela">
        <h2 className="card-titulo card-titulo-padding">Contas</h2>
        {contas.length === 0 ? <Vazio texto="Este cliente ainda não possui contas." /> : (
          <div className="tabela-scroll">
            <table className="tabela">
              <thead><tr><th>Tipo de conta</th><th>Agência</th><th>Conta</th><th>Saldo</th><th>Limite disponível</th><th className="col-acoes">Ações</th></tr></thead>
              <tbody>
                {contas.map((c) => (
                  <tr key={c.id}>
                    <td>{rotuloTipoConta(c.tipo)}</td>
                    <td>{c.agencia}</td>
                    <td>{c.numero}</td>
                    <td>{formatarMoeda(c.saldo)}</td>
                    <td>{formatarMoeda(c.limiteDisponivel)}</td>
                    <td className="col-acoes">
                      <div className="acoes-linha">
                        <Link to={`/contas/${c.id}/editar`} className="btn-icone" title="Editar conta" aria-label="Editar conta"><Icon nome="edit" /></Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

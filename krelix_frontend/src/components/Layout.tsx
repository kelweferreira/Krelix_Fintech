import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { iniciais } from '../utils/formatters'
import { rotuloPerfil, type Perfil } from '../utils/perfis'
import { Icon, type NomeIcone } from './Icons'
import logo from '../assets/logo-krelix.png'

interface ItemMenu {
  para: string
  texto: string
  textoCliente?: string
  icone: NomeIcone
  fim?: boolean
  perfis: Perfil[]
}

const MENU: ItemMenu[] = [
  { para: '/', texto: 'Dashboard', icone: 'home', fim: true, perfis: ['ADMIN', 'CLIENTE'] },
  { para: '/clientes', texto: 'Clientes', icone: 'users', perfis: ['ADMIN'] },
  { para: '/contas', texto: 'Contas', textoCliente: 'Minhas contas', icone: 'card', perfis: ['ADMIN', 'CLIENTE'] },
  { para: '/transacoes', texto: 'Transações', textoCliente: 'Minhas transações', icone: 'swap', perfis: ['ADMIN', 'CLIENTE'] },
  { para: '/usuarios', texto: 'Usuários', icone: 'user', perfis: ['ADMIN'] },
  { para: '/meu-perfil', texto: 'Meu perfil', icone: 'user', perfis: ['CLIENTE'] },
]

// CLIENTE que ainda não preencheu os dados pessoais só enxerga este item.
const ITEM_COMPLETAR: ItemMenu = { para: '/completar-cadastro', texto: 'Completar cadastro', icone: 'user', perfis: ['CLIENTE'] }

export default function Layout() {
  const { usuario, cliente, perfil, logout } = useAuth()
  const location = useLocation()
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => { setMenuAberto(false) }, [location.pathname])


  const semCadastro = perfil === 'CLIENTE' && !cliente
  const itens = semCadastro
    ? [ITEM_COMPLETAR]
    : MENU.filter((item) => perfil !== null && item.perfis.includes(perfil))

  return (
    <div className="app-shell">
      <header className="topbar-mobile">
        <button type="button" className="btn-icone-claro" aria-label="Abrir menu" onClick={() => setMenuAberto(true)}>
          <Icon nome="menu" tamanho={22} />
        </button>
        <img src={logo} alt="Krelix" height={28} />
      </header>

      <aside className={`sidebar ${menuAberto ? 'aberta' : ''}`}>
        <img className="sidebar-logo" src={logo} alt="Krelix" />
        <nav className="sidebar-nav">
          {itens.map((item) => (
            <NavLink key={item.para} to={item.para} end={item.fim}
              className={({ isActive }) => (isActive ? 'nav-link ativo' : 'nav-link')}>
              <Icon nome={item.icone} />
              {perfil === 'CLIENTE' && item.textoCliente ? item.textoCliente : item.texto}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-usuario">
          <div className="avatar">{iniciais(usuario?.nome ?? '')}</div>
          <div className="sidebar-usuario-info">
            <strong>{usuario?.nome}</strong>
            <span>{perfil ? rotuloPerfil(perfil) : ''}</span>
          </div>
          <button type="button" className="btn-icone-claro" title="Sair" aria-label="Sair" onClick={logout}>
            <Icon nome="logout" />
          </button>
        </div>
      </aside>
      {menuAberto && <div className="overlay" onClick={() => setMenuAberto(false)} />}

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

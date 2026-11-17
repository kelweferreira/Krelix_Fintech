import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute, { ExigeCadastro, PublicOnly } from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegistroPage from './pages/RegistroPage'
import DashboardPage from './pages/DashboardPage'
import UsuariosPage from './pages/UsuariosPage'
import UsuarioFormPage from './pages/UsuarioFormPage'
import ClientesPage from './pages/ClientesPage'
import ClienteFormPage from './pages/ClienteFormPage'
import ClienteDetalhePage from './pages/ClienteDetalhePage'
import ContasPage from './pages/ContasPage'
import ContaFormPage from './pages/ContaFormPage'
import TransacoesPage from './pages/TransacoesPage'
import NovaTransacaoPage from './pages/NovaTransacaoPage'
import CompletarCadastroPage from './pages/CompletarCadastroPage'
import MeuPerfilPage from './pages/MeuPerfilPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/cadastro" element={<PublicOnly><RegistroPage /></PublicOnly>} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>

          <Route element={<ExigeCadastro />}>
            <Route index element={<DashboardPage />} />
            <Route path="contas" element={<ContasPage />} />
            <Route path="transacoes" element={<TransacoesPage />} />
            <Route path="transacoes/depositar" element={<NovaTransacaoPage key="dep" tipoInicial="DEPOSITO" />} />
            <Route path="transacoes/transferir" element={<NovaTransacaoPage key="tra" tipoInicial="TRANSFERENCIA" />} />
          </Route>

          <Route element={<ProtectedRoute perfis={['ADMIN']} />}>
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="usuarios/novo" element={<UsuarioFormPage />} />
            <Route path="usuarios/:id/editar" element={<UsuarioFormPage />} />
            <Route path="clientes" element={<ClientesPage />} />
            <Route path="clientes/novo" element={<ClienteFormPage />} />
            <Route path="clientes/:id" element={<ClienteDetalhePage />} />
            <Route path="clientes/:id/editar" element={<ClienteFormPage />} />
            <Route path="contas/novo" element={<ContaFormPage />} />
            <Route path="contas/:id/editar" element={<ContaFormPage />} />
          </Route>

          <Route element={<ProtectedRoute perfis={['CLIENTE']} />}>
            <Route path="completar-cadastro" element={<CompletarCadastroPage />} />
            <Route path="meu-perfil" element={<MeuPerfilPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

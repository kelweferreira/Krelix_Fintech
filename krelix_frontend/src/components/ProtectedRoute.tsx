import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import AcessoNegadoPage from '../pages/AcessoNegadoPage'
import type { Perfil } from '../utils/perfis'

interface Props {
  perfis?: Perfil[] 
}


export default function ProtectedRoute({ perfis }: Props) {
  const { usuario, perfil } = useAuth()
  const location = useLocation()
  if (!usuario || !perfil) return <Navigate to="/login" replace state={{ from: location }} />
  if (perfis && !perfis.includes(perfil)) return <AcessoNegadoPage />
  return <Outlet />
}


export function ExigeCadastro() {
  const { perfil, cliente } = useAuth()
  if (perfil === 'CLIENTE' && !cliente) return <Navigate to="/completar-cadastro" replace />
  return <Outlet />
}


export function PublicOnly({ children }: { children: ReactNode }) {
  const { usuario } = useAuth()
  const location = useLocation()
  if (usuario) {
    const destino = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/'
    return <Navigate to={destino} replace />
  }
  return <>{children}</>
}

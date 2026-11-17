import { useContext } from 'react'
import { AuthContext, type AuthContextType } from './AuthContext'

export function useAuth(): AuthContextType {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return contexto
}

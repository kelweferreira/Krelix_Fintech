import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'
import { autenticar, clientesApi } from '../services/api'
import { comoPerfil, type Perfil } from '../utils/perfis'
import type { Cliente, Usuario } from '../types'

const CHAVE_SESSAO = 'krelix:sessao'

// O que fica guardado da sessão: o usuário logado e, se ele for CLIENTE,
// o cadastro pessoal (Cliente) vinculado a ele. O ADMIN não tem cliente.
interface Sessao {
  usuario: Usuario
  cliente: Cliente | null
}

export interface AuthContextType {
  usuario: Usuario | null
  cliente: Cliente | null
  perfil: Perfil | null // ADMIN ou CLIENTE
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
  definirCliente: (cliente: Cliente) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)


function lerSessao(): Sessao | null {
  try {
    const texto = localStorage.getItem(CHAVE_SESSAO)
    if (!texto) return null
    const sessao = JSON.parse(texto) as Sessao
    return comoPerfil(sessao.usuario.tipo) ? sessao : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(lerSessao)

  const login = useCallback(async (email: string, senha: string) => {
    const logado = await autenticar(email, senha)
    const perfilLogado = comoPerfil(logado.tipo)
    if (!perfilLogado) throw new Error(`O perfil "${logado.tipo}" não tem acesso a esta versão do sistema.`)

    let cliente: Cliente | null = null
    if (perfilLogado === 'CLIENTE') {
      const clientes = await clientesApi.listar()
      cliente = clientes.find((c) => c.usuario.id === logado.id) ?? null
    }

    const nova: Sessao = { usuario: logado, cliente }
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(nova))
    setSessao(nova)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(CHAVE_SESSAO)
    setSessao(null)
  }, [])

  const definirCliente = useCallback((cliente: Cliente) => {
    if (!sessao) return
    const nova: Sessao = { ...sessao, cliente }
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(nova))
    setSessao(nova)
  }, [sessao])

  const valor = useMemo<AuthContextType>(() => ({
    usuario: sessao?.usuario ?? null,
    cliente: sessao?.cliente ?? null,
    perfil: sessao ? comoPerfil(sessao.usuario.tipo) : null,
    login,
    logout,
    definirCliente,
  }), [sessao, login, logout, definirCliente])

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

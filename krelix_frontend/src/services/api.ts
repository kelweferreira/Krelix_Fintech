
import type {
  Cliente, ClientePayload, Conta, ContaPayload,
  Transacao, TransacaoPayload, Usuario, UsuarioPayload,
} from '../types'


export const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8080'


export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const MENSAGEM_POR_STATUS: Record<number, string> = {
  400: 'Requisição inválida. Confira os dados informados.',
  401: 'E-mail ou senha inválidos.',
  404: 'Registro não encontrado.',
  409: 'Operação não permitida: dado já cadastrado ou registro com vínculos.',
  500: 'Erro interno no servidor. Tente novamente.',
}

async function lerMensagemErro(resposta: Response): Promise<string> {
  try {
    const corpo = (await resposta.json()) as { message?: unknown }
    if (typeof corpo.message === 'string' && corpo.message.trim() !== '') return corpo.message
  } catch {
  }
  return MENSAGEM_POR_STATUS[resposta.status] ?? `Erro inesperado (HTTP ${resposta.status}).`
}

interface Opcoes {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

async function request<T>(caminho: string, { method = 'GET', body }: Opcoes = {}): Promise<T> {
  let resposta: Response
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, `Não foi possível conectar ao servidor (${API_URL}). Verifique se o backend está em execução.`)
  }
  if (!resposta.ok) throw new ApiError(resposta.status, await lerMensagemErro(resposta))
  if (resposta.status === 204) return undefined as T // DELETE responde 204 sem corpo
  return (await resposta.json()) as T
}

export const usuariosApi = {
  listar: () => request<Usuario[]>('/api/usuarios'),
  buscar: (id: number) => request<Usuario>(`/api/usuarios/${id}`),
  criar: (dados: UsuarioPayload) => request<Usuario>('/api/usuarios', { method: 'POST', body: dados }),
  atualizar: (id: number, dados: UsuarioPayload) =>
    request<Usuario>(`/api/usuarios/${id}`, { method: 'PUT', body: dados }),
  excluir: (id: number) => request<void>(`/api/usuarios/${id}`, { method: 'DELETE' }),
}

export const autenticar = (email: string, senha: string) =>
  request<Usuario>('/api/usuarios/login', { method: 'POST', body: { email, senha } })

export const clientesApi = {
  listar: () => request<Cliente[]>('/api/clientes'),
  buscar: (id: number) => request<Cliente>(`/api/clientes/${id}`),
  criar: (dados: ClientePayload) => request<Cliente>('/api/clientes', { method: 'POST', body: dados }),
  atualizar: (id: number, dados: ClientePayload) =>
    request<Cliente>(`/api/clientes/${id}`, { method: 'PUT', body: dados }),
  excluir: (id: number) => request<void>(`/api/clientes/${id}`, { method: 'DELETE' }),
}

export const contasApi = {
  listar: () => request<Conta[]>('/api/contas'),
  buscar: (id: number) => request<Conta>(`/api/contas/${id}`),
  criar: (dados: ContaPayload) => request<Conta>('/api/contas', { method: 'POST', body: dados }),
  atualizar: (id: number, dados: ContaPayload) =>
    request<Conta>(`/api/contas/${id}`, { method: 'PUT', body: dados }),
  excluir: (id: number) => request<void>(`/api/contas/${id}`, { method: 'DELETE' }),
}

export const transacoesApi = {
  listar: () => request<Transacao[]>('/api/transacoes'),
  buscar: (id: number) => request<Transacao>(`/api/transacoes/${id}`),
  criar: (dados: TransacaoPayload) => request<Transacao>('/api/transacoes', { method: 'POST', body: dados }),
}

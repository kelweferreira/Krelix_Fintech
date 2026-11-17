import { ApiError } from '../services/api'


export function mensagemDeErro(erro: unknown, conflito?: string): string {
  if (erro instanceof ApiError && erro.status === 409 && conflito) return conflito
  return erro instanceof Error ? erro.message : 'Erro inesperado.'
}

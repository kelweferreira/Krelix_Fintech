import type { Transacao } from '../types'

export const maisRecentePrimeiro = (a: Transacao, b: Transacao): number =>
  b.dataTransacao.localeCompare(a.dataTransacao) || b.id - a.id

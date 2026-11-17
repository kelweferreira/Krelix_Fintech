import type { Conta, Transacao } from '../types'


export const contaDoCliente = (conta: Conta | null | undefined, clienteId: number | undefined): boolean =>
  !!conta && clienteId !== undefined && conta.cliente.id === clienteId

export const transacaoDoCliente = (t: Transacao, clienteId: number | undefined): boolean =>
  contaDoCliente(t.conta, clienteId) || contaDoCliente(t.contaDestino, clienteId)

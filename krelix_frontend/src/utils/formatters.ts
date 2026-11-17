import type { Conta } from '../types'

export const formatarMoeda = (valor: number): string =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const somenteDigitos = (texto: string): string => texto.replace(/\D/g, '')


export function formatarCpf(texto: string): string {
  const d = somenteDigitos(texto).slice(0, 11)
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}


export function formatarTelefone(texto: string): string {
  const d = somenteDigitos(texto).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}


export function formatarData(iso?: string | null): string {
  if (!iso) return '—'
  const [ano, mes, dia] = iso.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

export function formatarDataHora(iso?: string | null): string {
  if (!iso) return '—'
  const data = new Date(iso.slice(0, 19))
  if (Number.isNaN(data.getTime())) return iso
  const d = data.toLocaleDateString('pt-BR')
  const h = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${d} ${h}`
}

export function converterValor(texto: string): number | null {
  let t = texto.replace(/R\$|\s/g, '')
  if (t === '') return null
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return null
  return Number(t)
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  const primeira = partes[0][0]
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (primeira + ultima).toUpperCase()
}

export const rotuloTipoConta = (tipo: string): string =>
  tipo === 'CORRENTE' ? 'Corrente' : tipo === 'POUPANCA' ? 'Poupança' : tipo

export const rotuloTipoTransacao = (tipo: string): string =>
  tipo === 'DEPOSITO' ? 'Depósito' : tipo === 'TRANSFERENCIA' ? 'Transferência' : tipo

export const rotuloConta = (c: Conta): string =>
  `${rotuloTipoConta(c.tipo)} ${c.agencia}/${c.numero} — ${c.cliente.nomeCompleto}`

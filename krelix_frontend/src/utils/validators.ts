import { somenteDigitos } from './formatters'

export const emailValido = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const cpfValido = (cpf: string): boolean => somenteDigitos(cpf).length === 11

export const telefoneValido = (tel: string): boolean => {
  const n = somenteDigitos(tel).length
  return n === 10 || n === 11
}

export function dataNascimentoValida(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false
  const data = new Date(`${iso}T00:00:00`)
  return !Number.isNaN(data.getTime()) && data <= new Date() && data.getFullYear() >= 1900
}

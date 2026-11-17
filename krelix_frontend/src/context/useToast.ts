import { useContext } from 'react'
import { ToastContext, type ToastContextType } from './ToastContext'

export function useToast(): ToastContextType {
  const contexto = useContext(ToastContext)
  if (!contexto) throw new Error('useToast deve ser usado dentro de um ToastProvider')
  return contexto
}

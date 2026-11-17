import { createContext, useCallback, useMemo, useRef, useState, type ReactNode } from 'react'

type TipoToast = 'sucesso' | 'erro'
interface Toast { id: number; tipo: TipoToast; mensagem: string }

export interface ToastContextType {
  sucesso: (mensagem: string) => void
  erro: (mensagem: string) => void
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Mensagens de sucesso/erro que aparecem no canto da tela e somem sozinhas.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const proximoId = useRef(0)

  const remover = useCallback((id: number) => {
    setToasts((anteriores) => anteriores.filter((t) => t.id !== id))
  }, [])

  const mostrar = useCallback((tipo: TipoToast, mensagem: string) => {
    const id = ++proximoId.current
    setToasts((anteriores) => [...anteriores, { id, tipo, mensagem }]) // imutável: novo array
    window.setTimeout(() => remover(id), 5000)
  }, [remover])

  const valor = useMemo(
    () => ({ sucesso: (m: string) => mostrar('sucesso', m), erro: (m: string) => mostrar('erro', m) }),
    [mostrar],
  )

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.tipo}`} role={t.tipo === 'erro' ? 'alert' : 'status'}>
            <span>{t.mensagem}</span>
            <button type="button" aria-label="Fechar" onClick={() => remover(t.id)}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

import { useEffect } from 'react'

interface Props {
  aberto: boolean
  titulo: string
  mensagem: string
  textoConfirmar?: string
  perigo?: boolean
  processando?: boolean
  aoConfirmar: () => void
  aoCancelar: () => void
}

// Janela de confirmação (usada antes de excluir).
export default function ConfirmDialog({
  aberto, titulo, mensagem, textoConfirmar = 'Confirmar', perigo = false, processando = false,
  aoConfirmar, aoCancelar,
}: Props) {
  useEffect(() => {
    if (!aberto) return
    const aoTeclar = (e: KeyboardEvent) => { if (e.key === 'Escape') aoCancelar() }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [aberto, aoCancelar])

  if (!aberto) return null
  return (
    <div className="modal-fundo" onClick={aoCancelar}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo" onClick={(e) => e.stopPropagation()}>
        <h2 id="modal-titulo">{titulo}</h2>
        <p>{mensagem}</p>
        <div className="modal-acoes">
          <button type="button" className="btn btn-secundario" onClick={aoCancelar} disabled={processando}>Cancelar</button>
          <button type="button" className={perigo ? 'btn btn-perigo' : 'btn btn-primario'} onClick={aoConfirmar} disabled={processando}>
            {processando ? 'Aguarde...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}

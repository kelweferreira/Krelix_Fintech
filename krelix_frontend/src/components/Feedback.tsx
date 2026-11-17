// Pequenos componentes para os 3 estados de uma tela: carregando, erro e vazio.

export function Carregando({ texto = 'Carregando...' }: { texto?: string }) {
  return (
    <div className="estado" role="status">
      <span className="spinner" />
      {texto}
    </div>
  )
}

export function ErroBox({ mensagem, aoTentarNovamente }: { mensagem: string; aoTentarNovamente?: () => void }) {
  return (
    <div className="alerta alerta-erro" role="alert">
      <span>{mensagem}</span>
      {aoTentarNovamente && (
        <button type="button" className="btn btn-secundario btn-sm" onClick={aoTentarNovamente}>
          Tentar novamente
        </button>
      )}
    </div>
  )
}

export function Vazio({ texto }: { texto: string }) {
  return <div className="estado estado-vazio">{texto}</div>
}

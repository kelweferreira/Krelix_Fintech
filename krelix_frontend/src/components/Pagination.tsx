interface Props {
  pagina: number
  totalPaginas: number
  aoMudar: (pagina: number) => void
}

export default function Pagination({ pagina, totalPaginas, aoMudar }: Props) {
  if (totalPaginas <= 1) return null
  const fim = Math.min(totalPaginas, Math.max(5, pagina + 2))
  const inicio = Math.max(1, fim - 4)
  const numeros: number[] = []
  for (let n = inicio; n <= fim; n++) numeros.push(n)

  return (
    <nav className="paginacao" aria-label="Paginação">
      <button type="button" className="btn btn-link" disabled={pagina === 1} onClick={() => aoMudar(pagina - 1)}>← Anterior</button>
      <div className="paginacao-numeros">
        {numeros.map((n) => (
          <button key={n} type="button" className={n === pagina ? 'pag-num ativo' : 'pag-num'}
            aria-current={n === pagina ? 'page' : undefined} onClick={() => aoMudar(n)}>
            {n}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-link" disabled={pagina === totalPaginas} onClick={() => aoMudar(pagina + 1)}>Próximo →</button>
    </nav>
  )
}

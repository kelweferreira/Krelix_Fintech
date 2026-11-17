import { useMemo, useState } from 'react'

export function usePaginacao<T>(itens: T[], tamanho = 8) {
  const [pagina, setPagina] = useState(1)
  const totalPaginas = Math.max(1, Math.ceil(itens.length / tamanho))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const itensDaPagina = useMemo(
    () => itens.slice((paginaAtual - 1) * tamanho, paginaAtual * tamanho),
    [itens, paginaAtual, tamanho],
  )
  return { pagina: paginaAtual, setPagina, totalPaginas, itensDaPagina }
}

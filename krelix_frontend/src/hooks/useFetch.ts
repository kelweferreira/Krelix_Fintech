import { useEffect, useState } from 'react'

export function useFetch<T>(buscar: () => Promise<T>, deps: unknown[] = []) {
  const [dados, setDados] = useState<T | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let cancelado = false
    setCarregando(true)
    setErro(null)
    buscar()
      .then((resultado) => { if (!cancelado) setDados(resultado) })
      .catch((e: unknown) => { if (!cancelado) setErro(e instanceof Error ? e.message : 'Erro inesperado.') })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [tentativa, ...deps])

  return { dados, carregando, erro, recarregar: () => setTentativa((t) => t + 1) }
}

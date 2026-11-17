
export type Perfil = 'ADMIN' | 'CLIENTE'


export function comoPerfil(tipo: string): Perfil | null {
  return tipo === 'ADMIN' || tipo === 'CLIENTE' ? tipo : null
}

export const rotuloPerfil = (perfil: Perfil): string => (perfil === 'ADMIN' ? 'Administrador' : 'Cliente')

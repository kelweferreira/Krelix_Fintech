// Tipos que espelham EXATAMENTE as entidades Java do backend (pacote model).
// BigDecimal vira number no JSON; LocalDate/LocalDateTime viram string ISO.

export interface Usuario {
  id: number
  nome: string
  email: string
  tipo: string
  dataCriacao: string
  // "senha" NUNCA vem do backend (@JsonProperty WRITE_ONLY) – só é enviada.
}

export interface UsuarioPayload {
  nome: string
  email: string
  tipo: string
  senha?: string // na edição, vazio = mantém a senha atual
}

export interface Cliente {
  id: number
  nomeCompleto: string
  cpf: string // 11 dígitos, sem máscara
  telefone: string | null // até 11 dígitos
  dataNascimento: string // yyyy-MM-dd
  dataCriacao: string
  usuario: Usuario
}

export interface ClientePayload {
  nomeCompleto: string
  cpf: string
  telefone: string | null
  dataNascimento: string
  usuario?: { id: number } // obrigatório na criação; ignorado pelo PUT
}

export type TipoConta = 'CORRENTE' | 'POUPANCA'

export interface Conta {
  id: number
  tipo: string
  agencia: string // 4 caracteres
  numero: string // até 10 caracteres
  saldo: number
  limiteDisponivel: number
  dataCriacao: string
  cliente: Cliente
}

export interface ContaPayload {
  tipo: string
  agencia: string
  numero: string
  limiteDisponivel: number
  cliente?: { id: number } // obrigatório na criação; ignorado pelo PUT
}

export type TipoTransacao = 'DEPOSITO' | 'TRANSFERENCIA'

export interface Transacao {
  id: number
  tipo: string
  valor: number
  descricao: string | null
  dataTransacao: string
  conta: Conta
  contaDestino: Conta | null
}

export interface TransacaoPayload {
  tipo: TipoTransacao
  valor: number
  descricao?: string
  conta: { id: number }
  contaDestino?: { id: number }
}

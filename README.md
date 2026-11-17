# Krelix — Fintech (Java + Oracle + Spring Boot + ReactJS)

Projeto final do curso de **Análise e Desenvolvimento de Sistemas — FIAP**.
Autor: **Kelwe Ferreira**.

O **Krelix** simula o núcleo de uma fintech: cadastro de usuários e clientes, abertura de contas (corrente e poupança),
depósitos e transferências entre contas, com saldos atualizados e histórico de transações.

---

## 1. Dados de acesso para teste (login)

Os usuários abaixo **já existem no banco da FIAP configurado neste projeto** (seção 4.1); não é preciso cadastrá-los.

| Perfil | E-mail | Senha | O que tem |
|---|---|---|---|
| **Administrador** | `kelwe123@gmail.com` | `kelwe123` | Acesso total: usuários, clientes, contas e todas as transações |
| **Cliente (conta corrente)** | `maria@krelix.com` | `senha123` | Cliente "Maria da Silva", com **conta corrente** (agência 0001, conta 00012345) e uma poupança. Vê e movimenta só as próprias contas |

Para testar o **recebimento** de uma transferência, existe também o cliente `joao@krelix.com` / `senha123`
(conta corrente 0001 / 00023456).

> Os saldos iniciais da Maria são R$ 750,00 (corrente) e R$ 500,00 (poupança); o do João é R$ 250,00.
> Depois de depósitos e transferências, os saldos mudam.

---

## 2. Tecnologias utilizadas

**Backend** (`krelix-backend/`)

| Tecnologia | Versão / observação |
|---|---|
| Java | 21 |
| Spring Boot | 4.1.1 |
| Spring Web MVC | `spring-boot-starter-webmvc` (API REST com `@RestController`) |
| Spring Data JPA (Hibernate) | `spring-boot-starter-data-jpa` (entidades e repositories) |
| Bean Validation | `spring-boot-starter-validation` (dependência declarada no `pom.xml`) |
| Driver Oracle | `ojdbc17` |
| Banco de dados | **Oracle (instância da FIAP)**, versão 12c ou superior (colunas `IDENTITY`) |
| Build | Maven (wrapper incluso: `mvnw` / `mvnw.cmd`) |

**Frontend** (`krelix-frontend/`)

| Tecnologia | Versão / observação |
|---|---|
| React | 19.x |
| TypeScript | 5.8.x |
| Vite | 8.x (servidor de desenvolvimento e build) |
| React Router DOM | 7.x (rotas de uma SPA) |
| Context API | sessão do usuário (`AuthContext`) e mensagens (`ToastContext`) |
| Fetch API | todas as chamadas HTTP, concentradas em `src/services/api.ts` |
| CSS próprio | sem biblioteca de componentes (`src/styles`) |

Nenhuma biblioteca além das apresentadas no curso foi adicionada às dependências de execução:
o frontend usa apenas `react`, `react-dom` e `react-router-dom`.

---

## 3. Pré-requisitos

- **JDK 21**
- **Node.js 20.19+ ou 22.12+** (exigência do Vite 8) e npm
- Acesso à rede para alcançar a **instância Oracle da FIAP** (a conexão já vem configurada no projeto)
- *(Opcional)* Um cliente SQL, como o Oracle SQL Developer, apenas para consultar ou recriar o banco

---

## 4. Como executar

A ordem é: **banco → backend → frontend**.

### 4.1 Banco de dados (Oracle da FIAP) — já está preparado

O banco **já está pronto** na instância Oracle da FIAP: as 4 tabelas (`T_KRX_USUARIO`, `T_KRX_CLIENTE`, `T_KRX_CONTA` e
`T_KRX_TRANSACAO`) já foram criadas e os dados de teste já foram carregados. **Não é preciso executar nenhum script** para
avaliar o projeto: basta iniciar o backend (seção 4.2) e o frontend (seção 4.3).

**Se for necessário recriar o banco do zero (opcional)** — por exemplo, para voltar os saldos ao estado inicial depois de
vários testes — execute, **nesta ordem**, os scripts da pasta `database/`:

1. `krelix_ddl.sql` — cria as tabelas, as chaves, as restrições e as colunas de ID automáticas. O início do arquivo traz um
   bloco de `DROP TABLE` **comentado**: descomente-o para apagar as tabelas existentes antes de recriá-las (os dados são apagados).
2. `krelix_dados_teste.sql` — carrega os usuários, clientes, contas e transações de exemplo (os logins da seção 1).
3. Confira com `SELECT COUNT(*) FROM T_KRX_USUARIO;` (o script de dados cria 4 usuários).

Observações:
- O Hibernate **não** cria nem altera as tabelas: elas vêm exclusivamente do script.
- Os saldos mudam conforme os testes. Se uma conta ficar sem saldo suficiente para uma transferência, faça um **depósito**
  nela antes (ou recrie o banco como descrito acima).
- O script de dados também cria um usuário do tipo `SUPORTE`; esse perfil não tem telas nesta versão (ver seção 9).

### 4.2 Backend (Spring Boot — porta 8080)

1. O arquivo `krelix-backend/src/main/resources/application.properties` **já acompanha o projeto com a conexão da instância
   Oracle da FIAP configurada**. Não é necessário alterar nada.

2. Dentro de `krelix-backend/`, inicie a aplicação:

   ```bash
   # Windows
   mvnw.cmd spring-boot:run

   # Linux / macOS
   ./mvnw spring-boot:run
   ```

   (Também é possível executar a classe `FintechApplication` pela IDE.)

3. A API fica em `http://localhost:8080`. Teste: `http://localhost:8080/api/usuarios` deve responder com uma lista JSON.
   Se aparecer erro de conexão, verifique se a instância Oracle da FIAP está acessível a partir da sua rede.

> Para gerar o pacote com `mvnw package`, o Spring executa o teste padrão `contextLoads`, que **conecta ao banco**.

### 4.3 Frontend (React + Vite — porta 5173)

Dentro de `krelix-frontend/`:

```bash
npm install        # instala as dependências a partir do package.json / package-lock.json
npm run dev        # abre em http://localhost:5173
```

- Use a porta **5173**: o backend só libera CORS para `http://localhost:5173`. O `vite.config.ts` fixa essa porta e
  falha (em vez de trocar de porta) se ela estiver ocupada.
- O endereço da API é definido em um único lugar, o arquivo `.env` (`VITE_API_URL=http://localhost:8080`),
  lido em `src/services/api.ts`. O arquivo `.env.example` mostra o formato.
- Outros comandos: `npm run build` (confere o TypeScript e gera `dist/`) e `npm run preview`.

Abra `http://localhost:5173` e entre com um dos usuários da seção 1.

---

## 5. Roteiro sugerido

**Como administrador** (`kelwe123@gmail.com`)
1. O menu mostra Dashboard, Clientes, Contas, Transações e Usuários.
2. **Usuários → Novo**: crie um usuário (o tipo pode ser Administrador ou Cliente).
3. **Clientes → Novo**: crie um cliente escolhendo o usuário vinculado.
4. **Contas → Nova**: abra uma conta para esse cliente (o saldo inicial é sempre zero).
5. **Transações**: faça um **depósito** nessa conta e uma **transferência** para outra conta. O fluxo tem 3 passos
   (dados → confirmação → comprovante).
6. Tente **excluir** um cliente que tem contas: o sistema recusa e informa o motivo.

**Como cliente** (`maria@krelix.com`)
1. O menu mostra apenas Dashboard, Minhas contas, Minhas transações e Meu perfil.
2. **Minhas contas** lista só as contas dela.
3. Digite `/usuarios` ou `/clientes` na barra de endereço: aparece **Acesso negado**.
4. Faça uma **transferência** para a conta do João: a origem só oferece as contas da Maria.
5. **Meu perfil**: o CPF aparece bloqueado; nome, telefone e data de nascimento podem ser editados.

**Primeiro acesso de um cliente novo**
1. Na tela de login, use **Criar usuário** (o cadastro público sempre cria um usuário do tipo Cliente).
2. Após entrar, o sistema leva para **Complete seu cadastro** (dados pessoais).
3. A **conta bancária é aberta por um administrador**; até lá o cliente vê "Você ainda não possui contas".

---

## 6. Como o sistema funciona

### 6.1 Arquitetura do backend

```
Controller (REST)  →  Service (regras de negócio)  →  Repository (JPA)  →  Oracle
```

Pacote raiz `br.com.krelix.fintech`, com os subpacotes `controller`, `service`, `repository` e `model`.
Cada uma das 4 entidades tem as quatro camadas.

### 6.2 Entidades e relacionamentos

```
Usuario 1 ──── 1 Cliente 1 ──── N Conta 1 ──── N Transacao
(login)         (dados pessoais)  (corrente/poupança)  (origem)
                                       ▲
              Transacao.contaDestino ──┘  (opcional: só em transferências)
```

| Entidade (tabela) | Campos principais | Regras no banco |
|---|---|---|
| **Usuario** (`T_KRX_USUARIO`) | nome, e-mail, senha, tipo, data de criação | e-mail único e com formato válido; tipo ∈ `ADMIN`, `SUPORTE`, `CLIENTE` |
| **Cliente** (`T_KRX_CLIENTE`) | nome completo, CPF, telefone (opcional), data de nascimento, **usuário** | CPF único; cada usuário tem no máximo 1 cliente (1 para 1) |
| **Conta** (`T_KRX_CONTA`) | tipo, agência, número, saldo, limite disponível, **cliente** | tipo ∈ `CORRENTE`, `POUPANCA`; agência + número únicos |
| **Transacao** (`T_KRX_TRANSACAO`) | tipo, valor, descrição (opcional), data, **conta de origem**, **conta de destino** (opcional) | tipo ∈ `DEPOSITO`, `TRANSFERENCIA`; valor > 0; transferência exige destino diferente da origem |

Os IDs são gerados pelo próprio banco (`IDENTITY`).

### 6.3 Regras de negócio

- **Depósito:** soma o valor ao saldo da conta e registra a transação (sem conta de destino).
- **Transferência:** exige conta de destino diferente da origem e **saldo suficiente** na origem; subtrai da origem,
  soma no destino e registra a transação. O limite disponível **não** entra nessa regra.
- **Atomicidade:** depósito e transferência rodam em uma única transação de banco (`@Transactional`): se qualquer
  passo falhar, tudo é desfeito.
- **Saldo:** só muda por transações. Uma conta nova sempre nasce com saldo zero, e o `PUT` de conta não altera o saldo.
- **Transações são imutáveis:** não há `PUT` nem `DELETE` (decisão para manter o histórico financeiro íntegro).
- **Integridade:** não é possível excluir um usuário que tem cliente, um cliente que tem contas, nem uma conta que tem transações.

### 6.4 Endpoints da API (`http://localhost:8080`)

| Recurso | Método e caminho | Sucesso | Observação |
|---|---|---|---|
| **Usuários** | `POST /api/usuarios` | 201 | corpo: `nome`, `email`, `senha`, `tipo` |
| | `POST /api/usuarios/login` | 200 | corpo: `email`, `senha`; devolve o usuário (sem a senha) |
| | `GET /api/usuarios` · `GET /api/usuarios/{id}` | 200 | |
| | `PUT /api/usuarios/{id}` | 200 | só troca a senha se vier preenchida |
| | `DELETE /api/usuarios/{id}` | 204 | |
| **Clientes** | `POST /api/clientes` | 201 | corpo: `nomeCompleto`, `cpf`, `telefone`, `dataNascimento`, `usuario: { id }` |
| | `GET /api/clientes` · `GET /api/clientes/{id}` | 200 | |
| | `PUT /api/clientes/{id}` | 200 | altera nome, CPF, telefone e nascimento (não o usuário) |
| | `DELETE /api/clientes/{id}` | 204 | |
| **Contas** | `POST /api/contas` | 201 | corpo: `tipo`, `agencia`, `numero`, `limiteDisponivel`, `cliente: { id }` |
| | `GET /api/contas` · `GET /api/contas/{id}` | 200 | |
| | `PUT /api/contas/{id}` | 200 | altera tipo, agência, número e limite (não o saldo nem o cliente) |
| | `DELETE /api/contas/{id}` | 204 | |
| **Transações** | `POST /api/transacoes` | 201 | depósito ou transferência, conforme o campo `tipo` |
| | `GET /api/transacoes` · `GET /api/transacoes/{id}` | 200 | |

Exemplos de corpo para `POST /api/transacoes`:

```json
{ "tipo": "DEPOSITO", "valor": 100.00, "conta": { "id": 1 } }
```
```json
{ "tipo": "TRANSFERENCIA", "valor": 100.00, "conta": { "id": 1 }, "contaDestino": { "id": 3 } }
```

**Códigos de status de erro:**

| Status | Quando |
|---|---|
| 400 | valor ≤ 0, conta de origem/destino ausente ou igual, saldo insuficiente, tipo de transação inválido, descrição acima de 200 caracteres |
| 401 | e-mail ou senha inválidos no login |
| 404 | usuário, cliente, conta ou transação inexistente |
| 409 | e-mail ou CPF repetido, agência + conta repetidas, ou exclusão de um registro que tem dependentes |

### 6.5 Frontend

**Estrutura** (`krelix-frontend/src`)

```
src/
├── assets/       logo
├── components/   Layout (menu lateral), ProtectedRoute, PageHeader, Field, Pagination, ConfirmDialog, formulários...
├── context/      AuthContext (sessão e perfil) e ToastContext (mensagens), com os hooks useAuth e useToast
├── hooks/        useFetch (busca com carregando/erro) e usePaginacao
├── pages/        Login, Cadastro, Dashboard, Usuários, Clientes, Contas, Transações, Meu perfil, Acesso negado, Erro 404
├── services/     api.ts (TODAS as chamadas HTTP)
├── styles/       global.css e layout.css
├── types/        interfaces TypeScript que espelham as entidades do backend
├── utils/        formatadores, validadores, tratamento de erro e regras de acesso
├── App.tsx       rotas
└── main.tsx
```

**Rotas**

| Rota | Quem acessa |
|---|---|
| `/login`, `/cadastro` | público |
| `/` (Dashboard), `/contas`, `/transacoes`, `/transacoes/depositar`, `/transacoes/transferir` | Administrador e Cliente (o cliente vê só os próprios dados) |
| `/usuarios`, `/clientes` (e as telas de cadastro/edição/detalhe), `/contas/novo`, `/contas/:id/editar` | só Administrador |
| `/meu-perfil`, `/completar-cadastro` | só Cliente |
| qualquer outra | página de erro personalizada |

---

## 7. Decisões de projeto

- **`Usuario` separado de `Cliente`:** o usuário guarda só os dados de acesso (login); o cliente guarda os dados pessoais.
  Um administrador, por exemplo, é um usuário que não é cliente. A conta pertence ao **cliente**, não ao login.
- **Tipo de conta como coluna** (`CORRENTE`/`POUPANCA`) em vez de herança entre classes, para manter o mapeamento JPA simples.
- **Transações só de depósito e transferência**, e imutáveis, para o histórico financeiro não ser reescrito.
- **Regras também no banco** (`UNIQUE`, `CHECK`, chaves estrangeiras), além da validação nos services e nos formulários.
- **Dinheiro em `BigDecimal`**, para evitar erros de arredondamento.
- **Controle de acesso por perfil na interface** (Administrador e Cliente) — ver a ressalva 1 abaixo.
- **Conta aberta pelo administrador:** o cliente completa os dados pessoais e a conta é aberta pela administração.
- **IDs gerados pelo banco** (`IDENTITY`), e o script SQL é a fonte de verdade das tabelas.

---

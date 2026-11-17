-- KRELIX - DADOS DE TESTE
-- ORDEM OBRIGATORIA
--   1) USUARIO  ->  2) CLIENTE  ->  3) CONTA  ->  4) TRANSACAO
--
-- REGRAS DO SCRIPT:
--   - Nunca informamos os IDs (o identity gera sozinho).
--   - Para ligar uma tabela a outra, buscamos o ID
--   - (e-mail, CPF, agencia + conta) com um SELECT. Assim o script funciona
--   - mesmo que os IDs tenham buracos.


-- LIMPAR DADOS ANTERIORES

-- DELETE FROM T_KRX_TRANSACAO;
-- DELETE FROM T_KRX_CONTA;
-- DELETE FROM T_KRX_CLIENTE;
-- DELETE FROM T_KRX_USUARIO;
-- COMMIT;



-- 1) USUARIOS

-- Administrador
INSERT INTO T_KRX_USUARIO (nm_usuario, ds_email, ds_senha, ds_tipo_usuario, dt_hr_criado)
VALUES ('Kelwe', 'kelwe123@gmail.com', 'kelwe123', 'ADMIN', SYSDATE);

-- Suporte
INSERT INTO T_KRX_USUARIO (nm_usuario, ds_email, ds_senha, ds_tipo_usuario, dt_hr_criado)
VALUES ('Atendente Teste', 'suporte@krelix.com', 'suporte123', 'SUPORTE', SYSDATE);

-- Cliente 1
INSERT INTO T_KRX_USUARIO (nm_usuario, ds_email, ds_senha, ds_tipo_usuario, dt_hr_criado)
VALUES ('Maria Silva', 'maria@krelix.com', 'senha123', 'CLIENTE', SYSDATE);

-- Cliente 2
INSERT INTO T_KRX_USUARIO (nm_usuario, ds_email, ds_senha, ds_tipo_usuario, dt_hr_criado)
VALUES ('Joao Souza', 'joao@krelix.com', 'senha123', 'CLIENTE', SYSDATE);



-- 2) CLIENTES (dados pessoais)
-- O id_usuario vem de um SELECT que procura o usuario pelo e-mail.

INSERT INTO T_KRX_CLIENTE (nm_completo, nr_cpf, nr_telefone, dt_nascimento, dt_hr_criado, id_usuario)
VALUES ('Maria da Silva',
        '01234567890',                                  
        '11987654321',
        TO_DATE('20/05/1998', 'DD/MM/YYYY'),            
        SYSDATE,
        (SELECT id_usuario FROM T_KRX_USUARIO WHERE ds_email = 'maria@krelix.com'));

INSERT INTO T_KRX_CLIENTE (nm_completo, nr_cpf, nr_telefone, dt_nascimento, dt_hr_criado, id_usuario)
VALUES ('Joao de Souza',
        '98765432100',
        NULL,                                           
        TO_DATE('15/09/1995', 'DD/MM/YYYY'),
        SYSDATE,
        (SELECT id_usuario FROM T_KRX_USUARIO WHERE ds_email = 'joao@krelix.com'));



-- 3) CONTAS (cada uma pertence a um cliente, buscado pelo CPF)

-- Maria: conta corrente (1000 de deposito - 250 transferidos = 750)
INSERT INTO T_KRX_CONTA (ds_tipo_conta, nr_agencia, nr_conta, vl_saldo, vl_limite_disponivel, dt_hr_criado, id_cliente)
VALUES ('CORRENTE', '0001', '00012345', 750.00, 500.00, SYSDATE,
        (SELECT id_cliente FROM T_KRX_CLIENTE WHERE nr_cpf = '01234567890'));

-- Maria: conta poupanca (500 de deposito)
INSERT INTO T_KRX_CONTA (ds_tipo_conta, nr_agencia, nr_conta, vl_saldo, vl_limite_disponivel, dt_hr_criado, id_cliente)
VALUES ('POUPANCA', '0001', '00012346', 500.00, 0.00, SYSDATE,
        (SELECT id_cliente FROM T_KRX_CLIENTE WHERE nr_cpf = '01234567890'));

-- Joao: conta corrente (recebeu 250 de transferencia)
INSERT INTO T_KRX_CONTA (ds_tipo_conta, nr_agencia, nr_conta, vl_saldo, vl_limite_disponivel, dt_hr_criado, id_cliente)
VALUES ('CORRENTE', '0001', '00023456', 250.00, 0.00, SYSDATE,
        (SELECT id_cliente FROM T_KRX_CLIENTE WHERE nr_cpf = '98765432100'));


-- =====================================================================
-- 4) TRANSACOES (cada uma ligada a conta de origem; a conta e
-- buscada pela combinacao agencia + numero, que e unica)
-- DEPOSITO       -> sem conta destino 
-- TRANSFERENCIA  -> com conta destino diferente da origem
-- =====================================================================

-- Deposito de 1000 na corrente da Maria
INSERT INTO T_KRX_TRANSACAO (id_conta, ds_tipo_transacao, vl_transacao, ds_transacao, dt_hr_transacao, id_conta_destino)
VALUES ((SELECT id_conta FROM T_KRX_CONTA WHERE nr_agencia = '0001' AND nr_conta = '00012345'),
        'DEPOSITO', 1000.00, 'Deposito inicial', SYSDATE, NULL);

-- Deposito de 500 na poupanca da Maria
INSERT INTO T_KRX_TRANSACAO (id_conta, ds_tipo_transacao, vl_transacao, ds_transacao, dt_hr_transacao, id_conta_destino)
VALUES ((SELECT id_conta FROM T_KRX_CONTA WHERE nr_agencia = '0001' AND nr_conta = '00012346'),
        'DEPOSITO', 500.00, 'Deposito na poupanca', SYSDATE, NULL);

-- Transferencia de 250: Maria  -> Joao 
INSERT INTO T_KRX_TRANSACAO (id_conta, ds_tipo_transacao, vl_transacao, ds_transacao, dt_hr_transacao, id_conta_destino)
VALUES ((SELECT id_conta FROM T_KRX_CONTA WHERE nr_agencia = '0001' AND nr_conta = '00012345'),
        'TRANSFERENCIA', 250.00, 'Pagamento de teste', SYSDATE,
        (SELECT id_conta FROM T_KRX_CONTA WHERE nr_agencia = '0001' AND nr_conta = '00023456'));
        
COMMIT;


-- 5) CONFERENCIA


-- Quantas linhas existem em cada tabela
--SELECT 'USUARIO' AS tabela, COUNT(*) AS qtd FROM T_KRX_USUARIO
--UNION ALL SELECT 'CLIENTE',   COUNT(*) FROM T_KRX_CLIENTE
--UNION ALL SELECT 'CONTA',     COUNT(*) FROM T_KRX_CONTA
--UNION ALL SELECT 'TRANSACAO', COUNT(*) FROM T_KRX_TRANSACAO;

-- Cada cliente com seu login e suas contas
--SELECT u.ds_email, c.nm_completo, ct.ds_tipo_conta, ct.nr_agencia, ct.nr_conta, ct.vl_saldo
  --FROM T_KRX_USUARIO u
  --JOIN T_KRX_CLIENTE c  ON c.id_usuario = u.id_usuario
  --JOIN T_KRX_CONTA  ct  ON ct.id_cliente = c.id_cliente
 --ORDER BY c.nm_completo, ct.ds_tipo_conta;

-- Extrato: transacoes com origem e destino
--SELECT t.id_transacao, t.ds_tipo_transacao, t.vl_transacao,
      -- o.nr_conta AS conta_origem,
     --  d.nr_conta AS conta_destino
  --FROM T_KRX_TRANSACAO t
  --JOIN T_KRX_CONTA o ON o.id_conta = t.id_conta
  --LEFT JOIN T_KRX_CONTA d ON d.id_conta = t.id_conta_destino  
 --ORDER BY t.id_transacao;


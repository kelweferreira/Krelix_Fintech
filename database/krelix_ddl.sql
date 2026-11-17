-- DROP TABLE T_KRX_TRANSACAO CASCADE CONSTRAINTS PURGE;
-- DROP TABLE T_KRX_CONTA     CASCADE CONSTRAINTS PURGE;
-- DROP TABLE T_KRX_CLIENTE   CASCADE CONSTRAINTS PURGE;
-- DROP TABLE T_KRX_USUARIO   CASCADE CONSTRAINTS PURGE;

CREATE TABLE T_KRX_USUARIO
    (
     id_usuario      NUMBER (5) GENERATED ALWAYS AS IDENTITY NOT NULL ,
     nm_usuario      VARCHAR2 (50)  NOT NULL ,
     ds_email        VARCHAR2 (100) NOT NULL , 
     ds_senha        VARCHAR2 (255) NOT NULL ,  
     ds_tipo_usuario VARCHAR2 (20)  NOT NULL ,  
     dt_hr_criado    DATE           NOT NULL
    )
;

COMMENT ON COLUMN T_KRX_USUARIO.ds_tipo_usuario IS 'ADMIN
SUPORTE
CLIENTE'
;


CREATE TABLE T_KRX_CLIENTE
    (
     id_cliente    NUMBER (5) GENERATED ALWAYS AS IDENTITY NOT NULL , 
     nm_completo   VARCHAR2 (100) NOT NULL ,
     nr_cpf        VARCHAR2 (11)  NOT NULL ,  
     nr_telefone   VARCHAR2 (11) ,            
     dt_nascimento DATE           NOT NULL ,
     dt_hr_criado  DATE           NOT NULL ,
     id_usuario    NUMBER (5)     NOT NULL    
    )
;


CREATE TABLE T_KRX_CONTA
    (
     id_conta             NUMBER (5) GENERATED ALWAYS AS IDENTITY NOT NULL , 
     ds_tipo_conta        VARCHAR2 (20)  NOT NULL ,
     nr_agencia           VARCHAR2 (4)   NOT NULL ,  
     nr_conta             VARCHAR2 (10)  NOT NULL ,  
     vl_saldo             NUMBER (15,2)  NOT NULL ,
     vl_limite_disponivel NUMBER (15,2)  NOT NULL ,
     dt_hr_criado         DATE           NOT NULL ,
     id_cliente           NUMBER (5)     NOT NULL    
    )
;

COMMENT ON COLUMN T_KRX_CONTA.ds_tipo_conta IS 'CORRENTE
POUPANCA'
;


CREATE TABLE T_KRX_TRANSACAO
    (
     id_transacao      NUMBER (5) GENERATED ALWAYS AS IDENTITY NOT NULL ,
     id_conta          NUMBER (5)     NOT NULL ,  
     ds_tipo_transacao VARCHAR2 (20)  NOT NULL ,
     vl_transacao      NUMBER (15,2)  NOT NULL ,
     ds_transacao      VARCHAR2 (200) ,          
     dt_hr_transacao   DATE           NOT NULL ,
     id_conta_destino  NUMBER (5)                
    )
;

COMMENT ON COLUMN T_KRX_TRANSACAO.ds_tipo_transacao IS 'DEPOSITO
TRANSFERENCIA'
;




ALTER TABLE T_KRX_USUARIO
    ADD CONSTRAINT T_KRX_USUARIO_PK PRIMARY KEY ( id_usuario ) ;

ALTER TABLE T_KRX_CLIENTE
    ADD CONSTRAINT T_KRX_CLIENTE_PK PRIMARY KEY ( id_cliente ) ;

ALTER TABLE T_KRX_CONTA
    ADD CONSTRAINT T_KRX_CONTA_PK PRIMARY KEY ( id_conta ) ;


ALTER TABLE T_KRX_TRANSACAO
    ADD CONSTRAINT T_KRX_TRANSACAO_PK PRIMARY KEY ( id_transacao ) ;


ALTER TABLE T_KRX_USUARIO
    ADD CONSTRAINT T_KRX_USUARIO_ds_email_UN UNIQUE ( ds_email ) ;


ALTER TABLE T_KRX_CLIENTE
    ADD CONSTRAINT T_KRX_CLIENTE_nr_cpf_UN UNIQUE ( nr_cpf ) ;

CREATE UNIQUE INDEX T_KRX_CLIENTE__IDX ON T_KRX_CLIENTE
    (
     id_usuario ASC
    )
;

ALTER TABLE T_KRX_CONTA
    ADD CONSTRAINT CONTA_nr_agencia_conta_UN UNIQUE ( nr_agencia , nr_conta ) ;



ALTER TABLE T_KRX_USUARIO
    ADD CONSTRAINT USUARIO_TIPO_CK
    CHECK (ds_tipo_usuario IN ('ADMIN', 'SUPORTE', 'CLIENTE'))
;

ALTER TABLE T_KRX_USUARIO
    ADD CONSTRAINT chk_email_valido 
    CHECK (REGEXP_LIKE(ds_email, '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'));


ALTER TABLE T_KRX_CONTA
    ADD CONSTRAINT CONTA_TIPO_CK
    CHECK (ds_tipo_conta IN ('CORRENTE', 'POUPANCA'))
;


ALTER TABLE T_KRX_TRANSACAO
    ADD CONSTRAINT TRANSACAO_VALOR_CK
    CHECK (vl_transacao > 0)
;

ALTER TABLE T_KRX_TRANSACAO
    ADD CONSTRAINT TRANSACAO_TIPO_CK
    CHECK (ds_tipo_transacao IN ('DEPOSITO', 'TRANSFERENCIA'))
;


ALTER TABLE T_KRX_TRANSACAO
    ADD CONSTRAINT TRANSACAO_CONTA_DESTINO_CK
    CHECK (
        (ds_tipo_transacao = 'TRANSFERENCIA' AND id_conta_destino IS NOT NULL AND id_conta_destino <> id_conta)
        OR
        (ds_tipo_transacao <> 'TRANSFERENCIA' AND id_conta_destino IS NULL)
    )
;


ALTER TABLE T_KRX_CLIENTE
    ADD CONSTRAINT T_KRX_CLIENTE_T_KRX_USUARIO_FK FOREIGN KEY
    (
     id_usuario
    )
    REFERENCES T_KRX_USUARIO
    (
     id_usuario
    )
;

ALTER TABLE T_KRX_CONTA
    ADD CONSTRAINT T_KRX_CONTA_T_KRX_CLIENTE_FK FOREIGN KEY
    (
     id_cliente
    )
    REFERENCES T_KRX_CLIENTE
    (
     id_cliente
    )
;

ALTER TABLE T_KRX_TRANSACAO
    ADD CONSTRAINT TRANSACAO_CONTA_FK FOREIGN KEY
    (
     id_conta
    )
    REFERENCES T_KRX_CONTA
    (
     id_conta
    )
;

ALTER TABLE T_KRX_TRANSACAO
    ADD CONSTRAINT TRANSACAO_CONTA_DESTINO_FK FOREIGN KEY
    (
     id_conta_destino
    )
    REFERENCES T_KRX_CONTA
    (
     id_conta
    )
;





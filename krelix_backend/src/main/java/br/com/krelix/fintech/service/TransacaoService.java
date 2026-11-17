package br.com.krelix.fintech.service;

import br.com.krelix.fintech.model.Conta;
import br.com.krelix.fintech.model.Transacao;
import br.com.krelix.fintech.repository.TransacaoRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TransacaoService {

    @Autowired
    private TransacaoRepository transacaoRepository;

    @Autowired
    private ContaService contaService;

    @Transactional
    public Transacao criar(Transacao transacao) {
        transacao.setId(null);
        return salvar(transacao);
    }

    private Transacao salvar(Transacao transacao) {
        if (transacao.getValor() == null || transacao.getValor().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O valor deve ser maior que zero");
        }
        if (transacao.getDescricao() != null && transacao.getDescricao().length() > 200) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A descricao deve ter no maximo 200 caracteres");
        }
        if (transacao.getConta() == null || transacao.getConta().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe a conta de origem");
        }
        if ("DEPOSITO".equals(transacao.getTipo())) {
            return depositar(transacao);
        }
        if ("TRANSFERENCIA".equals(transacao.getTipo())) {
            return transferir(transacao);
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de transacao invalido");
    }

    public Transacao buscarPorId(Long id) {
        return transacaoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transacao nao encontrada"));
    }

    public List<Transacao> buscarTodos() {
        return transacaoRepository.findAll();
    }

    private Transacao depositar(Transacao transacao) {
        Conta conta = contaService.buscarPorId(transacao.getConta().getId());

        conta.setSaldo(conta.getSaldo().add(transacao.getValor()));

        contaService.salvar(conta);

        transacao.setContaDestino(null);
        transacao.setConta(conta);

        return transacaoRepository.save(transacao);
    }

    private Transacao transferir(Transacao transacao) {

        if (transacao.getContaDestino() == null || transacao.getContaDestino().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe a conta destino");
        }

        Long idOrigem = transacao.getConta().getId();
        Long idDestino = transacao.getContaDestino().getId();
        if (idOrigem.equals(idDestino)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Origem e destino devem ser contas diferentes");
        }

        Conta origem = contaService.buscarPorId(idOrigem);
        Conta destino = contaService.buscarPorId(idDestino);

        BigDecimal valor = transacao.getValor();

        if (origem.getSaldo().compareTo(valor) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Saldo insuficiente");
        }

        origem.setSaldo(origem.getSaldo().subtract(valor));
        destino.setSaldo(destino.getSaldo().add(valor));

        contaService.salvar(origem);
        contaService.salvar(destino);

        transacao.setConta(origem);
        transacao.setContaDestino(destino);

        return transacaoRepository.save(transacao);

    }

}
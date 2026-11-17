package br.com.krelix.fintech.service;

import br.com.krelix.fintech.model.Conta;
import br.com.krelix.fintech.repository.ContaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ContaService {

    @Autowired

    private ContaRepository contaRepository;


    public Conta salvar(Conta conta) {
        try {
            return contaRepository.save(conta);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Agencia e conta ja cadastradas ou dados invalidos");
        }
    }

    public Conta criar(Conta conta) {
        conta.setId(null);
        conta.setSaldo(BigDecimal.ZERO);
        return salvar(conta);

    }

    public Conta buscarPorId(Long id) {
        return contaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta não encontrada"));
    }

    public List<Conta> buscarTodos() {
        return contaRepository.findAll();
    }

    public void excluir(Long id) {
        buscarPorId(id);
        try{
            contaRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Conta possui transacoes e nao pode ser excluida");
        }
    }

    public Conta atualizar(Long id, Conta conta) {
        Conta atual = buscarPorId(id);

        atual.setTipo(conta.getTipo());
        atual.setAgencia(conta.getAgencia());
        atual.setNumero(conta.getNumero());
        atual.setLimiteDisponivel(conta.getLimiteDisponivel());

        return salvar(atual);

    }
}

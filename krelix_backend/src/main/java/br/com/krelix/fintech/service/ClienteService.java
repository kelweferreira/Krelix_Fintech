package br.com.krelix.fintech.service;

import br.com.krelix.fintech.model.Cliente;
import br.com.krelix.fintech.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ClienteService {

    @Autowired

    private ClienteRepository clienteRepository;

    public Cliente salvar(Cliente cliente) {
        try {
            return clienteRepository.save(cliente);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF ja cadastrado ou dados invalidos");
        }

    }

    public Cliente criar(Cliente cliente) {
        cliente.setId(null);
        return salvar(cliente);
    }

    public Cliente buscarPorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado"));
    }

    public List<Cliente> buscarTodos() {
        return clienteRepository.findAll();
    }

    public void excluir(Long id) {
        buscarPorId(id);

        try {
            clienteRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cliente possui contas e não pode ser excluido");
        }

    }

    public Cliente atualizar(Long id, Cliente cliente) {
        Cliente atual = buscarPorId(id);

        atual.setNomeCompleto(cliente.getNomeCompleto());
        atual.setCpf(cliente.getCpf());
        atual.setTelefone(cliente.getTelefone());
        atual.setDataNascimento(cliente.getDataNascimento());

        return salvar(atual);
    }


}

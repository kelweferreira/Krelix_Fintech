package br.com.krelix.fintech.controller;

import br.com.krelix.fintech.model.Transacao;
import br.com.krelix.fintech.service.TransacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transacoes")
@CrossOrigin(origins = "http://localhost:5173")
public class TransacaoController {

    @Autowired
    private TransacaoService transacaoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Transacao criar(@RequestBody Transacao transacao) {
        return transacaoService.criar(transacao);
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public Transacao buscarPorId(@PathVariable Long id) {
        return transacaoService.buscarPorId(id);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<Transacao> buscarTodos() {
        return transacaoService.buscarTodos();
    }
}

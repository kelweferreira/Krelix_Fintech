package br.com.krelix.fintech.controller;

import br.com.krelix.fintech.model.Conta;
import br.com.krelix.fintech.service.ContaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contas")
@CrossOrigin(origins = "http://localhost:5173")
public class ContaController {

    @Autowired
    private ContaService contaService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Conta criar(@RequestBody Conta conta) {
        return contaService.criar(conta);
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public Conta buscarPorId(@PathVariable Long id) {
        return contaService.buscarPorId(id);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<Conta> buscarTodos() {
        return contaService.buscarTodos();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        contaService.excluir(id);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public Conta atualizar(@PathVariable Long id, @RequestBody Conta conta) {
        return contaService.atualizar(id, conta);
    }

}

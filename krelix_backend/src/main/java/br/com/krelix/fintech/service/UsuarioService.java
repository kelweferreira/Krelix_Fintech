package br.com.krelix.fintech.service;

import br.com.krelix.fintech.model.Usuario;
import br.com.krelix.fintech.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;


@Service
public class UsuarioService {

    @Autowired

    private UsuarioRepository usuarioRepository;

    public Usuario salvar(Usuario usuario) {
        try {
            return usuarioRepository.save(usuario);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Dados invalidos ou e-mail já cadastrado");
        }
    }

    public Usuario criar(Usuario usuario) {
        usuario.setId(null);
        return salvar(usuario);
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario não encontrado"));

    }


    public List<Usuario> buscarTodos() {
        return usuarioRepository.findAll();
    }

    public void excluir(Long id) {
        buscarPorId(id);

        try {
            usuarioRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Usuario possui cliente vinculado e não pode ser excluido");
        }

    }

    public Usuario atualizar(Long id, Usuario usuario) {

        Usuario atual = buscarPorId(id);

        atual.setNome(usuario.getNome());
        atual.setEmail(usuario.getEmail());
        atual.setTipo(usuario.getTipo());

        if (usuario.getSenha() != null && !usuario.getSenha().isBlank()) {
            atual.setSenha(usuario.getSenha());
        }

        return salvar(atual);

    }

    public Usuario login(String email, String senha) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha invalidos"));

        if (!usuario.getSenha().equals(senha)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha invalidos");
        }

        return usuario;
    }
}

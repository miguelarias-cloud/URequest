package dao;

import modelo.Usuario;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class UsuarioDAOMemoria implements UsuarioDAO {
    private final List<Usuario> usuarios = new ArrayList<>();
    private int secuenciaId = 1;

    @Override
    public Usuario guardar(Usuario usuario) {
        usuario.setId(secuenciaId++);
        usuarios.add(usuario);
        return usuario;
    }

    @Override
    public Optional<Usuario> buscarPorCorreo(String correo) {
        return usuarios.stream()
                .filter(usuario -> usuario.getCorreoInstitucional().equalsIgnoreCase(correo))
                .findFirst();
    }

    @Override
    public Optional<Usuario> buscarPorId(int id) {
        return usuarios.stream()
                .filter(usuario -> usuario.getId() == id)
                .findFirst();
    }
}

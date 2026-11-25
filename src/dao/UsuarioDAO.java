package dao;

import modelo.Usuario;
import java.util.Optional;

public interface UsuarioDAO {
    Usuario guardar(Usuario usuario);
    Optional<Usuario> buscarPorCorreo(String correo);
    Optional<Usuario> buscarPorId(int id);
}

package servicio;

import dao.UsuarioDAO;
import modelo.Usuario;
import java.util.Optional;

public class AuthService {
    private static final String DOMINIO_PERMITIDO = ".edu.co";
    private final UsuarioDAO usuarioDAO;

    public AuthService(UsuarioDAO usuarioDAO) {
        this.usuarioDAO = usuarioDAO;
    }

    public Usuario registrar(String nombre, String correo, String password, String telefono, String carrera) {
        if (correo == null || !correo.toLowerCase().endsWith(DOMINIO_PERMITIDO)) {
            throw new IllegalArgumentException(
                    "Debes usar un correo institucional válido (" + DOMINIO_PERMITIDO + ").");
        }
        if (usuarioDAO.buscarPorCorreo(correo).isPresent()) {
            throw new IllegalArgumentException("El correo ya está registrado en el sistema.");
        }
        if (password == null || password.length() < 6) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres.");
        }

        Usuario nuevo = new Usuario(0, nombre, correo, password, telefono, carrera);
        return usuarioDAO.guardar(nuevo);
    }

    public Optional<Usuario> iniciarSesion(String correo, String password) {
        if (correo == null || password == null) {
            return Optional.empty();
        }
        return usuarioDAO.buscarPorCorreo(correo)
                .filter(usuario -> usuario.getPassword().equals(password));
    }
}

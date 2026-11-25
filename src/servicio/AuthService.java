package servicio;

import dao.UsuarioDAO;
import modelo.Usuario;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Locale;
import java.util.Optional;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

public class AuthService {
    private static final String DOMINIO_PERMITIDO = "@autonoma.edu.co";
    private static final int ITERACIONES_HASH = 150000;
    private static final int LONGITUD_HASH_BITS = 256;
    private final SecureRandom random = new SecureRandom();
    private final UsuarioDAO usuarioDAO;

    public AuthService(UsuarioDAO usuarioDAO) {
        this.usuarioDAO = usuarioDAO;
    }

    public Usuario registrar(String nombre, String correo, String password, String telefono, String carrera) {
        String correoNormalizado = correo == null ? "" : correo.trim().toLowerCase(Locale.ROOT);
        if (!correoNormalizado.matches("^[a-z0-9._%+-]+@autonoma\\.edu\\.co$")) {
            throw new IllegalArgumentException(
                    "Debes usar un correo institucional válido (" + DOMINIO_PERMITIDO + ").");
        }
        if (usuarioDAO.buscarPorCorreo(correoNormalizado).isPresent()) {
            throw new IllegalArgumentException("El correo ya está registrado en el sistema.");
        }
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 8 caracteres.");
        }

        byte[] salt = new byte[16];
        random.nextBytes(salt);
        String saltCodificada = Base64.getEncoder().encodeToString(salt);
        String passwordHash = derivarHash(password, salt);
        Usuario nuevo = new Usuario(0, nombre, correoNormalizado,
                passwordHash, saltCodificada, telefono, carrera);
        return usuarioDAO.guardar(nuevo);
    }

    public Optional<Usuario> iniciarSesion(String correo, String password) {
        if (correo == null || password == null) {
            return Optional.empty();
        }
        return usuarioDAO.buscarPorCorreo(correo.trim().toLowerCase(Locale.ROOT))
                .filter(usuario -> verificarPassword(password, usuario));
    }

    private boolean verificarPassword(String password, Usuario usuario) {
        byte[] salt = Base64.getDecoder().decode(usuario.getPasswordSalt());
        byte[] hashEsperado = Base64.getDecoder().decode(usuario.getPasswordHash());
        byte[] hashIngresado = Base64.getDecoder().decode(derivarHash(password, salt));
        return MessageDigest.isEqual(hashEsperado, hashIngresado);
    }

    private String derivarHash(String password, byte[] salt) {
        PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, ITERACIONES_HASH, LONGITUD_HASH_BITS);
        try {
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            return Base64.getEncoder().encodeToString(factory.generateSecret(spec).getEncoded());
        } catch (GeneralSecurityException error) {
            throw new IllegalStateException("No se pudo proteger la contraseña.", error);
        } finally {
            spec.clearPassword();
        }
    }
}

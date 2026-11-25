package servicio;

import dao.AnuncioDAO;
import modelo.Anuncio;
import modelo.PuntoRuta;
import modelo.TipoAnuncio;
import modelo.Usuario;
import java.util.List;

public class AnuncioService {
    private final AnuncioDAO anuncioDAO;

    public AnuncioService(AnuncioDAO anuncioDAO) {
        this.anuncioDAO = anuncioDAO;
    }

    public Anuncio publicarAnuncio(String titulo, TipoAnuncio tipo, String descripcion,
            String contacto, List<PuntoRuta> ruta, Usuario autor) {
        if (autor == null) {
            throw new IllegalStateException("Debes iniciar sesión para publicar un anuncio.");
        }
        if (tipo == null) {
            throw new IllegalArgumentException("Debes seleccionar el tipo de anuncio.");
        }
        if (titulo == null || titulo.isBlank() || descripcion == null || descripcion.isBlank()) {
            throw new IllegalArgumentException("El título y la descripción son obligatorios.");
        }
        if (!esContactoValido(contacto)) {
            throw new IllegalArgumentException("El contacto debe ser un correo válido o un teléfono de 7 a 15 dígitos.");
        }

        List<PuntoRuta> rutaAnuncio = ruta == null ? List.of() : ruta;
        if (tipo == TipoAnuncio.TRANSPORTE && rutaAnuncio.size() < 2) {
            throw new IllegalArgumentException("Un anuncio de transporte requiere al menos dos puntos de ruta.");
        }
        if (tipo != TipoAnuncio.TRANSPORTE && !rutaAnuncio.isEmpty()) {
            throw new IllegalArgumentException("Solo los anuncios de transporte pueden incluir una ruta.");
        }

        Anuncio nuevo = new Anuncio(0, titulo, descripcion, tipo, contacto.trim(), autor, rutaAnuncio);
        return anuncioDAO.guardar(nuevo);
    }

    public List<Anuncio> obtenerTodosLosAnuncios() {
        return anuncioDAO.listarActivos();
    }

    public List<Anuncio> filtrarPorTipo(TipoAnuncio tipo) {
        return anuncioDAO.buscarPorTipo(tipo);
    }

    public void cerrarAnuncio(int idAnuncio, Usuario usuarioSolicitante) {
        if (usuarioSolicitante == null) {
            throw new SecurityException("Debes iniciar sesión para cerrar un anuncio.");
        }

        Anuncio anuncio = anuncioDAO.buscarPorId(idAnuncio)
                .orElseThrow(() -> new IllegalArgumentException("Anuncio no encontrado."));

        if (anuncio.getAutor().getId() != usuarioSolicitante.getId()) {
            throw new SecurityException("No tienes permiso para eliminar un anuncio de otro usuario.");
        }

        anuncioDAO.eliminar(idAnuncio);
    }

    private boolean esContactoValido(String contacto) {
        if (contacto == null || contacto.isBlank()) {
            return false;
        }
        String valor = contacto.trim();
        if (valor.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return true;
        }
        long digitos = valor.chars().filter(Character::isDigit).count();
        return digitos >= 7 && digitos <= 15;
    }
}

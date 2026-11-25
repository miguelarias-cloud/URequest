package servicio;

import dao.AnuncioDAO;
import modelo.Anuncio;
import modelo.Usuario;
import java.util.List;

public class AnuncioService {
    private final AnuncioDAO anuncioDAO;

    public AnuncioService(AnuncioDAO anuncioDAO) {
        this.anuncioDAO = anuncioDAO;
    }

    public Anuncio publicarAnuncio(String titulo, String descripcion, String categoria, double precio, Usuario autor) {
        if (autor == null) {
            throw new IllegalStateException("Debes iniciar sesión para publicar un anuncio.");
        }
        if (titulo == null || titulo.isBlank() || descripcion == null || descripcion.isBlank()) {
            throw new IllegalArgumentException("El título y la descripción son obligatorios.");
        }
        if (precio < 0) {
            throw new IllegalArgumentException("El precio no puede ser negativo.");
        }

        Anuncio nuevo = new Anuncio(0, titulo, descripcion, categoria, precio, autor);
        return anuncioDAO.guardar(nuevo);
    }

    public List<Anuncio> obtenerTodosLosAnuncios() {
        return anuncioDAO.listarActivos();
    }

    public List<Anuncio> filtrarPorCategoria(String categoria) {
        return anuncioDAO.buscarPorCategoria(categoria);
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
}

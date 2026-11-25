package dao;

import modelo.Anuncio;
import java.util.List;
import java.util.Optional;

public interface AnuncioDAO {
    Anuncio guardar(Anuncio anuncio);
    List<Anuncio> listarActivos();
    List<Anuncio> buscarPorCategoria(String categoria);
    Optional<Anuncio> buscarPorId(int id);
    boolean eliminar(int id);
}

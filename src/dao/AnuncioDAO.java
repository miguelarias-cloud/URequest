package dao;

import modelo.Anuncio;
import modelo.TipoAnuncio;
import java.util.List;
import java.util.Optional;

public interface AnuncioDAO {
    Anuncio guardar(Anuncio anuncio);
    List<Anuncio> listarActivos();
    List<Anuncio> buscarPorTipo(TipoAnuncio tipo);
    Optional<Anuncio> buscarPorId(int id);
    boolean eliminar(int id);
}

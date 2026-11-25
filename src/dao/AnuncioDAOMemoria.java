package dao;

import modelo.Anuncio;
import modelo.TipoAnuncio;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class AnuncioDAOMemoria implements AnuncioDAO {
    private final List<Anuncio> anuncios = new ArrayList<>();
    private int secuenciaId = 1;

    @Override
    public Anuncio guardar(Anuncio anuncio) {
        anuncio.setId(secuenciaId++);
        anuncios.add(anuncio);
        return anuncio;
    }

    @Override
    public List<Anuncio> listarActivos() {
        return anuncios.stream()
                .filter(Anuncio::isActivo)
                .collect(Collectors.toList());
    }

    @Override
    public List<Anuncio> buscarPorTipo(TipoAnuncio tipo) {
        return anuncios.stream()
                .filter(anuncio -> anuncio.isActivo()
                        && anuncio.getTipo() == tipo)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Anuncio> buscarPorId(int id) {
        return anuncios.stream()
                .filter(anuncio -> anuncio.getId() == id)
                .findFirst();
    }

    @Override
    public boolean eliminar(int id) {
        return buscarPorId(id).map(anuncio -> {
            anuncio.setActivo(false);
            return true;
        }).orElse(false);
    }
}

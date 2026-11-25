import dao.AnuncioDAO;
import dao.AnuncioDAOMemoria;
import dao.UsuarioDAO;
import dao.UsuarioDAOMemoria;
import modelo.Anuncio;
import modelo.PuntoRuta;
import modelo.TipoAnuncio;
import modelo.Usuario;
import servicio.AnuncioService;
import servicio.AuthService;
import java.util.Arrays;
import java.util.Collections;

public class Main {
    public static void main(String[] args) {
        UsuarioDAO usuarioDAO = new UsuarioDAOMemoria();
        AnuncioDAO anuncioDAO = new AnuncioDAOMemoria();

        AuthService authService = new AuthService(usuarioDAO);
        AnuncioService anuncioService = new AnuncioService(anuncioDAO);

        Usuario laura = authService.registrar(
                "Laura Gómez", "laura.gomez@autonoma.edu.co", "clave123", "573001234567", "Ingeniería");
        Usuario carlos = authService.registrar(
                "Carlos Ruiz", "carlos.ruiz@autonoma.edu.co", "clave456", "", "Diseño");

        anuncioService.publicarAnuncio(
                "Libro Cálculo Vectorial", TipoAnuncio.PRODUCTO,
                "En buen estado, entrega en el campus.", laura.getCorreoInstitucional(),
                Collections.emptyList(), laura);
        anuncioService.publicarAnuncio(
                "Cupo en carro hacia el centro", TipoAnuncio.TRANSPORTE,
                "Salgo a las 6:00 PM desde portería.", carlos.getCorreoInstitucional(),
                Arrays.asList(new PuntoRuta(3.4516, -76.5320), new PuntoRuta(3.4372, -76.5225)), carlos);

        for (Anuncio anuncio : anuncioService.obtenerTodosLosAnuncios()) {
            System.out.println("Título: " + anuncio.getTitulo() + " | Autor: " + anuncio.getAutor().getNombre());
            System.out.println("URL Botón Contacto: " + anuncio.generarEnlaceContactoDirecto());
            System.out.println("--------------------------------------------------");
        }
    }
}

package modelo;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Anuncio {
    private int id;
    private String titulo;
    private String descripcion;
    private TipoAnuncio tipo;
    private String contacto;
    private boolean activo;
    private final LocalDateTime fechaPublicacion;
    private final Usuario autor;
    private final List<PuntoRuta> ruta;

    public Anuncio(int id, String titulo, String descripcion, TipoAnuncio tipo,
            String contacto, Usuario autor, List<PuntoRuta> ruta) {
        this.id = id;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.tipo = tipo;
        this.contacto = contacto;
        this.activo = true;
        this.fechaPublicacion = LocalDateTime.now();
        this.autor = autor;
        this.ruta = Collections.unmodifiableList(new ArrayList<>(ruta == null
                ? Collections.emptyList()
                : ruta));
    }

    public String generarEnlaceContactoDirecto() {
        if (contacto != null && contacto.contains("@")) {
            String asunto = URLEncoder.encode("Interés en: " + titulo, StandardCharsets.UTF_8);
            return "mailto:" + contacto + "?subject=" + asunto;
        }

        String numeroLimpio = contacto == null ? "" : contacto.replaceAll("[^0-9+]", "");
        return "tel:" + numeroLimpio;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public TipoAnuncio getTipo() {
        return tipo;
    }

    public void setTipo(TipoAnuncio tipo) {
        this.tipo = tipo;
    }

    public String getContacto() {
        return contacto;
    }

    public void setContacto(String contacto) {
        this.contacto = contacto;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public LocalDateTime getFechaPublicacion() {
        return fechaPublicacion;
    }

    public Usuario getAutor() {
        return autor;
    }

    public List<PuntoRuta> getRuta() {
        return ruta;
    }
}

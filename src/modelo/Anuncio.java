package modelo;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

public class Anuncio {
    private int id;
    private String titulo;
    private String descripcion;
    private String categoria;
    private double precio;
    private boolean activo;
    private final LocalDateTime fechaPublicacion;
    private final Usuario autor;

    public Anuncio(int id, String titulo, String descripcion, String categoria, double precio, Usuario autor) {
        this.id = id;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.categoria = categoria;
        this.precio = precio;
        this.activo = true;
        this.fechaPublicacion = LocalDateTime.now();
        this.autor = autor;
    }

    public String generarEnlaceContactoDirecto() {
        if (autor.getTelefono() != null && !autor.getTelefono().isBlank()) {
            String numeroLimpio = autor.getTelefono().replaceAll("[^0-9]", "");
            String mensaje = "Hola " + autor.getNombre() + ", vi tu anuncio '" + titulo
                    + "' en la plataforma de la universidad.";
            return "https://wa.me/" + numeroLimpio + "?text="
                    + URLEncoder.encode(mensaje, StandardCharsets.UTF_8);
        }

        String asunto = URLEncoder.encode("Interés en: " + titulo, StandardCharsets.UTF_8);
        return "mailto:" + autor.getCorreoInstitucional() + "?subject=" + asunto;
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

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public double getPrecio() {
        return precio;
    }

    public void setPrecio(double precio) {
        this.precio = precio;
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
}

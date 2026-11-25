package modelo;

public class Usuario {
    private int id;
    private String nombre;
    private String correoInstitucional;
    private String password;
    private String telefono;
    private String carrera;

    public Usuario(int id, String nombre, String correoInstitucional, String password, String telefono, String carrera) {
        this.id = id;
        this.nombre = nombre;
        this.correoInstitucional = correoInstitucional;
        this.password = password;
        this.telefono = telefono;
        this.carrera = carrera;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCorreoInstitucional() {
        return correoInstitucional;
    }

    public void setCorreoInstitucional(String correoInstitucional) {
        this.correoInstitucional = correoInstitucional;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getCarrera() {
        return carrera;
    }

    public void setCarrera(String carrera) {
        this.carrera = carrera;
    }
}

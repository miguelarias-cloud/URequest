package modelo;

public class Usuario {
    private int id;
    private String nombre;
    private String correoInstitucional;
    private String passwordHash;
    private String passwordSalt;
    private String telefono;
    private String carrera;

    public Usuario(int id, String nombre, String correoInstitucional, String passwordHash,
            String passwordSalt, String telefono, String carrera) {
        this.id = id;
        this.nombre = nombre;
        this.correoInstitucional = correoInstitucional;
        this.passwordHash = passwordHash;
        this.passwordSalt = passwordSalt;
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

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getPasswordSalt() {
        return passwordSalt;
    }

    public void setPasswordSalt(String passwordSalt) {
        this.passwordSalt = passwordSalt;
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

# URequest
En este espacio realizaremos el proyecto de Ingeniería de software I, en el cual nuestro trabajo será realizar una pagina en la que los estudiantes, directivos y personas de la universidad, puedan compartir distintos productos para vender a otros estudiantes que los necesiten.

## Prototipo local

Abre `auth.html` desde un servidor local (por ejemplo, Live Server en VS Code). Crea una cuenta con un correo terminado en `@autonoma.edu.co` y luego publica desde la página principal.

Las cuentas y los anuncios se guardan en el almacenamiento local del navegador: no se usa MySQL ni se sincroniza entre dispositivos. El registro solo valida el formato del correo y no verifica que la cuenta pertenezca a la universidad, por lo que este prototipo no debe usarse como autenticación de producción.

Los mapas de transporte usan Leaflet y OpenStreetMap, por lo que requieren conexión a internet. Los puntos del recorrido se conectan con líneas rectas y no se ajustan automáticamente a las calles.

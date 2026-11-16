/*guardamos los elementos del HTML para manipularlos*/
const ventana = document.getElementById('ventana');
const abrir = document.getElementById('abrir');
const cerrar = document.getElementById('cerrar');
const desc = document.getElementById('desc');
const contador = document.getElementById('contador');

/*Esto abre y cierra la ventana al pulsar los botones correspondientes*/
abrir.onclick = () => ventana.showModal();
cerrar.onclick = () => ventana.close();
/*Se detecta si se hizo click por fuera de la ventana cerrandola*/
ventana.onclick = (e) => {
    if (e.target === ventana) ventana.close();
};
/*Actualiza el contador de letras al escribir en el cuadro de descripcion*/
desc.oninput = () => {
    contador.textContent = `${desc.value.length}/500`;
};
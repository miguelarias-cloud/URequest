

const btn_cierre_menu_desplegable=document.getElementById("btn_cierre_menu_desplegable");
const btn_menu_desplegable=document.getElementById("boton_menu_desplegable");


btn_menu_desplegable.addEventListener("click", 
    function (){
            document.getElementById("menu_desplegable").style.right="0px";
            document.getElementById("capa_superior").style.backgroundColor="rgba(136, 139, 141,0.4)";
    }
);

btn_cierre_menu_desplegable.addEventListener("click", 
    function (){
        document.getElementById("menu_desplegable").style.right="-500px";
        document.getElementById("capa_superior").style.backgroundColor="rgba(136, 139, 141,0)";
        }
);


const ventana = document.getElementById('ventana');
const crear_anuncio = document.getElementById('btn_crear_anuncio');
const cerrar = document.getElementById('cerrar');
const desc = document.getElementById('desc');
const contador = document.getElementById('contador');

/*Esto abre y cierra la ventana al pulsar los botones correspondientes*/
crear_anuncio.onclick = () => ventana.showModal();
cerrar.onclick = () => ventana.close();
/*Se detecta si se hizo click por fuera de la ventana cerrandola*/
ventana.onclick = (e) => {
    if (e.target === ventana) ventana.close();
};
/*Actualiza el contador de letras al escribir en el cuadro de descripcion*/
desc.oninput = () => {
    contador.textContent = `${desc.value.length}/500`;
};
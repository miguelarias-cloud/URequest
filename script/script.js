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
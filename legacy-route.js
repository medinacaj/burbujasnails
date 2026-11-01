/* Recuperación para URLs comerciales antiguas de GitHub Pages.
   La respuesta HTTP sigue siendo 404: una redirección 301 auténtica requiere reglas del CDN. */
"use strict";
(()=>{
 const legacy=new Set(["/servicios.html","/cejas-concepcion.html"]);
 if(legacy.has(window.location.pathname.toLowerCase()))window.location.replace("/#servicios");
})();

# El bosque de crochet

Catálogo público en español para GitHub Pages. La colección inicial reúne 92 fichas en 9 categorías y conserva las fotografías y agrupaciones originales. Las favoritas y las notas personales se guardan en cada navegador.

## Vista previa

Desde la carpeta que contiene index.html, ejecuta:

    python -m http.server 8000 --bind 127.0.0.1

Abre http://127.0.0.1:8000/ en el navegador. Con config.js vacío se puede explorar el catálogo completo y el acceso al taller aparece pendiente de configurar.

## Activar el taller

1. Crea o selecciona un proyecto de Supabase. En Authentication → Users, crea la cuenta de la administradora con su correo y contraseña. Copia su UUID. Desactiva el registro público en Authentication y conserva habilitado el inicio de sesión por correo y contraseña.
2. En una copia de supabase/setup.sql, sustituye el UUID de ejemplo por el UUID de esa cuenta y ejecuta el archivo completo en el SQL Editor. Activa la Data API para el esquema public si el proyecto la tiene desactivada.
3. Completa SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY en config.js con la URL del proyecto y la clave publicable (sb_publishable_…). El repositorio es público. Guarda la contraseña y cualquier clave secreta fuera del repositorio.
4. Prueba primero con una rama de revisión y luego incorpora los cambios a main en bosquecrochet/bosquecrochet.github.io, donde se publica GitHub Pages.
5. Antes de dar por activo el cambio, comprueba con la cuenta de la administradora que se puede publicar una pieza de prueba con una foto y un vídeo, editarla y retirarla. Revisa en una ventana sin sesión que la pieza publicada se puede leer, que las herramientas de edición no aparecen y que la escritura se rechaza para el rol anon y una cuenta autenticada ajena al taller.

Las reglas de Supabase conceden lectura pública del catálogo y reservan la escritura y la subida a las cuentas autorizadas por UUID. El catálogo utiliza una revisión para evitar que dos ediciones simultáneas se sobrescriban. El componente de navegador de Supabase está incluido en vendor/ con su licencia.

## Recuperar cambios guardados en la web anterior

Si tu madre añadió o editó piezas en el navegador anterior, abre la nueva web en la misma dirección, con el mismo navegador y perfil. Desde Acceso al taller, pulsa Importar cambios de este navegador antes de realizar la primera edición en Supabase. Ese botón aparece cuando se detectan datos de la galería anterior y el catálogo compartido todavía está en su revisión inicial. La confirmación indica cuántas piezas se van a publicar. Se importan altas, cambios, categorías y elementos retirados. Las notas y favoritas siguen siendo locales.

## Archivos

Se admiten fotos JPEG, PNG, WebP y GIF, y vídeos MP4, WebM y MOV de hasta 50 MB por archivo. La reproducción depende del códec, por lo que MP4 con H.264 suele ser la opción más compatible.

Eliminar una pieza la retira de la galería. Los archivos del repositorio y del almacenamiento conservan sus URL públicas. Los archivos subidos en una publicación que no termina pueden quedar en el almacenamiento. Para borrar un archivo cargado, comprueba que ninguna pieza lo referencia y retíralo desde el panel de Storage de Supabase. Para quitar una foto del repositorio público, revisa además el historial de Git.

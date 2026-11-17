# Portada pública y experiencia

La portada de presentación está en `/`. Muestra el propósito de Señal Nativa,
las funciones principales y aves de ejemplo con recursos visuales locales del
repositorio. El botón «Comenzar exploración» lleva a `/app`, donde permanece la
experiencia interactiva existente.

Los QR de estaciones ya impresos usan `/?sn=...`. La entrada detecta ese
parámetro, cambia la ruta a `/app?sn=...` sin recargar y conserva el flujo de
lectura y validación que ya maneja la aplicación. Vercel reescribe `/app` a
`/index.html` para que también funcione al abrir el enlace directamente. El
manifiesto PWA inicia en `/app` y el service worker incluye esa ruta en su
precarga. La portada y la aplicación comparten el mismo origen y almacenamiento
local, por lo que los perfiles existentes no se migran.

La portada es informativa: las fotografías y fichas provienen de los recursos
actuales del proyecto. Las cifras y el contenido científico deben revisarse
con las fuentes del parque antes de presentarlos como información oficial.

## Dirección visual

La presentación sigue una composición de cuaderno de campo: texto directo,
fotografías de aves ya incluidas en la aplicación, pies de imagen y una grilla
editorial. Conserva Fredoka, Plus Jakarta Sans y los verdes y ámbar de la app.
Para la revisión se consultó el estilo `editorial-grid-magazine` del recurso
[UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill);
sus sugerencias genéricas de paleta y tipografías se adaptaron a la identidad
que ya tenía Señal Nativa.

# Experiencia de descubrimiento MindAR

## Objetivo

Hacer que el escaneo de Chingolo, Tucán, Benteveo y Hornero se sienta como un hallazgo en el recorrido del Parque y ofrecer el mismo tipo de desafío para las cuatro aves.

## Diseño

- `targetFound` sigue siendo la fuente del evento. El índice se resuelve a una especie una sola vez por sesión del visor, sin abrir una segunda cámara.
- El guardado existente determina si la especie es nueva para el perfil. Solo un resultado `registered` abre la presentación central; volver a escanear una especie ya guardada no repite el anuncio.
- La presentación usa una tarjeta con arte, nombre, nombre científico y una entrada breve. Intenta reproducir el audio local del ave y siempre ofrece un control para repetirlo si el navegador bloquea el autoplay.
- Al continuar, el usuario accede a una pregunta de opción múltiple específica de esa ave. Completarla entrega una recompensa una sola vez por especie y perfil.
- El estado de descubrimiento y desafío permanece separado del diario de avistamientos reales.
- No se agregan umbrales distintos al detector por especie. La detección lenta del Tucán se compara contra la distribución de puntos del target compilado; si el problema está en la imagen de origen, se requerirá revisar esa imagen y volver a compilar el `.mind`.

## Diagnóstico del Tucán

El código inicializa MindAR con la misma configuración para los cuatro índices. Al decodificar el `.mind`, la primera escala tiene 181 puntos para el Tucán, contra 265 para Chingolo, 232 para Benteveo y 281 para Hornero. Los puntos ocupan 10 de 16 celdas en el Tucán, 13 en Chingolo, 10 en Benteveo y 13 en Hornero. Esto respalda que el target del Tucán tiene menos puntos, aunque la prueba en cámara puede variar con impresión, luz y enfoque. No se ajustan parámetros globales porque afectarían las cuatro aves; para mejorar el target hay que revisar la imagen original y su mapa de puntos y recompilarla.

## Diagnóstico de imagen borrosa

El wrapper A-Frame de MindAR inicia la cámara con `facingMode: environment` pero no fija ancho o alto. El CSS local también sobrescribía las dimensiones calculadas por MindAR con `100% × 100%` y `object-fit: cover`, lo que deformaba y estiraba la imagen al llenar la pantalla vertical. La corrección pide 1280 × 720 como ideal antes de que MindAR inicialice su procesador y permite que MindAR determine las dimensiones visuales manteniendo la proporción. El enfoque continuo queda como optimización opcional si el navegador lo admite.

## Aceptación

1. Un perfil que descubre un ave nueva recibe una presentación central y una oportunidad de escuchar su canto.
2. Un perfil que ya la descubrió no recibe otra presentación ni una segunda recompensa.
3. Los cuatro targets ofrecen una pregunta y guardan el resultado por especie y perfil.
4. El flujo mantiene cámara, guía visual, contraste, controles táctiles y prefers-reduced-motion.
5. Pruebas, lint y build pasan; la prueba física del Tucán se registra como pendiente si no hay cámara y tarjeta impresas disponibles.

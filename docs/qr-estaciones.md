# QR de las estaciones

El circuito del Parque Botánico Municipal Barón Schuel tiene ocho estaciones,
definidas en `CHECKPOINTS_DATA` (`src/data/birdsData.ts`).

## Formato y validación

Cada token tiene el formato `SN1.PBSCHUEL.E0n.CODE`, por ejemplo:

```text
SN1.PBSCHUEL.E01.RJNS4J
```

- `SN1`: versión del formato (`STATION_QR_VERSION`).
- `PBSCHUEL`: identificador del circuito (`STATION_CIRCUIT_ID`).
- `E0n`: número de estación con dos dígitos, de `E01` a `E08`. Solo se aceptan
  los identificadores presentes en `CHECKPOINTS_DATA`.
- `CODE`: seis caracteres calculados de forma determinista. Se aplica FNV-1a
  de 32 bits a `version|circuit|id|seed` (el id numérico, sin `E` ni ceros de
  relleno). Los 30 bits inferiores se representan con el alfabeto base32
  `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, sin `I`, `O`, `0` ni `1`.

Las constantes están en `src/utils/stationQr.ts`. **Cambiar
`STATION_QR_SEED` o el identificador del circuito invalida todos los códigos
impresos anteriores**: hay que regenerar y reemplazar los carteles.

El contenido del QR es una URL:

```text
https://senal-nativa-aves-en-accion.vercel.app/?sn=SN1.PBSCHUEL.E01.RJNS4J
```

El lector acepta el token directo o una URL HTTP(S) con el parámetro `sn`.
Tolera espacios exteriores y mayúsculas/minúsculas del token. No restringe
el host de lectura, para permitir despliegues de prueba. Un número suelto
como `3` o `E03` no valida una estación.

## Seguridad: qué demuestra y qué no

El QR es estático: se puede fotografiar, copiar o compartir. El código es un
hash simple, no una firma criptográfica ni un secreto. **Demuestra pertenencia
al circuito, no presencia física en el lugar.** No hay GPS ni verificación
con backend, por diseño. El progreso y las recompensas son locales al dispositivo;
no son una prueba antifraude y pueden perderse al borrar sus datos.

## Recompensas y práctica

- Se necesita un QR válido **de la estación seleccionada** y una respuesta
  correcta al desafío.
- Cada estación concede **25 XP una sola vez por perfil**. Volver a escanearla
  o responderla no repite la recompensa.
- Al completar las ocho estaciones se obtiene el **Sello de Ruta Completa**
  y se desbloquean **Urutaú y Jote Real**, sin duplicar aves ya desbloqueadas.
- Una respuesta incorrecta muestra la explicación como pista; reintentar
  conserva el QR verificado de esa estación.
- **Modo práctica — no otorga XP ni valida la estación**. Permite repasar
  preguntas y explicaciones sin QR, incluso en estaciones ya completadas.
- Si se detecta otra estación, la app permite ir a ella. Ese token solo sirve
  para esa estación; no valida la seleccionada originalmente.

## Abrir desde la cámara del teléfono

1. La cámara nativa lee el cartel y abre la URL de la app.
2. Al iniciar, la app valida `sn`, guarda el token en `localStorage` con la
   clave `senial_nativa_pending_station_v1` y quita `sn` de la URL, conservando
   los demás parámetros. Los tokens inválidos se ignoran.
   Los QR impresos que apuntan a `/?sn=...` siguen abriendo la experiencia:
   la entrada cambia la ruta a `/app?sn=...` antes de montar la aplicación.
3. El token pendiente sobrevive a la bienvenida, selección y creación de perfil.
   Tanto «Continuar» de un perfil que regresa como el recorrido de un perfil
   nuevo llegan al hub (`screen4`).
4. En el hub se abre el mapa en la estación reconocida; al consumir el token
   inicial se elimina el pendiente. Si ya estaba completada, se informa sin XP.

**Abrir un enlace nunca concede XP por sí solo.** Se debe responder el desafío.
La persistencia requiere que el navegador permita `localStorage`.

## Regenerar carteles

Con las dependencias instaladas (el repositorio usa `bun.lock`):

```sh
bun install
PUBLIC_APP_URL=https://mi-despliegue.example npm run qr:generate
```

Sin `PUBLIC_APP_URL` se usa
`https://senal-nativa-aves-en-accion.vercel.app`. El generador exige un origen
HTTP(S) público, sin credenciales, ruta adicional, parámetros ni fragmento.
Rechaza `localhost`, direcciones privadas/loopback y hosts que resuelvan a ellas.
**La comprobación DNS necesita red, también con el dominio predeterminado**:
si falla la resolución, la generación falla; no se omite esa comprobación.
Los archivos ya generados permanecen disponibles para imprimir sin conexión.

Salida determinista, sin marcas de tiempo, en `public/qr/estaciones/`:

- `estacion-0N-<slug>.svg`: tarjeta vertical de proporciones A6, encabezado,
  distintivo de número, nombre, QR vectorial, instrucción y token.
- `estacion-0N-<slug>-qr.png`: QR de 1200 × 1200 píxeles con margen blanco.
- `manifest.json`: id, nombre, token, URL y nombres de archivos por estación.

Se generan ocho SVG, ocho PNG y un manifiesto. La corrección de errores es
nivel Q. Para imprimir: **lado del QR de al menos 4 cm**, soporte mate,
alto contraste y margen blanco intacto. No deformar ni escalar de forma no
proporcional. Probar una impresión con un teléfono antes de colocar todos
los carteles.

`VITE_PUBLIC_APP_URL` configura la URL usada por `buildStationQrUrl` en la app
al compilar con Vite; tiene el mismo dominio de producción como valor por
defecto. No sustituye a `PUBLIC_APP_URL`, que es la variable del generador.
Usar valores coherentes al imprimir para otro despliegue.

## Lectores, cámara y fotos

`src/utils/qrScanner.ts` usa `BarcodeDetector` solo si está disponible y
`getSupportedFormats()` incluye `qr_code`. Si no, o si falla durante la lectura,
usa **jsQR incluido estáticamente en el bundle principal**. No depende de una
descarga dinámica del lector. En iOS/Firefox, donde `BarcodeDetector` puede no
estar disponible, se usa jsQR.

La cámara trasera se solicita primero mediante `requestMobileCameraStream`.
El bucle evita decodificaciones simultáneas, limita la frecuencia y deduplica
lecturas. Se liberan el bucle y todas las pistas al reconocer un código,
cerrar, cambiar de modo o desmontar el desafío. «Elegir foto con un QR» sí
decodifica la imagen: intenta el lector disponible y también jsQR a tamaños
reducidos para fotos grandes. Una foto sin QR no valida nada.

La cámara requiere contexto seguro (normalmente HTTPS) y permiso del usuario.
iOS Safari y las PWA instaladas pueden tener particularidades de permisos;
puede ser necesario habilitarlos de nuevo o usar una foto.

### Atrás y Escape

El desafío está dentro del modal de mapa. `App.tsx` identifica el mapa con
`activeModalId = 'map'`; ante `popstate`, `closeAllModals()` pone
`showMapModal` en `false`. `TrailMapModal` deja de renderizar sus hijos y
`StationChallengeModal` se desmonta. Sus limpiezas llaman a `release()`:
se cancela el bucle, se paran las pistas y se descarta cualquier apertura
de cámara pendiente. Por eso Atrás cierra al menos el mapa y libera la cámara.
Escape cierra el desafío o modal activo con la misma limpieza.

## Uso sin conexión: alcance real

Verificado en `public/sw.js` y en la salida de `npm run build`:

- jsQR se importa estáticamente y queda dentro del chunk principal
  `dist/assets/index-<hash>.js` (no hay un chunk separado del lector).
- El Service Worker precarga `/`, `/index.html` y una lista de recursos
  explícitos. **Esa lista no incluye los bundles Vite con hash**.
- Para navegación usa red primero, con respaldo del HTML en caché. Para
  recursos de producción, incluido `/assets/index-<hash>.js`, usa red primero
  y guarda respuestas HTTP 200 `basic`/`cors` en caché durante su uso; si la
  red falla busca la petición en caché.
- Tras una visita online con el Service Worker activo y los recursos ya
  cargados/cacheados, el lector jsQR, la validación y el progreso local pueden
  funcionar offline. No se consulta un servidor para validar ni premiar.

**La primera visita debe ser online**: un dispositivo que nunca cargó la app
no puede usarla sin conexión. Una sola carga inicial no garantiza que los
bundles hayan pasado por un Service Worker ya activo; conviene volver a abrir
la app online y probar luego en modo avión antes de salir al sendero. Tampoco
se garantiza funcionamiento si el navegador elimina la caché, se borran datos
o hay una actualización cuyos recursos todavía no se descargaron. La lectura
con la cámara nativa y la apertura de una nueva URL pueden depender además del
comportamiento offline del navegador y de los permisos de cámara.

# Diario, fotografías y progreso

Las funciones de recompensas son puras: reciben el último perfil persistido y
devuelven actualizaciones y estado. Aplicarlas dentro de `commitProfile`; solo
actualizar la interfaz después de `saved === true`. Un fallo no consume la
recompensa y permite reintentar.

- Observación de campo: 30 XP por primera especie (nombre científico o id).
- Foto Perfecta IA: 50 XP por primera especie; cada captura nueva incrementa
  avistamientos. Las estrellas declaradas no modifican XP.
- Diez observaciones de campo: insignia y 100 XP una sola vez.
- Foto de compañero: 25 XP por ave una sola vez.
- Cuestionario de ascenso: 150 XP una sola vez, protegido por la insignia.
- MindAR: conserva su recompensa de 40 XP y su protección existente.
- Estación: conserva 25 XP por estación y agrega una actividad al diario.

`rewardLedger` conserva las claves `field-species:…`, `ai-species:…`,
`companion-photo:…` y `badge:detail`. Para perfiles antiguos, el historial de
la misma categoría/especie también impide volver a cobrar. La bienvenida no
cuenta. No se trunca el historial. MindAR y estaciones no son avistamientos
reales; IA tampoco cuenta para la insignia de detalles.

Las fotos permanecen en IndexedDB o localStorage; nunca se suben. El llamador
agrega la referencia mediante `commitProfile` después de `savePhoto` y elimina
el blob nuevo con `deletePhoto` si la persistencia del perfil falla (no eliminar
una referencia preexistente devuelta por deduplicación). La migración verifica
los bytes originales sin recompresión antes de quitar el data URL antiguo;
ancho/alto 0 significa que las dimensiones originales no fueron registradas.

`buildBackup` y `parseBackup` no escriben almacenamiento ni suman XP.
El flujo de restauración debe conservar el id activo y reescribir los
profileId de fotos y descubrimientos, guardar copia de seguridad e importar
fotos antes de confirmar los cambios.

Los handlers de App ahora calculan sobre el último perfil dentro de
`commitProfile`, devuelven `SaveResult` y conservan el estado React si falla
la escritura. El diario recibe
`onAddJournalEntry(entry: Omit<JournalEntry, 'id' | 'timestamp'>, photo?: File): SaveResult | Promise<SaveResult>`.
Foto Perfecta recibe un id estable por captura y espera la autoevaluación antes
de guardar. Las fotos de compañero y XR solo agregan referencias al perfil;
los blobs nuevos se eliminan si falla la escritura.

La reclamación de meta grupal comprueba membresía, especies compartidas y
`squad-goal:<id>` en los perfiles persistidos antes de conceder XP. El
indicador de cuadrilla también se marca solo después del guardado del perfil.

El diario muestra categorías, fechas conocidas, estaciones antiguas sin fecha
inventada y una galería de fotos locales. Adjuntar una foto propia guarda sus
bytes antes de confirmar la observación; si el perfil no se puede guardar,
se elimina el blob nuevo.

Respaldo y recuperación, en Opciones, exporta JSON con fotografías por defecto.
Si alguna no puede leerse, informa cuáles fallaron y exporta solo identificadores
sin afirmar que incluyó fotos. La restauración exige resumen y confirmación:
guarda la copia previa, verifica e importa bytes sin recomprimir, reescribe las
referencias y confirma el perfil. Un fallo revierte los blobs nuevos, no el
perfil actual. Los blobs anteriores se conservan para la copia de seguridad.

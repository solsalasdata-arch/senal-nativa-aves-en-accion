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
fotos antes de confirmar los cambios. Estos pasos y la integración de los
handlers de interfaz corresponden a las siguientes etapas.

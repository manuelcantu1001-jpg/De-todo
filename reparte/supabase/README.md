# Activar la conexión del piloto

Todavía no hay un proyecto creado para ReParte. La aplicación funciona localmente y la conexión permanece desactivada hasta completar estos pasos.

1. Crear un proyecto Supabase. Ejecutar `schema.sql` una sola vez en SQL Editor. La transacción crea `reparte_events` y dos funciones; si hay un objeto del mismo nombre, revisar antes de repetir.
2. En Authentication, habilitar Email. En la plantilla Magic Link incluir el código `{{ .Token }}` (por ejemplo: `<p>Tu código de ReParte es {{ .Token }}</p>`). Se usa correo y código, sin contraseña. Configurar el envío de correo para los participantes del piloto; comprobar destinatarios y límites del proveedor.
3. Poner la URL del proyecto y su **publishable key** o **anon key** en las etiquetas `reparte-supabase-url` y `reparte-supabase-key` de `index.html`. No usar claves secretas ni `service_role`. Ambas etiquetas se publican con el HTML.
4. Servir/publicar la misma app bajo HTTPS para ambos teléfonos. En «Conectar y recuperar mis eventos», introducir el correo del organizador, recibir el código y validarlo. Esto sube sus cuentas locales. Los invitados no necesitan correo.
5. Ejecutar `checks.sql` en SQL Editor. Sus datos y cambios se revierten al terminar. Verificar además con dos sesiones reales de organizador que una no puede leer ni escribir los eventos de la otra.
6. Hacer el ensayo de `../PRUEBA-PILOTO.md`, primero con conexión, después sin red y al recuperarla. No declarar lista la sincronización hasta terminar estas verificaciones.

## Qué protege el servidor

RLS solo permite a un organizador autenticado seleccionar sus eventos. No hay permisos de insertar, actualizar o borrar la tabla desde el cliente. `save_reparte_event` requiere `auth.uid()`, comprueba propietario y versión y serializa escrituras del mismo evento. Las funciones tienen `search_path` vacío y permisos explícitos.

`read_reparte_event` permite leer con un token aleatorio de invitación; devuelve únicamente el evento compartido y su versión. No devuelve `owner_id`. Todos los gastos de ese evento son visibles. Compartir ese token equivale a compartir la cuenta completa para consulta. Este piloto no implementa revocación/rotación del enlace ni subgrupos privados.

El servidor y el cliente seleccionan explícitamente los campos permitidos, excluyendo CLABEs, bancos, sesión y roles locales. La sesión con tokens se conserva solo en el navegador del organizador. El respaldo descargable no la incluye.

## Conflictos y recuperación

- Al volver a conectar, primero se consultan versiones del servidor.
- Si solo cambió la nube, se recupera esa versión; si también hay cambios locales, se bloquea la edición y se ofrece descargar el respaldo antes de cargar la nube.
- Nunca se combinan gastos ni pagos por nombre; no se recupera identidad eligiendo «Ana».
- En un teléfono nuevo, el mismo correo recupera la titularidad desde el servidor.
- La app actualiza mientras está visible. No hay sincronización de fondo garantizada con la app cerrada.
- Si el envío falla, el estado local queda pendiente; no se presenta como guardado en la nube.

## Documentación utilizada

- [OTP por correo](https://supabase.com/docs/guides/auth/auth-email-passwordless).
- [Funciones y permisos explícitos](https://supabase.com/docs/guides/database/functions).
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

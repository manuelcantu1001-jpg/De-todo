# ReParte

PWA para llevar gastos de grupo. En este piloto **el organizador captura, corrige y confirma pagos; el grupo consulta por enlace sin registrarse**. No requiere dependencias para servirla.

## Estado del piloto

- Eventos, participantes sin teléfono, captura a nombre de cualquiera, MXN/USD con tipo de cambio manual guardado por gasto.
- Desglose por persona: gastos pagados, parte consumida, pagos enviados/recibidos y saldo pendiente. Transferencias simplificadas, sin prometer el mínimo matemático.
- Cierre gratuito, sin cuotas ficticias. Pagos completos/parciales registrados por el organizador después de verificar con el receptor. Reabrir conserva los pagos y puede cambiar el plan de transferencias.
- Enlaces de consulta y detalle de gastos. Elegir un nombre cambia la vista, no concede permisos. Importar una copia nunca reemplaza la cuenta local del organizador.
- Respaldo JSON descargable/restaurable. No sobrescribe eventos existentes. El respaldo puede contener CLABEs locales; no contiene la sesión de Supabase.
- Resumen PNG con altura variable para incluir todas las transferencias.
- Service worker para uso offline. Solo elimina cachés de ReParte, respetando las de otras apps en el mismo dominio.

**Sin configurar Supabase, el enlace contiene una copia estática:** hay que volver a compartir después de cada cambio. La app muestra esa limitación. Los datos originales anteriores se consideran cuentas locales; los nuevos enlaces siempre se importan como consulta.

**Con Supabase configurado:** acceso del organizador por código de correo, recuperación de eventos en otro dispositivo, enlace estable y actualización cada 10 segundos mientras la página esté visible. Los cambios se guardan primero localmente. Las versiones concurrentes se detectan y no se combinan ni sobrescriben automáticamente. Ver [conexión](supabase/README.md).

La integración está implementada, pero **no hay todavía un proyecto Supabase conectado ni una validación contra un servidor real**. No está publicada esta revisión.

## Alcance de privacidad

En este piloto, cualquier persona con el enlace ve **todos los gastos y saldos**. Repartir un gasto entre dos personas no lo hace privado. No se incluyen CLABEs, claves de sesión ni permisos de edición en los enlaces o datos de nube. Las CLABEs deben compartirse directamente con quien paga.

Los subgrupos privados con cierre consolidado siguen pendientes. Se requiere un modelo de participantes autenticados, filtrado por servidor y una explicación de los saldos que no filtre detalles ajenos; no se resuelve ocultando filas en pantalla.

## Recuperación de cuotas anteriores

La versión anterior agregaba una cuota ficticia al cerrar eventos posteriores al primero, aunque no cobraba. Al cargar se retiran únicamente los registros `isFee` con el historial exacto `Cuota del evento, repartida entre todos`, guardando primero el estado original en `localStorage['reparte.before-fee-fix']`. Si no puede guardar esa copia, conserva los datos originales. Los pagos registrados se conservan.

## Probar

```sh
python3 -m http.server 8765 --bind 127.0.0.1
node --test tests/account.test.cjs
# Con Playwright y Chromium disponibles:
node tests/browser.cjs
```

`REPARTE_BROWSER` permite seleccionar un Chrome ya instalado. Las pruebas de navegador usan perfiles temporales separados para organizador, lector y recuperación. Las pruebas de nube en Node usan respuestas simuladas; las verificaciones reales de permisos están en `supabase/checks.sql`.

[PRUEBA-PILOTO.md](PRUEBA-PILOTO.md) contiene el ensayo con cuatro personas y resultados esperados. Todavía falta ejecutarlo con personas reales y teléfonos físicos.

## Archivos

- `index.html`: aplicación, integración REST opcional y configuración pública de Supabase en dos etiquetas meta.
- `supabase/schema.sql`: tabla con RLS, lectura mediante invitación y escritura con verificación de propietario y versión.
- `CONCEPTO.md`: concepto original; las decisiones del piloto documentadas aquí tienen prioridad para esta versión.
- `img/`: ilustraciones de la app (240 px, JPEG), también guardadas en el caché offline.
- `design/`: prototipos y sistema visual original. Las ilustraciones fuente, los lotes generados y los prompts están en `design/ilustraciones/` y `design/PROMPTS-ILUSTRACIONES.md`.

Pendientes posteriores al ensayo: colaboración con captura por participante, subgrupos privados, lectura de tickets y cobro real por evento. No se integra cobro antes de validar el flujo.

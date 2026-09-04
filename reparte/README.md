# ReParte

Webapp para dividir gastos de grupo: entras por un link de WhatsApp, sin app ni cuenta, y al final te dice quién le paga cuánto a quién.

**Abrir la app:** `reparte/index.html` (o en GitHub Pages: `/reparte/`). Es una PWA estática de un solo archivo, sin dependencias.

## Qué hace ya

- Crear evento y agregar gente (con o sin teléfono), entrar solo con tu nombre.
- Capturar gasto: monto primero con teclado numérico, pastilla "Pagaste tú · entre todos · hoy" que abre quién pagó, entre quiénes y fecha. Descripción opcional.
- Pesos y dólares, con tipo de cambio guardado en cada gasto. Redondeo en centavos: el centavo huérfano se le carga a quien pagó.
- Default inteligente: si los dos últimos gastos fueron entre las mismas personas, sugiere ese subgrupo.
- Editar y borrar gastos, con historial de quién cambió qué. Deshacer en el toast.
- Cerrar y liquidar: la explicación numerada (total, por cabeza, quién pagó de más) y la lista mínima de transferencias. Se puede cerrar aunque falte alguien.
- Cómo pagar: CLABE, banco (por los 3 primeros dígitos), concepto y botón de copiar. Recordar por WhatsApp con el mensaje listo. Marcar pagado, pago parcial, deshacer.
- Compartir: link con QR (generador propio, sin librerías) y botón de WhatsApp. Resumen final como imagen PNG.
- Funciona sin red una vez abierta (service worker) e instalable como app.

## Cómo se comparte hoy, y qué falta

No hay servidor. Los eventos viven en el navegador y el link (`#e=...`) lleva una copia comprimida del evento. Quien lo abre lo ve sin cuenta y puede participar, pero los cambios no se sincronizan entre teléfonos: hay que volver a compartir el link.

Siguiente paso: capa de datos (Supabase con Row Level Security para los subgrupos privados), cobro por evento con Mercado Pago, y lectura de tickets.

## Archivos

- `CONCEPTO.md` — documento de concepto (idea, MVP, pantallas, modelo de negocio, identidad visual).
- `design/` — export de Claude Design con el prototipo y el sistema visual:
  - `ReParte.dc.html` — prototipo interactivo del flujo principal (entrar, capturar gasto, cerrar, cómo pagar).
  - `ReParte Sistema.dc.html` — sistema visual (tipografía, color, componentes).
  - `ReParte Opciones.dc.html` — direcciones de identidad evaluadas.
  - `ReParte Ilustraciones.dc.html` — reglas de ilustración y animación stop-motion.
  - `support.js`, `image-slot.js`, `ios-frame.jsx` — runtime del canvas; los `.dc.html` los cargan desde la misma carpeta.
  - `uploads/` — imágenes de referencia y bocetos.

# ReParte v2

ReParte divide gastos de un evento sin pedir cuentas ni instalar una app. A diferencia del prototipo original, el enlace identifica un evento compartido en una base de datos: todos ven los cambios del mismo evento.

## Qué incluye

- Eventos con enlace corto y actualización automática cada cuatro segundos.
- Entrada como invitado, alta por nombre e invitaciones personales de un solo uso.
- Gastos en MXN o USD, división entre todos o solo algunas personas y centavos exactos.
- Visibilidad privada: cada integrante recibe solo sus gastos, su saldo y sus transferencias.
- CLABE privada, visible únicamente para quien debe pagarle a esa persona.
- Corrección y borrado lógico de gastos con permisos e historial de auditoría.
- Pagos parciales o completos confirmados únicamente por quien recibe.
- Cierre y reapertura del evento por la persona organizadora.
- Acciones WebMCP para crear eventos, consultar un resumen y agregar gastos.

## Desarrollo local

Requiere Node.js 22.13 o posterior.

```bash
npm install
npm run db:generate
npm run dev
```

Para una base local nueva, aplica el archivo SQL de `drizzle/` con Wrangler antes de probar las rutas de API.

## Verificación

```bash
npm run lint
npm run build
```

La aplicación usa Vinext, Cloudflare D1 y OpenAI Sites. El dinero se guarda como centavos enteros; el frontend nunca calcula ni decide saldos autorizados por sí solo.

# Ensayo de ReParte: cuatro personas, 20 minutos

Objetivo: comprobar si el organizador puede llevar la cuenta y si cada persona entiende cuánto debe sin explicaciones del desarrollador. El concepto original propone Las Vegas en octubre de 2026; confirmar que ese viaje sigue vigente.

## Preparación

Ana organiza. Beto, Carla y Diego consultan desde otros teléfonos. No usar datos bancarios reales durante el ensayo. Para probar actualizaciones automáticas, primero completar `supabase/README.md`. Sin Supabase solo se puede evaluar la copia de consulta, no la sincronización.

## Guion y cuenta esperada

1. Ana crea el evento y agrega a Beto, Carla y Diego. Comparte el enlace y pide que cada quien encuentre su cuenta sin ayuda.
2. Ana registra una cena de **$1,200 MXN** pagada por ella, entre los cuatro.
3. Registra un taxi de **US$20**, a **$18 MXN por dólar**, pagado por Beto y repartido solo entre Beto y Carla. Todos pueden ver el taxi; no es privado.
4. Revisa el cierre: total **$1,560**. Ana consume $300, Beto $480, Carla $480 y Diego $300. Ana cobra $900; Beto debe $120, Carla $480 y Diego $300. El promedio de $390 no es lo que todos deben.
5. Carla pide corregir el taxi a **US$22**. Ana lo edita. Total **$1,596**; Beto debe $102, Carla $498, Diego $300 y Ana cobra $900. El historial debe mostrar la corrección. Con el enlace conectado, comprobar que los demás ven la actualización sin recibir otro enlace.
6. Ana cierra gratis. Confirma con quien recibe un pago parcial de **Carla por $100**. Carla queda debiendo $398; Ana queda por cobrar $800. Beto y Diego no cambian. No aparece ninguna cuota de ReParte.
7. Un lector intenta editar o confirmar pagos: debe poder consultar los detalles pero no modificar la cuenta. Cambiar el nombre consultado no cambia permisos.
8. Ana descarga un respaldo. En otro navegador limpio lo restaura, o, con Supabase activo, entra usando el mismo correo. Debe recuperar el evento. Un correo diferente no debe poder recuperarlo.
9. Con Supabase activo: desconectar el teléfono de Ana, reabrir y registrar un gasto, verificar el aviso de cambios pendientes y reconectar. Abrir el mismo evento desde dos dispositivos del organizador, editar ambos sin conexión y reconectar: debe detectarse conflicto sin perder silenciosamente cambios.

## Observar sin ayudar

Registrar cuánto tarda el organizador en capturar cada gasto, las preguntas espontáneas y quién pide participar en la captura. Preguntar individualmente «¿cuánto debes y por qué?» y «¿a quién le pagas?». No explicar primero la pantalla.

Criterios iniciales para pasar: los cuatro encuentran su saldo correcto sin ayuda; el organizador registra un gasto habitual en menos de 30 segundos; no se pierden ni duplican movimientos; nadie interpreta el promedio como su deuda; la diferencia entre pago confirmado y pendiente queda clara. Estos son criterios propuestos, no resultados obtenidos.

Si varias personas necesitan capturar, reconsiderar el modo de organizador único antes de añadir OCR o cobro. Si piden privacidad, probar primero una explicación de cierre privado con datos ficticios; el piloto actual no debe usarse para gastos que deban ocultarse a otros participantes.

## Resultados

Pendiente de ensayo humano. Las pruebas automatizadas comprueban cálculo e interacción, no adopción ni comprensión.

Anotar fecha, teléfonos, tiempos, errores y comentarios textuales aquí después del ensayo.

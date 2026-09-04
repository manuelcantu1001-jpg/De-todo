# ReParte — Documento de concepto

*Nombre de trabajo. Alternativas vivas: ReParte (ícono ReP), Solva, Salda, Kuadra, Repar.*

---

## 1. La idea en una frase

Una webapp para dividir gastos de grupo donde entras por un link de WhatsApp, sin bajar app ni crear cuenta, y al final te dice exactamente quién le paga cuánto a quién y cómo hacerlo.

## 2. Por qué ahora

Splitwise domina el mercado pero se está estrangulando solo:

- Tope de 3 a 5 gastos por día en el plan gratis. Brutal justo en un viaje.
- Anuncios entre pantallas.
- Escaneo de recibos, búsqueda y conversión de moneda detrás de un muro de pago de $4.99 USD al mes.
- Todos los miembros deben bajar la app y crear cuenta. Siempre hay uno que no lo hace.
- A principios de 2026, 65% de sus reseñas en Trustpilot son de una estrella.

Nadie ha atacado esto con enfoque mexicano: multi-moneda peso-dólar real, liquidación por SPEI y CLABE en vez de Venmo, y entrada por WhatsApp en vez de app store.

## 3. Principio rector

**Un gasto compartido es un evento con principio y fin, no una relación contable eterna.**

Splitwise está diseñado como libro contable permanente entre amigos. El 90% de los casos reales son eventos cerrados: un viaje, una cena, un fin de semana. Todo el producto sale de ahí.

**Completo pero simple.** Cada feature debe pasar el filtro: ¿esto lo necesita el usuario normal en el camino principal, o es un caso de borde que puede vivir detrás de un botón? Si es lo segundo, se esconde.

---

## 4. Diferenciadores

| Dolor de Splitwise | Solución en ReParte |
|---|---|
| Todos bajan app y crean cuenta | Link por WhatsApp. Ver es gratis, participar cuesta un nombre. |
| Tope de gastos por día | Ilimitado siempre. Es el gancho. |
| Recibo y búsqueda de paga | Foto del ticket gratis. |
| Anuncios | Cero. Se cobra por evento. |
| Simplificación de deudas apagada por defecto | Siempre prendida e invisible. |
| Peso/dólar manual | Tipo de cambio automático, guardado por gasto. |
| Venmo/Zelle | CLABE, DiMo y CoDi. |
| Termina en "settle up" y te deja solo | Termina dándote la CLABE y el monto listos para pegar en tu banco. |

---

## 5. Alcance del MVP

**Objetivo de validación:** el viaje a Las Vegas de octubre 2026. Grupo real, dos monedas, gente que no va a bajar nada.

### Lo que entra

1. Crear evento y compartir por link o QR
2. Entrar sin cuenta, solo nombre
3. Capturar gasto (monto primero, dos taps)
4. Reparto igual o personalizado
5. Multi-moneda peso/dólar con tipo de cambio del día
6. Cerrar evento y ver la liquidación mínima
7. Pantalla de cómo pagar: CLABE, monto, botón copiar
8. Recordatorio por WhatsApp
9. Resumen final compartible como imagen

### Lo que NO entra (deliberadamente)

Chat interno (ya existe WhatsApp), itinerario, presupuesto personal, conexión bancaria, categorías contables, gráficas. Cada una de estas es lo que volvió pesado a Splitwise.

---

## 6. Las cinco pantallas

### 6.1 Entrada al evento

Abres el link y **ves el evento primero**, con los gastos ya cargados. Solo te piden el nombre cuando vas a hacer algo. Una sola pantalla: "¿Cómo te llamas?" y adentro.

El link **no caduca** mientras el evento esté abierto. QR para cuando están todos en la mesa, link para el que no vino. WhatsApp como primer destino de compartir.

### 6.2 Capturar gasto — la pantalla más usada

Aquí se gana o se pierde la simplicidad.

1. Abre con el **monto en grande y el teclado numérico ya activo**. Nada más.
2. Debajo, una sola pastilla tocable con todo resuelto: **"Pagaste tú · entre todos · hoy"**
3. Descripción **opcional** y hasta abajo. Si no pones nada, se llama "Gasto".
4. Un botón.

Dos taps para el caso normal. El editor de reparto avanzado existe, pero detrás de la pastilla, no en el camino principal.

**Default inteligente:** si los últimos gastos fueron entre las mismas tres personas, sugiere esas tres. Así los subgrupos se vuelven invisibles en vez de ser otra pantalla.

### 6.3 Recibo por partidas (opcional)

Vive detrás de un botón dentro de la captura normal, **nunca antes**. La pregunta se hace **por persona, no por partida**: "¿Cuáles cosas incluyen a Manuel?" con el recibo completo y checkboxes. Cada quien se acuerda de lo suyo.

Propina e impuestos se prorratean solos. Si la IA lee mal, se corrige el total y ya — no obligar a arreglar línea por línea.

### 6.4 Cerrar y liquidar

1. Arriba, la explicación numerada: **cuánto se gastó en total, cuánto tocaba por cabeza, quién pagó de más.** Mostrar la aritmética mata el pleito de "a mí no me tocaba tanto".
2. Abajo, la lista mínima de transferencias, ya simplificada.
3. Se puede cerrar **aunque falte alguien por pagar**. El saldo queda visible, no bloqueado.

### 6.5 Cómo pagar

Por cada línea de la liquidación, dos acciones:

- **Cómo pagar:** CLABE del que cobra, monto y concepto, con un botón que copia todo y abre la app del banco.
- **Recordar:** arma el mensaje ya escrito y abre WhatsApp con esa persona. El usuario da un tap; la app no manda nada sola.

El que **recibe** marca como pagado. Con opción de **monto parcial** (a veces te dan 1,000 de 1,200) y con **Undo** en el toast, porque alguien va a marcar por error.

---

## 7. Subgrupos con privacidad real

El caso más común en viajes grandes: de diez personas, tres se separan y hacen gastos entre ellos. Splitwise obliga a crear otro grupo y quedan dos libros que no se hablan.

**Reglas:**

- Si no estás en el subgrupo, el gasto **no existe** para ti. Ni en la lista, ni en el total, ni en el resumen final.
- El total del viaje que ve cada quien es distinto. No hay un "gran total" público.
- Solo ves quién está en un subgrupo si estás dentro.
- **El organizador tampoco lo ve.** Si él ve todo, no hay privacidad, hay teatro.
- Al cerrar, los saldos del subgrupo **se consolidan** en el viaje principal. Un solo cierre, no cinco.

**Sin crear subgrupo:** al capturar un gasto puedes elegir "solo entre Luis, Ana y yo". Es un subgrupo de un solo gasto.

**El punto delicado:** si Luis te debe 1,300 y 500 vienen de una cena a la que no fuiste, la app dice "Luis te debe 1,300" sin desglosar ante terceros. Funciona porque nadie necesita ver el detalle ajeno para pagar, solo el número final.

**Implementación:** esto no se resuelve escondiendo cosas en el frontend. El servidor filtra por participante antes de mandar datos. Row Level Security en Supabase lo hace nativo.

---

## 8. Modelo de negocio

**Pago por evento, no suscripción.** Es lo que la gente está pidiendo a gritos en las reseñas de Splitwise.

- **Primer evento gratis siempre.** Que prueben sin fricción.
- **Precio por tamaño, no por features.** $49 hasta 8 personas, $99 hasta 20, $199 sin límite. Más fácil de entender que "plan Pro".
- **El costo se reparte solo.** El precio se mete como el primer gasto del grupo. Entre 8 personas son 6 pesos cada uno. Nadie discute 6 pesos.
- **Se le muestra al organizador:** "Pagaste $99, te lo devuelven repartido, tu costo real: $8." Esa línea vende sola.
- **Se cobra al CERRAR, no al abrir.** Si cobras al abrir, la gente duda. Si cobras al cerrar, ya vio que funcionó y quiere su resumen.
- Sin cuenta guardada, sin tarjeta en archivo, sin cancelar suscripción después.

**Adquisición:** cada evento pagado trae 8 o 20 personas que vieron el producto funcionar sin pagar nada. Ese es el motor.

**Procesador:** Mercado Pago primero (OXXO, SPEI, confianza local). Stripe como segunda opción para el mercado gringo.

---

## 9. Restricción legal crítica

**La app nunca toca el dinero.** Esta es la decisión más importante del proyecto.

En el momento en que recibes fondos y los repartes, te conviertes en institución de fondos de pago bajo la Ley Fintech mexicana: licencia, capital mínimo, años de trámite. La app **solo calcula y muestra**. El dinero va de persona a persona por su propio banco.

Cobrar tu propia licencia de software no cae ahí. Eso es venta de servicio, no intermediación financiera.

**También obligatorio:**
- Aviso de privacidad conforme a la LFPDPPP (guardas nombres, montos, fotos de tickets)
- Términos visibles de que no eres intermediario financiero

---

## 10. Decisiones técnicas

**Webapp PWA, no app nativa.**

Ventajas: elimina la fricción de onboarding (el problema #1 de Splitwise), sales en semanas no meses, no le pagas 30% a Apple, un solo código para todo.

Lo que pierdes y cómo se cubre: las notificaciones push en iPhone solo funcionan si instalaron la PWA, pero el respaldo real es WhatsApp. La cámara funciona igual desde el navegador.

Ruta: PWA primero, validar con Las Vegas. Si en 6 meses hay tracción y piden push nativo o presencia en tienda, se envuelve el mismo código con Capacitor.

**Stack sugerido:** Next.js en Vercel, Supabase para datos y Row Level Security, API de Claude para leer tickets.

### Trampas que se vuelven caras si se dejan para después

- **Multi-moneda desde el día uno.** Meterla después obliga a rediseñar la base. Guarda moneda y tipo de cambio **en cada gasto**, aunque el MVP sea solo peso y dólar.
- **Tipo de cambio del día del gasto**, no el de hoy. Si no, los totales cambian solos cada mañana.
- **Redondeo.** Dividir 100 entre 3 deja un centavo huérfano. Define ahora a quién se le carga o vas a tener saldos que nunca cuadran.
- **Costo de IA por ticket.** Con eventos gratis, un grupo puede quemarte dinero. Límite o feature de pago.

---

## 11. Casos de borde que hay que resolver

- **Editar y borrar gastos.** Alguien va a capturar mal el primer día. Con historial de quién cambió qué.
- **Alguien se une a la mitad.** ¿Le tocan los gastos anteriores? Debe poder elegirse.
- **Participante sin dispositivo.** El suegro que no quiere entrar debe poder existir como participante.
- **El organizador desaparece.** Más de un admin, o que cualquiera pueda cerrar.
- **Cerrar con saldos pendientes.** Ya cubierto arriba.

---

## 12. Backlog v2

- **Fondo común.** Cada quien pone su parte antes del viaje, los gastos salen de ahí, al final se devuelve el sobrante. Elimina el 80% de los cruces de deuda.
- **Reglas de reparto por persona.** "Los niños pagan mitad", "Juan no toma".
- **Modo organizador.** Ver quién ya puso su parte. Sirve para bodas, despedidas, viajes de golf.
- **Recordatorios automáticos** vía API de WhatsApp.
- **CoDi como camino principal**, si su adopción mejora.
- **DiMo** (pago por número de celular). Verificar estado actual antes de construir.
- **Historial y grupos guardados**, para resolver la pregunta del segundo viaje.

---

## 13. La pregunta abierta del negocio

Todo el modelo asume que vuelven. **¿Qué pasa el segundo viaje?** Si la app se usa una vez y se olvida, no hay negocio recurrente. Hace falta una razón para que el organizador la abra de nuevo: historial, grupos guardados, algo.

Y una definición clara: **el cliente no es el grupo, es el organizador.** Todo el producto debe estar diseñado para hacerlo ver bien a él.

---

## 14. Identidad visual

**Dirección elegida: calidez con disciplina.**

Se evaluaron tres caminos:

- **A. Fintech mexicana moderna** (Inter o Satoshi, verde profundo #0F4C3A). Confiable y competente, pero es donde está todo el mundo: Klar, Stori, Nubank. Te ves correcto pero no memorable.
- **B. Cálido y humano** (serif contemporánea tipo Fraunces o Instrument Serif en títulos, Inter en cuerpo; terracota #C4552F sobre crema). Sensación de viaje y mesa compartida, más Airbnb que banco. Nadie en gastos compartidos se ve así.
- **C. Suizo y silencioso** (un solo tipo en dos pesos, mucho blanco, negro con un acento). Se ve caro con poco esfuerzo y envejece bien, pero puede sentirse frío.

**La decisión es B con la disciplina de C.** La serif cálida y el terracota separan de toda la competencia; la estructura silenciosa y el espacio en blanco evitan que se vea informal. Profesional sin parecer banco.

**Reglas prácticas:**
- Serif solo en títulos y en los montos grandes. Todo lo demás en Inter.
- Un solo color de acento. El terracota se usa para acciones, no para decorar.
- Verde y rojo reservados exclusivamente para "te deben" y "debes". Si el color significa dinero, no puede significar otra cosa.
- Los números son el contenido principal. Todo lo demás es soporte y debe ceder espacio.

**Logo:** dirección preferida son barras de distintas alturas que terminan al mismo nivel — cuenta la historia de entrar desparejo y salir parejo, y se anima al cerrar el evento. Alternativa segura: monograma ReP en cuadro redondeado. Evitar el círculo dividido tipo gráfica de pastel, está saturado.

---

## Anexo — Referencias de diseño

Solo como inspiración. El principio de simplicidad manda sobre cualquiera de estas.

**Vale la pena robar:**
- **Buddy** — pantalla de cierre numerada en 3 pasos (cuánto, quién pagó de más, quién debe a quién)
- **KOHO** — monto primero con teclado abierto; confirmación en dos tarjetas
- **Splitwise** — la pastilla "Pagado por ti y dividido en partes iguales"; la pregunta por persona en el reparto por partidas
- **Revolut** — Remind y Mark as paid como acciones separadas, con explicación de por qué existen
- **Wanderlog** — pago parcial y Undo; toggle entre "tu resumen" y "vista de grupo" (útil para subgrupos)
- **Monzo** — invitación con QR y link para gente fuera de la app
- **yope** — pantalla de compartir con WhatsApp de primero

**Contraejemplos, qué NO hacer:**
- **Vipps** — 11 pantallas para meter un gasto, con "remaining to distribute" que hay que cuadrar a mano
- **GoPay** — 16 pantallas para un recibo; bifurca antes de que sepas qué quieres; QR que expira en 15 minutos
- **Canopi** — pide Sign in with Apple y teléfono antes de dejarte ver nada
- **Revolut Business** — categoría contable e IVA por partida
- **Splitwise** — pide la descripción antes del monto; su mejor feature viene apagada de fábrica

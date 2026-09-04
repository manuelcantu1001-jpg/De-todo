# De-todo · Estado del proyecto

Repo personal de Manuel con proyectos sueltos por rama. **Esta rama
(`claude/juego-pulelo-idea-dyz035`) contiene la colección de juegos de pasatiempos.**
(La rama `claude/tier-list-page-2cz2lq` es otro proyecto aparte.)

## Lo que ya existe y funciona

- **Hub + 61 juegos** (eran 44: se retiraron «La definición» y «Póker 3 cartas» por
  relleno, ver auditoría abajo), todos vanilla JS sin build, con dificultades, marcas y
  «¿Cómo se juega?»: Palabras (Encadena, Sopa, Crucigrama con banco propio de ~390
  pistas, La palabra del día con modo diario, Ahorcado, Anagramas, Acomoda-palabras,
  Buscapalabras tipo Boggle, Ordena la frase con banco de 144 refranes, Sílabas
  encadenadas con silabeador propio),
  Números y lógica (Sudoku, Cifras, Nonograma, Kakuro, Buscaminas, Batalla naval,
  2048, Binario/Takuzu, Puentes/Hashi, Hitori, Luces fuera, Picas y fijas,
  Punteros —el de las flechas que pidió Manuel—, Inunda, Futoshiki, Rascacielos,
  Calcudoku, Tiendas y árboles, Atasco),
  Mesa (Memorama, Gato, Conecta 4, Damas, Solitario, Reversi, Dominó, Deslizante,
  Come solo, Hanoi, Ludo, Timbiriche, Generala, Molino, Mancala, Ajedrez,
  Backgammon, Escoba del 15, FreeCell, Hundir la flota,
  Blackjack con división y reto de banca, Texas Hold'em con
  equity Monte Carlo y apuesta a elección) y Arcade (Serpiente, Simón, Laberinto, Bloques/tetrominós, Ladrillos,
  Topos). Ver `README.md`. Generadores con garantías (unicidad/solubilidad) en
  sudoku, nonograma, naval, cifras, binario, luces, deslizante, punteros e
  inunda (límite = resolutor voraz + margen).
- **Sistema compartido** en `comun/`: `estilo.css` (TODA la identidad visual vive ahí,
  tokens en `:root`) y `nucleo.js` (utilidades + diccionario). Cada juego enlaza ambos.
- **PWA instalable** (manifest «Sobremesa», `sw.js` cache `sobremesa-v16`).
  Al añadir/cambiar assets: bump de versión del cache.
- **Publicación automática**: push a esta rama → workflow construye `_site` → rama
  `gh-pages` → **https://manuelcantu1001-jpg.github.io/De-todo/**
  (la fuente de Pages ya está activada a mano; el token no puede crearla por API).
- Marcas del hub: cada juego escribe `store.set('<id>.hub', 'texto')` al batir récord;
  ids: enc, sopa, cru, pal, ahorcado, ana, aco, sud, cif, nono, kak, mina, naval,
  m2048, memo, gato, c4, damas, sol, serp, simon, lab, bus, fra, sil, bin,
  pue, hit, luz, pic, pun, inu, rev, dom, des, come, han, bj, hold, blo,
  lad, topo, ludo, tim, gen, mol, man, pan, crip, fut, ras, cal, tie, ata, esc,
  aje, bak, esco, fre, flo, cua.
  (Carpeta ≠ id en varios:
  buscapalabras→bus, frase→fra, criptograma→crip, timbiriche→tim, etc.)
  Los juegos con rival guardan la marca por nivel (`<juego>.wins.<nivel>`) y al hub
  mandan la del nivel más alto ganado.
- La portada tiene **buscador** y **«seguir jugando»** (últimos abiertos, en
  `hub.recientes`).

## Identidad visual: «papel, no pantalla» (elegida por Manuel, sept. 2026)

Manuel pasó capturas de la web de Function Health y pidió «acoplar todo el diseño
del juego a este tipo de arte». Él mismo lo leyó como «vibra de Kindle», y ese es el
norte: **una superficie de lectura, calmada**. Reemplaza la piel «hecha a mano»
anterior (contornos gruesos, esquinas chuecas, filtro SVG, stopmotion), que queda
en el historial de git (commit «Identidad nueva: letra de Claude…»).

- **Papel**: fondo crema `#FAF4E8` (`--bg`), tarjeta clara `#FFFDFA` (`--card`) para
  piezas que deben saltar, **bloque beige `#F1E7D7` (`--panel`)** para agrupar sin
  dibujar caja (las tarjetas del hub van así, como los «01/02/03» de la referencia).
  Tinta parda `#33302B`, **nunca negro puro**: eso rompe la calma. Secundario
  `#7A7268`, tenue `#B6AEA1`.
- **Acentos**: terracota `#C0603A` (acciones, marcas), azul polvo `#7C8FA3`, salvia
  `#7C9A6E` (positivo; tablero del Reversi), rojo `#A8503A`, ocre `#A6853F`.
- **Tintas `--tinta-1..8`** para paletas de varios colores. Están **calculadas por
  búsqueda numérica en Lab con ΔE ≥ 25 entre cualquier par** y cada una conserva su
  familia (2 azul, 5 rosa, 6 lavanda, 7 verde azulado, 8 pardo rosado). Si un juego
  necesita N colores, usa N tintas: no inventes hex. Regla de la auditoría anterior
  que volvió a morder: tinta-5 salió casi igual a tinta-1 (ΔE 15) y Inunda las
  mezclaba en el mismo tablero.
- **Filete, no contorno**: `--linea` (tinta al 13 %) para cajas, `--linea-fuerte`
  (26 %) para piezas y para las líneas que **significan** (bloques 3×3 del Sudoku,
  a 2px). `--trazo` es 1px. **Sin sombras** (`--shadow: none`): las superficies se
  separan por relleno. Esquinas amplias e iguales: `--mano-1/2/3` valen 18px (se
  conservan los nombres para no tocar los 42 juegos) y `--pastilla` 999px.
- **Letra**: **Fraunces** (`--display`, serif) para títulos y para la cursiva de lo
  secundario; **DM Sans** (`--font`, y `--title-font` es un alias) para interfaz y
  números; **monoespaciada del sistema** (`--mono`, clase `.dato`) para etiquetas
  técnicas en mayúsculas con letter-spacing («NORMAL», «SIN MARCAS AÚN», relojes).
  Las dos familias están **alojadas en el repo** (`comun/fuentes/`, 12 cortes
  latin + latin-ext, 376 KB): sin conexión se ven igual y no dependen de Google.
- **Movimiento** suave y corto: `--ease: cubic-bezier(.2,.7,.2,1)`, `--dur: .26s`.
  Nada de `steps()`. Respeta `prefers-reduced-motion`.
- **Disposición**: el tablero suele ser cuadrado y ya ocupa el 96 % del ancho, así
  que en pantallas altas sobra alto. Lo que crece son los mandos (el teclado del
  Sudoku hasta 215 px) y el resto se reparte con `justify-content: space-evenly`
  **solo en la pantalla de juego** (`.scroll:not(.g-setup)` o clase propia): la
  primera vez la regla alcanzó a la pantalla de inicio y mandó el «Jugar» al fondo.
  Se mide contando píxeles (última fila distinta del fondo), no a ojo.

**La colección se llama «Sobremesa»** (elegido en sept. 2026, cuando Manuel pidió
«ponle nombre»): nombra el rato para el que es, el de mesa recogida, dominó y
plática, que es la misma calma del papel. Va en manifest (`name` y `short_name`),
en la portada (`h1`, `<title>`, `apple-mobile-web-app-title`) y en el README. Los
iconos PNG (`icons/`) van a juego: terracota, tarjeta crema, S en Fraunces y un
punto terracota; se renderizan con Chromium desde una plantilla HTML servida por
el mismo origen que las fuentes (desde `file://` la fuente no carga por CORS).
Las 4 direcciones viejas
(Quiosco/Arcadia/Recreo/Casillas) quedan archivadas en `design/direcciones/`.

## La auditoría (agosto 2026): qué se encontró y qué se corrigió

Manuel dijo «hay juegos sin sentido, que están de relleno». Se auditaron los 44
jugándolos con bots y solucionadores propios. Lo importante, para no repetirlo:

- **Nunca prometas en las reglas lo que el generador no garantiza.** Se encontraron
  cinco mentiras: Kakuro (>5000 soluciones por tablero), Hitori (hasta 2000),
  Binario («sale sin adivinar» y en experto no salía ninguna), Buscaminas (83 % de
  los expertos exigían adivinar) y Punteros («elige el orden correcto» cuando se
  gana tocando al azar). Los cuatro primeros se rehicieron; en Punteros se corrigió
  el texto, que es un juego de vista rápida y ahora lo dice.
- **La interfaz puede esconder el juego.** La Batalla naval tenía un generador
  correcto, pero sin forma en las piezas ni flota tachable no se podía deducir:
  41/100 tableros salían sin ensayo-error; ahora 320/320.
- **Las marcas tienen que medir habilidad.** Luces (récord farmeable a 1 movimiento),
  Picas (acertar a la primera por suerte), Memorama (movimientos → tiempo), Hanoi
  (se saturaba al llegar al mínimo → ahora es tiempo con el mínimo), Deslizante
  (tiempo sobre revueltos desiguales → movimientos con revuelto de coste fijo).
- **Una dificultad que no se nota es decorado.** Blackjack (abanico de 0,64 → 4,4
  puntos de ventaja), Dominó (Fácil y Normal eran idénticos: 47,3 % vs 46,5 %; ahora
  59,8 / 45,3 / 35,3 / 30,3), Topos (plano e invertido; ahora 211/340/517/782 puntos
  de un bot), Gato (Normal ahora falla el 25 % a propósito y sí se deja ganar).
- **Cuidado al re-vestir**: el cambio de identidad dejó dos pares de colores
  idénticos (los pads 1 y 3 de Simón, las piezas O y Z de Bloques) porque se reutilizó
  el mismo token. Si una paleta necesita N colores, usa N tintas distintas.
- Bugs de bulto encontrados: la torre de Hanoi estaba **dibujada al revés**, el bote
  del Hold'em se repartía **dos veces** al quedarse alguien sin fichas, Ladrillos no
  usaba delta time (a 120 Hz la bola iba al doble), el Solitario no detectaba el
  atasco y su botón «Terminar» no hacía nada, y el tablero Europeo del Come solo
  prometía dejar una ficha cuando el mínimo posible es 2.

Para contrastar con Codex: `scripts/auditar-con-codex.sh`. Ojo, en las sesiones
remotas de Claude Code el proxy bloquea `api.openai.com` (403) salvo que se permita
en la política de red del entorno; el script lo detecta y avisa en vez de colgarse.

## Notas técnicas útiles

- **Palabras**: los juegos PREGUNTAN desde `banco-es.js` (window.BANCO_ES + window.Banco,
  7.800 sustantivos/adjetivos/infinitivos curados, + window.TEMAS_ES con 14 temas) y
  ACEPTAN desde `lexico-es.txt.gz` (~635k formas; fetch + DecompressionStream).
  `vocab-es.js` (17.100 formas, con plurales y conjugaciones) es para los juegos de
  cadena, que necesitan mucho vocabulario. `dicc-es.js` se eliminó: era una lista de
  frecuencias de subtítulos y metía nombres propios ingleses («jeff», «randy») como
  respuestas. NO volver a usar frecuencias crudas para preguntar.
- `norm()`: minúsculas, sin tildes, conserva la ñ.
- **Perft es la única prueba que vale para un generador de jugadas.** El Ajedrez
  entrega los seis conteos canónicos exactos (20, 400, 8.902, 197.281, 4.865.609
  desde la inicial; kiwipete 48, 2.039, 97.862, 4.085.603; y las posiciones 3 a 6).
  Esos números no se aciertan por casualidad: si salen, el enroque, la captura al
  paso, la coronación y las clavadas están bien. Se corrieron dos veces, con un
  contador propio contra el archivo publicado.
- **El desempate al azar va DENTRO de la ventana alfa-beta, no después.** En el
  Ajedrez se sumaba al final, así que una jugada podada volvía con el valor de
  corte y le ganaba a la mejor: el Experto perdía 0-20 contra el Difícil.
- **Afinar pesos con pocas partidas por prueba es ruido.** En el Backgammon, un
  ascenso de coordenadas con 400 partidas por prueba dio un 62,3 % que con
  semillas nuevas se cayó a 52,5 %. Se tiró entero: los rasgos se eligieron por
  ablación a 1.500 partidas y se validaron con 2.500 de semillas distintas.
- **Segunda confirmación de que más honda no es más fuerte** (ver Molino): el
  expectimax de un tiro del Backgammon vale 51 % contra la misma evaluación sin
  buscar. Lo que separa a su Experto del Difícil es lo que MIDE, no lo que mira.
- **Las pruebas del repo no llegan a todos los estados.** En la Escoba, un fallo
  que reventaba al cerrar ronda pasó `prueba-manoseo.js` sin despeinarse: 25
  toques al azar no llegan a fin de ronda. Para estados tardíos (fin de ronda,
  fin de partida, modales) hace falta forzarlos a mano.

- **Verifica el verificador.** En la tanda de lógica cada generador traía su
  propio contador de soluciones, y un contador con un fallo «demuestra» lo que
  quieras. Para auditarlos se escribió un segundo contador por juego, con otra
  técnica: por permutaciones de fila en Futoshiki, Rascacielos y Calcudoku, y
  por columnas con emparejamiento por máscaras en Tiendas. Coincidieron con los
  del juego en los 1.005 tableros probados. Si haces un juego de rejilla, esta
  comprobación cruzada es barata y es la única que vale.

- **Un porcentaje de relleno se mide contra el CONTENEDOR, no contra el elemento.**
  Los dados de la Generala llevaban `padding: 15%` y `width: var(--dado)` (60px);
  con `box-sizing: border-box` la caja no puede ser menor que su propio relleno,
  y el 15 % salía del ancho de la fila (362px): cada dado medía 111px y los cinco
  se salían de la pantalla. Relleno atado al propio tamaño (`calc(var(--dado)*.15)`).
  En un elemento flexible añade además `min-width: 0`: `min-width: auto` usa el
  ancho mínimo del contenido y también lo agranda.
- **Más honda no es más fuerte.** El Molino se quedó en tres niveles: se midió una
  búsqueda a 4, 5 y 6 jugadas (con y sin búsqueda de quietud, y con varios juegos de
  pesos) y ninguna gana a la de tres (37,5 %, 40,8 % y 30,4 %). Se descartó que
  fuera la búsqueda: la poda coincide jugada a jugada con un minimax sin podar en
  107 posiciones, hacer/deshacer restaura el estado en 198.560 pruebas y la
  evaluación es antisimétrica en 3.245 posiciones. Es la evaluación la que no
  aguanta la profundidad. Antes de vender un «Experto», mídelo contra el nivel de
  abajo: si no gana, no es un nivel.

- **Cuidado al medir en este entorno.** Dos trampas que ya invalidaron mediciones:
  (1) el **service worker sirve desde su caché**, así que un `page.route` que
  sustituye CSS o HTML no se aplica y acabas comparando una versión contra sí
  misma — usa `browser.newContext({ serviceWorkers: 'block' })`;
  (2) Chromium sin pantalla declara `prefers-reduced-motion: reduce` y el CSS
  apaga las animaciones — usa `reducedMotion: 'no-preference'`. Además **no puede
  medir pintado/composición**: los fps de `requestAnimationFrame` salen 60 aunque
  haya trabajo de sobra, así que para coste gráfico vale más contar trabajo
  (llamadas al canvas, `getComputedStyle`, elementos filtrados) que cronometrar.
- **`steps(1, jump-none)` es CSS inválido** (con `jump-none` hacen falta ≥2 pasos)
  y tira la declaración `animation` entera. Estuvo semanas en el estilo: el
  «hervor» de la identidad nunca se ejecutó. Si una animación no se ve, valida la
  sintaxis con `getComputedStyle(el).animationName` antes de buscar otra causa.
- **Una clase con nombre genérico pisa el estilo compartido.** La Batalla naval
  llamaba `.seg` a los tramos de barco y esa regla (`position: absolute; background:
  ink`) alcanzaba al selector de dificultad `.seg` de `nucleo.js`. Antes de crear una
  clase en un juego, `grep` en `comun/estilo.css`.
- **Los barridos masivos rompen lo que significa.** Igualar todos los bordes a 1px
  borró los bloques del Sudoku; una sustitución anterior metió `steps()` DENTRO de un
  `cubic-bezier()` en el Memorama (CSS inválido: la carta giraba sin transición).
  Tras un barrido, mirar la lámina de los 42 (scripts en el scratchpad de la sesión:
  captura de inicio y de juego en una cuadrícula) y buscar `cubic-bezier([^)]*steps`.
- **Coste gráfico en el teléfono**: nada de `mix-blend-mode` a pantalla completa
  (obliga a rehacer la mezcla en cada cuadro que dibuja el canvas de abajo: era la
  causa de los tirones), nada de `getComputedStyle` dentro de un bucle de dibujo
  (usa `color()` de `nucleo.js`, que lo cachea) y el fondo fijo de un tablero se
  pinta una vez en un canvas aparte y se estampa, no se redibuja por cuadro.
- **La pantalla se puede ir antes que el temporizador.** Los juegos con rival piensan
  con `setTimeout`, y si el jugador toca «Salir» o «Nueva» mientras tanto, el repintado
  llega a un `#id` que ya no existe y revienta la página. Mordió en Dominó, Memorama,
  Gato y Reversi. Regla: **toda función de pintado a la que pueda llegar un
  temporizador empieza con `if (!$('#algo')) return;`**, y los temporizadores propios
  se guardan en `S` para poder cancelarlos al reiniciar.
- **Un generador de azar roto invalida la medición.** La simulación del Ludo usaba
  un LCG (`seed * 1103515245 + 12345`) que desborda los 2^53 de coma flotante y
  degenera: los porcentajes bailaban 25 puntos entre corridas y la escalera de
  niveles salía no monótona. En simulaciones usa mulberry32 (`Math.imul`) y
  comprueba que dos arneses distintos den lo mismo. La escalera del Ludo medida
  así: normal 80 % a fácil, difícil 62 % a normal, experto 59 % a difícil.
- Otro nombre genérico que pisó el estilo compartido: `.meta` (el centro del Ludo)
  contra `.topbar .meta` de la barra; el chip de nivel acababa encima del título.
- Pruebas: Playwright + Chromium en `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
  OJO: `page.evaluate(() => ...)` no ve los `const` globales de la página — usar la
  forma string `page.evaluate('expr')`. Google Fonts está bloqueado en el sandbox.
- Artifact de Encadena solo (pre-hub): `7486ae0b-e528-47ee-868b-f7c5cb094cfa`.
- Commits en español, sin nombre de modelo en artefactos del repo.

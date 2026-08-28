# De-todo · Estado del proyecto

Repo personal de Manuel con proyectos sueltos por rama. **Esta rama
(`claude/juego-pulelo-idea-dyz035`) contiene la colección de juegos de pasatiempos.**
(La rama `claude/tier-list-page-2cz2lq` es otro proyecto aparte.)

## Lo que ya existe y funciona

- **Hub + 42 juegos** (eran 44: se retiraron «La definición» y «Póker 3 cartas» por
  relleno, ver auditoría abajo), todos vanilla JS sin build, con dificultades, marcas y
  «¿Cómo se juega?»: Palabras (Encadena, Sopa, Crucigrama con banco propio de ~390
  pistas, La palabra del día con modo diario, Ahorcado, Anagramas, Acomoda-palabras,
  Buscapalabras tipo Boggle, Ordena la frase con banco de 144 refranes, Sílabas
  encadenadas con silabeador propio),
  Números y lógica (Sudoku, Cifras, Nonograma, Kakuro, Buscaminas, Batalla naval,
  2048, Binario/Takuzu, Puentes/Hashi, Hitori, Luces fuera, Picas y fijas,
  Punteros —el de las flechas que pidió Manuel—, Inunda),
  Mesa (Memorama, Gato, Conecta 4, Damas, Solitario, Reversi, Dominó, Deslizante,
  Come solo, Hanoi, Blackjack con división y reto de banca, Texas Hold'em con
  equity Monte Carlo y apuesta a elección) y Arcade (Serpiente, Simón, Laberinto, Bloques/tetrominós, Ladrillos,
  Topos). Ver `README.md`. Generadores con garantías (unicidad/solubilidad) en
  sudoku, nonograma, naval, cifras, binario, luces, deslizante, punteros e
  inunda (límite = resolutor voraz + margen).
- **Sistema compartido** en `comun/`: `estilo.css` (TODA la identidad visual vive ahí,
  tokens en `:root`) y `nucleo.js` (utilidades + diccionario). Cada juego enlaza ambos.
- **PWA instalable** (manifest «Juegos» provisional, `sw.js` cache `juegos-v8`).
  Al añadir/cambiar assets: bump de versión del cache.
- **Publicación automática**: push a esta rama → workflow construye `_site` → rama
  `gh-pages` → **https://manuelcantu1001-jpg.github.io/De-todo/**
  (la fuente de Pages ya está activada a mano; el token no puede crearla por API).
- Marcas del hub: cada juego escribe `store.set('<id>.hub', 'texto')` al batir récord;
  ids: enc, sopa, cru, pal, ahorcado, ana, aco, sud, cif, nono, kak, mina, naval,
  m2048, memo, gato, c4, damas, sol, serp, simon, lab, bus, fra, sil, bin,
  pue, hit, luz, pic, pun, inu, rev, dom, des, come, han, bj, hold, blo,
  lad, topo. (Carpeta ≠ id en varios: buscapalabras→bus, frase→fra, etc.)
  Los juegos con rival guardan la marca por nivel (`<juego>.wins.<nivel>`) y al hub
  mandan la del nivel más alto ganado.
- La portada tiene **buscador** y **«seguir jugando»** (últimos abiertos, en
  `hub.recientes`).

## Identidad visual: «hecho a mano» (elegida por Manuel)

Pedido literal: *«la letra y números los mismos de Claude por lo pronto, y todo lo
demás como hecho a mano, con lápiz o tinta, y los movimientos tipo stopmotion»*.

- **Tipografía de la marca Claude**: **Poppins** (títulos, números, botones) y
  **Lora** (texto corrido, en cursiva para lo secundario). Las de Anthropic de
  verdad (Styrene/Tiempos) son comerciales; estas son las equivalentes libres que
  indica la guía de marca y están en Google Fonts.
- **Paleta Anthropic**: tinta `#141413`, papel `#FAF9F5`, tarjeta `#FFFEFA`,
  naranja `#D97757`, azul `#6A9BCC`, verde `#788C5D` + tintas derivadas
  (`--tinta-1..8`) para las paletas de varios colores (inunda, bloques, 2048…).
- **Hecho a mano**: contorno de tinta (`--trazo`) en vez de sombras suaves, sombra
  sólida de repasado (`--shadow`), esquinas nunca iguales (`--mano-1/2/3`,
  `--pastilla`), separadores de raya ondulada (SVG en data URI), grano de papel
  sobre todo (`body::after`) y **filtro `#tinta`** (feTurbulence + feDisplacementMap,
  inyectado desde `nucleo.js`) que tuerce todos los SVG: `#app svg`.
  Excepción: `.sale`/`.vuela` sin filtro, porque recortaría lo que se sale volando.
- **Stopmotion**: ninguna transición es suave; todas llevan `steps()`. Animaciones
  `boil` (3 dibujos, ~7 fps) en marca, títulos e iconos del hub, `boil-borde` en
  botones y `hervor` (alterna `#tinta`/`#tinta2`/`#tinta3`) disponible con `.hierve`.
  Medido: 60 fps en el hub y en los juegos de canvas. Respeta
  `prefers-reduced-motion`.

Sigue **pendiente el nombre** de la colección (hoy «Juegos» provisional en
manifest/hub/README). Las 4 direcciones viejas (Quiosco/Arcadia/Recreo/Casillas)
quedan archivadas en `design/direcciones/`.

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
- **La pantalla se puede ir antes que el temporizador.** Los juegos con rival piensan
  con `setTimeout`, y si el jugador toca «Salir» o «Nueva» mientras tanto, el repintado
  llega a un `#id` que ya no existe y revienta la página. Mordió en Dominó, Memorama,
  Gato y Reversi. Regla: **toda función de pintado a la que pueda llegar un
  temporizador empieza con `if (!$('#algo')) return;`**, y los temporizadores propios
  se guardan en `S` para poder cancelarlos al reiniciar.
- Pruebas: Playwright + Chromium en `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
  OJO: `page.evaluate(() => ...)` no ve los `const` globales de la página — usar la
  forma string `page.evaluate('expr')`. Google Fonts está bloqueado en el sandbox.
- Artifact de Encadena solo (pre-hub): `7486ae0b-e528-47ee-868b-f7c5cb094cfa`.
- Commits en español, sin nombre de modelo en artefactos del repo.

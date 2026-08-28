# De-todo · Estado del proyecto

Repo personal de Manuel con proyectos sueltos por rama. **Esta rama
(`claude/juego-pulelo-idea-dyz035`) contiene la colección de juegos de pasatiempos.**
(La rama `claude/tier-list-page-2cz2lq` es otro proyecto aparte.)

## Lo que ya existe y funciona

- **Hub + 44 juegos**, todos vanilla JS sin build, con dificultades, mejores marcas y
  «¿Cómo se juega?»: Palabras (Encadena, Sopa, Crucigrama con banco propio de ~390
  pistas, La palabra del día con modo diario, Ahorcado, Anagramas, Acomoda-palabras,
  Buscapalabras tipo Boggle, Ordena la frase con banco de 72 refranes, Sílabas
  encadenadas con silabeador propio, La definición que reutiliza pistas-es.js),
  Números y lógica (Sudoku, Cifras, Nonograma, Kakuro, Buscaminas, Batalla naval,
  2048, Binario/Takuzu, Puentes/Hashi, Hitori, Luces fuera, Picas y fijas,
  Punteros —el de las flechas que pidió Manuel—, Inunda),
  Mesa (Memorama, Gato, Conecta 4, Damas, Solitario, Reversi, Dominó, Deslizante,
  Come solo, Hanoi, Blackjack, Póker 3 cartas, Texas Hold'em con equity Monte
  Carlo) y Arcade (Serpiente, Simón, Laberinto, Bloques/tetrominós, Ladrillos,
  Topos). Ver `README.md`. Generadores con garantías (unicidad/solubilidad) en
  sudoku, nonograma, naval, cifras, binario, luces, deslizante, punteros e
  inunda (límite = resolutor voraz + margen).
- **Sistema compartido** en `comun/`: `estilo.css` (TODA la identidad visual vive ahí,
  tokens en `:root`) y `nucleo.js` (utilidades + diccionario). Cada juego enlaza ambos.
- **PWA instalable** (manifest «Juegos» provisional, `sw.js` cache `juegos-v6`).
  Al añadir/cambiar assets: bump de versión del cache.
- **Publicación automática**: push a esta rama → workflow construye `_site` → rama
  `gh-pages` → **https://manuelcantu1001-jpg.github.io/De-todo/**
  (la fuente de Pages ya está activada a mano; el token no puede crearla por API).
- Marcas del hub: cada juego escribe `store.set('<id>.hub', 'texto')` al batir récord;
  ids: enc, sopa, cru, pal, ahorcado, ana, aco, sud, cif, nono, kak, mina, naval,
  m2048, memo, gato, c4, damas, sol, serp, simon, lab, bus, fra, sil, def, bin,
  pue, hit, luz, pic, pun, inu, rev, dom, des, come, han, bj, p3, hold, blo,
  lad, topo. (Carpeta ≠ id en varios: buscapalabras→bus, frase→fra, etc.;
  el resto de claves de cada juego usa el nombre de carpeta.)

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

## Notas técnicas útiles

- `dicc-es.js`: ~32k palabras por frecuencia (window.DICC_ES). `lexico-es.txt.gz`:
  ~635k formas normalizadas (fetch + DecompressionStream; en artifacts va en base64).
- `norm()`: minúsculas, sin tildes, conserva la ñ.
- Pruebas: Playwright + Chromium en `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
  OJO: `page.evaluate(() => ...)` no ve los `const` globales de la página — usar la
  forma string `page.evaluate('expr')`. Google Fonts está bloqueado en el sandbox.
- Artifact de Encadena solo (pre-hub): `7486ae0b-e528-47ee-868b-f7c5cb094cfa`.
- Commits en español, sin nombre de modelo en artefactos del repo.

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

## DECISIÓN PENDIENTE: identidad visual y nombre

La piel actual (papel cálido + verde botella + Fraunces/Onest) es **provisional** —
a Manuel no le convence. Hay 4 direcciones propuestas, cada una con nombre candidato:

- A · **Quiosco** — editorial de pasatiempos (papel, tinta, rojo; Archivo Black + Archivo)
- B · **Arcadia** — neón nocturno (oscuro, violeta/turquesa; Unbounded + Instrument Sans)
- C · **Recreo** — pop de caramelo (claro, un color por juego; Bricolage Grotesque + Schibsted Grotesk)
- D · **Casillas** — suizo modular (blanco/negro/azul; Familjen Grotesk + IBM Plex Mono)

Lienzo: `design/direcciones/` y artifact
`https://claude.ai/code/artifact/9244f0e4-b529-428b-8245-95276584e3b7`.
**Preguntar a Manuel cuál eligió.** Para aplicar: re-tokenizar `comun/estilo.css`,
cambiar los `<link>` de fuentes de todas las páginas, nombre en manifest/hub/README
e iconos (`icons/`, se generan con Chromium — ver historial).

## Notas técnicas útiles

- `dicc-es.js`: ~32k palabras por frecuencia (window.DICC_ES). `lexico-es.txt.gz`:
  ~635k formas normalizadas (fetch + DecompressionStream; en artifacts va en base64).
- `norm()`: minúsculas, sin tildes, conserva la ñ.
- Pruebas: Playwright + Chromium en `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
  OJO: `page.evaluate(() => ...)` no ve los `const` globales de la página — usar la
  forma string `page.evaluate('expr')`. Google Fonts está bloqueado en el sandbox.
- Artifact de Encadena solo (pre-hub): `7486ae0b-e528-47ee-868b-f7c5cb094cfa`.
- Commits en español, sin nombre de modelo en artefactos del repo.

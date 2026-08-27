# De-todo · Estado del proyecto

Repo personal de Manuel con proyectos sueltos por rama. **Esta rama
(`claude/juego-pulelo-idea-dyz035`) contiene Encadena y la futura colección de
juegos de pasatiempos.** (La rama `claude/tier-list-page-2cz2lq` es otro proyecto aparte.)

## Lo que ya existe y funciona

- **Encadena** (`index.html` + `dicc-es.js` + `lexico-es.txt.gz`): juego de palabras
  encadenadas por terminación. Vanilla JS sin build. Ver `README.md` para reglas y estructura.
- **PWA instalable** (manifest, `sw.js`, `icons/`) — Manuel ya la tiene en su iPhone.
- **Publicación automática**: `.github/workflows/pages.yml` construye `_site` y lo empuja a la
  rama `gh-pages` en cada push a esta rama; GitHub Pages sirve esa rama (fuente ya activada).
  - URL en vivo: **https://manuelcantu1001-jpg.github.io/De-todo/**
  - El token del workflow NO puede crear el sitio de Pages por API (probado, 403);
    la fuente se elige a mano en Settings → Pages y ya quedó hecha. No tocar.
- Artifacts de Claude (sesión original): juego jugable
  `https://claude.ai/code/artifact/7486ae0b-e528-47ee-868b-f7c5cb094cfa` (versión pre-hub),
  lienzo de direcciones `https://claude.ai/code/artifact/9244f0e4-b529-428b-8245-95276584e3b7`.

## Proyecto en curso: colección de juegos (tipo «10000 juegos», pero propia)

Convertir la app en un **hub de pasatiempos en español**: pantalla de inicio con tarjetas
y varios juegos, todos con dificultades y el mismo lenguaje de diseño.

Juegos acordados:
1. **Encadena** (ya hecho; se integra al hub)
2. **Sopa de letras** (usa `dicc-es.js` como banco de palabras)
3. **Crucigrama con pistas** — OJO: Manuel primero dijo «diagrama» y se interpretó como
   acomoda-palabras; luego corrigió: quiere el **crucigrama clásico con definiciones**.
   Requiere banco de pistas propio (escribirlo a mano, ~cientos de pares palabra/pista
   por dificultad) + generador de tableros.
4. **Sudoku** (generador con solución única; dificultad por nº de pistas)

Arquitectura prevista (sin build, misma filosofía):

```
index.html            → hub con tarjetas
comun/estilo.css      → tokens + átomos compartidos
comun/nucleo.js       → utilidades compartidas (norm, store, modal, confeti, diccionario)
juegos/encadena/  juegos/sopa/  juegos/crucigrama/  juegos/sudoku/
```

Actualizar `sw.js` (bump de versión de cache + nuevos assets) y `manifest` (nombre nuevo)
al montar el hub. El workflow de Pages debe copiar también `comun/` y `juegos/` a `_site`.

## DECISIÓN PENDIENTE (bloqueante antes de construir el hub)

A Manuel **no le convence la identidad visual actual** (papel cálido + verde botella +
terracota + Fraunces/Onest). Hay 4 direcciones nuevas propuestas en el lienzo
(`design/direcciones/`, y el artifact de arriba); cada una trae un nombre candidato:

- A · **Quiosco** — editorial de pasatiempos (papel, tinta, rojo; Archivo Black + Archivo)
- B · **Arcadia** — neón nocturno (oscuro, violeta/turquesa; Unbounded + Instrument Sans)
- C · **Recreo** — pop de caramelo (claro, un color por juego; Bricolage Grotesque + Schibsted Grotesk)
- D · **Casillas** — suizo modular (blanco/negro/azul eléctrico; Familjen Grotesk + IBM Plex Mono)

Dirección y nombre se pueden mezclar. **Preguntar a Manuel cuál eligió antes de construir.**
Cuando elija: rehacer los tokens de Encadena con esa piel y construir hub + juegos con ella.

## Notas técnicas útiles

- `dicc-es.js`: ~32k palabras por frecuencia (window.DICC_ES, texto plano con \n).
- `lexico-es.txt.gz`: ~635k formas normalizadas (sin tildes, con ñ) para validar; se carga
  con fetch + DecompressionStream; en artifacts se incrusta como base64 (window.LEXICO_ES_B64).
- `norm()`: minúsculas, sin tildes, conserva la ñ — el léxico ya está en esa forma.
- Pruebas: Playwright con Chromium en `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`;
  Google Fonts está bloqueado en el sandbox (usar fallbacks o interceptar con fuentes locales).
- `design/`: prototipo original del canvas (React) y `design/direcciones/` (lienzo de pieles).
- Commits en español, sin nombre de modelo en artefactos del repo.

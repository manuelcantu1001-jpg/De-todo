# Juegos · Pasatiempos en español

Colección propia de juegos de pasatiempos, al estilo de las apps de «mil juegos»
pero hecha en casa: **44 juegos sin anuncios, sin conexión y con el mismo lenguaje
de diseño** en todos.

**Juega en** <https://manuelcantu1001-jpg.github.io/De-todo/> — y desde ahí,
«Añadir a pantalla de inicio» la instala como app en el teléfono.

## Los juegos

**Palabras**: Encadena (terminaciones, 1 vs 1 / vs. app / solo) · Sopa de letras ·
Crucigrama (banco propio de ~390 pistas) · La palabra del día (5 letras, modo diario
con racha) · Ahorcado · Anagramas · Acomoda-palabras · Buscapalabras (tipo Boggle,
con el léxico completo) · Ordena la frase (banco propio de 72 refranes) · Sílabas
encadenadas (con silabeador propio) · La definición (el crucigrama al revés).

**Números y lógica**: Sudoku (solución única) · Cifras (objetivo siempre alcanzable) ·
Nonograma (única y resoluble sin adivinar) · Kakuro · Buscaminas · Batalla naval
(unicidad verificada) · 2048 · Binario/Takuzu (solución única) · Puentes
(Hashiwokakero) · Hitori · Luces fuera (siempre resoluble) · Picas y fijas ·
Punteros (tableros 100 % despejables) · Inunda (límite calibrado con resolutor).

**Mesa y clásicos**: Memorama · Gato (minimax) · Conecta 4 (minimax α-β) ·
Damas (capturas obligatorias, multisalto) · Solitario Klondike · Reversi (minimax
α-β con final exacto) · Dominó · Deslizante (15-puzzle) · Come solo · Torres de
Hanoi · Blackjack · Póker 3 cartas · Texas Hold'em (evaluador de 7 cartas y
equity Monte Carlo).

**Arcade**: Serpiente · Simón (con sonido) · Laberinto generado · Bloques
(tetrominós) · Ladrillos (rompe-ladrillos) · Topos (reflejos).

Todos con dificultades, «¿Cómo se juega?» y **mejores marcas** que se presumen en la portada.

## Estructura

```
index.html            Portada (hub) con las tarjetas de los juegos
comun/estilo.css      La identidad visual completa: tokens + átomos compartidos
comun/nucleo.js       Utilidades compartidas (norm, store, modal, confeti, diccionario…)
juegos/<juego>/       Cada juego en su carpeta, HTML+CSS+JS vanilla sin build
dicc-es.js            Diccionario de frecuencias (~32.000 palabras)
lexico-es.txt.gz      Léxico de validación (~635.000 formas normalizadas)
manifest.webmanifest  PWA instalable · sw.js: cache para jugar sin conexión
.github/workflows/    Deploy automático a GitHub Pages (rama gh-pages) en cada push
```

**Para re-vestir la app** (cambiar identidad visual): tokens en `comun/estilo.css`
(`:root`) y los `<link>` de Google Fonts de cada página. Hay 4 direcciones
propuestas en `design/direcciones/`.

## Validación de palabras (Encadena)

1. **Frecuentes** (`dicc-es.js`): válida al instante; también es el vocabulario de la app rival.
2. **Léxico completo** (`lexico-es.txt.gz`): conjugaciones, plurales y femeninos.
3. **Juez rival** (1 vs 1): lo que no aparezca lo decide el otro jugador (nombres propios).

La comparación ignora tildes y mayúsculas pero distingue la ñ. Fuentes:
[hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords) (CC-BY-SA-4.0) y
[words/an-array-of-spanish-words](https://github.com/words/an-array-of-spanish-words) (hunspell).

## Desarrollo

Sin build: edita y recarga. En local:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Pendiente

- **Identidad visual y nombre definitivos**: 4 direcciones propuestas
  (Quiosco / Arcadia / Recreo / Casillas) en el lienzo de diseño; se eligen y se
  aplican re-tokenizando `comun/estilo.css`.
- Modo online de Encadena (reservado en la interfaz).
- Más juegos: la arquitectura del hub escala solo con añadir carpeta y tarjeta.

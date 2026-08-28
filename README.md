# Juegos · Pasatiempos en español

Colección propia de juegos de pasatiempos, al estilo de las apps de «mil juegos»
pero hecha en casa: **sin anuncios, sin conexión y con el mismo lenguaje de diseño**
en todos los juegos.

**Juega en** <https://manuelcantu1001-jpg.github.io/De-todo/> — y desde ahí,
«Añadir a pantalla de inicio» la instala como app en el teléfono.

## Los juegos

| Juego | Tipo | Dificultades |
|---|---|---|
| **Encadena** | Palabras encadenadas por terminación (1 vs 1, vs. app, solo) | Letras 2–5, vidas, tiempo |
| **Sopa de letras** | Encuentra las palabras escondidas arrastrando | 4 (tamaño, direcciones y rareza) |
| **Crucigrama** | Resuelve pistas escritas a mano (~390 en el banco) | 4 (nº de palabras y nivel de pista) |
| **Ahorcado** | Letra a letra con rachas | 4 (rareza y largo de palabra) |
| **Anagramas** | Ordena las letras revueltas, 5 por partida | 4 (largo de palabra) |
| **Sudoku** | Generador con solución única garantizada | 4 (nº de pistas) |
| **Buscaminas** | Toque para abrir, toque largo para bandera | 4 (tablero y minas) |
| **Memorama** | Parejas de iconos, menos movimientos = mejor | 4 (6 a 15 parejas) |
| **Gato** | Tres en raya, 2 jugadores o vs. app (minimax) | 3 niveles de app |
| **2048** | Desliza y suma | 3 tamaños de tablero |

Todos guardan sus **mejores marcas** y las presumen en la portada.

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

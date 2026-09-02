# Sobremesa · Pasatiempos en español

Colección propia de juegos de pasatiempos, al estilo de las apps de «mil juegos»
pero hecha en casa. Se llama **Sobremesa** por el rato para el que es: el de después
de comer, con la mesa recogida, dominó, cartas y plática. Son **49 juegos sin anuncios, sin conexión y con el mismo lenguaje
de diseño** en todos. Auditados uno por uno: si un juego no tenía juego dentro, se
fue; si prometía algo que no cumplía, se arregló.

**Juega en** <https://manuelcantu1001-jpg.github.io/De-todo/> — y desde ahí,
«Añadir a pantalla de inicio» la instala como app en el teléfono.

## Los juegos

**Palabras**: Encadena (terminaciones, 1 vs 1 / vs. app / solo) · Sopa de letras ·
Crucigrama (banco propio de ~390 pistas) · La palabra del día (5 letras, modo diario
con racha) · Ahorcado · Anagramas · Acomoda-palabras · Buscapalabras (tipo Boggle,
con el léxico completo) · Ordena la frase (banco propio de 144 refranes,
con pista) · Sílabas encadenadas (con silabeador propio) · Panal (siete letras,
una obligatoria; cada panal esconde de 20 a 100 palabras y siempre un pangrama) ·
Criptograma (un refrán cifrado por sustitución; se puntúa, no se cronometra).

**Números y lógica**: Sudoku (solución única) · Cifras (objetivo siempre alcanzable) ·
Nonograma (38 dibujos de verdad; única y sin adivinar) · Kakuro (solución única) ·
Buscaminas (nunca hay que adivinar) · Batalla naval
(piezas con forma y flota tachable; resoluble sin adivinar) · 2048 ·
Binario/Takuzu (única y deducible entera) · Puentes (Hashiwokakero, con el grafo
a la vista) · Hitori (solución única) · Luces fuera (marca sobre el mínimo real) · Picas y fijas
(media de cinco partidas) ·
Punteros (tableros 100 % despejables) · Inunda (límite calibrado con resolutor).

**Mesa y clásicos**: Memorama · Gato (minimax; el nivel Normal sí se deja ganar) ·
Conecta 4 (minimax α-β) · Damas (capturas obligatorias, multisalto y tablas) ·
Solitario Klondike (elige el destino de cada carta y avisa si te atascas) ·
Reversi (minimax α-β con final exacto) · Dominó (el rival deduce por tus pases) ·
Deslizante (empuja filas enteras; revueltos de dificultad fija) · Come solo ·
Torres de Hanoi · Ludo (contra 1, 2 o 3 rivales; los niveles se miden con
simulación) · Blackjack (con división y reto de banca: de $200 a $500) ·
Texas Hold'em (tú eliges cuánto apostar; evaluador de 7 cartas y equity Monte Carlo) ·
Timbiriche (puntos y cajas; la app cuenta cadenas y juega la paridad) ·
Generala (cinco dados; la app decide por valor esperado) ·
Molino (nueve hombres de Morris, con tres niveles medidos) ·
Mancala (Kalah; la app busca hasta once jugadas).

**Arcade**: Serpiente (mando de flechas y gestos que giran al vuelo) · Simón (con
sonido, reloj y modo que no repite la secuencia entera) · Laberinto a oscuras
(niebla de guerra y brújula) · Bloques (tetrominós, con margen de fijado) ·
Ladrillos (física por tiempo, igual en 60 y 120 Hz) · Topos (rachas y tres tipos).

Todos con dificultades, «¿Cómo se juega?» y **mejores marcas** que se presumen en la portada.

## Estructura

```
index.html            Portada (hub) con las tarjetas de los juegos
comun/estilo.css      La identidad visual completa: tokens + átomos compartidos
comun/nucleo.js       Utilidades compartidas (norm, store, modal, confeti, léxico…)
comun/fuentes/        Fraunces y DM Sans alojadas en el repo (funcionan sin conexión)
juegos/<juego>/       Cada juego en su carpeta, HTML+CSS+JS vanilla sin build
banco-es.js           Banco curado: 7.800 palabras y 14 listas temáticas
vocab-es.js           Vocabulario amplio (17.100 formas) para los juegos de cadena
lexico-es.txt.gz      Léxico de validación (~635.000 formas normalizadas)
scripts/              auditar-con-codex.sh (segunda opinión) y las dos pruebas
                      de robustez que se pasan a los 49 juegos con Playwright
manifest.webmanifest  PWA instalable · sw.js: cache para jugar sin conexión
.github/workflows/    Deploy automático a GitHub Pages (rama gh-pages) en cada push
```

## La piel: papel, no pantalla

Crema en vez de blanco, tinta parda en vez de negro, y casi nada de contraste duro:
la colección se ve como una página, no como una pantalla. Los titulares van en
**Fraunces** (serif, con cursiva para lo secundario), la interfaz y los números en
**DM Sans**, y las etiquetas técnicas —dificultad, reloj, marcas— en monoespaciada
en mayúsculas. Las tarjetas son bloques beige sin borde ni sombra; las piezas de
juego llevan un filete finísimo. El movimiento es suave y corto.

Las tipografías viven en el repo, así que la app instalada se ve igual sin conexión.
**Para re-vestirla** basta con los tokens de `:root` en `comun/estilo.css`.

## Las palabras

Los juegos **preguntan** desde `banco-es.js` y **aceptan** desde el léxico completo.
Esa separación es lo que evita que el ahorcado te pida adivinar «jeff»: el banco son
7.800 sustantivos, adjetivos e infinitivos españoles de verdad, sacados de cruzar las
frecuencias con un diccionario hunspell y repasados a mano (fuera nombres propios,
conjugaciones, formas con pronombre pegado y palabras función). `vocab-es.js` añade
plurales y conjugaciones para los juegos de cadena, que necesitan mucho vocabulario.

La comparación ignora tildes y mayúsculas pero distingue la ñ. Fuentes:
[hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords) (CC-BY-SA-4.0) y
[words/an-array-of-spanish-words](https://github.com/words/an-array-of-spanish-words) (hunspell).

## Desarrollo

Sin build: edita y recarga. En local:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Auditoría

Cada juego se revisó jugándolo con bots y solucionadores propios, no a ojo. Lo que
salió de ahí: dos juegos retirados por no tener juego dentro (La definición, que era
el banco del crucigrama sin el crucigrama, y Póker 3 cartas, donde decidir bien vale
2,2 % por mano), generadores rehechos en Kakuro e Hitori (de 0 tableros con solución
única a todos), Buscaminas y Binario que ya no obligan a adivinar, y la Batalla naval
con piezas que tienen forma y flota tachable, que era lo que faltaba para poder
deducir. Para contrastar con una segunda opinión: `scripts/auditar-con-codex.sh`.

Segunda pasada (septiembre de 2026), tras el cambio de piel: los 42 se revisaron
uno por uno a dos tamaños de pantalla, midiendo contrastes y distancias de color
en vez de mirarlos, y jugando cada uno con un bot. Salieron cosas que nadie había
visto: el Hold'em mostraba tus cartas en blanco, la ficha del Conecta 4 aparecía
sin caer, Enter físico re-pulsaba la última tecla táctil en La palabra del día,
cuatro juegos abrían el modal de fin encima de la pantalla de inicio si salías a
tiempo, y la Serpiente tapaba su mando en un iPhone chico.

## Pendiente

- Modo online de Encadena (reservado en la interfaz).
- Más juegos: la arquitectura del hub escala solo con añadir carpeta y tarjeta.
